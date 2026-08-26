<template>
  <main class="host-layout">
    <Transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
        @done="gameStore.setGameState('revealing')"
      />
      <GameTransition
        v-else-if="showFinalRoundTransition"
        first="FINAL"
        second="ROUND"
        @done="handleFinalRoundDone"
      />
      <GameTransition
        v-else-if="showBonusRoundTransition"
        first="BONUS"
        second="ROUND"
        @done="handleBonusRoundDone"
      />
      <GameTransition
        v-else-if="partyStore.showSuddenDeathTransition"
        first="SUDDEN"
        second="DEATH"
        @done="handleSuddenDeathDone"
      />
      <GameTransition
        v-else-if="
          partyStore.buzzTransitionPending &&
          partyStore.buzzerState === 'answering'
        "
        :first="partyStore.activePlayer?.username || 'PLAYER'"
        :is-short="true"
        second="BUZZERED"
        @done="handleBuzzTransitionDone"
      />
    </Transition>

    <!-- Linke Card -->
    <div class="buzzer-column layout-card">
      <h1 class="logo">
        Pix<span>Reveal</span>
      </h1>
      <BuzzerStatus
        :is-final-round="isFinalRound"
        :bonus-round-type="bonusRoundType"
        :max-reveal-time="Number(timerDuration)"
        :time-remaining="Number(timer)"
      />
      <div v-if="partyStore.players.length <= 10" class="join-container">
      <h2>JOIN GAME</h2>
      <qrcode-vue :value="inviteLink" :size="150" render-as="svg" />
      <div>
        Room ID:
        <p class="room-code"> <span>{{ channelStore.currentRoomId }}</span></p>
      </div>
      </div>
    </div>

    <!-- Mittlere Card (Spielfeld) -->
    <div class="center-column layout-card">
      <MinimalSettings :hide-keyboard="true" />
      <GameHeader
        :max="Number(timerDuration)"
        :count="Number(timer)"
        :is-correct="false"
        :is-incorrect="false"
        :is-bonus="!!bonusRoundType || isFinalRound"
        :total-score="undefined"
        :current-round="gameStore.currentRoundIndex + 1"
        :max-rounds="Number(configStore.maxRounds)"
        :is-survival="false"
        :is-sudden-death="partyStore.isSuddenDeath"
      />

      <div class="canvas-effects" :style="canvasEffectsStyle">
        <PixelCanvas
          ref="pixelCanvasRef"
          :class="{ dark: partyStore.isLightsOut, twisted: partyStore.isUpsideDown }"
          :pixel-array="pixelData"
          :resolution="resolution"
          :is-revealing="canvasIsRevealing"
          :is-status-icon="false"
          :timer-duration="Number(timerDuration)"
          :pause-reveal="
            partyStore.buzzerState === 'answering' ||
            showFinalRoundTransition ||
            showBonusRoundTransition
          "
        />
        <div v-if="isBlurRoundActive" class="blur-overlay" />
      </div>
    </div>

    <!-- Rechte Card -->
    <div class="rankings-column layout-card">
      <PartyRankings
        :party-players-sorted="partyPlayersSorted"
        :active-player-id="partyStore.activePlayerId"
        :freeze-until-at="partyStore.freezeUntilAt"
        :freeze-by-player-id="partyStore.freezeByPlayerId"
        :last-emoji="lastEmoji"
        :emoji-by-player-id="lastEmojiPlayerId"
      />
    </div>

    <EmojiOverlay :new-emoji="lastEmoji" />
    <FreezeBurstOverlay :trigger="freezeBurstTrigger" />
    <FartOverlay :trigger="fartTrigger" />
    <DevilBurstOverlay :trigger="devilTrigger" />
  </main>
</template>

<script setup lang="ts">
import {
  nextTick,
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch,
  unref,
} from "vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import BuzzerStatus from "@/components/game-ui/BuzzerStatus.vue";
import PartyRankings from "@/components/game-ui/PartyRankings.vue";
import PowerUpInfo from "@/components/game-ui/PowerUpInfo.vue";
import QrcodeVue from "qrcode.vue";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { usePartyStore } from "@/stores/party";
import { useSoundStore } from "@/stores/sound";
import { useChannelStore } from "@/stores/channel";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";
import EmojiOverlay from "@/components/game-ui/EmojiOverlay.vue";
import { useBonusRounds } from "@/composables/useBonusRounds";
import FreezeBurstOverlay from "@/components/game-ui/FreezeBurstOverlay.vue";
import FartOverlay from "@/components/game-ui/FartOverlay.vue";
import DevilBurstOverlay from "@/components/game-ui/DevilBurstOverlay.vue";

