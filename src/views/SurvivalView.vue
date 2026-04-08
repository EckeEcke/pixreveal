<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <GameTransition v-if="showTransition" message="GET READY" @done="start" />
    </transition>

    <section class="canvas-section">
      <GameHeader
        :max="store.maxTime"
        :count="store.timeLeft"
        :total-score="store.solvedCount"
        :is-survival="true"
        :highscore="store.highscore"
      />
      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="store.hasAnswered"
        :timer-duration="useConfigStore().revealTime"
      />
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="store.hasAnswered"
        :answers="store.currentDrawing?.options"
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue";
import { useSurvivalStore } from "@/stores/survival";
import PixelCanvas from "../components/PixelCanvas.vue";
import GameTransition from "@/components/GameTransition.vue";
import router from "@/router";
import GameHeader from "@/components/GameHeader.vue";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/AnswerButtons.vue";
import { useConfigStore } from "@/stores/config";

const store = useSurvivalStore();

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const isRevealing = ref(true);
const showTransition = ref(true);

const setDrawing = () => {
  if (store.currentDrawing) {
    store.hasAnswered = false;
    isRevealing.value = true;
    pixelData.value = store.currentDrawing.data;
    resolution.value = Math.sqrt(pixelData.value.length);
  }
};

const handleAnswer = (isCorrect) => {
  store.isRevealing = false;
  store.hasAnswered = true;
  if (isCorrect) {
    store.handleCorrectAnswer();
    pixelData.value = statusIcons.success;
  } else {
    store.handleWrongAnswer();
    pixelData.value = statusIcons.failure;
  }

  setTimeout(() => {
    isRevealing.value = false;
    pixelData.value = store.currentDrawing.data;
    setTimeout(() => {
      isRevealing.value = true;
      store.setNextDrawing();
      pixelData.value = store.currentDrawing.data;
      setDrawing();
    }, 1000);
    store.hasAnswered = false;
  }, 1000);
};

watch(
  () => store.isGameOver,
  (over) => {
    if (over) router.push("/gameover");
  },
);

const start = () => {
  store.startSurvival();
  showTransition.value = false;
  setDrawing();
};

onUnmounted(() => {
  if (store.timerInterval) clearInterval(store.timerInterval);
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

.canvas-section {
  @media (min-width: 1024px) {
    border-right: 2px solid #334155;
  }
}

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 16px 0 32px;
}
</style>
