<template>
  <div
    class="percentile-tag"
    :class="{ visible: active, pulsing: isPulsing, finished }"
    :data-rank="rank.class"
  >
    <Icon icon="pixel:chart-up" />
    Better than
    <span class="value" :class="{ pulse: isPulsing, 'tier-pop': isTierPop }">
      {{ displayPercentile }}%
    </span>
    of players
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { getRankData } from "@/utils/ranks";

const props = defineProps<{
  percentile: number;
  active: boolean;
}>();

const DURATION = 1200;

const displayPercentile = ref<number>(0);
const isPulsing = ref<boolean>(false);
const isTierPop = ref<boolean>(false);
const finished = ref<boolean>(false);

const rank = computed(() => getRankData(displayPercentile.value));

let rafId: number | null = null;
let pulseTimeout: ReturnType<typeof setTimeout> | null = null;
let tierTimeout: ReturnType<typeof setTimeout> | null = null;

const stopAnimation = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const animate = (target: number) => {
  stopAnimation();
  finished.value = false;
  const startTime = performance.now();

  const tick = (now: number) => {
    const t = Math.min((now - startTime) / DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out

    if (t < 1) {
      displayPercentile.value = Math.round(target * eased);
      rafId = requestAnimationFrame(tick);
    } else {
      displayPercentile.value = target;
      rafId = null;
      finished.value = true;
    }
  };

  rafId = requestAnimationFrame(tick);
};

// Pulse bei jedem neuen Zahlenwert
watch(displayPercentile, () => {
  isPulsing.value = true;
  if (pulseTimeout) clearTimeout(pulseTimeout);
  pulseTimeout = setTimeout(() => {
    isPulsing.value = false;
  }, 60);
});

// Größerer Pop, wenn der Wert in eine neue Rank-Stufe wechselt
watch(
  () => rank.value.class,
  () => {
    isTierPop.value = true;
    if (tierTimeout) clearTimeout(tierTimeout);
    tierTimeout = setTimeout(() => {
      isTierPop.value = false;
    }, 220);
  },
);

watch(
  () => [props.active, props.percentile] as const,
  ([active, value]) => {
    if (active) animate(Number(value));
  },
  { immediate: true },
);

onUnmounted(() => {
  stopAnimation();
  if (pulseTimeout) clearTimeout(pulseTimeout);
  if (tierTimeout) clearTimeout(tierTimeout);
});
</script>

<style scoped>
.percentile-tag {
  --rank-color: #ff0044;

  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid color-mix(in srgb, var(--rank-color) 35%, transparent);
  border-radius: 20px;
  font-size: 14px;
  color: #cccccc;
  opacity: 0;
  transition:
    opacity 0.3s ease,
    border-color 0.15s ease,
    box-shadow 0.06s ease-out;

  &.visible {
    opacity: 1;
  }

  &.pulsing {
    box-shadow: 0 0 14px color-mix(in srgb, var(--rank-color) 55%, transparent);
  }

  &[data-rank="rank-prophet"] {
    --rank-color: #ffcc00;
  }
  &[data-rank="rank-eagle"] {
    --rank-color: #00ffcc;
  }
  &[data-rank="rank-glitcher"] {
    --rank-color: #ff6600;
  }
  &[data-rank="rank-blurry"] {
    --rank-color: #888888;
  }
  &[data-rank="rank-afk"] {
    --rank-color: #ff0044;
  }

  svg {
    font-size: 16px;
    color: var(--rank-color);
    transition: color 0.15s ease;
  }
}

.value {
  display: inline-block;
  min-width: 3ch;
  color: var(--rank-color);
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  transition:
    color 0.15s ease,
    transform 0.06s ease-out,
    text-shadow 0.06s ease-out;

  &.pulse {
    transform: scale(1.25);
    text-shadow: 0 0 12px var(--rank-color);
  }

  &.tier-pop {
    transform: scale(1.6);
    text-shadow: 0 0 22px var(--rank-color);
  }
}

/* Finale: Landung des Endwerts + Ring, der vom Tag ausgeht */
.percentile-tag.finished .value {
  animation: percentile-land 0.5s cubic-bezier(0.18, 1.4, 0.4, 1);
}

.percentile-tag::after {
  content: "";
  position: absolute;
  inset: -1px;
  border: 2px solid var(--rank-color);
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
}

.percentile-tag.finished::after {
  animation: percentile-ring 0.7s ease-out;
}

@keyframes percentile-land {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.5);
    text-shadow: 0 0 24px var(--rank-color);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes percentile-ring {
  from {
    opacity: 0.8;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.3, 1.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .value.pulse,
  .value.tier-pop {
    transform: none;
  }

  .percentile-tag.finished .value,
  .percentile-tag.finished::after {
    animation: none;
  }
}
</style>