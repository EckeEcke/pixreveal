<template>
  <div class="app-container">
    <main class="game-layout">
      <section class="canvas-section">
        <PixelCanvas :pixel-array="pixelData" :resolution="resolution" />
      </section>

      <section class="editor-section">
        <div class="tool-card">
          <h3>Data Input</h3>
          <textarea
            v-model="rawInput"
            placeholder="Paste Array here: [0, 1, 0...]"
            @input="updateArrayFromInput"
          ></textarea>

          <div class="stats">
            Pixels: {{ pixelData.length }} | Res: {{ resolution }}x{{ resolution }}
          </div>
          <button @click="generateEmpty" class="btn-secondary">Clear / New 16x16</button>
          <div>
            <h3>Color Palette</h3>
            <div class="color-palette">
              <div v-for="i in 15" class="color-palette-item">
                <div
                  class="color-flag"
                  :style="{ backgroundColor: colorPalette[i - 1] }"
                ></div>
                <div>{{ i - 1 }}</div>
              </div>
            </div>
          </div>
          <button v-for="drawing in drawings" @click="setDrawing(drawing.data)">
            {{ drawing.name }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PixelCanvas from "../components/PixelCanvas.vue";
import colorPalette from "@/data/colorPalette";
import drawings from "@/data/drawings";

const resolution = ref(16);
const rawInput = ref("");

const createEmptyMatrix = (res) => {
  return Array.from({ length: res }, () => Array(res).fill(0));
};

const pixelData = ref(createEmptyMatrix(16));

const updateArrayFromInput = () => {
  try {
    const parsed = JSON.parse(rawInput.value);
    if (Array.isArray(parsed)) {
      pixelData.value = parsed;
      resolution.value = parsed.length;
    }
  } catch (e) {}
};

const generateEmpty = () => {
  const newMatrix = Array.from({ length: 16 }, () => Array(16).fill(0));
  pixelData.value = newMatrix;
  resolution.value = 16;
  rawInput.value = JSON.stringify(newMatrix);
};

const setDrawing = (data) => {
  pixelData.value = data;
  resolution.value = Math.sqrt(data.length);
  rawInput.value = JSON.stringify(data);
};
</script>

<style>
:root {
  --bg-dark: #0d0e14;
  --card-bg: #161821;
  --neon-orange: #ff4d00;
  --text-main: #e0e0e0;
}

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

.logo {
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  margin-bottom: 2rem;
}

.logo span {
  color: var(--neon-orange);
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

.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 64px);
  gap: 8px;
}

.color-flag {
  height: 16px;
  width: 16px;
  border: 1px solid white;
}

.color-palette-item {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
