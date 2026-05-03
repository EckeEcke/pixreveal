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
        :pixel-array="pixelData"
        :is-status-icon="isStatusIcon"
        :is-revealing="!hasAnswered || isStatusIcon"
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
import PixelCanvasGravity from "@/components/canvas/PixelCanvasGravity.vue";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useConfigStore } from "@/stores/config";
import { useSoundStore } from "@/stores/sound";
import { useOnlineStore } from "@/stores/online";
import { statusIcons } from "@/data/statusIcons";
import router from "@/router";

const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const configStore = useConfigStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();

const pixelData = ref([]);
const hasAnswered = ref(false);
const isStatusIcon = ref(false);
const hasAnsweredCorrectly = ref(false);
const timerDuration = configStore.revealTime || 15;
const timer = ref(timerDuration);
const showTransition = ref(true);

let timerId = null;
let revealTimeoutId = null;
let nextRoundTimeoutId = null;

const rounds = computed(() => gameStore.rounds);
const currentRoundIndex = computed(() => gameStore.currentRoundIndex);
const maxRounds = configStore.maxRounds;

const startTimer = () => {
  if (timerId) clearInterval(timerId);
  timer.value = timerDuration;
  timerId = setInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) soundStore.playSound("timer");
    if (timer.value <= 0) {
      soundStore.playSound("incorrect");
      clearInterval(timerId);
      handleAnswer(false);
    }
  }, 1000);
};

const setDrawing = (data) => {
  hasAnswered.value = false;
  isStatusIcon.value = false;
  pixelData.value = data;
  hasAnsweredCorrectly.value = false;
  timer.value = timerDuration;
  startTimer();
};

const handleAnswer = (selectedAnswer) => {
  if (hasAnswered.value) return;
  hasAnswered.value = true;
  clearInterval(timerId);

  if (playerStore.isCreatorMode) {
    pixelData.value = statusIcons.question;
  } else if (!selectedAnswer?.isCorrect) {
    pixelData.value = statusIcons.failure;
    soundStore.playSound("incorrect");
  } else {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(timer.value);
    soundStore.playSound("success");
  }
  isStatusIcon.value = true;

  revealTimeoutId = setTimeout(() => {
    isStatusIcon.value = false;
    pixelData.value = rounds.value[currentRoundIndex.value].data;

    nextRoundTimeoutId = setTimeout(() => {
      if (currentRoundIndex.value < maxRounds - 1) {
        gameStore.nextRound();
        setDrawing(rounds.value[currentRoundIndex.value].data);
      } else {
        onlineStore.broadcastScore();
        router.push("/gameover");
      }
    }, 1500);
  }, 1500);
};

const activeChannel = computed(() => onlineStore.ac);
const heartbeat = setInterval(() => {
  if (activeChannel.value) {
    activeChannel.value.trigger("client-heartbeat", { timestamp: Date.now() });
  }
}, 20000);

const start = () => {
  showTransition.value = false;
  setDrawing(rounds.value[currentRoundIndex.value].data);
};

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
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .game-layout {
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