const gameStore = useGameStore();
const configStore = useConfigStore();
const partyStore = usePartyStore();
const soundStore = useSoundStore();
const channelStore = useChannelStore();

const pixelCanvasRef = ref<{
  playShine: () => void;
  playShake: () => void;
} | null>(null);

const pixelData = ref(Array(256).fill(0));
const resolution = ref(16);
const timerDuration = computed(() => unref(configStore.revealTime));
const timer = ref(timerDuration.value);
let timerId: number | null = null;
let timerEndTimeoutId: number | null = null;
let navigationTimeout: number | null = null;

const inviteLink = computed(
  () =>
    `${window.location.origin}?id=${channelStore.currentRoomId}&mode=party`,
);

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const currentRound = computed(() => gameStore.currentRound);
const isRevealing = computed(
  () =>
    gameStore.gameState === "revealing" &&
    !showFinalRoundTransition.value &&
    !showBonusRoundTransition.value &&
    !partyStore.showSuddenDeathTransition,
);

const {
  bonusRoundType,
  isFinalRound,
  isBlurRoundActive,
  canvasEffectsStyle: canvasEffectsStyleBase,
  canvasIsRevealing,
  showFinalRoundTransition,
  showBonusRoundTransition,
  handleFinalRoundDone: markFinalRoundTransitionDone,
  handleBonusRoundDone: markBonusRoundTransitionDone,
  shouldShowTransitionOnRevealing,
} = useBonusRounds({
  currentRoundIndex: computed(() => gameStore.currentRoundIndex),
  maxRounds: computed(() => configStore.maxRounds),
  gameState: computed(() => gameStore.gameState),
  timer,
  timerDuration,
  baseRevealing: isRevealing,
});

const suppressFilterTransition = ref(false);

const canvasEffectsStyle = computed(() => {
  const style: Record<string, string> = { ...canvasEffectsStyleBase.value };
  if (suppressFilterTransition.value) {
    style.transition = "none";
  }
  return style;
});

const handleFinalRoundDone = () => {
  markFinalRoundTransitionDone();
  setupDrawing();
};

const handleBonusRoundDone = () => {
  markBonusRoundTransitionDone();
  setupDrawing();
};

const handleSuddenDeathDone = () => {
  partyStore.showSuddenDeathTransition = false;
  setupDrawing();
};

const handleBuzzTransitionDone = () => {
  partyStore.startAnswerPhase?.();
};

let lastFreezeUntilAt: number | null = null;
watch(
  () => partyStore.freezeUntilAt,
  (untilAt) => {
    if (typeof untilAt !== "number") {
      lastFreezeUntilAt = null;
      return;
    }
    if (untilAt <= Date.now()) return;
    if (lastFreezeUntilAt === untilAt) return;
    lastFreezeUntilAt = untilAt;
    soundStore.playSound("freeze");
    freezeBurstTrigger.value += 1;
  },
);

let lastLightsOutUntilAt: number | null = null;
watch(
  () => partyStore.lightsOutUntilAt,
  (untilAt) => {
    if (typeof untilAt !== "number") {
      lastLightsOutUntilAt = null;
      return;
    }
    if (untilAt <= Date.now()) return;
    if (lastLightsOutUntilAt === untilAt) return;
    lastLightsOutUntilAt = untilAt;
    soundStore.playSound("electricity");
  },
);

let lastXlzByPlayerId: string | null = null;
watch(
  [() => partyStore.xlzCharge, () => partyStore.xlzByPlayerId],
  ([xlzCharge, byPlayerId]) => {
    if (xlzCharge <= 0 || !byPlayerId) return;
    lastXlzByPlayerId = typeof byPlayerId === "string" ? byPlayerId : null;
    soundStore.playSound("shuffle");
  },
);

