<template>
  <main class="game-layout">
    <section class="canvas-section">
      <PlayerDisplay
        :name="playerStore.playerName"
        :avatar-index="playerStore.avatarIndex"
        :points="playerStore.points"
        :correct-answers="playerStore.correctAnswers"
        :round-index="gameStore.currentRoundIndex + 1"
        :max-rounds="gameStore.maxRounds"
        class="hud"
      />
      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
      />
      <TimerDisplay
        :class="{ 'is-hidden': !isRevealing || hasAnswered }"
        :count="timer"
        :max="timerDuration"
      />
    </section>
    <section class="answer-section">
      <h1>What is it?</h1>
      <div class="answer-buttons">
        <button
          class="btn-outline"
          v-for="answer in rounds[currentRoundIndex].options"
          :disabled="hasAnswered"
          :class="{
            'is-wrong':
              hasAnswered &&
              selectedAnswer === answer.title &&
              !answer.isCorrect,
            'is-correct': hasAnswered && answer.isCorrect,
          }"
          @click="checkAnswer(answer, $event)"
        >
          {{ answer.title }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import PixelCanvas from "../components/PixelCanvas.vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import TimerDisplay from "@/components/TimerDisplay.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import router from "@/router";
import { useOnlineStore } from "@/stores/online";
import { useSoundStore } from "@/stores/sound";

const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const soundstore = useSoundStore();
const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const selectedAnswer = ref(undefined);
const isRevealing = ref(true);
const timerDuration = 15;
const timer = ref(timerDuration);
let timerId = null;

const rounds = computed(() => gameStore.rounds);
const currentRoundIndex = computed(() => gameStore.currentRoundIndex);

const { nextRound, maxRounds } = useGameStore();

const startTimer = () => {
  if (!pixelData.value || !pixelData.value[0]) return;
  if (timer.value < timerDuration) timer.value = timerDuration;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(timerId);
      checkAnswer(null);
    }
  }, 1000);
};

const setDrawing = (data) => {
  hasAnswered.value = false;
  isRevealing.value = true;
  selectedAnswer.value = undefined;
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
  timer.value = timerDuration;
  startTimer();
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

const checkAnswer = (answer, event) => {
  if (event) event.currentTarget.blur();
  selectedAnswer.value = answer ? answer.title : null;
  pixelData.value =
    answer === null || !answer.isCorrect
      ? statusIcons.failure
      : statusIcons.success;
  hasAnswered.value = true;
  if (answer && answer.isCorrect) {
    playerStore.addPoints(timer.value);
    soundstore.playSound("correct");
  } else soundstore.playSound("incorrect");
  clearInterval(timerId);
  setTimeout(() => {
    isRevealing.value = false;
    pixelData.value = rounds.value[currentRoundIndex.value].data;
  }, 1500);
  setTimeout(() => {
    if (currentRoundIndex.value < maxRounds - 1) {
      nextRound();
      setDrawing(rounds.value[currentRoundIndex.value].data);
    } else {
      onlineStore.broadcastScore();
      router.push("/gameover");
    }
  }, 3000);
};

setDrawing(rounds.value[currentRoundIndex.value].data);

const activeChannel = computed(() => onlineStore.ac);

const heartbeat = setInterval(() => {
  if (activeChannel.value) {
    activeChannel.value.trigger("client-heartbeat", { timestamp: Date.now() });
  }
}, 20000);

const requestWakeLock = async () => {
  try {
    const wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    console.log(`${err.name}, ${err.message}`);
  }
};

onMounted(() => requestWakeLock());

onUnmounted(() => {
  clearInterval(timerId);
  clearInterval(heartbeat);
});
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

.hud {
  margin-bottom: 16px;
}
</style>
