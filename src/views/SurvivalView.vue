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
      <TimerDisplay
        :count="store.timeLeft"
        :max="store.maxTime"
        showSeconds
      />
    </section>

    <section class="answer-section">
      <h1>SURVIVAL</h1>
      <div class="answer-buttons">
        <button
          class="answer-btn"
          v-for="(answer, index) in store.currentDrawing?.options"
          :key="answer.name"
          :disabled="store.hasAnswered"
          :class="[
            buttonColors[index % buttonColors.length],
            {
              'is-wrong':
                store.hasAnswered &&
                selectedAnswer === answer.name &&
                !answer.isCorrect,
              'is-correct': store.hasAnswered && answer.isCorrect,
            },
          ]"
          @click="checkAnswer(answer, $event)"
        >
          {{ answer.name }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useSurvivalStore } from "@/stores/survival";
import { useSoundStore } from "@/stores/sound";
import PixelCanvas from "../components/PixelCanvas.vue";
import router from "@/router";
import { usePlayerStore } from "@/stores/player";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import TimerDisplay from "@/components/TimerDisplay.vue";

const store = useSurvivalStore();
const soundStore = useSoundStore();
const playerStore = usePlayerStore()

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const selectedAnswer = ref(undefined);
const isRevealing = ref(true);
const buttonColors = ["btn-pink", "btn-blue", "btn-purple", "btn-yellow"];

const statusIcons = {
  success: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 0, 0, 0],
    [0, 9, 9, 0, 0, 0, 0, 0, 9, 9, 0, 0, 0, 0, 0, 0],
    [0, 0, 9, 9, 0, 0, 0, 9, 9, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 9, 9, 0, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  failure: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0],
    [0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0],
    [0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0],
    [0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
    [0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0],
    [0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0],
    [0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

const setDrawing = () => {
  if (store.currentDrawing) {
    store.hasAnswered = false;
    isRevealing.value = true;
    selectedAnswer.value = undefined;
    pixelData.value = store.currentDrawing.data;
    resolution.value = Math.sqrt(pixelData.value.length);
  }
};

const checkAnswer = (answer, event) => {
  store.hasAnswered = true;
  if (event) event.currentTarget.blur();
  selectedAnswer.value = answer.name;
  const isCorrect = answer.isCorrect;

  pixelData.value = isCorrect ? statusIcons.success : statusIcons.failure;

  if (isCorrect) {
    soundStore.playSound("correct");
    store.handleCorrectAnswer();
  } else {
    soundStore.playSound("incorrect");
    store.handleWrongAnswer();
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
  max-width: calc(1000px + 2rem);
  width: 100%;
}

@media (min-width: 769px) {
  .game-layout {
    grid-template-columns: 1fr 400px;
    gap: 64px;
  }
}

.survival-hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-family: "8bit", sans-serif;
}

.stat-block .value {
  font-size: 2rem;
  color: var(--neon-blue);
  margin-left: 10px;
}

.timer-block {
  width: 150px;
  text-align: right;
}

.timer-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 5px;
}

.timer-bar-fill {
  height: 100%;
  background: var(--neon-blue);
  box-shadow: 0 0 10px var(--blue-glow);
  transition: width 1s linear;
}

.is-critical .timer-bar-fill {
  background: var(--neon-pink);
  box-shadow: 0 0 10px var(--pink-glow);
}

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.answer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (min-width: 769px) {
  .answer-buttons {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.answer-btn {
  background: #222222aa;
  backdrop-filter: blur(20px);
  padding: 12px;
  text-transform: uppercase;
  font-family: inherit;
  letter-spacing: 2px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-pink {
  border-color: var(--neon-pink);
  color: var(--neon-pink);
  box-shadow: 0 0 10px var(--pink-glow);
}
.btn-blue {
  border-color: var(--neon-blue);
  color: var(--neon-blue);
  box-shadow: 0 0 10px var(--blue-glow);
}
.btn-purple {
  border-color: var(--neon-purple);
  color: var(--neon-purple);
  box-shadow: 0 0 10px var(--purple-glow);
}
.btn-yellow {
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
  box-shadow: 0 0 10px var(--yellow-glow);
}

.answer-btn.is-correct {
  background-color: var(--neon-success);
  box-shadow: 0 0 20px var(--neon-success);
  color: white;
}

.answer-btn.is-wrong {
  background-color: var(--neon-error);
  box-shadow: 0 0 20px var(--neon-error);
  color: white;
  animation: shake 0.4s both;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}
</style>
