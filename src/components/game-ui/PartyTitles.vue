<template>
  <div v-if="currentSlide" class="party-titles">
    <RobotModerator />
    <Transition name="fade" mode="out-in">
      <div :key="currentSlide.key" class="title-pill">
        <div class="title-line">
          <span class="emoji">{{ currentSlide.emoji }}</span>
          <span class="title">{{ currentSlide.title }}</span>
        </div>
        <div class="message">
          {{ currentSlide.message }}
        </div>
        <div class="who">
          — <span class="player">{{ currentSlide.playerNameUpper }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import RobotModerator from "@/components/game-ui/RobotModerator.vue";
import {
  workerClearInterval,
  workerSetInterval,
} from "@/services/workerTimers";

type PartyPlayerStats = {
  playerId: string;
  username: string;
  wrongAnswers: number;
  correctAnswers: number;
  quickestAnswer: number | null;
  powerupsUsed: number;
  emojisSent: number;
  isDecrypter: boolean;
};

const props = defineProps<{
  players: PartyPlayerStats[];
  slideMs?: number;
}>();

const slideMs = computed(() => (props.slideMs && props.slideMs > 0 ? props.slideMs : 3000));

const maxPowerupsUsed = computed(() => {
  let max = 0;
  for (const p of props.players || []) {
    max = Math.max(max, p?.powerupsUsed ?? 0);
  }
  return max;
});

const maxEmojisSent = computed(() => {
  let max = 0;
  for (const p of props.players || []) {
    max = Math.max(max, p?.emojisSent ?? 0);
  }
  return max;
});

const minQuickestAnswer = computed(() => {
  let min: number | null = null;
  for (const p of props.players || []) {
    const v = p?.quickestAnswer;
    if (typeof v !== "number") continue;
    if (min === null || v < min) min = v;
  }
  return min;
});

type Slide = {
  key: string;
  emoji: string;
  title: string;
  message: string;
  playerId: string;
  playerNameUpper: string;
};

const slides = computed<Slide[]>(() => {
  const list: Slide[] = [];
  const players = props.players || [];
  const maxPowerups = maxPowerupsUsed.value;
  const maxEmojis = maxEmojisSent.value;
  const minQuick = minQuickestAnswer.value;

  for (const p of players) {
    const nameUpper = String(p.username || "Player").toUpperCase();
    const wrong = p.wrongAnswers ?? 0;
    const correct = p.correctAnswers ?? 0;
    const quickest = p.quickestAnswer ?? null;
    const powerups = p.powerupsUsed ?? 0;
    const emojis = p.emojisSent ?? 0;
    const isDecrypter = Boolean(p.isDecrypter);

    // 🎯 Perfectionist
    if (correct > 0 && wrong === 0) {
      list.push({
        key: `${p.playerId}-perfectionist`,
        emoji: "🎯",
        title: "Perfectionist",
        message:
          "Flawless victory! Not a single mistake. Are you a genius or just cheating?",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }

    // 💣 Saboteur (most powerups used)
    if (maxPowerups > 0 && powerups === maxPowerups) {
      list.push({
        key: `${p.playerId}-saboteur`,
        emoji: "💣",
        title: "Saboteur",
        message: "Some people just want to watch the world burn. Thanks for the chaos!",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }

    // 🕊️ Pacifist (no powerups)
    if (powerups === 0) {
      list.push({
        key: `${p.playerId}-pacifist`,
        emoji: "🕊️",
        title: "Pacifist",
        message:
          "Too pure for this chaotic world. You played with honor (and probably paid the price).",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }

    // 🥚 Beginner (no correct answers)
    if (correct === 0 && (wrong > 0 || powerups >= 0)) {
      list.push({
        key: `${p.playerId}-beginner`,
        emoji: "🥚",
        title: "Beginner",
        message: "Your confidence was inspiring. Your guessing skills? Not so much.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }

    // 💬 Spammer (most emojis sent; minimum threshold)
    if (maxEmojis >= 10 && emojis === maxEmojis) {
      list.push({
        key: `${p.playerId}-spammer`,
        emoji: "💬",
        title: "Spammer",
        message:
          "You treated this game like a group chat. Please step away from the keyboard.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }

    // ⚡ Speedster (fastest quickestAnswer)
    if (typeof minQuick === "number" && typeof quickest === "number" && quickest === minQuick) {
      list.push({
        key: `${p.playerId}-speedster`,
        emoji: "⚡",
        title: "Speedster",
        message:
          "Fastest fingers in the lobby! Your reflexes are terrifying—or you're just button-mashing.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }

    // 🧠 Decrypter (correct while scrambled)
    if (isDecrypter) {
      list.push({
        key: `${p.playerId}-decrypter`,
        emoji: "🧠",
        title: "Decrypter",
        message:
          "You successfully translated absolute nonsense into actual points. Are you even human?",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
      });
    }
  }

  return list;
});

const activeIndex = ref(0);
let intervalId: number | null = null;

const currentSlide = computed(() => {
  const list = slides.value;
  if (!list.length) return null;
  return list[activeIndex.value] ?? list[0] ?? null;
});

const start = () => {
  if (intervalId) return;
  if (!slides.value.length) return;
  intervalId = workerSetInterval(() => {
    const len = slides.value.length;
    if (!len) return;
    activeIndex.value = (activeIndex.value + 1) % len;
  }, slideMs.value);
};

const stop = () => {
  if (!intervalId) return;
  workerClearInterval(intervalId);
  intervalId = null;
};

onMounted(() => start());
onBeforeUnmount(() => stop());
</script>

<style scoped>
.party-titles {
  display: grid;
  grid-template-columns: 80px auto;
  align-items: start;
  gap: 16px;
  width: 100%;
  margin: 16px 0 24px;
}

.title-pill {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 2px solid var(--neon-yellow);
  color: rgba(255, 255, 255, 0.92);
}

.title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  color: var(--neon-yellow);
}

.emoji {
  font-size: 26px;
}

.title {
  font-size: 22px;
  letter-spacing: 2px;
}

.message {
  margin-top: 6px;
}

.who {
  margin-top: 6px;
  opacity: 0.95;
}

.player {
  color: #fff;
}
</style>
