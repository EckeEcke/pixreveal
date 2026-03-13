<template>
  <main class="game-layout">
    <section class="canvas-section">
      <PlayerDisplay
        :name="playerStore.playerName"
        :avatar-index="playerStore.avatarIndex"
        :points="store.solvedCount"
        class="hud"
        :highscore="store.highscore"
      />
      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="store.hasAnswered"
        :timer-duration="15"
      />
      <TimerDisplay :count="store.timeLeft" :max="store.maxTime" showSeconds />
    </section>

    <section class="answer-section">
      <h1>SURVIVAL</h1>
      <AnswerButtons
        :hasAnswered="store.hasAnswered"
        :answers="store.currentDrawing?.options"
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useSurvivalStore } from "@/stores/survival";
import PixelCanvas from "../components/PixelCanvas.vue";
import router from "@/router";
import { usePlayerStore } from "@/stores/player";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import TimerDisplay from "@/components/TimerDisplay.vue";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/AnswerButtons.vue";

const store = useSurvivalStore();
const playerStore = usePlayerStore();

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const isRevealing = ref(true);

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
    store.hasAnswered = false;
    pixelData.value = store.currentDrawing.data;
    setTimeout(() => {
      isRevealing.value = true;
      store.setNextDrawing();
      pixelData.value = store.currentDrawing.data;
      setDrawing();
    }, 1000);
  }, 1000);
};

watch(
  () => store.isGameOver,
  (over) => {
    if (over) router.push("/gameover");
  },
);

onMounted(() => {
  store.startSurvival();
  setDrawing();
});

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

h1 {
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  animation: pulse 1s forwards;
}

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 32px 0;
}
</style>
