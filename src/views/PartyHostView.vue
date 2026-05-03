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
      <h1 class="logo">PARTY<span>RANKINGS</span></h1>
      <div v-for="(player, index) in partyPlayersSorted" :key="index">
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
import { useRouter } from "vue-router";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import GameTransition from "@/components/page-layout/GameTransition.vue";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { usePartyStore } from "@/stores/party";
import { useChannelStore } from "@/stores/channel";
import BuzzerStatus from "@/components/game-ui/BuzzerStatus.vue";

const router = useRouter();
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
let navigationTimeout: ReturnType<typeof setTimeout> | null = null;

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const currentRound = computed(() => gameStore.currentRound);
const isRevealing = computed(() => partyStore.isRevealing);

const startTimer = () => {
  stopTimer();
  timer.value = timerDuration;
  timerId = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) stopTimer();
  }, 1000);
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const setDrawing = (data: any) => {
  if (!data) return;
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
  startTimer();
};

const clearNavigationTimeout = () => {
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
    navigationTimeout = null;
  }
};

const start = () => {
  showTransition.value = false;
  setDrawing(currentRound.value?.data);
  partyStore.openBuzzer();

  channelStore.activeChannel?.bind("client-party-buzz", (data: any) => {
    partyStore.handleBuzz(data.playerId);
    stopTimer();
  });
};

watch(
  () => partyStore.roundResult,
  (newResult) => {
    if (newResult) {
      stopTimer();
      clearNavigationTimeout();

      navigationTimeout = setTimeout(() => {
        const isLastRound =
          gameStore.currentRoundIndex >= configStore.maxRounds - 1;

        if (isLastRound) {
          router.push("/gameover");
        } else {
          partyStore.nextRound();
          setDrawing(currentRound.value?.data);
        }
      }, 3000);
    } else {
      clearNavigationTimeout();
    }
  },
);

watch(
  () => partyStore.buzzerState,
  (newState) => {
    if (newState === "answering" || newState === "locked") {
      stopTimer();
    }
  },
);

onUnmounted(() => {
  stopTimer();
  clearNavigationTimeout();
  channelStore.activeChannel?.unbind("client-party-buzz");
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
