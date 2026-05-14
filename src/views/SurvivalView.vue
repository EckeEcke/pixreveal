<template>
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <GameTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
        @done="start"
      />
    </transition>

    <section class="canvas-section">
      <GameHeader
        :max="survivalStore.maxTime"
        :count="survivalStore.timeLeft"
        :total-score="survivalStore.solvedCount"
        :is-survival="true"
        :highscore="survivalStore.highscore"
      />
      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="survivalStore.hasAnswered"
        :timer-duration="configStore.revealTime"
      />
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="survivalStore.hasAnswered"
        :answers="survivalStore.currentDrawing?.options || []"
        @answered="handleAnswer"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onUnmounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useSurvivalStore } from "@/stores/survival";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { useSoundStore } from "@/stores/sound";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import { statusIcons } from "@/data/statusIcons";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers";

const router = useRouter();
const survivalStore = useSurvivalStore();
const gameStore = useGameStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();

const resolution = ref(16);
const pixelData = ref(Array(256).fill(0));
const isRevealing = ref(true);

let feedbackTimeoutId = null;
let nextRoundTimeoutId = null;

/**
 * Bereitet die Anzeige für das aktuelle Bild vor
 */
const setupDrawing = () => {
  if (survivalStore.currentDrawing) {
    survivalStore.hasAnswered = false;
    isRevealing.value = true;
    pixelData.value = survivalStore.currentDrawing.data;
    resolution.value = Math.sqrt(pixelData.value.length);
  }
};

/**
 * Verarbeitet die Antwort im Survival-Modus
 */
const handleAnswer = (answer) => {
  // Guard: Nur Antworten zulassen, wenn wir in der Revealing-Phase sind und Zeit da ist
  if (
    gameStore.gameState !== "revealing" ||
    survivalStore.hasAnswered ||
    survivalStore.timeLeft <= 0
  )
    return;

  survivalStore.hasAnswered = true;
  gameStore.setGameState("feedback");

  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(nextRoundTimeoutId);

  // 1. Visuelles Feedback
  if (answer.isCorrect) {
    survivalStore.handleCorrectAnswer();
    pixelData.value = statusIcons.success;
    soundStore.playSound("correct");
  } else {
    survivalStore.handleWrongAnswer();
    pixelData.value = statusIcons.failure;
    // Sound wird bereits im Store abgespielt
  }

  // 2. Feedback-Phase (Icon zeigen)
  feedbackTimeoutId = workerSetTimeout(() => {
    if (survivalStore.isGameOver) return;

    isRevealing.value = false;
    pixelData.value = survivalStore.currentDrawing.data;
    gameStore.setGameState("revealed");

    // 3. Kurze Pause, dann nächstes Bild
    nextRoundTimeoutId = workerSetTimeout(() => {
      if (survivalStore.isGameOver) return;

      survivalStore.setNextDrawing(); // Setzt gameState intern wieder auf 'revealing'
      setupDrawing();
    }, 1000);
  }, 1000);
};

/**
 * Initialer Start nach der Transition
 */
const start = () => {
  survivalStore.startSurvival();
  setupDrawing();
};

/**
 * Überwacht den Game-Over Status für den Redirect
 */
watch(
  () => survivalStore.isGameOver,
  (over) => {
    if (over) {
      gameStore.setGameState("gameover");
      router.push("/gameover");
    }
  },
);

onUnmounted(() => {
  workerClearTimeout(feedbackTimeoutId);
  workerClearTimeout(nextRoundTimeoutId);
  survivalStore.reset();
  gameStore.setGameState("starting");
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
