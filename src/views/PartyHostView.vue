<template>
  <main class="host-layout setup-card">
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

    <div>
      <MinimalSettings :hide-keyboard="true" />
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="false"
        :is-incorrect="false"
        :is-bonus="!!bonusRoundType || isFinalRound"
        :total-score="undefined"
        :current-round="gameStore.currentRoundIndex + 1"
        :max-rounds="configStore.maxRounds"
        :is-survival="false"
        :is-sudden-death="partyStore.isSuddenDeath"
      />

      <div class="canvas-effects" :style="canvasEffectsStyle">
        <PixelCanvas
          ref="pixelCanvasRef"
          :class="{ dark: partyStore.isLightsOut }"
          :pixel-array="pixelData"
          :resolution="resolution"
          :is-revealing="canvasIsRevealing"
          :is-status-icon="false"
          :timer-duration="timerDuration"
          :pause-reveal="
            partyStore.buzzerState === 'answering' ||
            showFinalRoundTransition ||
            showBonusRoundTransition
          "
        />
        <div v-if="isBlurRoundActive" class="blur-overlay" />
      </div>
      <BuzzerStatus
        :is-final-round="isFinalRound"
        :bonus-round-type="bonusRoundType"
      />
    </div>
    <div class="rankings-column">
      <PartyRankings
        :party-players-sorted="partyPlayersSorted"
        :active-player-id="partyStore.activePlayerId"
        :freeze-until-at="partyStore.freezeUntilAt"
        :freeze-by-player-id="partyStore.freezeByPlayerId"
      />
    </div>
    <EmojiOverlay :new-emoji="lastEmoji" />
    <FreezeBurstOverlay :trigger="freezeBurstTrigger" />
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
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { usePartyStore } from "@/stores/party";
import { useSoundStore } from "@/stores/sound";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";
import EmojiOverlay from "@/components/game-ui/EmojiOverlay.vue";
import { useBonusRounds } from "@/composables/useBonusRounds";
import FreezeBurstOverlay from "@/components/game-ui/FreezeBurstOverlay.vue";

const gameStore = useGameStore();
const configStore = useConfigStore();
const partyStore = usePartyStore();
const soundStore = useSoundStore();

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

let lastXlzActiveForRoundIndex: number | null = null;
let lastXlzByPlayerId: string | null = null;
watch(
  [() => partyStore.xlzActiveForRoundIndex, () => partyStore.xlzByPlayerId],
  ([roundIndex, byPlayerId]) => {
    if (typeof roundIndex !== "number") {
      lastXlzActiveForRoundIndex = null;
      lastXlzByPlayerId = null;
      return;
    }
    if (roundIndex !== gameStore.currentRoundIndex) return;
    if (
      lastXlzActiveForRoundIndex === roundIndex &&
      lastXlzByPlayerId === byPlayerId
    )
      return;
    lastXlzActiveForRoundIndex = roundIndex;
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
};

const lastEmoji = ref("");
const freezeBurstTrigger = ref(0);

const handleIncomingEmoji = (emojiChar: string) => {
  lastEmoji.value = emojiChar;

  nextTick(() => {
    lastEmoji.value = "";
  });
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

watch(
  () => partyStore.buzzerState,
  (newState) => {
    if (newState === "answering" && timer.value > 0) {
      soundStore.playSound("buzz");
      workerClearInterval(timerId);
      timerId = null;
      workerClearTimeout(timerEndTimeoutId);
      timerEndTimeoutId = null;
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

const emojiListener = (event: any) => {
  handleIncomingEmoji(event.detail);
};

onMounted(() => {
  window.addEventListener("emoji-received", emojiListener);
});

onUnmounted(() => {
  window.removeEventListener("emoji-received", emojiListener);
  clearAllTimers();
});
</script>

<style scoped>
.host-layout {
  display: grid;
  grid-template-columns: max(600px) minmax(400px, 100%);
  align-items: start;
  gap: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
}

@media (max-width: 1023px) {
  .host-layout {
    grid-template-columns: 1fr;
    max-width: 600px;
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

.rankings-column {
  display: grid;
  height: 100%;
}

.powerup-info {
  margin-top: auto;
}
</style>
