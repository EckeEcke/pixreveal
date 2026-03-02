<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PixelCanvas from "./components/PixelCanvas.vue";

const resolution = ref(16);
const rawInput = ref("");
const pixelData = ref(Array(256).fill(0));

const updateArrayFromInput = () => {
  try {
    const parsed = JSON.parse(rawInput.value);
    if (Array.isArray(parsed)) {
      pixelData.value = parsed;
      resolution.value = Math.sqrt(parsed.length);
    }
  } catch (e) {}
};

const generateEmpty = () => {
  pixelData.value = Array(256).fill(0);
  rawInput.value = JSON.stringify(pixelData.value);
  resolution.value = 16;
};
</script>

<style>
body {
  margin: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: "Inter", sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  max-width: calc(1000px + 2rem);
  width: 100%;
}

.tool-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #2a2d3e;
}

textarea {
  width: 100%;
  height: 200px;
  background: #000;
  color: #0f0;
  font-family: monospace;
  border: 1px solid #333;
  padding: 10px;
  box-sizing: border-box;
  resize: none;
}

.btn-secondary {
  margin-top: 1rem;
  background: transparent;
  border: 1px solid var(--neon-orange);
  color: var(--neon-orange);
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

.btn-secondary:hover {
  background: var(--neon-orange);
  color: white;
}
</style>
