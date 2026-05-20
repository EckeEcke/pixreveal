<template>
  <div v-if="isActive" class="freeze-burst" aria-hidden="true">
    <div class="freeze-burst__wash" />
    <div
      v-for="flake in activeFlakes"
      :key="flake.id"
      class="freeze-burst__flake"
      :style="{
        left: flake.x + '%',
        '--drift': flake.drift + 'px',
        animationDelay: flake.delayMs + 'ms',
      }"
    >
      {{ flake.char }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";

const props = defineProps({
  trigger: {
    type: Number,
    default: 0,
  },
});

interface FloatingFlake {
  id: number;
  char: string;
  x: number;
  drift: number;
  delayMs: number;
}

const isActive = ref(false);
const activeFlakes = ref<FloatingFlake[]>([]);
let clearTimeoutId: number | null = null;

const clear = () => {
  isActive.value = false;
  activeFlakes.value = [];
  if (clearTimeoutId) {
    clearTimeout(clearTimeoutId);
    clearTimeoutId = null;
  }
};

const run = () => {
  clear();
  isActive.value = true;

  const flakes: FloatingFlake[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    flakes.push({
      id: Date.now() + i + Math.random(),
      char: Math.random() > 0.35 ? "❄️" : "🧊",
      x: Math.random() * 80 + 10,
      drift: (Math.random() - 0.5) * 180,
      delayMs: Math.floor(Math.random() * 220),
    });
  }
  activeFlakes.value = flakes;

  clearTimeoutId = window.setTimeout(() => {
    clearTimeoutId = null;
    isActive.value = false;
    activeFlakes.value = [];
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
.freeze-burst {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 110;
  overflow: hidden;
}

.freeze-burst__wash {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 40%,
    rgba(56, 189, 248, 0.28) 0%,
    rgba(56, 189, 248, 0.16) 30%,
    rgba(56, 189, 248, 0.04) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  animation: freeze-wash 1s ease-out forwards;
}

.freeze-burst__flake {
  position: absolute;
  bottom: -60px;
  font-size: 64px;
  user-select: none;
  filter: drop-shadow(0 6px 16px rgba(56, 189, 248, 0.35));
  animation: freeze-float-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes freeze-wash {
  0% {
    opacity: 0;
    transform: scale(1.02);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes freeze-float-up {
  0% {
    transform: translateY(0) scale(0.7) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: translateY(-12vh) scale(1) rotate(10deg);
  }
  100% {
    transform: translateY(-75vh) translateX(var(--drift)) scale(1) rotate(-15deg);
    opacity: 0;
  }
}
</style>
