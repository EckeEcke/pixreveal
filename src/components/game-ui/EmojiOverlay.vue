<template>
  <div class="emoji-container">
    <div
      v-for="emoji in activeEmojis"
      :key="emoji.id"
      class="emoji"
      :style="{ left: emoji.x + '%', '--drift': emoji.drift + 'px' }"
    >
      {{ emoji.char }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSoundStore } from "@/stores/sound";
import { ref, watch } from "vue";

const props = defineProps({
  newEmoji: {
    type: String,
    default: "",
  },
});

interface FloatingEmoji {
  id: number;
  char: string;
  x: number;
  drift: number;
}

const soundStore = useSoundStore();

const activeEmojis = ref<FloatingEmoji[]>([]);

const spawnEmoji = (char: string) => {
  if (!char) return;

  const id = Date.now() + Math.random();
  const emoji = {
    id,
    char,
    x: Math.random() * 80 + 10,
    drift: (Math.random() - 0.5) * 200,
  };

  activeEmojis.value.push(emoji);

  soundStore.playSound("pop");

  setTimeout(() => {
    activeEmojis.value = activeEmojis.value.filter((e) => e.id !== id);
  }, 3000);
};

watch(
  () => props.newEmoji,
  (val) => {
    if (val) spawnEmoji(val);
  },
);
</script>

<style scoped>
.emoji-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

.emoji {
  position: absolute;
  bottom: -60px;
  font-size: 4rem;
  user-select: none;
  animation: float-up-emoji 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
