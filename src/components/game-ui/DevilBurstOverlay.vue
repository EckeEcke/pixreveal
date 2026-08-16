<template>
  <div v-if="isActive" class="devil-burst" aria-hidden="true">
    <div class="devil-burst__wash" />
    <div
      v-for="flame in activeFlames"
      :key="flame.id"
      class="devil-burst__flame"
      :style="{
        left: flame.x + '%',
        '--drift': flame.drift + 'px',
        animationDelay: flame.delayMs + 'ms',
      }"
    >
      {{ flame.char }}
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

interface FloatingFlame {
  id: number;
  char: string;
  x: number;
  drift: number;
  delayMs: number;
}

const isActive = ref(false);
const activeFlames = ref<FloatingFlame[]>([]);
let clearTimeoutId: number | null = null;

const clear = () => {
  isActive.value = false;
  activeFlames.value = [];
  if (clearTimeoutId) {
    clearTimeout(clearTimeoutId);
    clearTimeoutId = null;
  }
};

const run = () => {
  clear();
  isActive.value = true;

  const flames: FloatingFlame[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    flames.push({
      id: Date.now() + i + Math.random(),
      char: Math.random() > 0.35 ? "🔥" : "😈",
      x: Math.random() * 80 + 10,
      drift: (Math.random() - 0.5) * 180,
      delayMs: Math.floor(Math.random() * 220),
    });
  }
  activeFlames.value = flames;

  clearTimeoutId = window.setTimeout(() => {
    clearTimeoutId = null;
    isActive.value = false;
    activeFlames.value = [];
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
.devil-burst {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 110;
  overflow: hidden;
}

.devil-burst__wash {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 40%,
    rgba(255, 0, 0, 0.28) 0%,
    rgba(255, 60, 0, 0.16) 30%,
    rgba(255, 60, 0, 0.04) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  animation: devil-wash 1s ease-out forwards;
}

.devil-burst__flame {
  position: absolute;
  bottom: -60px;
  font-size: 64px;
  user-select: none;
  filter: drop-shadow(0 6px 16px rgba(255, 0, 0, 0.35));
  animation: devil-float-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes devil-wash {
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

@keyframes devil-float-up {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-90vh) translateX(var(--drift)) rotate(15deg);
  }
}
</style>