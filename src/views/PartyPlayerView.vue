<template>
  <main class="player-layout">
    <div v-if="partyStore.isFrozen" class="freeze-overlay" aria-hidden="true" />
    <PlayerDisplay
      :name="player.username"
      :avatar-index="player.avatarIndex"
      :points="player.points"
      class="player-display"
    />
    <div class="container">
      <Transition name="fade" mode="out-in">
        <div v-if="partyOver" key="party-over" class="centered placeholder">
          <p class="waiting-label">PARTY IS OVER</p>
          <button class="neon-buzzer" data-sfx="click" @click="goHome">
            <span class="buzzer-text">GO HOME</span>
          </button>
        </div>

        <div
          v-else-if="partyStore.connectionStale"
          key="reconnecting"
          class="centered placeholder"
        >
          <p class="waiting-label">RECONNECTING...</p>
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
            :disabled="partyStore.isFrozen"
            @click="handleBuzz"
          >
            <span class="buzzer-text">BUZZ!</span>
          </button>
        </div>

        <div
          v-else-if="isMyTurn || lingerAnswerUi"
          key="answers"
          class="centered"
        >
          <AnswerButtons
            :hasAnswered="hasAnswered"
            :answers="answersForUi"
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
    </div>

    <div class="powerup-btns">
      <button
        class="lightsout-btn"
        data-sfx="click"
        :disabled="
          partyStore.isLightsOut ||
          partyStore.lightsOutUsedByMe ||
          partyStore.isFrozen ||
          partyStore.connectionStale
        "
        @click="partyStore.triggerLightsOut()"
      >
        🔦
      </button>
      <button
        class="xlz-btn"
        data-sfx="click"
        :disabled="
          partyStore.isXlzActive ||
          partyStore.xlzUsedByMe ||
          partyStore.isFrozen ||
          partyStore.connectionStale
        "
        @click="partyStore.triggerXlz()"
      >
        🔀
      </button>
      <button
        class="freeze-btn"
        data-sfx="click"
        :disabled="
          partyStore.freezeUsedByMe ||
          partyStore.isFrozen ||
          partyStore.connectionStale
        "
        @click="partyStore.triggerFreeze()"
      >
        ❄️
      </button>
    </div>

    <div class="emoji-btns">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-btn"
        :disabled="
          emojiCooldown || partyStore.isFrozen || partyStore.connectionStale
        "
        @click="sendEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>
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
import { useSoundStore } from "@/stores/sound";
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
const soundStore = useSoundStore();

const player = computed(() => {
  return (
    partyStore.players.find((p) => p.playerId === channelStore.playerId) || {
      username: "Unknown",
      avatarIndex: 0,
      points: 0,
    }
  );
});

const ANSWER_TIMEOUT = 5000;
const ANSWER_UI_LINGER_MS = 900;

const timeRemaining = ref(5);
const timerStartTime = ref(null);
let timerInterval = null;
let timeoutId = null;
let watchdogInterval = null;
let lingerTimeoutId = null;
const lingerAnswerUi = ref(false);
let hardReconnectIntervalId = null;
let lastHardReconnectAt = 0;

const startLinger = () => {
  lingerAnswerUi.value = true;
  if (lingerTimeoutId) workerClearTimeout(lingerTimeoutId);
  lingerTimeoutId = workerSetTimeout(() => {
    lingerTimeoutId = null;
    lingerAnswerUi.value = false;
  }, ANSWER_UI_LINGER_MS);
};

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

const hashToUint32 = (input) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const scrambleText = (text, seed) => {
  const str = String(text || "");
  if (str.length < 2) return str;

  const scrambleWord = (word, wordSeed) => {
    if (word.length < 2) return word;
    const chars = word.split("");
    const rand = mulberry32(wordSeed);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
  };

  // Split on whitespace and only scramble within each term (e.g. "ice cream")
  const parts = str.split(/(\s+)/);
  return parts
    .map((part, index) => {
      if (/^\s+$/.test(part)) return part;
      const partSeed = hashToUint32(`${seed}|${index}|${part}`);
      return scrambleWord(part, partSeed);
    })
    .join("");
};

const answersForUi = computed(() => {
  const options = gameStore.currentRound?.options || [];
  if (!partyStore.isXlzActive) return options;

  return options.map((opt) => {
    const label = opt?.title || opt?.name || "";
    const seed = hashToUint32(`${gameStore.currentRoundIndex}|${label}`);
    return { ...opt, title: scrambleText(label, seed) };
  });
});

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

watch(
  () => partyStore.isFrozen,
  (isFrozen, wasFrozen) => {
    if (isFrozen && !wasFrozen) {
      soundStore.playSound("freeze");
    }
  },
);

