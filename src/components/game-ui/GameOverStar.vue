<template>
  <div class="score-wrapper">
    <Icon icon="pixel:star-solid" class="star-icon" />
    <span class="points">{{ points }}</span>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{
    points: number
}>();
</script>

<style scoped>
.score-wrapper {
  position: relative;
  width: 180px;
  margin: 16px auto 0;
  height: 180px;
  animation: floating 2s infinite ease-in-out;
}

.star-icon {
  font-size: 180px;
  position: absolute;
  color: yellow;
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 5px var(--neon-yellow));
}

.points {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
  z-index: 1;
  color: black;
  font-size: 41px;
  font-weight: 900;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
}
</style>
