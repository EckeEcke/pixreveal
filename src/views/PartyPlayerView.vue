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
      <MinimalSettings :bottom="true" />
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
          v-else-if="isPlayerOut"
          key="sudden-death-out"
          class="centered placeholder"
        >
          <p class="waiting-label">YOU ARE OUT</p>
        </div>

        <div
          v-else-if="partyStore.buzzerState === 'open'"
          key="buzzer"
          class="centered"
        >
          <button
            class="neon-buzzer"
            aria-label="Buzz to answer"
            :disabled="partyStore.isFrozen || hasBuzzed"
            @click="handleBuzz"
          >
            <span class="buzzer-text">
              {{ hasBuzzed ? "BUZZED" : "BUZZ!" }}
            </span>
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
            :inputDisabled="!isMyTurn"
            :devil-mode="partyStore.isDevilActive"
            @answered="handleAnswer"
            @devil-clicked="handleDevilClicked"
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

    <p v-if="partyStore.powerupInventory.length <= 0" class="no-powerups">No Powerups</p>

    <TransitionGroup v-else name="powerup" tag="div" class="powerup-btns">
      <button
        v-for="type in partyStore.powerupInventory"
        :key="type"
        :class="POWERUP_BTN_CLASS[type]"
        data-sfx="click"
        :disabled="isPowerupTypeDisabled(type)"
        @click="triggerFromInventory(type)"
      >
        <span class="powerup-icon">{{ POWERUP_ICON[type] }}</span>
        <span class="powerup-label">{{ POWERUP_LABEL[type] }}</span>
      </button>
    </TransitionGroup>

    <div class="emoji-btns">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-btn"
        data-sfx="pop"
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
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue";
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
    partyStore.activePlayerId === channelStore.playerId &&
    !partyStore.buzzTransitionPending,
);

const hasBuzzed = computed(() =>
  partyStore.buzzedPlayerIds?.includes(channelStore.playerId),
);

const isPlayerOut = computed(() => {
  return (
    partyStore.isSuddenDeath &&
    !partyStore.suddenDeathPlayerIds?.includes(channelStore.playerId)
  );
});

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

let lastShuffleKey = "";
watch(
  [() => partyStore.xlzActiveForRoundIndex, () => partyStore.xlzByPlayerId],
  ([roundIndex, byPlayerId]) => {
    if (typeof roundIndex !== "number") {
      lastShuffleKey = "";
      return;
    }
    if (roundIndex !== gameStore.currentRoundIndex) return;
    if (!byPlayerId || byPlayerId !== channelStore.playerId) return;
    const key = `${roundIndex}|${byPlayerId}`;
    if (key === lastShuffleKey) return;
    lastShuffleKey = key;
    soundStore.playSound("shuffle");
  },
);

