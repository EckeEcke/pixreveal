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
        <div v-if="currentSlide.playerNameUpper" class="who">
          <div
            v-if="typeof currentSlide.avatarIndex === 'number'"
            class="mini-avatar"
            :style="avatarStyleFor(currentSlide.avatarIndex)"
          />
          <span class="player">{{ currentSlide.playerNameUpper }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import RobotModerator from "@/components/game-ui/RobotModerator.vue";
import { usePartyStore } from "@/stores/party";
import avatarSheet from "@/assets/avatars/avatars.webp";
import { workerClearInterval, workerSetInterval } from "@/services/workerTimers";

type PartyPlayerStats = {
  playerId: string;
  username: string;
  avatarIndex: number;
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

const partyStore = usePartyStore();

const slideMs = computed(() =>
  props.slideMs && props.slideMs > 0 ? props.slideMs : 3000,
);

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
  avatarIndex?: number;
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

    if (correct > 0 && wrong === 0) {
      list.push({
        key: `${p.playerId}-perfectionist`,
        emoji: "🎯",
        title: "Perfect",
        message:
          "Flawless victory! Not a single mistake. Are you a genius or just cheating?",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (maxPowerups > 0 && powerups === maxPowerups) {
      list.push({
        key: `${p.playerId}-saboteur`,
        emoji: "⚡",
        title: "Saboteur",
        message: "Some people just want to watch the world burn. Thanks for the chaos!",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (powerups === 0) {
      list.push({
        key: `${p.playerId}-pacifist`,
        emoji: "🕊️",
        title: "Pacifist",
        message:
          "Too pure for this chaotic world. You played with honor (and probably paid the price).",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (correct === 0 && (wrong > 0 || powerups >= 0)) {
      list.push({
        key: `${p.playerId}-beginner`,
        emoji: "🥚",
        title: "Beginner",
        message: "Your confidence was inspiring. Your guessing skills? Not so much.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (emojis === 0) {
      list.push({
        key: `${p.playerId}-mime`,
        emoji: "🤫",
        title: "The Mime",
        message:
          "Zero communication. You played this match with the emotional expression of a brick wall.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (maxEmojis >= 10 && emojis === maxEmojis) {
      list.push({
        key: `${p.playerId}-spammer`,
        emoji: "💬",
        title: "Spammer",
        message:
          "You treated this game like a group chat. Please step away from the keyboard.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (
      typeof minQuick === "number" &&
      typeof quickest === "number" &&
      quickest === minQuick
    ) {
      list.push({
        key: `${p.playerId}-speedy`,
        emoji: "⚡",
        title: "Speedy",
        message:
          "Fastest fingers in the lobby! Your reflexes are terrifying—or you're just button-mashing.",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }

    if (isDecrypter) {
      list.push({
        key: `${p.playerId}-decrypter`,
        emoji: "🧠",
        title: "Decrypter",
        message:
          "You successfully translated absolute nonsense into actual points. Are you even human?",
        playerId: p.playerId,
        playerNameUpper: nameUpper,
        avatarIndex: p.avatarIndex,
      });
    }
  }

  return list;
});

const emojiStatsSlide = computed<Slide | null>(() => {
  const emojis = partyStore.emojiStatistics || [];
  const total = emojis.length;
  if (total < 10) return null;

  const counts = new Map<string, number>();
  for (const e of emojis) {
    if (!e) continue;
    counts.set(e, (counts.get(e) || 0) + 1);
  }

  let mostPopular: string | null = null;
  let mostPopularCount = 0;
  for (const [emoji, count] of counts.entries()) {
    if (count > mostPopularCount) {
      mostPopular = emoji;
      mostPopularCount = count;
    }
  }

  return {
    key: "emoji-stats",
    emoji: "📊",
    title: "Emoji Stats",
    message: `Total emojis sent: ${total}\nMost popular emoji: ${mostPopular || "—"}`,
    playerId: "emoji-stats",
    playerNameUpper: "",
  };
});

const allSlides = computed<Slide[]>(() => {
  const base = slides.value;
  const stats = emojiStatsSlide.value;
  return stats ? [...base, stats] : base;
});

const activeIndex = ref(0);
let intervalId: number | null = null;

const currentSlide = computed(() => {
  const list = allSlides.value;
  if (!list.length) return null;
  return list[activeIndex.value] ?? list[0] ?? null;
});

const start = () => {
  if (intervalId) return;
  if (!allSlides.value.length) return;
  intervalId = workerSetInterval(() => {
    const len = allSlides.value.length;
    if (!len) return;
    activeIndex.value = (activeIndex.value + 1) % len;
  }, slideMs.value);
};

const stop = () => {
  if (!intervalId) return;
  workerClearInterval(intervalId);
  intervalId = null;
};

const avatarStyleFor = (avatarIndex: number) => {
  const index = typeof avatarIndex === "number" ? avatarIndex : 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  } as const;
};

onMounted(() => start());
onBeforeUnmount(() => stop());
</script>

<style scoped>
.party-titles {
  display: grid;
  grid-template-columns: 60px auto;
  align-items: start;
  gap: 16px;
  width: 100%;
  margin: 16px 0 24px;
  @media (min-width: 576px) {
      grid-template-columns: 80px auto;
  }
}

.title-pill {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 1px;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 2px solid var(--neon-yellow);
  color: rgba(255, 255, 255, 0.92);
  @media(min-width: 576px) {
    font-size: 20px;
  }
}

.title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  color: var(--neon-yellow);
}

.emoji {
  font-size: 22px;
  @media(min-width: 576px) {
    font-size: 26px;
  }
}

.title {
  font-size: 20px;
  letter-spacing: 1px;
  @media(min-width: 576px) {
    font-size: 22px;
    letterspacing: 2px;
  }
}

.message {
  margin-top: 6px;
  white-space: pre-line;
}

.who {
  margin-top: 16px;
  opacity: 0.95;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-avatar {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.player {
  color: #fff;
}
</style>

