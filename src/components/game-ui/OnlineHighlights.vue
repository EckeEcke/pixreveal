<template>
  <section v-if="currentHighlight" class="online-highlights">
    <Transition name="fade" mode="out-in">
      <article :key="currentHighlight.key" class="highlight-pill" @click="advance">
        <div class="highlight-image">
          <PixelCanvas
            :pixel-array="currentHighlight.highlight.pixels"
            :resolution="currentHighlight.highlight.pixels.length"
            :is-revealing="false"
            :is-status-icon="false"
            :timer-duration="0"
            :pause-reveal="false"
          />
        </div>
        <div class="highlight-copy">
          <div
            class="answer-line"
            :class="currentHighlight.highlight.isCorrect ? 'answer-correct' : 'answer-wrong'"
          >
            <span>{{ currentHighlight.highlight.isCorrect ? "✅" : "❌" }}</span>
            <span>{{ currentHighlight.highlight.givenAnswer }}</span>
          </div>
          <p class="message">{{ currentHighlight.message }}</p>
          <div class="player-pill">
            <div class="mini-avatar" :style="avatarStyleFor(currentHighlight.avatarIndex)" />
            <span>{{ currentHighlight.username.toUpperCase() }}</span>
          </div>
        </div>
      </article>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import avatarSheet from "@/assets/avatars/avatars.webp";
import type { OnlineHighlight, Player } from "@/types/player";
import { workerClearInterval, workerSetInterval } from "@/services/workerTimers";

const props = defineProps<{ players: Player[] }>();
const activeIndex = ref(0);
let intervalId: number | null = null;

const copy = {
  correct: [
    ["⚡", "Fastest Guess", "That answer arrived before the picture did."],
    ["🎯", "Pixel Sniper", "You saw three pixels and chose violence."],
    ["🚀", "Blink And It's Gone", "The buzzer barely had time to panic."],
  ],
  incorrect: [
    ["🧱", "Confidently Wrong", "You waited for the whole masterpiece and chose chaos."],
    ["🐌", "Last To The Party", "The pixels were practically holding up a sign."],
    ["🔍", "Overthinking Champion", "You gave every pixel a chance to testify."],
  ],
} as const;

type HighlightSlide = {
  key: string;
  emoji: string;
  title: string;
  message: string;
  username: string;
  avatarIndex: number;
  highlight: OnlineHighlight;
};

const highlights = computed<HighlightSlide[]>(() => {
  const result: HighlightSlide[] = [];
  for (const player of props.players) {
    const playerHighlights = player.onlineHighlights ?? [
      player.bestCorrectHighlight,
      player.worstIncorrectHighlight,
    ];
    for (const highlight of playerHighlights) {
      if (!highlight) continue;
      const variants = copy[highlight.isCorrect ? "correct" : "incorrect"];
      const variant = variants[result.length % variants.length] ?? variants[0];
      result.push({
        key: `${player.playerId}-${highlight.isCorrect ? "best" : "worst"}`,
        emoji: variant[0],
        title: variant[1],
        message: variant[2],
        username: player.username || "Player",
        avatarIndex: player.avatarIndex,
        highlight,
      });
    }
  }
  return result;
});

const currentHighlight = computed(() => highlights.value[activeIndex.value] ?? highlights.value[0] ?? null);

const advance = () => {
  if (highlights.value.length > 1) {
    activeIndex.value = (activeIndex.value + 1) % highlights.value.length;
  }
};

const avatarStyleFor = (avatarIndex: number) => {
  const index = typeof avatarIndex === "number" ? avatarIndex : 0;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${(index % 6) * 20}% ${Math.floor(index / 6) * 20}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  } as const;
};

onMounted(() => {
  intervalId = workerSetInterval(advance, 10000);
});

onBeforeUnmount(() => {
  if (intervalId) workerClearInterval(intervalId);
});
</script>

<style scoped>
.online-highlights {
  width: 100%;
  margin: 16px 0;
}

.highlight-pill {
  display: grid;
  grid-template-columns: minmax(110px, 34%) 1fr;
  gap: 32px;
  min-height: 180px;
  box-sizing: border-box;
  padding: 16px;
  border: 2px solid rgba(255,255,255,0.09);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.highlight-image {
  min-width: 0;
  aspect-ratio: 1;
}

.highlight-image :deep(.canvas-wrapper),
.highlight-image :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.highlight-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 900;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--neon-yellow);
  text-transform: uppercase;
}

.emoji { font-size: 24px; }
.title { font-size: 20px; letter-spacing: 1px; }
.message { margin: 8px 0 12px; line-height: 1.5; }

.answer-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 900;
  text-transform: uppercase;
}

.answer-correct { color: var(--neon-success); }
.answer-wrong { color: var(--neon-error); }

.player-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 4px 10px 4px 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 14px;
}

.mini-avatar {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 4px;
  background-color: #2d3748;
}

@media (max-width: 500px) {
  .highlight-pill { 
    grid-template-columns: 100px 1fr;
    align-items: center; 
    gap: 16px; 
    padding: 12px;
    .highlight-image {
      max-width: 250px;
    } 
  }
  .title { font-size: 16px; }
  .message { font-size: 14px; }
}
</style>
