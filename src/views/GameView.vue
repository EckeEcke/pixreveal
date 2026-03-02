<template>
  <main class="game-layout">
    <section class="canvas-section">
      <PlayerDisplay />
      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="true"
        :is-status-icon="hasAnswered"
      />
    </section>
    <section class="answer-section">
      <h1>What is being displayed?</h1>
      <div class="answer-buttons">
        <button
          class="btn-outline"
          v-for="answer in rounds[currentRoundIndex].options"
          :disabled="hasAnswered"
          :class="{
            'is-wrong':
              hasAnswered && selectedAnswer === answer.title && !answer.isCorrect,
            'is-correct': hasAnswered && answer.isCorrect,
          }"
          @click="checkAnswer(answer)"
        >
          {{ answer.title }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import PixelCanvas from "../components/PixelCanvas.vue";
import drawings from "@/data/drawings";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useGame } from "@/composables/useQuizData";

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const selectedAnswer = ref(undefined);

const setDrawing = (data) => {
  hasAnswered.value = false;
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
};

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

const answers = [
  {
    title: "Mario",
    isCorrect: true,
  },
  {
    title: "Watermelon",
    isCorrect: false,
  },
  {
    title: "Pacman",
    isCorrect: false,
  },
  {
    title: "Heart",
    isCorrect: false,
  },
];

const checkAnswer = (answer) => {
  selectedAnswer.value = answer.title;
  pixelData.value = answer.isCorrect ? statusIcons.success : statusIcons.failure;
  hasAnswered.value = true;
};

const { initGame, rounds, currentRoundIndex } = useGame();
initGame();
setDrawing(rounds.value[currentRoundIndex.value].data);
</script>

<style>
body {
  margin: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: "Inter", sans-serif;
}

.logo {
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  margin-bottom: 2rem;
}

.logo span {
  color: var(--neon-orange);
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  max-width: calc(1000px + 2rem);
  width: 100%;
  @media (min-width: 512px) {
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
  @media (min-width: 768px) {
    grid-template-columns: 1fr 400px;
  }
}

.tool-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #2a2d3e;
}

textarea {
  width: 100%;
  height: 200px;
  background: #000;
  color: #0f0;
  font-family: monospace;
  border: 1px solid #333;
  padding: 10px;
  box-sizing: border-box;
  resize: none;
}

.btn-secondary {
  margin-top: 1rem;
  background: transparent;
  border: 1px solid var(--neon-orange);
  color: var(--neon-orange);
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

.btn-secondary:hover {
  background: var(--neon-orange);
  color: white;
}

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.answer-buttons {
  display: grid;
  grid-template-columns: repeat(1fr);
  gap: 1rem;
}
</style>
