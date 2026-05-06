<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <GameTransition v-if="showTransition" message="GET READY" @done="start" />
    </transition>
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
      <PixelCanvasGravity
        v-if="mode === 'gravity'"
        :pixel-array="pixelData"
        :is-status-icon="isStatusIcon"
        :is-revealing="!hasAnswered || isStatusIcon"
      />
      <PixelCanvas
        v-else
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
        :is-magnifier-mode="mode === 'inspect'"
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
import { computed, ref, onUnmounted } from "vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import PixelCanvasGravity from "@/components/canvas/PixelCanvasGravity.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useDailyStore } from "@/stores/daily";
import { useSoundStore } from "@/stores/sound";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import router from "@/router";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { useConfigStore } from "@/stores/config";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";

const playerStore = usePlayerStore();
const configStore = useConfigStore();
const dailyStore = useDailyStore();
const gameStore = useGameStore();
const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const isStatusIcon = ref(false);
const isRevealing = ref(dailyStore.mode !== "inspect");
const showTransition = ref(true);
const timerDuration = configStore.revealTime;
const timer = ref(timerDuration);
let timerId = null;
let revealTimeoutId = null;
let nextRoundTimeoutId = null;
const hasAnsweredCorrectly = ref(false);
const mode = dailyStore.mode;

const rounds = computed(() => gameStore.rounds);
const currentRoundIndex = computed(() => gameStore.currentRoundIndex);

const nextRound = useGameStore().nextRound;
const maxRounds = useConfigStore().maxRounds;

const startTimer = () => {
  if (!pixelData.value || !pixelData.value[0]) return;
  if (timer.value < timerDuration) timer.value = timerDuration;
  workerClearInterval(timerId);
  timerId = workerSetInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) useSoundStore().playSound("timer");
    if (timer.value <= 0) {
      useSoundStore().playSound("incorrect");
      workerClearInterval(timerId);
      timerId = null;
      handleAnswer(false);
    }
  }, 1000);
};

const setDrawing = (data) => {
  hasAnswered.value = false;
  isRevealing.value = mode !== "inspect";
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
  hasAnsweredCorrectly.value = false;
  timer.value = timerDuration;
  startTimer();
};

const handleAnswer = (selectedAnswer) => {
  if (hasAnswered.value) return;
  hasAnswered.value = true;
  workerClearInterval(timerId);
  timerId = null;

  if (playerStore.isCreatorMode) {
    pixelData.value = statusIcons.question;
  } else if (!selectedAnswer?.isCorrect) {
    pixelData.value = statusIcons.failure;
    useSoundStore().playSound("incorrect");
  } else {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(timer.value);
    useSoundStore().playSound("correct");
  }

  workerClearTimeout(revealTimeoutId);
  revealTimeoutId = workerSetTimeout(() => {
    isRevealing.value = false;
    isStatusIcon.value = false;
    pixelData.value = rounds.value[currentRoundIndex.value].data;

    workerClearTimeout(nextRoundTimeoutId);
    nextRoundTimeoutId = workerSetTimeout(() => {
      const isLastRound = currentRoundIndex.value >= maxRounds - 1;

      if (isLastRound) {
        router.push("/gameover-daily");
      } else {
        nextRound();
        setDrawing(rounds.value[currentRoundIndex.value].data);
      }
    }, 1500);
  }, 1500);
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

const start = () => {
  showTransition.value = false;
  setDrawing(rounds.value[currentRoundIndex.value].data);
};

dailyStore.markAsPlayed();

onUnmounted(() => {
  workerClearTimeout(revealTimeoutId);
  workerClearTimeout(nextRoundTimeoutId);
  workerClearInterval(timerId);
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
</style>
