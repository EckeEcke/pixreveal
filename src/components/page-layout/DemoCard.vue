<template>
  <div class="info-card setup-card">
    <div class="canvas-preview">
      <PixelCanvas
        class="canvas"
        :pixel-array="currentDisplayData"
        :resolution="16"
        :is-revealing="true"
        :timer-duration="15"
        :mute-sound="true"
      />
    </div>
    <div class="info-text">
      <h2 class="logo">WHAT IS PIX<span>REVEAL</span>?</h2>
      <p>
        Unveil the art, beat the clock. Guess the pixel art as it reveals —
        before the final pixel drops.
      </p>
    </div>
    <Icon icon="pixel:question-circle" class="background-icon" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import allDrawings from "@/data/drawings.json";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import { Icon } from "@iconify/vue";

const currentDisplayData = ref(allDrawings[0].data);
let intervalId;

onMounted(() => {
  intervalId = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * allDrawings.length);
    currentDisplayData.value = allDrawings[randomIndex].data;
  }, 15000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.canvas {
  border-radius: 8px;
}

.info-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  margin-top: 40px;
  padding: 32px;
  max-width: 850px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.background-icon {
  position: absolute;
  font-size: 200px;
  right: -50px;
  bottom: -30px;
  color: var(--primary);
  opacity: 0.1;
}

.canvas-preview {
  flex: 0 0 150px;
  width: 150px;
  height: 150px;
}

.info-text {
  flex: 1 1 200px;
  text-align: left;
}

.info-text h2 {
  margin-top: 0;
  margin-bottom: 16px;
}

.info-text p {
  line-height: 1.6;
  font-size: 18px;
  color: #ffffff88;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .info-text {
    text-align: center;
  }
}
</style>
