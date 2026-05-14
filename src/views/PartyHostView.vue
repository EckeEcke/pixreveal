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
  <EmojiOverlay :new-emoji="lastEmoji" />
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, onUnmounted, computed, watch, unref } from "vue";
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
import EmojiOverlay from "@/components/game-ui/EmojiOverlay.vue";

const gameStore = useGameStore();
const configStore = useConfigStore();
const partyStore = usePartyStore();

const pixelData = ref(Array(256).fill(0));
const resolution = ref(16);
const timerDuration = computed(() => unref(configStore.revealTime));
const timer = ref(timerDuration.value);
let timerId: number | null = null;
let timerEndTimeoutId: number | null = null;
let navigationTimeout: number | null = null;

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const currentRound = computed(() => gameStore.currentRound);
const isRevealing = computed(() => gameStore.gameState === 'revealing');

const clearAllTimers = () => {
  workerClearInterval(timerId);
  workerClearTimeout(timerEndTimeoutId);
  workerClearTimeout(navigationTimeout);
  timerId = null;
  timerEndTimeoutId = null;
  navigationTimeout = null;
};

const startTimer = () => {
  workerClearInterval(timerId);
  workerClearTimeout(timerEndTimeoutId);
  timer.value = timerDuration.value;
  
  timerEndTimeoutId = workerSetTimeout(() => {
    timerEndTimeoutId = null;
    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
  }, timerDuration.value * 1000);

  timerId = workerSetInterval(() => {
    timer.value--;

    if (timer.value > 0) return;

    timer.value = 0;
    workerClearInterval(timerId);
    timerId = null;
    workerClearTimeout(timerEndTimeoutId);
    timerEndTimeoutId = null;
    // Let Vue paint the "0" before triggering the timeout flow
    // (which can immediately transition the UI to feedback/locked state).
    nextTick().then(() => {
      partyStore.handleRoundTimeout();
    });
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

const lastEmoji = ref("")

const handleIncomingEmoji = (emojiChar: string) => {
  lastEmoji.value = emojiChar
  
  nextTick(() => {
    lastEmoji.value = ""
  })
}

watch(
  () => partyStore.roundResult,
  (newResult) => {
    if (newResult) {
      if (timer.value > 0) {
        clearAllTimers();
      }

      if (!partyStore.activePlayerId) {
        timer.value = 0;
      }
      
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
    if (newState === "answering" && timer.value > 0) {
      workerClearInterval(timerId);
      timerId = null;
      workerClearTimeout(timerEndTimeoutId);
      timerEndTimeoutId = null;
    }
  }
);

const emojiListener = (event: any) => {
  handleIncomingEmoji(event.detail);
};

onMounted(() => {
  window.addEventListener("emoji-received", emojiListener);
});

onUnmounted(() => {
  window.removeEventListener("emoji-received", emojiListener);
  clearAllTimers();
});
</script>

<style scoped>
.host-layout {
  display: grid;
  grid-template-columns: max(600px) minmax(400px,100%);
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
