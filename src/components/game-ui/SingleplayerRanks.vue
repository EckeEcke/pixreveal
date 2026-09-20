<template>
  <div class="rank-text" :class="{ active }">
    <div class="rank-label">YOUR RANK IS</div>
    <div class="rank-title-wrap">
      <div :class="rankData.class">{{ rankData.title }}</div>
    </div>
    <div class="rank-desc">
      {{ rankData.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getRankData } from "@/utils/ranks";

const props = withDefaults(
  defineProps<{
    percentile: number;
    active?: boolean;
  }>(),
  { active: true },
);

const rankData = computed(() => getRankData(props.percentile));
</script>

<style scoped>
.rank-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  margin-top: 16px;
  font-weight: 700;
}

.rank-desc {
  margin: 16px;
}

.rank-label,
.rank-title-wrap,
.rank-desc {
  opacity: 0;
}

.rank-title-wrap {
  transform-origin: center;
}

.rank-text.active .rank-label {
  animation: rankFade 0.4s ease-out forwards;
}

.rank-text.active .rank-title-wrap {
  animation: rankTitleReveal 0.6s cubic-bezier(0.18, 1.4, 0.4, 1) 0.15s forwards;
}

.rank-text.active .rank-desc {
  animation: rankFadeUp 0.5s ease-out 0.55s forwards;
}

@keyframes rankFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rankTitleReveal {
  from {
    opacity: 0;
    transform: scale(0.5);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes rankFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rank-label,
  .rank-title-wrap,
  .rank-desc {
    opacity: 1;
  }

  .rank-text.active .rank-label,
  .rank-text.active .rank-title-wrap,
  .rank-text.active .rank-desc {
    animation: none;
  }
}

.rank-prophet {
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
  animation: pulse 2s ease-in-out infinite;
  font-weight: bold;
  font-size: 24px;
}

.rank-eagle {
  color: #00ffcc;
  animation: sharp-pulse 1.5s ease-in-out infinite;
  font-size: 24px;
}

.rank-glitcher {
  color: #ff6600;
  animation: glitch 0.2s infinite;
  font-size: 24px;
}

.rank-blurry {
  color: #888888;
  animation: blur-fade 3s infinite;
  font-size: 24px;
}

.rank-afk {
  color: #ff0044;
  animation: slow-blink 2s step-end infinite;
  font-size: 24px;
}
</style>