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
    </Transition>

    <div>
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="false"
        :is-incorrect="false"
        :total-score="undefined"
        :current-round="gameStore.currentRoundIndex + 1"
        :max-rounds="configStore.maxRounds"
        :is-survival="false"
      />

      <div class="canvas-effects" :style="canvasEffectsStyle">
        <PixelCanvas
          :class="{ dark: partyStore.isLightsOut }"
          :pixel-array="pixelData"
          :resolution="resolution"
          :is-revealing="canvasIsRevealing"
          :is-status-icon="false"
          :timer-duration="timerDuration"
          :pause-reveal="
            partyStore.buzzerState === 'answering' || showFinalRoundTransition
            || showBonusRoundTransition
          "
        />
        <div v-if="isBlurRoundActive" class="blur-overlay" />
      </div>
      <BuzzerStatus :is-final-round="isFinalRound" :bonus-round-type="bonusRoundType" />
    </div>

    <PartyRankings
      :party-players-sorted="partyPlayersSorted"
      :active-player-id="partyStore.activePlayerId"
      :freeze-until-at="partyStore.freezeUntilAt"
      :freeze-by-player-id="partyStore.freezeByPlayerId"
    />
  </main>
  <EmojiOverlay :new-emoji="lastEmoji" />
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, onUnmounted, computed, watch, unref } from "vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
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

const gameStore = useGameStore();
const configStore = useConfigStore();
const partyStore = usePartyStore();
const soundStore = useSoundStore();

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
    !showBonusRoundTransition.value,
);

type BonusRoundType = "blur" | "sepia" | "bw";

const bonusRoundType = computed<BonusRoundType | null>(() => {
  const idx = gameStore.currentRoundIndex;
  const max = configStore.maxRounds;
  if (max >= 10 && idx === 4) return "blur";
  if (max >= 15 && idx === 9) return "sepia";
  if (max >= 20 && idx === 14) return "bw";
  return null;
});

const isBlurRoundActive = computed(
  () => gameStore.gameState === "revealing" && bonusRoundType.value === "blur",
);

const blurAmountPx = computed(() => {
  if (!isBlurRoundActive.value) return 0;
  const duration = timerDuration.value || 1;
  const t = typeof timer.value === "number" ? timer.value : duration;
  const ratio = Math.min(1, Math.max(0, t / duration));
  const maxBlur = 80;
  return maxBlur * ratio;
});

const canvasEffectsStyle = computed(() => {
  if (!bonusRoundType.value) return undefined;
  const filters: string[] = [];
  if (bonusRoundType.value === "blur") {
    filters.push(`blur(${blurAmountPx.value}px)`);
  }
  if (bonusRoundType.value === "sepia") {
    filters.push("sepia(1)");
    filters.push("saturate(1.2)");
  }
  if (bonusRoundType.value === "bw") {
    filters.push("grayscale(1)");
    filters.push("contrast(1.15)");
  }
  return { filter: filters.join(" ") };
});

const canvasIsRevealing = computed(
  () => Boolean(isRevealing.value && bonusRoundType.value !== "blur"),
);

const isFinalRound = computed(
  () => gameStore.currentRoundIndex === configStore.maxRounds - 1,
);
const showFinalRoundTransition = ref(false);
const finalRoundTransitionShown = ref(false);
const showBonusRoundTransition = ref(false);
const bonusRoundTransitionShownByIndex = ref<Record<number, boolean>>({});

const handleFinalRoundDone = () => {
  finalRoundTransitionShown.value = true;
  showFinalRoundTransition.value = false;
  setupDrawing();
};

const handleBonusRoundDone = () => {
  const idx = gameStore.currentRoundIndex;
  bonusRoundTransitionShownByIndex.value = {
    ...bonusRoundTransitionShownByIndex.value,
    [idx]: true,
  };
  showBonusRoundTransition.value = false;
  setupDrawing();
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

const clearAllTimers = () => {
  workerClearInterval(timerId);
  workerClearTimeout(timerEndTimeoutId);
  workerClearTimeout(navigationTimeout);
  timerId = null;
  timerEndTimeoutId = null;
  navigationTimeout = null;
};

const startTimer = () => {
  workerClearInterval(timerId);
  workerClearTimeout(timerEndTimeoutId);
  timer.value = timerDuration.value;
  
  timerEndTimeoutId = workerSetTimeout(() => {
    timerEndTimeoutId = null;
    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, timerDuration.value * 1000);

  timerId = workerSetInterval(() => {
    timer.value--;

    if (timer.value > 0) return;

    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    workerClearTimeout(timerEndTimeoutId);
    timerEndTimeoutId = null;
    // Let Vue paint the "0" before triggering the timeout flow
    // (which can immediately transition the UI to feedback/locked state).
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;
  
  clearAllTimers();
  pixelData.value = currentRound.value.data;
  resolution.value = Math.sqrt(pixelData.value.length);
  
  partyStore.openBuzzer();
  startTimer();
};

const lastEmoji = ref("")

const handleIncomingEmoji = (emojiChar: string) => {
  lastEmoji.value = emojiChar
  
  nextTick(() => {
    lastEmoji.value = ""
  })
}

watch(
  () => partyStore.roundResult,
  (newResult) => {
    if (newResult) {
      if (timer.value > 0) {
        clearAllTimers();
      }

      if (!partyStore.activePlayerId) {
        timer.value = 0;
      }
      
      gameStore.setGameState("feedback");

      navigationTimeout = workerSetTimeout(() => {
        const isLastRound = gameStore.currentRoundIndex >= configStore.maxRounds - 1;
        if (isLastRound) {
          partyStore.endGame();
        } else {
          partyStore.nextRound();
        }
      }, 4000);
    }
  }
);

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      if (isFinalRound.value && !finalRoundTransitionShown.value) {
        clearAllTimers();
        showFinalRoundTransition.value = true;
        return;
      }
      const bonusIdx = gameStore.currentRoundIndex;
      if (bonusRoundType.value && !bonusRoundTransitionShownByIndex.value[bonusIdx]) {
        clearAllTimers();
        showBonusRoundTransition.value = true;
        return;
      }
      if (!showFinalRoundTransition.value && !showBonusRoundTransition.value)
        setupDrawing();
    }
  },
  { immediate: true }
);

watch(
  () => partyStore.buzzerState,
  (newState) => {
    if (newState === "answering" && timer.value > 0) {
      workerClearInterval(timerId);
      timerId = null;
      workerClearTimeout(timerEndTimeoutId);
      timerEndTimeoutId = null;
    }
  }
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
  grid-template-columns: max(600px) minmax(400px,100%);
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
</style>
