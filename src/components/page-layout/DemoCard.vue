<template>
  <div class="info-card setup-card">
    <div class="canvas-preview">
      <PixelCanvas
        class="canvas"
        :pixel-array="currentDisplayData"
        :resolution="16"
        :is-revealing="true"
        :timer-duration="15"
      />
    </div>
    <div class="info-text">
      <h2>WHAT IS PIX<span>REVEAL</span>?</h2>
      <p>
        Unveil the art, beat the clock. Guess the pixel art as it reveals —
        before the final pixel drops.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import allDrawings from "@/data/drawings.json";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";

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
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 16px;
  letter-spacing: 1px;
  & span {
    color: var(--primary);
  }
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
