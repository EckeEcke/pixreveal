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

      <div class="buzzer-status">
        <Transition name="fade" mode="out-in">
          <div
            v-if="partyStore.buzzerState === 'open'"
            key="open"
            class="status-pill open"
          >
            BUZZ TO ANSWER!
          </div>
          <div
            v-else-if="partyStore.buzzerState === 'answering'"
            key="answering"
            class="status-pill answering"
          >
            {{ partyStore.activePlayer?.username }} IS ANSWERING
          </div>
          <div
            v-else-if="partyStore.roundResult"
            key="result"
            class="status-pill"
            :class="partyStore.roundResult"
          >
            {{
              partyStore.roundResult === "correct" ? "✓ CORRECT" : "✗ WRONG"
            }}! <span>{{ currentRound.answer }}</span> is the answer.
          </div>
        </Transition>
      </div>
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
        />
        <div class="position">{{ index + 1 }}</div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed, watch } from "vue";
import GameHeader from "@/components/GameHeader.vue";
import PixelCanvas from "@/components/PixelCanvas.vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import GameTransition from "@/components/GameTransition.vue";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { usePartyStore } from "@/stores/party";
import { useChannelStore } from "@/stores/channel";

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

  channelStore.activeChannel?.bind("client-party-answer", (data: any) => {
    partyStore.resolveAnswer(data.playerId, data.isCorrect);
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
/*
.player-wrapper:nth-of-type(1) {

  animation: sharp-pulse 2s ease-in-out infinite;
}
*/
.player-wrapper:nth-of-type(1) .position {
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
  box-shadow:
    0 0 20px var(--yellow-glow),
    2px 2px 4px #00000088;
}

.player-wrapper:nth-of-type(2) .position {
  border-color: #c0c0c0;
  color: #c0c0c0;
  box-shadow:
    0 0 15px rgba(192, 192, 192, 0.4),
    2px 2px 4px #00000088;
}

.player-wrapper:nth-of-type(3) .position {
  border-color: #cd7f32; /* Bronze */
  color: #cd7f32;
  box-shadow:
    0 0 15px rgba(205, 127, 50, 0.4),
    2px 2px 4px #00000088;
}

.position {
  position: absolute;
  top: -12px;
  left: -12px;
  background: var(--bg-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid;
  transition: all 0.3s ease;
}

.buzzer-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.status-pill {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 3px;
  text-transform: uppercase;
  span {
    color: white;
  }
}

.status-pill.open {
  border: 2px solid var(--neon-pink);
  color: var(--neon-pink);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.status-pill.answering {
  border: 2px solid var(--neon-blue);
  color: var(--neon-blue);
}

.status-pill.correct {
  border: 2px solid var(--neon-success);
  color: var(--neon-success);
}

.status-pill.incorrect {
  border: 2px solid var(--neon-error);
  color: var(--neon-error);
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
