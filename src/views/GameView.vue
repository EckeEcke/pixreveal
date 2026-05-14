<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <GameTransition
        v-if="gameStore.gameState === 'starting'"
        @done="gameStore.setGameState('revealing')"
      />
    </transition>

    <section class="canvas-section">
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="hasAnsweredCorrectly"
        :is-incorrect="hasAnswered && !hasAnsweredCorrectly"
        :total-score="playerStore.points"
        :currentRound="gameStore.currentRoundIndex + 1"
        :max-rounds="maxRounds"
        :is-survival="false"
      />

      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
      />
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="hasAnswered && !playerStore.isCreatorMode"
        :answers="currentRound?.options || []"
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup>
import { computed, ref, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import { useOnlineStore } from "@/stores/online";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { useConfigStore } from "@/stores/config";
import GameHeader from "@/components/game-ui/GameHeader.vue";
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

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const isRevealing = ref(true);
const hasAnsweredCorrectly = ref(false);
const timer = ref(configStore.revealTime);
const timerDuration = configStore.revealTime;

let timerId = null;
let feedbackTimeoutId = null;
let solutionTimeoutId = null;

const currentRound = computed(() => gameStore.currentRound);
const maxRounds = computed(() => configStore.maxRounds);

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
  timer.value = timerDuration;

  timerId = workerSetInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) soundStore.playSound("timer");
    if (timer.value <= 0) {
      workerClearInterval(timerId);
      handleAnswer(null);
    }
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;

  clearAllLocalTimers();
  // Reset local answer state BEFORE showing new content
  hasAnswered.value = false;
  hasAnsweredCorrectly.value = false;
  isRevealing.value = true;

  pixelData.value = currentRound.value.data;
  resolution.value = Math.sqrt(pixelData.value.length);

  startTimer();
};

const handleAnswer = (selectedOption) => {
  if (gameStore.gameState !== "revealing" || hasAnswered.value) return;

  hasAnswered.value = true;
  gameStore.setGameState("feedback");
  clearAllLocalTimers();

  if (playerStore.isCreatorMode) {
    pixelData.value = statusIcons.question;
  } else if (selectedOption?.isCorrect) {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(timer.value);
    soundStore.playSound("correct");
  } else {
    pixelData.value = statusIcons.failure;
    hasAnsweredCorrectly.value = false;
    soundStore.playSound("incorrect");
  }

  feedbackTimeoutId = workerSetTimeout(() => {
    isRevealing.value = false;
    if (currentRound.value) {
      pixelData.value = currentRound.value.data;
    }
    gameStore.setGameState("revealed");

    solutionTimeoutId = workerSetTimeout(() => {
      if (gameStore.currentRoundIndex >= maxRounds.value - 1) {
        onlineStore.broadcastScore();
        gameStore.setGameState("gameover");
        router.push("/gameover");
      } else {
        gameStore.nextRound();
      }
    }, 1500);
  }, 1500);
};

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
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
</style>
