<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        @done="gameStore.setGameState('revealing')"
      />
    </transition>

    <section class="canvas-section">
      <MinimalSettings />
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
        :is-revealing="false"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
        :is-magnifier-mode="gameStore.gameState === 'revealing'"
        :mouse-pos="mousePos"
        @mousemove="updateMousePos"
        @touchstart="updateTouchPos"
        @touchmove="updateTouchPos"
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
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useConfigStore } from "@/stores/config";
import { useOnlineStore } from "@/stores/online";
import { useSoundStore } from "@/stores/sound";
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

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const hasAnsweredCorrectly = ref(false);
const timer = ref(configStore.revealTime);
const timerDuration = configStore.revealTime;
const mousePos = ref({ x: 300, y: 300 });

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
  hasAnswered.value = false;
  hasAnsweredCorrectly.value = false;

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

// Lupe/Magnifier Positionen
const updateMousePos = (event) => {
  if (gameStore.gameState !== "revealing") return;
  const rect = event.target.getBoundingClientRect();
  const scaleX = 600 / rect.width;
  const scaleY = 600 / rect.height;
  mousePos.value = {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

const updateTouchPos = (event) => {
  if (gameStore.gameState !== "revealing") return;
  if (event.cancelable) event.preventDefault();
  const touch = event.touches[0];
  const canvasElement =
    event.currentTarget.$el?.querySelector("canvas") || event.target;
  const rect = canvasElement.getBoundingClientRect();
  const scaleX = 600 / rect.width;
  const scaleY = 600 / rect.height;
  mousePos.value = {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  };
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
  @media (min-width: 1024px) {
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
</style>
