<template>
  <div class="info-card setup-card">
    <div class="canvas-preview">
      <PixelCanvas
        :pixel-array="currentDisplayData"
        :resolution="16"
        :is-revealing="true"
        :timer-duration="15"
      />
    </div>
    <div class="info-text">
      <h2>What is PixReveal?</h2>
      <p>
        PixReveal is an interactive guessing game where pixel art is
        revealed pixel by pixel. Challenge your recognition skills across
        various game modes and compete against the clock. Whether playing solo,
        hosting a local party, or battling friends online, the goal is simple:
        guess the art before it's fully revealed!
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
.info-card {
  display: flex;
  flex-direction: column;
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
  @media(min-width: 768px) {
    flex-direction: row;
  }
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
  color: var(--primary);
}

.info-text p {
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 767px) {
  .info-text {
    text-align: center;
  }
}
</style>
