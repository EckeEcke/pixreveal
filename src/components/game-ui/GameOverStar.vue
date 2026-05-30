<template>
  <div class="score-wrapper">
    <div class="fade-in-animation">
      <Icon
        icon="pixel:star-solid"
        class="star-icon"
        :class="{ 'pop-effect': isCounting }"
      />
      <span class="points">{{ displayPoints }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useSoundStore } from "@/stores/sound";

const props = defineProps<{
  points: number;
}>();

const soundStore = useSoundStore();

const displayPoints = ref<number>(0);
const isCounting = ref<boolean>(false);

const animateScore = () => {
  if (props.points === 0) return;

  const duration = 1000;
  const startTime = performance.now();

  const updateScore = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentPoints = Math.floor(props.points * progress);

    if (currentPoints !== displayPoints.value) {
      displayPoints.value = currentPoints;
      soundStore.playSound("partyCorrect");
      isCounting.value = true;
      setTimeout(() => {
        isCounting.value = false;
      }, 50);
    }

    if (progress < 1) {
      requestAnimationFrame(updateScore);
    } else {
      displayPoints.value = props.points;
    }
  };

  requestAnimationFrame(updateScore);
};

onMounted(() => {
  setTimeout(() => {
    animateScore();
  }, 1200);
});
</script>

<style scoped>
.score-wrapper {
  position: relative;
  width: 180px;
  margin: 16px auto 0;
  height: 180px;
}

.star-icon {
  font-size: 180px;
  position: absolute;
  left: 0;
  color: yellow;
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 5px var(--neon-yellow));
  transition: transform 0.05s ease-out;
}

.star-icon.pop-effect {
  transform: scale(1.15);
  filter: drop-shadow(0 0 15px var(--neon-yellow));
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
</style>
