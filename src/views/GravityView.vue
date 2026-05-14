<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <GameTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
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

      <PixelCanvasGravity
        :pixel-array="pixelData"
        :is-status-icon="isStatusIcon"
        :is-revealing="gameStore.gameState === 'revealing' || isStatusIcon"
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
import PixelCanvasGravity from "@/components/canvas/PixelCanvasGravity.vue";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useConfigStore } from "@/stores/config";
import { useSoundStore } from "@/stores/sound";
import { useOnlineStore } from "@/stores/online";
import { statusIcons } from "@/data/statusIcons";
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

const pixelData = ref([]);
const hasAnswered = ref(false);
const isStatusIcon = ref(false);
const hasAnsweredCorrectly = ref(false);
const timerDuration = configStore.revealTime || 15;
const timer = ref(timerDuration);

let timerIntervalId = null;
let feedbackTimeoutId = null;
let solutionTimeoutId = null;

const currentRound = computed(() => gameStore.currentRound);
const maxRounds = computed(() => configStore.maxRounds);

const clearAllLocalTimers = () => {
  workerClearInterval(timerIntervalId);
  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(solutionTimeoutId);
  timerIntervalId = null;
  feedbackTimeoutId = null;
  solutionTimeoutId = null;
};

const startTimer = () => {
  workerClearInterval(timerIntervalId);
  timer.value = timerDuration;

  timerIntervalId = workerSetInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) soundStore.playSound("timer");

    if (timer.value <= 0) {
      workerClearInterval(timerIntervalId);
      handleAnswer(null);
    }
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;

  clearAllLocalTimers();
  hasAnswered.value = false;
  isStatusIcon.value = false;
  hasAnsweredCorrectly.value = false;

  pixelData.value = currentRound.value.data;

  startTimer();
};

const handleAnswer = (selectedAnswer) => {
  if (gameStore.gameState !== "revealing" || hasAnswered.value) return;

  hasAnswered.value = true;
  gameStore.setGameState("feedback");
  clearAllLocalTimers();

  if (playerStore.isCreatorMode) {
    pixelData.value = statusIcons.question;
  } else if (!selectedAnswer?.isCorrect) {
    pixelData.value = statusIcons.failure;
    soundStore.playSound("incorrect");
  } else {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(timer.value);
    soundStore.playSound("correct");
  }
  isStatusIcon.value = true;

  feedbackTimeoutId = workerSetTimeout(() => {
    isStatusIcon.value = false;
    if (currentRound.value) {
      pixelData.value = currentRound.value.data;
    }
    gameStore.setGameState("revealed");

    solutionTimeoutId = workerSetTimeout(() => {
      if (gameStore.currentRoundIndex >= configStore.maxRounds - 1) {
        onlineStore.broadcastScore();
        gameStore.setGameState("gameover");
        router.push("/gameover");
      } else {
        hasAnswered.value = false;
        hasAnsweredCorrectly.value = false;
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
  margin: 0 auto;
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
