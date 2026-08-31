<template>
  <div class="rank-text">
    <div>YOUR RANK IS</div>
    <div :class="rankData.class">{{ rankData.title }}</div>
    <div class="rank-desc">
      {{ rankData.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useConfigStore } from "@/stores/config";
import { getRankData } from "@/utils/ranks";
import { useGameStore } from "@/stores/game";

const props = defineProps<{
  percentile: number;
}>();

const configStore = useConfigStore();
const gameStore = useGameStore();

const rankData = computed(() => {
  return getRankData(props.percentile);
});
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
