<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
        @done="start"
      />
    </transition>

    <section class="canvas-section">
      <MinimalSettings />
      <GameHeader
        :max="survivalStore.maxTime"
        :count="survivalStore.timeLeft"
        :total-score="survivalStore.solvedCount"
        :is-survival="true"
        :highscore="survivalStore.highscore"
      />
      <PixelCanvas
        ref="pixelCanvasRef"
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="survivalStore.hasAnswered"
        :timer-duration="configStore.revealTime"
      />
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="survivalStore.hasAnswered"
        :answers="survivalStore.currentDrawing?.options || []"
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useSurvivalStore } from "@/stores/survival";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { useSoundStore } from "@/stores/sound";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers";
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue";

const router = useRouter();
const survivalStore = useSurvivalStore();
const gameStore = useGameStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();

const pixelCanvasRef = ref(null);
const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const isRevealing = ref(true);

let feedbackTimeoutId = null;
let nextRoundTimeoutId = null;

const setupDrawing = () => {
  if (survivalStore.currentDrawing) {
    survivalStore.hasAnswered = false;
    isRevealing.value = true;
    pixelData.value = survivalStore.currentDrawing.data;
    resolution.value = Math.sqrt(pixelData.value.length);
  }
};

const handleAnswer = (answer) => {
  if (
    gameStore.gameState !== "revealing" ||
    survivalStore.hasAnswered ||
    survivalStore.timeLeft <= 0
  )
    return;

  survivalStore.hasAnswered = true;
  gameStore.setGameState("feedback");

  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(nextRoundTimeoutId);

  if (answer.isCorrect) {
    survivalStore.handleCorrectAnswer();
    pixelData.value = statusIcons.success;
    soundStore.playSound("correct");
  } else {
    survivalStore.handleWrongAnswer();
    pixelData.value = statusIcons.failure;
  }

  workerSetTimeout(() => {
    pixelCanvasRef.value?.playShine();
  }, 650);

  feedbackTimeoutId = workerSetTimeout(() => {
    if (survivalStore.isGameOver) return;

    isRevealing.value = false;
    pixelData.value = survivalStore.currentDrawing.data;
    gameStore.setGameState("revealed");
    workerSetTimeout(() => {
      pixelCanvasRef.value?.playShine();
    }, 650);

    nextRoundTimeoutId = workerSetTimeout(() => {
      if (survivalStore.isGameOver) return;

      survivalStore.setNextDrawing();
      setupDrawing();
    }, 1000);
  }, 1500);
};

const start = () => {
  survivalStore.startSurvival();
  setupDrawing();
};

watch(
  () => survivalStore.isGameOver,
  (over) => {
    if (over) {
      gameStore.setGameState("gameover");
      router.push("/gameover");
    }
  },
);

onUnmounted(() => {
  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(nextRoundTimeoutId);
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
