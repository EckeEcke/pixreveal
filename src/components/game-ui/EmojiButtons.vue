<template>
  <div class="emoji-btns">
    <button
      v-for="emoji in (reduced ? emojisReduced : emojis)"
      :key="emoji"
      class="emoji-btn"
      data-sfx="pop"
      :disabled="emojiCooldown || isFrozen || connectionStale"
      @click="sendEmoji(emoji)"
    >
      {{ emoji }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  emojiCooldown: boolean;
  isFrozen: boolean;
  connectionStale: boolean;
  reduced: boolean;
}>();

const emit = defineEmits<{
  clicked: [emoji: string];
}>();

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

const emojisReduced = [
  "👏",
  "😭",
  "😎",
  "💩",
];

const sendEmoji = (emoji: string) => {
  emit("clicked", emoji);
};
</script>

<style scoped>
.emoji-btns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin: 0 auto 64px;
  width: 95%;
  box-sizing: border-box;
  border: 2px solid var(--neon-pink);
  border-radius: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
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
</style>