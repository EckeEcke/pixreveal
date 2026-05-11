<template>
  <main class="player-layout">
    <PlayerDisplay
      :name="player.username"
      :avatar-index="player.avatarIndex"
      :points="player.points"
      class="player-display"
    />
    <Transition name="fade" mode="out-in">
      <div v-if="partyOver" key="party-over" class="centered placeholder">
        <p class="waiting-label">PARTY IS OVER</p>
        <button class="neon-buzzer" data-sfx="click" @click="goHome">
          <span class="buzzer-text">GO HOME</span>
        </button>
      </div>
      <div
        v-else-if="partyStore.buzzerState === 'open'"
        key="buzzer"
        class="centered"
      >
        <button
          class="neon-buzzer"
          aria-label="Buzz to answer"
          data-sfx="buzz"
          @click="handleBuzz"
        >
          <span class="buzzer-text">BUZZ!</span>
        </button>
      </div>

      <div v-else-if="isMyTurn" key="answers" class="centered">
        <AnswerButtons
          :hasAnswered="hasAnswered"
          :answers="gameStore.currentRound.options"
          @answered="handleAnswer"
        />
        <div class="timer-container">
          <GameHeader
            :max="5"
            :count="timeRemaining"
            :is-correct="false"
            :is-incorrect="false"
            :total-score="undefined"
            :currentRound="undefined"
            :maxRounds="undefined"
            :isSurvival="false"
          />
        </div>
      </div>

      <div
        v-else-if="partyStore.buzzerState === 'answering'"
        key="waiting"
        class="centered placeholder"
      >
        <p class="waiting-label">{{ activePlayerDisplay }} IS ANSWERING...</p>
      </div>

      <div
        v-else-if="partyStore.buzzerState === 'locked'"
        key="result"
        class="centered"
      >
        <p class="waiting-label">Waiting for host...</p>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount, onMounted } from "vue";
import { usePartyStore } from "@/stores/party";
import { useGameStore } from "@/stores/game";
import { useChannelStore } from "@/stores/channel";
import { useRouter } from "vue-router";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import { vibrateBuzz } from "@/utils/vibration";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";

const partyStore = usePartyStore();
const gameStore = useGameStore();
const channelStore = useChannelStore();
const router = useRouter();

const player = computed(() => {
  return partyStore.players.find(
    (p) => p.playerId === channelStore.playerId,
  ) || { username: "Unknown", avatarIndex: 0, points: 0 };
});

const ANSWER_TIMEOUT = 5000;

const timeRemaining = ref(5);
const timerStartTime = ref(null);
let timerInterval = null;
let timeoutId = null;
let watchdogInterval = null;

const isMyTurn = computed(
  () =>
    partyStore.buzzerState === "answering" &&
    partyStore.activePlayerId === channelStore.playerId,
);

const hasAnswered = computed(() => partyStore.hasAnswered);

const activePlayerDisplay = computed(
  () => partyStore.activePlayer?.username?.toUpperCase() || "PLAYER",
);

const partyOver = computed(
  () => !channelStore.onlineGameRunning && partyStore.buzzerState === "locked",
);

const goHome = () => {
  partyStore.reset?.();
  channelStore.reset?.();
  router.push("/");
};

watch(isMyTurn, (newValue) => {
  if (newValue) {
    startTimer();
  } else {
    cancelTimer();
  }
});

const handleBuzz = () => {
  vibrateBuzz();
  partyStore.pressBuzzer();
};

onBeforeUnmount(() => {
  cancelTimer();
  if (watchdogInterval) {
    workerClearInterval(watchdogInterval);
    watchdogInterval = null;
  }
});

const startTimer = () => {
  timerStartTime.value = Date.now();
  timeRemaining.value = 5;

  cancelTimer();

  timerInterval = workerSetInterval(() => {
    const elapsed = Math.floor((Date.now() - timerStartTime.value) / 1000);
    const remaining = Math.max(0, 5 - elapsed);
    timeRemaining.value = remaining;

    if (remaining <= 0) {
      cancelTimer();
      handleTimeoutAnswer();
    }
  }, 1000);

  timeoutId = workerSetTimeout(() => {
    handleTimeoutAnswer();
  }, ANSWER_TIMEOUT);
};

const cancelTimer = () => {
  if (timerInterval) {
    workerClearInterval(timerInterval);
    timerInterval = null;
  }
  if (timeoutId) {
    workerClearTimeout(timeoutId);
    timeoutId = null;
  }
};

const handleAnswer = (selectedAnswer) => {
  if (hasAnswered.value) return;

  cancelTimer();

  partyStore.hasAnswered = true;
  partyStore.submitAnswer(selectedAnswer);
};

const handleTimeoutAnswer = () => {
  if (hasAnswered.value) return;

  partyStore.hasAnswered = true;
  partyStore.submitAnswer(undefined);
};

onMounted(() => {
  partyStore.setupEvents();
  channelStore.activeChannel?.trigger("client-party-state-request", {
    requestedBy: channelStore.playerId,
  });
  watchdogInterval = workerSetInterval(() => {
    if (isMyTurn.value && !hasAnswered.value && !timerInterval) {
      startTimer();
      return;
    }

    if (!isMyTurn.value && (timerInterval || timeoutId)) {
      cancelTimer();
    }
  }, 500);
});
</script>

<style scoped>
:root {
  --neon-pink: #ec4899;
  --neon-blue: #00d4ff;
  --neon-success: #00ff00;
  --neon-error: #ff0066;
}

.player-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 32px 16px;
  width: 100%;
}

.player-display {
    position: fixed;
    top: 0;
    width: 100%;
}

.timer-container {
  width: 100%;
  margin-top: 32px;
}

.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.neon-buzzer {
  width: clamp(160px, 50vw, 220px);
  height: clamp(160px, 50vw, 220px);
  border-radius: 50%;
  background: rgba(236, 72, 153, 0.1);
  border: 3px solid var(--neon-pink);
  color: #fff;
  font-family: inherit;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 4px;
  cursor: pointer;
  animation: pulse-glow 1.5s infinite ease-in-out;
  text-shadow: 0 0 8px var(--neon-pink);
  transition: all 0.15s ease;
}

.neon-buzzer:hover {
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.6);
}

.neon-buzzer:active {
  background: var(--neon-pink);
  transform: scale(0.95);
  color: #000;
  text-shadow: none;
}

.neon-buzzer:focus-visible {
  outline: 2px solid var(--neon-pink);
  outline-offset: 4px;
}

.your-turn-label {
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--neon-blue);
  font-weight: 700;
}

.waiting-label {
  font-size: 16px;
  letter-spacing: 2px;
  opacity: 0.6;
  font-weight: 700;
}

.placeholder {
  opacity: 0.5;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(236, 72, 153, 0.8);
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
