<template>
  <main class="host-layout setup-card">
    <Transition name="fade" mode="out-in">
      <GameTransition 
        v-if="gameStore.gameState === 'starting'" 
        message="GET READY" 
        @done="gameStore.setGameState('revealing')" 
      />
    </transition>

    <div>
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="false"
        :is-incorrect="false"
        :total-score="undefined"
        :current-round="gameStore.currentRoundIndex + 1"
        :max-rounds="configStore.maxRounds"
        :is-survival="false"
      />

      <PixelCanvas
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="false"
        :timer-duration="timerDuration"
        :pause-reveal="partyStore.buzzerState === 'answering'"
      />
      <BuzzerStatus />
    </div>

    <div class="rankings">
      <h1 class="logo">PARTY<span>RANKINGS</span></h1>
      <div v-for="(player, index) in partyPlayersSorted" :key="player.playerId || index">
        <PlayerDisplay
          :position="index + 1"
          :name="player.username"
          :avatar-index="player.avatarIndex"
          :points="player.points"
          :is-active="partyStore.activePlayer?.username === player.username"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from "vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import BuzzerStatus from "@/components/game-ui/BuzzerStatus.vue";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { usePartyStore } from "@/stores/party";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";

const gameStore = useGameStore();
const configStore = useConfigStore();
const partyStore = usePartyStore();

const pixelData = ref(Array(256).fill(0));
const resolution = ref(16);
const timerDuration = configStore.revealTime;
const timer = ref(timerDuration);
let timerId: number | null = null;
let navigationTimeout: number | null = null;

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const currentRound = computed(() => gameStore.currentRound);
const isRevealing = computed(() => gameStore.gameState === 'revealing');

const clearAllTimers = () => {
  workerClearInterval(timerId);
  workerClearTimeout(navigationTimeout);
  timerId = null;
  navigationTimeout = null;
};

const startTimer = () => {
  workerClearInterval(timerId);
  timer.value = timerDuration;
  timerId = workerSetInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      workerClearInterval(timerId);
      partyStore.handleRoundTimeout(); 
    }
  }, 1000);
};

const setupDrawing = () => {
  if (!currentRound.value) return;
  
  clearAllTimers();
  pixelData.value = currentRound.value.data;
  resolution.value = Math.sqrt(pixelData.value.length);
  
  partyStore.openBuzzer();
  startTimer();
};

watch(
  () => partyStore.roundResult,
  (newResult) => {
    if (newResult) {
      clearAllTimers();
      gameStore.setGameState("feedback");

      navigationTimeout = workerSetTimeout(() => {
        const isLastRound = gameStore.currentRoundIndex >= configStore.maxRounds - 1;

        if (isLastRound) {
          partyStore.endGame();
        } else {
          partyStore.nextRound();
        }
      }, 4000);
    }
  }
);

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      setupDrawing();
    }
  },
  { immediate: true }
);

watch(
  () => partyStore.buzzerState,
  (newState) => {
    if (newState === "answering") {
      workerClearInterval(timerId);
    }
  }
);

onUnmounted(() => {
  clearAllTimers();
});
</script>

<style scoped>
.host-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  align-items: start;
  gap: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
}

.rankings {
  padding-left: 24px;
}

.logo {
  text-align: center;
  margin-bottom: 32px;
  font-size: 1.5rem;
  letter-spacing: 2px;
}

@media (max-width: 1023px) {
  .host-layout {
    grid-template-columns: 1fr;
    max-width: 600px;
  }

  .rankings {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 24px;
  }
}
</style>
