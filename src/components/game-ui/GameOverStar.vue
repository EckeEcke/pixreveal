<template>
  <div class="score-wrapper">
    <div class="fade-in-animation">
      <Icon icon="pixel:star-solid" class="star-icon" />
      <span class="points">{{ points }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
  points: number;
}>();
</script>

<style scoped>
.score-wrapper {
  position: relative;
  width: 180px;
  margin: 16px auto 0;
  height: 180px;
  animation: pulse 2s infinite ease-in-out;
}

.star-icon {
  font-size: 180px;
  position: absolute;
  left: 0;
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

.fade-in-animation {
  height: 100%;
  width: 100%;
  transform: scale(0);
  animation: starReveal 0.55s cubic-bezier(0.18, 1.4, 0.4, 1) forwards;
  animation-delay: 1.5s;
}

@keyframes starReveal {
  0% {
    opacity: 0;
    transform: scale(0);
    filter: blur(8px) drop-shadow(0 0 0 #ffd700);
  }
  70% {
    opacity: 1;
    transform: scale(1.08);
    filter: blur(0) drop-shadow(0 0 18px #ffd700);
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px #ffd700);
  }
}
</style>
