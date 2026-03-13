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
        :pauseReveal="pauseReveal"
      />
      <TimerDisplay
        :class="{ 'is-hidden': !isRevealing || hasAnswered }"
        :count="timer"
        :max="timerDuration"
        :showSeconds="pauseReveal"
        :is-correct="hasAnsweredCorrectly"
        :is-incorrect="hasAnswered && !hasAnsweredCorrectly"
      />
    </section>
    <section class="answer-section">
      <h1>guess it</h1>
      <AnswerButtons
        v-if="showAnswers"
        :hasAnswered="hasAnswered"
        :answers="rounds[currentRoundIndex].options"
        @answered="handleAnswer"
      />
      <div v-else class="buzzer-container">
        <button @click="handleBuzzerPress" class="neon-buzzer">
          <span class="buzzer-text">I KNOW IT!</span>
          <div class="glow-layer"></div>
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
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/AnswerButtons.vue";
import { useSoundStore } from "@/stores/sound";

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
const showAnswers = ref(false);
const potentialPoints = ref(0);
const pauseReveal = ref(false);

const rounds = computed(() => gameStore.rounds);
const currentRoundIndex = computed(() => gameStore.currentRoundIndex);

const { nextRound, maxRounds } = useGameStore();

const startTimer = () => {
  if (!pixelData.value || !pixelData.value[0]) return;
  if (timer.value < timerDuration) timer.value = timerDuration;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timer.value--;
    if (timer.value <= 3) useSoundStore().playSound("timer");
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

const handleBuzzerPress = () => {
  potentialPoints.value = timer.value;
  showAnswers.value = true;
  timer.value = 5;
  pauseReveal.value = true;
  useSoundStore().playSound("buzz");
};

const handleAnswer = (isCorrect) => {
  hasAnswered.value = true;
  pauseReveal.value = false;
  if (!isCorrect) {
    pixelData.value = statusIcons.failure;
  } else {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(potentialPoints.value);
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
      showAnswers.value = false;
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

.buzzer-container {
  margin: 32px 0;
}

.buzzer-wrapper {
  padding: 16px;
  width: 100%;
}

.neon-buzzer {
  position: relative;
  width: 100%;
  padding: 20px;
  background: rgba(236, 72, 153, 0.1);
  border: 2px solid #ec4899;
  border-radius: 8px;
  color: #fff;
  font-family: "8bit", sans-serif;
  font-size: 1.5rem;
  letter-spacing: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
  text-shadow: 0 0 8px #ec4899;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
  }
  100% {
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
  }
}

.neon-buzzer {
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.neon-buzzer:active {
  background: #ec4899;
  box-shadow: 0 0 40px #ec4899;
  transform: scale(0.98);
  color: #000;
  text-shadow: none;
}

.buzzer-text {
  position: relative;
  z-index: 2;
}
</style>
