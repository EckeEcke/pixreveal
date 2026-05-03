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
      <h2>What is PIX<span>REVEAL</span>?</h2>
      <p>
        Unveil the art, beat the clock! PixReveal is a fast-paced guessing game
        where every pixel counts. Challenge yourself in Solo mode, host a local
        Party, or battle friends online. Can you recognize the drawing before
        the final pixel drops?
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
  @media (min-width: 768px) {
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
  letter-spacing: 1px;
    & span {
    color: var(--primary);
  }
}

.info-text p {
  line-height: 1.6;
  color: #ffffff88;
}

@media (max-width: 767px) {
  .info-text {
    text-align: center;
  }
}
</style>