const clearAllTimers = () => {
  workerClearInterval(timerId);
  workerClearTimeout(timerEndTimeoutId);
  workerClearTimeout(navigationTimeout);
  timerId = null;
  timerEndTimeoutId = null;
  navigationTimeout = null;
};

const resumeTimer = () => {
  if (partyStore.isSuddenDeath) return;
  if (timer.value <= 0) return;
  if (timerId || timerEndTimeoutId) return;

  timerEndTimeoutId = workerSetTimeout(() => {
    timerEndTimeoutId = null;
    soundStore.playSound("partyIncorrect");
    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, timer.value * 1000);

  timerId = workerSetInterval(() => {
    timer.value = Math.max(0, timer.value - 1);

    if (timer.value <= 3 && timer.value > 0) {
      soundStore.playSound("timer");
      pixelCanvasRef.value?.playShake();
    }

    if (timer.value > 0) return;

    soundStore.playSound("incorrect");

    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    workerClearTimeout(timerEndTimeoutId);
    timerEndTimeoutId = null;
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, 1000);
};

const startTimer = () => {
  workerClearInterval(timerId);
  workerClearTimeout(timerEndTimeoutId);
  timer.value = timerDuration.value;

  if (partyStore.isSuddenDeath) {
    return;
  }

  timerEndTimeoutId = workerSetTimeout(() => {
    timerEndTimeoutId = null;
    soundStore.playSound("partyIncorrect");
    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, timerDuration.value * 1000);

  timerId = workerSetInterval(() => {
    timer.value = Math.max(0, timer.value - 1);

    if (timer.value <= 3 && timer.value > 0) {
      soundStore.playSound("timer");
      pixelCanvasRef.value?.playShake();
    }

    if (timer.value > 0) return;

    soundStore.playSound("incorrect");

    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    workerClearTimeout(timerEndTimeoutId);
    timerEndTimeoutId = null;
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;

  clearAllTimers();

  suppressFilterTransition.value = true;

  pixelData.value = currentRound.value.data;
  resolution.value = Math.sqrt(pixelData.value.length);

  partyStore.openBuzzer();
  startTimer();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressFilterTransition.value = false;
    });
  });
  partyStore.openBuzzer();
};

const freezeBurstTrigger = ref(0);
const fartTrigger = ref(0);
const devilTrigger = ref(0);


const lastEmoji = ref("");
const lastEmojiPlayerId = ref<string | null>(null);

const handleIncomingEmoji = (emojiChar: string, playerId?: string) => {
  lastEmoji.value = emojiChar;
  lastEmojiPlayerId.value = playerId ?? null;

  nextTick(() => {
    lastEmoji.value = "";
    lastEmojiPlayerId.value = null;
  });
};

const emojiListener = (event: any) => {
  handleIncomingEmoji(event.detail?.emoji, event.detail?.playerId);
};

watch(
  () => partyStore.roundResult,
  (newResult) => {
    if (newResult) {
      soundStore.playSound(
        newResult === "correct" ? "partyCorrect" : "partyIncorrect",
      );

      if (timer.value > 0) {
        clearAllTimers();
      }

      if (!partyStore.activePlayerId) {
        timer.value = 0;
      }

      gameStore.setGameState("feedback");

      workerSetTimeout(() => {
        pixelCanvasRef.value?.playShine();
      }, 1000);

      navigationTimeout = workerSetTimeout(() => {
        if (partyStore.isSuddenDeath) {
          if (partyStore.roundResult === "correct") {
            partyStore.endGame();
          } else if (partyStore.suddenDeathPlayerIds.length <= 1) {
            partyStore.endGame();
          } else {
            partyStore.nextSuddenDeathRound();
          }
        } else {
          const isLastRound =
            gameStore.currentRoundIndex >= configStore.maxRounds - 1;
          if (isLastRound) {
            const candidates = partyStore.getSuddenDeathCandidates();
            if (candidates.length >= 2) {
              partyStore.startSuddenDeath(candidates);
            } else {
              partyStore.endGame();
            }
          } else {
            partyStore.nextRound();
          }
        }
      }, 4000);
    }
  },
);

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      if (partyStore.showSuddenDeathTransition) {
        clearAllTimers();
        return;
      }
      const transition = shouldShowTransitionOnRevealing();
      if (transition === "final") {
        clearAllTimers();
        showFinalRoundTransition.value = true;
        return;
      }
      if (transition === "bonus") {
        clearAllTimers();
        showBonusRoundTransition.value = true;
        return;
      }
      if (!showFinalRoundTransition.value && !showBonusRoundTransition.value)
        setupDrawing();
    }
  },
  { immediate: true },
);

