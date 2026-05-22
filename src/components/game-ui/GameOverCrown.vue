<template>
  <div v-if="highscore || highscore === 0" class="hud-highscore">
    <div :key="highscore" class="highscore-wrapper">
      <h2>HIGHSCORE:</h2>
      <Icon icon="pixel:crown-solid" class="crown-icon" />
      {{ highscore }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
  highscore: number;
}>();
</script>

<style scoped>
.hud-highscore {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 8px;
  font-weight: 700;
  height: 88px;
  h2 {
    font-size: 20px;
  }
}

.crown-icon {
  color: var(--neon-blue);
  filter: drop-shadow(0 0 5px var(--neon-blue));
}

.highscore-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 36px;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}
</style>
