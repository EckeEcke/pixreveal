<template>
  <div v-if="isActive" class="fart-burst" aria-hidden="true">
    <div class="fart-burst__wash" />
    <div
      v-for="cloud in activeClouds"
      :key="cloud.id"
      class="fart-burst__cloud"
      :style="{
        left: cloud.x + '%',
        '--drift': cloud.drift + 'px',
        '--rotate': cloud.rotate + 'deg',
        animationDelay: cloud.delayMs + 'ms',
      }"
    >
      {{ cloud.char }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { useSoundStore } from "@/stores/sound";

const soundStore = useSoundStore();

const props = defineProps({
  trigger: {
    type: Number,
    default: 0,
  },
});

interface FloatingCloud {
  id: number;
  char: string;
  x: number;
  drift: number;
  rotate: number;
  delayMs: number;
}

const isActive = ref(false);
const activeClouds = ref<FloatingCloud[]>([]);
let clearTimeoutId: number | null = null;

const clear = () => {
  isActive.value = false;
  activeClouds.value = [];
  if (clearTimeoutId) {
    clearTimeout(clearTimeoutId);
    clearTimeoutId = null;
  }
};

const run = () => {
  clear();
  isActive.value = true;
  soundStore.playSound("fart");

  const clouds: FloatingCloud[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    clouds.push({
      id: Date.now() + i + Math.random(),
      char: Math.random() > 0.35 ? "💨" : "🤢",
      x: Math.random() * 80 + 10,
      drift: (Math.random() - 0.5) * 180,
      rotate: (Math.random() - 0.5) * 60,
      delayMs: Math.floor(Math.random() * 220),
    });
  }
  activeClouds.value = clouds;

  clearTimeoutId = window.setTimeout(() => {
    clearTimeoutId = null;
    isActive.value = false;
    activeClouds.value = [];
  }, 1000);
};

watch(
  () => props.trigger,
  (val, prev) => {
    if (val === prev) return;
    if (val <= 0) return;
    run();
  },
);

onUnmounted(() => clear());
</script>

<style scoped>
.fart-burst {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 110;
  overflow: hidden;
}

.fart-burst__wash {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 60%,
    rgba(132, 204, 22, 0.28) 0%,
    rgba(132, 204, 22, 0.16) 30%,
    rgba(132, 204, 22, 0.04) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  animation: fart-wash 1s ease-out forwards;
}

.fart-burst__cloud {
  position: absolute;
  bottom: -60px;
  font-size: 64px;
  user-select: none;
  filter: drop-shadow(0 6px 16px rgba(132, 204, 22, 0.35));
  animation: fart-float-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fart-wash {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes fart-float-up {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateY(-420px) translateX(var(--drift)) rotate(var(--rotate));
    opacity: 0;
  }
}
</style>