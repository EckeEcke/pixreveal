<template>
  <div class="stats">
    <div class="hud-points">
      <div :key="points" class="score-wrapper">
        <Icon icon="pixel:star-solid" class="star-icon" /> {{ points }}
      </div>
    </div>
    <div v-if="playerStore.gameMode === 'survival'" class="hud-highscore">
      <div :key="highscore" class="highscore-wrapper">
        <Icon icon="pixel:crown-solid" class="star-icon" />
        {{ survivalStore.highscore || 0 }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from "@/stores/player";
import { useSurvivalStore } from "@/stores/survival";
import { Icon } from "@iconify/vue";

const playerStore = usePlayerStore();
const survivalStore = useSurvivalStore();

const points =
  playerStore.gameMode === "survival"
    ? survivalStore.solvedCount
    : playerStore.points;
</script>

<style scoped>
.hud-points,
.hud-highscore {
  display: flex;
  flex-direction: row;
  gap: 4px;
  position: relative;
  padding: 8px;
  font-size: 20px;
  font-weight: 700;
}

.star-icon {
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 5px var(--neon-yellow));
}

.score-wrapper,
.highscore-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}

.stats {
  display: flex;
  justify-content: space-around;
}
</style>