const handleBuzz = () => {
  if (partyStore.connectionStale) return;
  if (partyStore.isFrozen) return;
  if (hasBuzzed.value) return;
  if (
    channelStore.connectionState &&
    channelStore.connectionState !== "connected"
  )
    return;
  if (!channelStore.activeChannel) return;
  vibrateBuzz();

  // Fart-Powerup: aktiv, jemand hat es ausgelöst, und ich bin nicht der
  // Auslöser selbst -> mein Buzz klingt wie ein Furz statt normal.
  const willFart =
    partyStore.fartCharges > 0 &&
    partyStore.fartByPlayerId &&
    partyStore.fartByPlayerId !== channelStore.playerId;

  soundStore.playSound(willFart ? "fart" : "buzz");
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

    if (remaining <= 3 && remaining > 0) soundStore.playSound("timer");

    if (remaining <= 0) {
      soundStore.playSound("incorrect");
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

const handleDevilClicked = ({ answer, index } = {}) => {
  console.log("[DevilMode] devil-clicked received in PlayerHud", {
    answer,
    index,
  });
};

const handleTimeoutAnswer = () => {
  if (hasAnswered.value) return;
  if (partyStore.isFrozen) return;

  startLinger();

  partyStore.hasAnswered = true;
  partyStore.submitAnswer(undefined);
};

// ─── Powerup inventory (random award system) ─────────────────────────────────

const POWERUP_ICON = {
  darken: "🔦",
  freeze: "❄️",
  xlz: "🔀",
  devil: "😈",
  rotate: "🙃",
  fart: "💨",
};

const POWERUP_LABEL = {
  darken: "DARKEN",
  freeze: "FREEZE",
  xlz: "MIX UP",
  devil: "DEVIL",
  rotate: "ROTATE",
  fart: "FART",
};

const POWERUP_BTN_CLASS = {
  darken: "lightsout-btn",
  freeze: "freeze-btn",
  xlz: "xlz-btn",
  devil: "devil-btn",
  rotate: "upsidedown-btn",
  fart: "fart-btn",
};

const isPowerupTypeDisabled = (type) => {
  if (partyStore.isFrozen || partyStore.connectionStale) return true;
  switch (type) {
    case "darken":
      return partyStore.isDarken;
    case "freeze":
      return false; // partyStore.freezeUsedByMe;
    case "xlz":
      return false;
    case "devil":
      return false; // partyStore.isDevilActive;
    case "rotate":
      return partyStore.isRotate;
    case "fart":
      return false; //partyStore.isFartActive;
    default:
      return true;
  }
};

const triggerFromInventory = (type) => {
  console.log(type)
  if (isPowerupTypeDisabled(type)) return;
  switch (type) {
    case "darken":
      partyStore.triggerDarken();
      break;
    case "freeze":
      partyStore.triggerFreeze();
      break;
    case "xlz":
      partyStore.triggerXlz();
      break;
    case "devil":
      partyStore.triggerDevil();
      break;
    case "rotate":
      partyStore.triggerRotate();
      break;
    case "fart":
      partyStore.triggerFart();
      break;
    default:
      return;
  }
  partyStore.removePowerupFromInventory(type);
};

const emojis = [
  "🤔",
  "😠",
  "😆",
  "😭",
  "👏🏻",
  "😯",
  "☠️",
  "♥️",
  "💩",
  "⏱️",
  "😇",
  "😈",
];
const emojiCooldown = ref(false);
const EMOJI_COOLDOWN_MS = 1000;

const sendEmoji = (emoji) => {
  if (emojiCooldown.value) return;
  if (partyStore.isFrozen) return;
  partyStore.sendEmoji(emoji);
  emojiCooldown.value = true;
  setTimeout(() => (emojiCooldown.value = false), EMOJI_COOLDOWN_MS);
};

onMounted(() => {
  partyStore.setupEvents();
  partyStore.resetPowerups;
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
.player-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 64px 16px 32px;
  width: 100%;
  max-width: 500px;
  background: var(--card-bg);
  box-sizing: unset;
  @media (min-width: 550px) {
    box-sizing: border-box;
  }
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

.neon-buzzer:disabled {
  animation: none;
  filter: grayscale(1);
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
  width: 95%;
  box-sizing: border-box;
  border: 2px solid var(--neon-pink);
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.6);
  border-radius: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.powerup-btns {
  position: relative;
  display: flex;
  gap: 16px;
  min-height: 44px;
  margin: 32px auto;
}

.powerup-btns button {
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 88px;
  height: 88px;
  text-shadow: 2px 2px 4px black;
}

.powerup-icon {
  font-size: 36px;
  line-height: 1;
}

.powerup-label {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.5px;
  line-height: 1;
}

/* ─── Powerup Enter/Leave/Move Transitions ─────────────────────────────── */

.powerup-enter-active {
  animation: powerupPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.powerup-leave-active {
  position: absolute;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.powerup-leave-to {
  transform: scale(0);
  opacity: 0;
}

.powerup-move {
  transition: transform 0.25s ease;
  transition-delay: 0.3s;
}

.lightsout-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 4px solid var(--neon-blue);
  background: var(--blue-glow);
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
  border: 4px solid var(--neon-orange);
  background: var(--orange-glow);
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
  border: 4px solid rgba(56, 189, 248, 0.9);
  background: var(--cyan-glow);
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

.devil-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 4px solid var(--neon-purple);
  background: var(--purple-glow);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 900;
  padding: 8px;
  letter-spacing: 2px;
  cursor: pointer;
  text-shadow: 0 0 10px var(--purple-glow);
  box-shadow: 0 0 12px var(--purple-glow);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.devil-btn:hover:not(:disabled) {
  box-shadow: 0 0 22px var(--purple-glow);
  transform: translateY(-1px);
}

.devil-btn:active:not(:disabled) {
  transform: translateY(0);
}

.devil-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.fart-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 4px solid var(--neon-yellow);
  background: var(--yellow-glow);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 900;
  padding: 8px;
  letter-spacing: 2px;
  cursor: pointer;
  text-shadow: 0 0 10px var(--yellow-glow);
  box-shadow: 0 0 12px var(--yellow-glow);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.fart-btn:hover:not(:disabled) {
  box-shadow: 0 0 22px var(--yellow-glow);
  transform: translateY(-1px);
}

.fart-btn:active:not(:disabled) {
  transform: translateY(0);
}

.fart-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.upsidedown-btn {
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 4px solid var(--neon-cyan);
  background: var(--cyan-glow);
  backdrop-filter: blur(4px);
  color: #fff;
  font-weight: 900;
  padding: 8px;
  letter-spacing: 2px;
  cursor: pointer;
  text-shadow: 0 0 10px var(--cyan-glow);
  box-shadow: 0 0 12px var(--cyan-glow);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.upsidedown-btn:hover:not(:disabled) {
  box-shadow: 0 0 22px var(--cyan-glow);
  transform: translateY(-1px);
}

.upsidedown-btn:active:not(:disabled) {
  transform: translateY(0);
}

.upsidedown-btn:disabled {
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

.no-powerups {
  opacity: 0.7;
  height: 88px;
  margin: 32px;
  display: flex;
  align-items: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes powerupPop {
  0% { transform: scale(0.5); opacity: 0 }
  50% { transform: scale(1.3); opacity: 1 }
  100% { transform: scale(1); opacity: 1 }
}
</style>