const handleBuzz = () => {
  if (partyStore.connectionStale) return;
  if (partyStore.isFrozen) return;
  if (
    channelStore.connectionState &&
    channelStore.connectionState !== "connected"
  )
    return;
  if (!channelStore.activeChannel) return;
  vibrateBuzz();
  partyStore.pressBuzzer();
};

onBeforeUnmount(() => {
  cancelTimer();
  if (lingerTimeoutId) {
    workerClearTimeout(lingerTimeoutId);
    lingerTimeoutId = null;
  }
  if (hardReconnectIntervalId) {
    workerClearInterval(hardReconnectIntervalId);
    hardReconnectIntervalId = null;
  }
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
  if (partyStore.isFrozen) return;

  cancelTimer();

  startLinger();

  partyStore.hasAnswered = true;
  partyStore.submitAnswer(selectedAnswer);
};

const handleTimeoutAnswer = () => {
  if (hasAnswered.value) return;
  if (partyStore.isFrozen) return;

  startLinger();

  partyStore.hasAnswered = true;
  partyStore.submitAnswer(undefined);
};

const emojis = [
  "🤔",
  "💩",
  "😆",
  "😭",
  "👏🏻",
  "👍🏻",
  "👎🏻",
  "😠",
  "♥️",
  "⏱️",
  "❌",
  "✅",
];
const emojiCooldown = ref(false);
const EMOJI_COOLDOWN_MS = 2000;

const sendEmoji = (emoji) => {
  if (emojiCooldown.value) return;
  if (partyStore.isFrozen) return;
  partyStore.sendEmoji(emoji);
  emojiCooldown.value = true;
  setTimeout(() => (emojiCooldown.value = false), EMOJI_COOLDOWN_MS);
};

onMounted(() => {
  partyStore.setupEvents();
  channelStore.activeChannel?.trigger("client-party-state-request", {
    requestedBy: channelStore.playerId,
  });

  hardReconnectIntervalId = workerSetInterval(() => {
    if (!partyStore.connectionStale) return;
    const now = Date.now();
    if (now - lastHardReconnectAt < 15000) return;
    const state = channelStore.connectionState;
    if (state === "connecting") return;
    lastHardReconnectAt = now;
    channelStore.tryReconnect?.({ force: true });
  }, 8000);

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
  max-width: 500px;
}

.freeze-overlay {
  position: fixed;
  inset: 0;
  background: rgba(56, 189, 248, 0.22);
  backdrop-filter: blur(2px);
  z-index: 9999;
  pointer-events: all;
}

.player-display {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
}

.container {
  display: flex;
  place-items: center;
  min-height: 220px;
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
  border: 8px solid var(--neon-pink);
  color: #fff;
  font-family: inherit;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 4px;
  cursor: pointer;
  animation: pulse-glow 1.5s infinite ease-in-out;
  text-shadow: 0 0 8px var(--neon-pink);
  transition: all 0.15s ease;
  background: var(--primary);
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

.emoji-btns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin: 0 auto 64px;
  border: 2px solid var(--neon-pink);
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.6);
  border-radius: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.powerup-btns {
  display: flex;
  gap: 16px;
}

.powerup-btns button {
  font-size: 32px;
  padding: 8px;
  margin: 32px auto 16px;
}

.lightsout-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 2px solid var(--neon-blue);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 900;
  letter-spacing: 2px;
  cursor: pointer;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.lightsout-btn:hover {
  box-shadow: 0 0 22px rgba(0, 212, 255, 0.6);
  transform: translateY(-1px);
}

.lightsout-btn:active {
  transform: translateY(0);
}

.lightsout-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.xlz-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 2px solid var(--neon-purple);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 900;
  letter-spacing: 2px;
  cursor: pointer;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.65);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.xlz-btn:hover {
  box-shadow: 0 0 22px rgba(168, 85, 247, 0.6);
  transform: translateY(-1px);
}

.xlz-btn:active {
  transform: translateY(0);
}

.xlz-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.freeze-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 2px solid rgba(56, 189, 248, 0.9);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 900;
  padding: 8px;
  letter-spacing: 2px;
  cursor: pointer;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.75);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.freeze-btn:hover {
  box-shadow: 0 0 22px rgba(56, 189, 248, 0.6);
  transform: translateY(-1px);
}

.freeze-btn:active {
  transform: translateY(0);
}

.freeze-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.emoji-btn {
  font-size: 32px;
  transition: all 0.3s ease-in-out;
}

.emoji-btn:hover {
  text-shadow: 0 0 8px var(--neon-pink);
  transform: scale(1.2);
  filter: contrast(1.5);
}

.emoji-btn:disabled {
  opacity: 0.7;
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
