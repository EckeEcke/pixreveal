<template>
  <main class="game-layout">
    <section class="canvas-section">
      <PlayerDisplay
        :name="playerStore.playerName"
        :avatar-index="playerStore.avatarIndex"
        :points="playerStore.points"
        :correct-answers="playerStore.correctAnswers"
        :round-index="gameStore.currentRoundIndex + 1"
        :max-rounds="maxRounds"
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
        :is-correct="hasAnsweredCorrectly"
        :is-incorrect="hasAnswered && !hasAnsweredCorrectly"
      />
    </section>
    <section class="answer-section">
      <h1>guess it</h1>
      <AnswerButtons
        :hasAnswered="hasAnswered"
        :answers="rounds[currentRoundIndex].options"
        @answered="handleAnswer"
      />
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
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/AnswerButtons.vue";

const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const isRevealing = ref(true);
const timerDuration = 15;
const timer = ref(timerDuration);
let timerId = null;
let revealTimeoutId = null;
let nextRoundTimeoutId = null;
const hasAnsweredCorrectly = ref(false);

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
      handleAnswer(false);
    }
  }, 1000);
};

const setDrawing = (data) => {
  hasAnswered.value = false;
  isRevealing.value = true;
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
  hasAnsweredCorrectly.value = false;
  timer.value = timerDuration;
  startTimer();
};

const handleAnswer = (isCorrect) => {
  hasAnswered.value = true;
  if (!isCorrect) {
    pixelData.value = statusIcons.failure;
  } else {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(timer.value);
  }

  clearInterval(timerId);
  revealTimeoutId = setTimeout(() => {
    isRevealing.value = false;
    pixelData.value = rounds.value[currentRoundIndex.value].data;
  }, 1500);
  nextRoundTimeoutId = setTimeout(() => {
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
  clearTimeout(revealTimeoutId);
  clearTimeout(nextRoundTimeoutId);
  clearInterval(timerId);
  clearInterval(heartbeat);
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

.answer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 32px;
  }
}

.answer-btn {
  @media (min-width: 769px) {
    padding: 16px;
    font-size: 18px;
  }
}

.btn-pink {
  color: var(--neon-pink);
  border: 2px solid var(--neon-pink);
  background: var(--pink-bg);
  box-shadow:
    0 0 10px var(--pink-glow),
    inset 0 0 5px var(--pink-glow);
  text-shadow: 0 0 5px var(--pink-glow);
}

.btn-yellow {
  color: var(--neon-yellow);
  border: 2px solid var(--neon-yellow);
  background: var(--yellow-bg);
  box-shadow:
    0 0 10px var(--yellow-glow),
    inset 0 0 5px var(--yellow-glow);
  text-shadow: 0 0 5px var(--yellow-glow);
}

.btn-blue {
  color: var(--neon-blue);
  border: 2px solid var(--neon-blue);
  background: var(--blue-bg);
  box-shadow:
    0 0 10px var(--blue-glow),
    inset 0 0 5px var(--blue-bg);
  text-shadow: 0 0 5px var(--blue-glow);
}

.btn-purple {
  color: var(--neon-purple);
  border: 2px solid var(--neon-purple);
  background: var(--purple-bg);
  box-shadow:
    0 0 10px var(--purple-glow),
    inset 0 0 5px var(--purple-glow);
  text-shadow: 0 0 5px var(--purple-bg);
}

.answer-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.answer-btn.is-correct {
  background-color: var(--neon-success);
  opacity: 1;
  color: var(--text-main);
  border: none;
  color: var(--white);
  box-shadow:
    0 0 20px var(--neon-success),
    0 0 40px var(--neon-success);
  animation:
    sharp-pulse 1s infinite,
    floating 1s infinite;
}

.answer-btn.is-wrong {
  background-color: var(--neon-error);
  opacity: 1;
  color: var(--text-main);
  border: none;
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  box-shadow:
    0 0 20px var(--neon-error),
    0 0 40px var(--neon-error);
}

.answer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background: #222222aa;
  backdrop-filter: blur(20px);
  padding: 10px;
  text-transform: uppercase;
  font-family: inherit;
  letter-spacing: 2px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
}

@media (hover: hover) {
  .btn-pink:not(:disabled):hover {
    background: var(--pink-bg);
    box-shadow: 0 0 20px var(--neon-pink);
    transform: translateY(-2px);
  }
  .btn-purple:not(:disabled):hover {
    background: var(--purple-bg);
    box-shadow: 0 0 20px var(--neon-purple);
    transform: translateY(-2px);
  }

  .btn-blue:not(:disabled):hover {
    background: var(--blue-bg);
    box-shadow: 0 0 20px var(--neon-blue);
    transform: translateY(-2px);
  }

  .btn-yellow:not(:disabled):hover {
    background: var(--yellow-bg);
    box-shadow: 0 0 20px var(--neon-yellow);
    transform: translateY(-2px);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-10px);
  }
  40% {
    transform: translateX(10px);
  }
  60% {
    transform: translateX(-10px);
  }
  80% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
