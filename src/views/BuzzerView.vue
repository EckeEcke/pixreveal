<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
        @done="gameStore.setGameState('revealing')"
      />
    </transition>

    <section class="canvas-section">
    <MinimalSettings />
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
        :is-revealing="isRevealing"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
        :pauseReveal="pauseReveal"
      />
    </section>

    <section class="answer-section">
      <transition name="fade" mode="out-in">
        <AnswerButtons
          v-if="showAnswers"
          :hasAnswered="hasAnswered"
          :answers="currentRound?.options || []"
          @answered="handleAnswer"
        />
        <div v-else class="buzzer-container">
          <button @click="handleBuzzerPress" class="neon-buzzer">
            <span class="buzzer-text">I KNOW IT!</span>
            <div class="glow-layer"></div>
          </button>
        </div>
      </transition>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useConfigStore } from "@/stores/config";
import { useOnlineStore } from "@/stores/online";
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { statusIcons } from "@/data/statusIcons";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";

const router = useRouter();
const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const hasAnswered = ref(false);
const isRevealing = ref(true);
const hasAnsweredCorrectly = ref(false);
const timer = ref(configStore.revealTime);
const timerDuration = configStore.revealTime;

const showAnswers = ref(false);
const potentialPoints = ref(0);
const pauseReveal = ref(false);

let timerId = null;
let feedbackTimeoutId = null;
let solutionTimeoutId = null;

const currentRound = computed(() => gameStore.currentRound);
const maxRounds = computed(() => configStore.maxRounds);

const clearAllLocalTimers = () => {
  workerClearInterval(timerId);
  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(solutionTimeoutId);
  timerId = null;
  feedbackTimeoutId = null;
  solutionTimeoutId = null;
};

const startTimer = () => {
  workerClearInterval(timerId);
  timer.value = timerDuration;

  timerId = workerSetInterval(() => {
    timer.value--;
    if (timer.value <= 3 && timer.value > 0) soundStore.playSound("timer");

    if (timer.value <= 0) {
      workerClearInterval(timerId);
      if (!showAnswers.value) {
        gameStore.setGameState("answering");
      }
      
      handleAnswer(null);
    }
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;

  clearAllLocalTimers();
  hasAnswered.value = false;
  hasAnsweredCorrectly.value = false;
  isRevealing.value = true;
  showAnswers.value = false;
  pauseReveal.value = false;

  pixelData.value = currentRound.value.data;
  resolution.value = Math.sqrt(pixelData.value.length);

  startTimer();
};

const handleBuzzerPress = () => {
  if (gameStore.gameState !== "revealing" || showAnswers.value || hasAnswered.value) {
    return;
  }

  potentialPoints.value = timer.value;
  showAnswers.value = true;
  pauseReveal.value = true;
  gameStore.setGameState("answering");
  soundStore.playSound("buzz");
  workerClearInterval(timerId);
  timer.value = 5; 
  
  timerId = workerSetInterval(() => {
    timer.value--;
    
    if (timer.value <= 2 && timer.value > 0) {
      soundStore.playSound("timer");
    }

    if (timer.value <= 0) {
      workerClearInterval(timerId);
      handleAnswer(null);
    }
  }, 1000);
};

const handleAnswer = (selectedOption) => {
  if (gameStore.gameState !== "answering" || hasAnswered.value) return;

  hasAnswered.value = true;
  pauseReveal.value = false;
  gameStore.setGameState("feedback");
  clearAllLocalTimers();

  if (selectedOption?.isCorrect) {
    pixelData.value = statusIcons.success;
    hasAnsweredCorrectly.value = true;
    playerStore.addPoints(potentialPoints.value);
    soundStore.playSound("correct");
  } else {
    pixelData.value = statusIcons.failure;
    hasAnsweredCorrectly.value = false;
    soundStore.playSound("incorrect");
  }

  feedbackTimeoutId = workerSetTimeout(() => {
    isRevealing.value = false;
    if (currentRound.value) {
      pixelData.value = currentRound.value.data;
    }
    gameStore.setGameState("revealed");

    solutionTimeoutId = workerSetTimeout(() => {
      if (gameStore.currentRoundIndex >= maxRounds.value - 1) {
        onlineStore.broadcastScore();
        gameStore.setGameState("gameover");
        router.push("/gameover");
      } else {
        gameStore.nextRound();
      }
    }, 1500);
  }, 1500);
};

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      setupDrawing();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearAllLocalTimers();
});
</script>

<style scoped>
.game-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  max-width: 500px;
  width: 100%;
}

@media (min-width: 1024px) {
  .game-layout {
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
  min-height: 160px;
}

.buzzer-container {
  margin: 32px 0;
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
  box-sizing: border-box;
}

.neon-buzzer:active {
  background: #ec4899;
  transform: scale(0.98);
  color: #000;
}

.buzzer-text {
  position: relative;
  z-index: 2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
