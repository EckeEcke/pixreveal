<template>
  <Teleport to="body">
    <Transition name="winner-fade" @after-leave="emit('done')">
      <div v-if="visible" class="winner-overlay" role="dialog" aria-live="polite">
        <div class="winner-backdrop" />
        <div
          class="winner-scale-wrapper"
          ref="wrapperRef"
          :style="{ transform: `scale(${scale})` }"
        >
          <div class="winner-card" ref="contentRef">
            <div class="winner-glow" />
            <div
              class="winner-avatar"
              :style="avatarStyle"
              aria-hidden="true"
            />
            <div class="winner-name">{{ displayName }}</div>
            <div class="winner-sub">is the winner</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from "vue";
import type { CSSProperties } from "vue";
import avatarSheet from "@/assets/avatars/avatars.webp";
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers";
import { useConfetti } from "@/composables/useConfetti";

const props = defineProps<{
  winnerName: string;
  avatarIndex: number;
  show: boolean;
  durationMs?: number;
  isWinner?: boolean;
}>();

const emit = defineEmits<{
  (e: "done"): void;
}>();

const { fireConfetti } = useConfetti();

const visible = ref(false);
let hideTimeoutId: number | null = null;

const clearHideTimeout = () => {
  workerClearTimeout(hideTimeoutId);
  hideTimeoutId = null;
};

watch(
  () => props.show,
  (shouldShow) => {
    clearHideTimeout();
    if (!shouldShow) {
      visible.value = false;
      return;
    }

    visible.value = true;
    if (props.isWinner) fireConfetti()

    const duration = typeof props.durationMs === "number" ? props.durationMs : 3000;
    hideTimeoutId = workerSetTimeout(() => {
      hideTimeoutId = null;
      visible.value = false;
    }, duration);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearHideTimeout();
});

const displayName = computed(() => String(props.winnerName || "Player").toUpperCase());

const avatarStyle = computed<CSSProperties>(() => {
  const index = props.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated" as CSSProperties["imageRendering"],
  };
});

const wrapperRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const scale = ref(1);

const VIEWPORT_MARGIN = 24;
const HEIGHT_RATIO = 0.5;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.6;

let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;

const getViewportSize = () => {
  const vv = window.visualViewport;
  return {
    width: vv ? vv.width : window.innerWidth,
    height: vv ? vv.height : window.innerHeight,
  };
};

const recomputeScale = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    if (!contentRef.value) return;

    const naturalWidth = contentRef.value.offsetWidth;
    const naturalHeight = contentRef.value.offsetHeight;
    if (!naturalWidth || !naturalHeight) return;

    const { width: viewportWidth, height: viewportHeight } = getViewportSize();
    const availableWidth = viewportWidth - VIEWPORT_MARGIN * 2;

    const availableHeight = viewportHeight * HEIGHT_RATIO - VIEWPORT_MARGIN;

    const nextScale = Math.min(
      availableWidth / naturalWidth,
      availableHeight / naturalHeight,
    );

    scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
  });
};

let mediaObserverAttached = false;

const attachObservers = async () => {
  await nextTick();
  recomputeScale();

  if (!contentRef.value) return;
  resizeObserver = new ResizeObserver(recomputeScale);
  resizeObserver.observe(contentRef.value);

  window.addEventListener("resize", recomputeScale);
  window.visualViewport?.addEventListener("resize", recomputeScale);
  mediaObserverAttached = true;
};

const detachObservers = () => {
  if (rafId) cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener("resize", recomputeScale);
  window.visualViewport?.removeEventListener("resize", recomputeScale);
  mediaObserverAttached = false;
};

watch(visible, (isVisible) => {
  if (isVisible) {
    attachObservers();
  } else if (mediaObserverAttached) {
    detachObservers();
  }
});

onMounted(() => {
  if (visible.value) attachObservers();
});

onUnmounted(() => {
  detachObservers();
});
</script>

<style scoped>
.winner-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.winner-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(4px);
}

.winner-scale-wrapper {
  position: relative;
  z-index: 1;
  transform-origin: center center;
}

.winner-card {
  position: relative;
  width: min(520px, calc(100vw - 64px));
  box-sizing: border-box;
  border-radius: 12px;
  padding: 28px 22px 22px;
  background: rgba(12, 8, 20, 0.85);
  border: 2px solid rgba(255, 176, 0, 0.55);
  box-shadow:
    0 0 0 3px rgba(255, 176, 0, 0.12),
    0 30px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  text-align: center;
  animation: card-pop 520ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.winner-glow {
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle, rgba(255, 176, 0, 0.22), transparent 55%);
  filter: blur(2px);
  animation: glow-pulse 1.6s ease-in-out infinite;
}

.winner-card::after {
  content: "";
  position: absolute;
  top: -60%;
  left: -70%;
  width: 40%;
  height: 220%;
  transform: rotate(18deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.18),
    transparent
  );
  animation: shine-sweep 1.2s ease-out 120ms both;
}

.winner-avatar {
  position: relative;
  z-index: 1;
  width: 96px;
  height: 96px;
  margin: 0 auto 14px;
  border-radius: 14px;
  box-shadow:
    0 0 0 4px rgba(255, 176, 0, 0.15),
    0 12px 18px rgba(0, 0, 0, 0.45);
  transform: translateY(2px);
  animation: avatar-bounce 700ms ease-out 80ms both;
}

.winner-name {
  position: relative;
  z-index: 1;
  font-family: "8bit";
  letter-spacing: 3px;
  color: var(--white);
  font-size: 22px;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(255, 176, 0, 0.3);
}

.winner-sub {
  position: relative;
  z-index: 1;
  color: var(--neon-yellow);
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  animation: float-soft 2.2s ease-in-out infinite;
}

.winner-fade-enter-active,
.winner-fade-leave-active {
  transition: opacity 240ms ease;
}
.winner-fade-enter-from,
.winner-fade-leave-to {
  opacity: 0;
}
</style>