let lastFartTriggerKey: string | null = null;
let lastDevilTriggerKey: string | null = null;  

watch(
  () => partyStore.buzzerState,
  (newState) => {
    if (newState === "answering" && timer.value > 0) {
      soundStore.playSound("buzz");
      workerClearInterval(timerId);
      timerId = null;
      workerClearTimeout(timerEndTimeoutId);
      timerEndTimeoutId = null;

      const fartByPlayerId = partyStore.fartByPlayerId;
      const activePlayerId = partyStore.activePlayerId;
      const isFartBuzz =
        partyStore.fartCharges > 0 &&
        !!fartByPlayerId &&
        !!activePlayerId &&
        activePlayerId !== fartByPlayerId;

      if (isFartBuzz) {
        const key = `${activePlayerId}-${fartByPlayerId}`;
        if (lastFartTriggerKey !== key) {
          lastFartTriggerKey = key;
          fartTrigger.value += 1;
        }
      }

      if (partyStore.isDevilActive && partyStore.activePlayerId) {
        const key = `${partyStore.activePlayerId}-${partyStore.devilCharges}`;
        if (lastDevilTriggerKey !== key) {
          lastDevilTriggerKey = key;
          devilTrigger.value += 1;
        }
      }
    } else if (newState !== "answering") {
      lastFartTriggerKey = null;
      lastDevilTriggerKey = null;
    }

    if (
      newState === "open" &&
      gameStore.gameState === "revealing" &&
      timer.value > 0
    ) {
      resumeTimer();
    }
  },
);

function resizeGame() {
  const main = document.querySelector('.host-layout') as HTMLElement;

  if (!main) return
  
  const baseWidth = 1440;
  const baseHeight = 672;
  
  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);
  
  main.style.transform = `scale(${scale})`;
}

onMounted(() => {
  window.addEventListener("emoji-received", emojiListener);
  resizeGame();
  window.addEventListener('resize', resizeGame);
});

onUnmounted(() => {
  window.removeEventListener("emoji-received", emojiListener);
  window.removeEventListener('resize', resizeGame);
  clearAllTimers();
});
</script>

<style scoped>
.host-layout {
  display: grid;
  grid-template-columns: minmax(320px, 380px) max(600px) minmax(320px, 380px);
  gap: 8px;
  align-items: stretch;
  max-width: 1440px;
  margin: 0 auto;
  box-sizing: border-box;
  transform-origin: center center;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.layout-card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
}

.layout-card {
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
}

.buzzer-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.center-column {
  display: flex;
  flex-direction: column;
}

.rankings-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media (max-width: 1279px) {
  .host-layout {
    grid-template-columns: 1fr;
    max-width: 600px;
  }

  .buzzer-column {
    order: -1;
  }
}

.canvas-effects {
  position: relative;
  width: 100%;
  transition: filter 600ms ease;
  will-change: filter;
}

.blur-overlay {
  position: absolute;
  inset: 0;
  border-radius: 0px;
  background: rgba(56, 189, 248, 0.12);
  pointer-events: none;
  mix-blend-mode: screen;
}

.dark {
  animation: flickerBlackout 4s ease-out forwards;
  transition: filter 0.3s ease-in-out;
}

.twisted {
  transform: rotate(180deg);
}

.powerup-info {
  margin-top: auto;
}

.logo {
  margin-bottom: 16px;
}

.join-container {
  display: flex;
  flex-direction: column;
  margin-top: auto;
  justify-content: center;
  align-items: center;
  gap: 24px;
  h2 {
    margin-bottom: 0;
  }
  .room-code {
    margin: 4px 0 0;
    font-size: 24px;
    font-weight: 700;
    span {
      color: var(--primary);
    }
  }
}
</style>
