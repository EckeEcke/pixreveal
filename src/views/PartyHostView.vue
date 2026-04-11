<!-- PartyHostView.vue -->
<template>
  <main class="host-layout setup-card">
    <Transition name="fade" mode="out-in">
      <GameTransition v-if="showTransition" message="GET READY" @done="start" />
    </Transition>
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
      <h1 class="logo"><span>RANKINGS</span></h1>
      <div
        v-for="(player, index) in partyPlayersSorted"
        class="player-wrapper"
        :key="index"
      >
        <PlayerDisplay
          :name="player.username"
          :avatar-index="player.avatarIndex"
          :points="player.points"
          :is-active="partyStore.activePlayer?.username === player.username"
        />
        <PositionInfo :position="index + 1" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from "vue";
import GameHeader from "@/components/GameHeader.vue";
import PixelCanvas from "@/components/PixelCanvas.vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import PositionInfo from "@/components/PositionInfo.vue";
import GameTransition from "@/components/GameTransition.vue";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { usePartyStore } from "@/stores/party";
import { useChannelStore } from "@/stores/channel";
import BuzzerStatus from "@/components/BuzzerStatus.vue";

const gameStore = useGameStore();
const configStore = useConfigStore();
const partyStore = usePartyStore();
const channelStore = useChannelStore();

const showTransition = ref(true);
const pixelData = ref(Array(256).fill(0));
const resolution = ref(16);
const timerDuration = gameStore.revealTime;
const timer = ref(timerDuration);
let timerId: any = null;
let autoNextRoundTimer: ReturnType<typeof setTimeout> | null = null;

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const currentRound = computed(() => gameStore.currentRound);

const isRevealing = computed(() => partyStore.isRevealing);
let lastRoundResult: "correct" | "incorrect" | null = null;

const startTimer = () => {
  if (timerId) clearInterval(timerId);
  timer.value = timerDuration;

  timerId = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) clearInterval(timerId);
  }, 1000);
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const setDrawing = (data: any) => {
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
  startTimer();
};

const clearAutoNextRoundTimer = () => {
  if (autoNextRoundTimer) {
    clearTimeout(autoNextRoundTimer);
    autoNextRoundTimer = null;
  }
};

const nextRound = () => {
  clearAutoNextRoundTimer();
  partyStore.nextRound();
  if (!gameStore.isGameOver) {
    setDrawing(currentRound.value.data);
  }
};

const scheduleAutoNextRound = () => {
  if (gameStore.isGameOver) return;
  clearAutoNextRoundTimer();
  autoNextRoundTimer = setTimeout(() => {
    nextRound();
  }, 3000);
};

const start = () => {
  showTransition.value = false;
  setDrawing(currentRound.value.data);
  partyStore.openBuzzer();

  channelStore.activeChannel?.bind("client-party-buzz", (data: any) => {
    partyStore.handleBuzz(data.playerId);
    stopTimer();
  });
};

watch(
  () => partyStore.buzzerState,
  (newState) => {
    if (newState !== "open") {
      stopTimer();
    }
  },
);

watch(
  () => partyStore.roundResult,
  (newResult) => {
    if (newResult && newResult !== lastRoundResult) {
      lastRoundResult = newResult;
      scheduleAutoNextRound();
    } else if (!newResult) {
      lastRoundResult = null;
      clearAutoNextRoundTimer();
    }
  },
);

onUnmounted(() => {
  stopTimer();
  clearAutoNextRoundTimer();
});
</script>

<style scoped>
.host-layout {
  display: grid;
  grid-template-columns: auto 400px;
  align-items: start;
  flex-wrap: wrap;
  gap: 32px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: 8px;
  border: 2px solid #334155;
  overflow: hidden;
}

header {
  width: 100%;
}

h1 {
  margin: 14px auto 24px;
}

.rankings {
  padding-right: 32px;
}

.player-wrapper {
  position: relative;
  margin-bottom: 16px;
}
</style>
