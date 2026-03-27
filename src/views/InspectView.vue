<template>
  <main class="game-layout">
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
      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="false"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
        :is-magnifier-mode="true"
        :mouse-pos="mousePos"
        @mousemove="updateMousePos"
        @touchstart="updateTouchPos"
        @touchmove="updateTouchPos"
      />
    </section>
    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="hasAnswered && !playerStore.isCreatorMode"
        :answers="rounds[currentRoundIndex].options"
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import PixelCanvas from "../components/PixelCanvas.vue";
import GameHeader from "@/components/GameHeader.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import router from "@/router";
import { useOnlineStore } from "@/stores/online";
import { useSoundStore } from "@/stores/sound";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/AnswerButtons.vue";
import { useConfigStore } from "@/stores/config";

const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const configStore = useConfigStore();
const gameStore = useGameStore();
const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const isRevealing = ref(true);
const timerDuration = configStore.revealTime;
const timer = ref(timerDuration);
let timerId = null;
let revealTimeoutId = null;
let nextRoundTimeoutId = null;
const hasAnsweredCorrectly = ref(false);

const rounds = computed(() => gameStore.rounds);
const currentRoundIndex = computed(() => gameStore.currentRoundIndex);

const nextRound = useGameStore().nextRound;
const maxRounds = useConfigStore().maxRounds;

const startTimer = () => {
  if (!pixelData.value || !pixelData.value[0]) return;
  if (timer.value < timerDuration) timer.value = timerDuration;
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) useSoundStore().playSound("timer");
    if (timer.value <= 0) {
      useSoundStore().playSound("incorrect");
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
  if (playerStore.isCreatorMode) {
    pixelData.value = statusIcons.question;
  } else if (!isCorrect) {
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

const mousePos = ref({ x: 300, y: 300 });

const updateMousePos = (event) => {
  const rect = event.target.getBoundingClientRect();
  const scaleX = 600 / rect.width;
  const scaleY = 600 / rect.height;
  mousePos.value = {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

const updateTouchPos = (event) => {
  if (event.cancelable) event.preventDefault();

  const touch = event.touches[0];
  const canvasElement = event.currentTarget.$el
    ? event.currentTarget.$el.querySelector("canvas")
    : event.target;

  const rect = canvasElement.getBoundingClientRect();

  const scaleX = 600 / rect.width;
  const scaleY = 600 / rect.height;

  mousePos.value = {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  };
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

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 16px 0 32px;
}
</style>
