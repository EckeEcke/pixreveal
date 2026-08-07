<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
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
    </transition>

    <section class="canvas-section">
      <MinimalSettings />
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="hasAnsweredCorrectly"
        :is-incorrect="hasAnswered && !hasAnsweredCorrectly"
        :is-bonus="(!!bonusRoundType || isFinalRound) && !hasAnswered"
        :total-score="playerStore.points"
        :currentRound="gameStore.currentRoundIndex + 1"
        :max-rounds="maxRounds"
        :is-survival="false"
      />

      <div class="canvas-effects" :style="canvasEffectsStyle">
        <PixelCanvas
          ref="pixelCanvasRef"
          :pixel-array="pixelData"
          :resolution="resolution"
          :is-revealing="canvasIsRevealing"
          :is-status-icon="hasAnswered && !hasAnsweredCorrectly"
          :timer-duration="timerDuration"
          :pauseReveal="showFinalRoundTransition || showBonusRoundTransition"
        />
        <div v-if="isBlurRoundActive" class="blur-overlay" />
      </div>
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="hasAnswered && !playerStore.isCreatorMode"
        :answers="currentRound?.options || []"
        :inputDisabled="
          showFinalRoundTransition ||
          showBonusRoundTransition ||
          gameStore.gameState !== 'revealing'
        "
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch, unref } from "vue";
import { useRouter } from "vue-router";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue";
import { useOnlineStore } from "@/stores/online";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { useConfigStore } from "@/stores/config";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import { useBonusRounds } from "@/composables/useBonusRounds";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";

const router = useRouter();
const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const configStore = useConfigStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();

const pixelCanvasRef = ref<{
  playShine: () => void;
  playShake: () => void;
  triggerCorrectAnswer: () => void;
  triggerIncorrectAnswer: () => void;
} | null>(null);

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const isRevealing = ref(true);
const hasAnsweredCorrectly = ref(false);
const timer = ref<number>(Number(unref(configStore.revealTime)));
const timerDuration = computed(() => Number(unref(configStore.revealTime)));

let timerId: number | null = null;
let feedbackTimeoutId: number | null = null;
let solutionTimeoutId: number | null = null;

const currentRound = computed(() => gameStore.currentRound);
const maxRounds = computed(() => Number(configStore.maxRounds));

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
  maxRounds,
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

const clearAllLocalTimers = () => {
  workerClearInterval(timerId);
  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(solutionTimeoutId);
  timerId = null;
  feedbackTimeoutId = null;
  solutionTimeoutId = null;
};

const startTimer = () => {
  workerClearInterval(timerId);
  timer.value = timerDuration.value;

  timerId = workerSetInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) {
      soundStore.playSound("timer");
      pixelCanvasRef.value?.playShake();
    }
    if (timer.value <= 0) {
      workerClearInterval(timerId);
      handleAnswer(null);
    }
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;

  clearAllLocalTimers();

  hasAnswered.value = false;
  hasAnsweredCorrectly.value = false;

  suppressFilterTransition.value = true;
  isRevealing.value = true;

  pixelData.value = currentRound.value.data;
  resolution.value = Math.sqrt(pixelData.value.length);

  startTimer();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressFilterTransition.value = false;
    });
  });
};

const goToNextRound = () => {
  gameStore.nextRound();

  if (gameStore.isGameOver) {
    onlineStore.broadcastScore();
    const isOnlineRoute =
      router.currentRoute.value.name === "online" ||
      router.currentRoute.value.path === "/online";
    router.push(isOnlineRoute ? "/gameover-online" : "/gameover");
  }
};

const handleAnswer = (selectedOption: any) => {
  if (gameStore.gameState !== "revealing" || hasAnswered.value) return;

  hasAnswered.value = true;
  gameStore.setGameState("feedback");
  clearAllLocalTimers();

  if (playerStore.isCreatorMode) {
    pixelData.value = statusIcons.question;
  } else if (selectedOption?.isCorrect) {
    hasAnsweredCorrectly.value = true;
    pixelCanvasRef.value?.triggerCorrectAnswer();

    const multiplier = isFinalRound.value || !!bonusRoundType.value ? 2 : 1;
    playerStore.addPoints(timer.value * multiplier);
    soundStore.playSound("correct");

    feedbackTimeoutId = workerSetTimeout(() => {
      goToNextRound();
    }, 1500);

  } else {
    hasAnsweredCorrectly.value = false;
    pixelCanvasRef.value?.triggerIncorrectAnswer();
    soundStore.playSound("incorrect");

    feedbackTimeoutId = workerSetTimeout(() => {
      goToNextRound();
    }, 1800);
  }

  playerStore.pushToAnswerHistory(selectedOption?.isCorrect ?? false);
};

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      const transition = shouldShowTransitionOnRevealing();
      if (transition === "final") {
        hasAnswered.value = false;
        hasAnsweredCorrectly.value = false;
        clearAllLocalTimers();
        showFinalRoundTransition.value = true;
        return;
      }
      if (transition === "bonus") {
        hasAnswered.value = false;
        hasAnsweredCorrectly.value = false;
        clearAllLocalTimers();
        showBonusRoundTransition.value = true;
        return;
      }
      setupDrawing();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearAllLocalTimers();
});
</script>

<style scoped>
.game-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  max-width: 500px;
  width: 100%;
}

@media (min-width: 1024px) {
  .game-layout {
    position: relative;
    grid-template-columns: 1fr 400px;
    gap: 64px;
    max-width: calc(950px + 2rem);
  }
}

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 16px 0 32px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.canvas-effects {
  position: relative;
  width: 100%;
  transition: filter 600ms ease;
  will-change: filter;
  overflow: hidden;
}

.blur-overlay {
  position: absolute;
  inset: 0;
  border-radius: 0px;
  background: rgba(56, 189, 248, 0.12);
  pointer-events: none;
  mix-blend-mode: screen;
}
</style>