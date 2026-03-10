<template>
  <div class="app-container">
    <main class="game-layout">
      <section class="canvas-section">
        <div class="canvas-wrapper">
          <div
            class="interaction-layer"
            :style="{
              gridTemplateColumns: `repeat(${resolution}, 1fr)`,
              gridTemplateRows: `repeat(${resolution}, 1fr)`,
            }"
            @contextmenu.prevent
          >
            <div
              v-for="(_, index) in flatPixelData"
              :key="index"
              class="pixel-cell"
              @mousedown="paintPixel(index)"
              @mouseenter="handleDrag(index, $event)"
            ></div>
          </div>

          <PixelCanvas
            :pixel-array="pixelData"
            :resolution="resolution"
            :is-revealing="false"
          />
        </div>
      </section>

      <section class="editor-section">
        <div class="tool-card">
          <div class="editor-header">
            <h3>Data Input</h3>
            <div
              class="active-indicator"
              :style="{ backgroundColor: colorPalette[selectedColor] }"
            ></div>
          </div>

          <textarea
            v-model="rawInput"
            placeholder="Paste Array here..."
            @input="updateArrayFromInput"
          ></textarea>

          <div class="stats">
            Pixels: {{ resolution * resolution }} | Res: {{ resolution }}x{{
              resolution
            }}
          </div>

          <div class="action-buttons">
            <button @click="generateEmpty" class="btn-outline">
              Clear / New 16x16
            </button>
            <button
              @click="copyToClipboard"
              class="btn-outline"
              :class="{ 'btn-success': copyStatus === 'Copied!' }"
            >
              {{ copyStatus }}
            </button>
          </div>

          <div class="palette-container">
            <h3>Color Palette (Selected: {{ selectedColor }})</h3>
            <div class="color-palette">
              <div
                v-for="(color, index) in colorPalette"
                :key="index"
                class="color-palette-item"
                :class="{ active: selectedColor === index }"
                @click="selectedColor = index"
              >
                <div
                  class="color-flag"
                  :style="{
                    backgroundColor: color === 'transparent' ? '#333' : color,
                  }"
                ></div>
                <div class="color-label">{{ index }}</div>
              </div>
            </div>
          </div>

          <div class="drawings-list">
            <h3>Presets ({{ drawings.length }})</h3>
            <div class="preset-grid">
              <button
                v-for="drawing in drawings"
                :key="drawing.name"
                @click="setDrawing(drawing.data)"
                class="btn-preset"
              >
                {{ drawing.name }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import PixelCanvas from "../components/PixelCanvas.vue";
import colorPalette from "@/data/colorPalette";
import drawings from "@/data/drawings.json";

const resolution = ref(16);
const rawInput = ref("");
const selectedColor = ref(1);
const pixelData = ref(Array.from({ length: 16 }, () => Array(16).fill(0)));

const flatPixelData = computed(() => pixelData.value.flat());

const syncRawInput = () => {
  rawInput.value = JSON.stringify(pixelData.value);
};

const paintPixel = (index) => {
  const y = Math.floor(index / resolution.value);
  const x = index % resolution.value;
  pixelData.value[y][x] = Number(selectedColor.value);

  syncRawInput();
};

const handleDrag = (index, event) => {
  if (event.buttons === 1) {
    paintPixel(index);
  }
};

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
  pixelData.value = Array.from({ length: 16 }, () => Array(16).fill(0));
  resolution.value = 16;
  syncRawInput();
};

const setDrawing = (data) => {
  pixelData.value = data;
  resolution.value = data.length;
  syncRawInput();
};

const copyStatus = ref("Copy to Clipboard");

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rawInput.value);
    copyStatus.value = "Copied!";
    setTimeout(() => {
      copyStatus.value = "Copy to Clipboard";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
    copyStatus.value = "Error!";
  }
};
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  position: relative;
  background: #000;
}

.interaction-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  z-index: 10;
  border: 2px solid transparent;
}

.pixel-cell {
  border: 0.5px solid rgba(255, 255, 255, 0.03);
  box-sizing: border-box;
}

.pixel-cell:hover {
  background: rgba(255, 255, 255, 0.1);
  outline: 1px solid var(--primary);
  z-index: 11;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.active-indicator {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid #fff;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.color-flag {
  height: 16px;
  width: 16px;
  border: 1px solid var(--white);
}

.color-palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
}

.color-palette-item.active {
  border-color: var(--primary);
  background: rgba(255, 77, 0, 0.15);
}

.color-label {
  font-size: 0.8rem;
  color: #888;
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  height: 200px;
  overflow: auto;
}

.btn-preset {
  background: #2a2d3e;
  border: 1px solid #3f4257;
  color: var(--white);
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-preset:hover {
  border-color: var(--primary);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.tool-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #2a2d3e;
}

textarea {
  width: 100%;
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
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

.btn-secondary:hover {
  background: var(--primary);
  color: var(--white);
}
</style>
