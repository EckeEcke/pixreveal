<template>
  <div class="app-container">
    <button class="back-btn" @click="$router.back()">
      <Icon icon="pixel:angle-left-solid" />
    </button>
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
              :class="!showGrid ? 'transparent-border' : ''"
              @mousedown="paintPixel(index)"
              @mouseenter="handleDrag(index, $event)"
            ></div>
          </div>

          <PixelCanvas
            ref="pixelCanvasRef"
            :pixel-array="pixelData"
            :resolution="resolution"
            :is-revealing="false"
          />
        </div>
      </section>

      <section class="editor-section">
        <div v-if="viewMode === 'editor'">
          <InfoBox
            class="recommendation"
            message="Create and submit your own pixel art. Once your art is approved,
              it is available in PixReveal for all players to guess."
          />

          <div class="palette-container">
            <h3>Color Palette</h3>
            <div class="color-palette">
              <div
                v-for="(color, index) in colorPalette"
                :key="index"
                class="color-palette-item"
                :class="{ active: selectedColor === index }"
                @click="selectedColor = index"
              >
                <Icon
                  v-if="color === 'transparent'"
                  class="eraser"
                  icon="streamline-pixel:interface-essential-eraser"
                />
                <div
                  v-else
                  class="color-flag"
                  :style="{
                    backgroundColor: color,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="downloadDrawing" class="btn-outline">
              <Icon icon="pixel:download-solid" /> Download
            </button>
            <button @click="generateEmpty" class="btn-outline">
              <Icon icon="pixel:trash-alt-solid" /> Clear
            </button>
            <button
              v-if="isAdmin"
              @click="copyToClipboard"
              class="btn-outline"
              :class="{ 'btn-success': copyStatus === 'Copied!' }"
            >
              {{ copyStatus }}
            </button>
            <button
              @click="showGrid = !showGrid"
              class="btn-outline"
              :class="!showGrid ? 'inactive' : ''"
            >
              <Icon icon="pixel:grid" /> Grid
            </button>
          </div>

          <div class="drawings-list">
            <h3>Presets ({{ drawings.length }})</h3>
            <select
              @change="
                setDrawing(
                  drawings.find((d) => d.name === $event.target.value)?.data,
                )
              "
              class="preset-select"
            >
              <option value="" disabled selected>Select a preset...</option>
              <option
                v-for="drawing in drawings"
                :key="drawing.name"
                :value="drawing.name"
              >
                {{ drawing.name }}{{ drawing.createdAt ? " [User Art]" : "" }}
              </option>
            </select>
          </div>

          <button
            @click="viewMode = 'submit'"
            class="btn-primary submit-trigger"
          >
            SUBMIT TO PIXREVEAL
          </button>
        </div>

        <div v-else class="submit-form">
          <h3>Submit Your Art</h3>

          <div class="form-group">
            <label>Drawing Name</label>
            <input
              v-model="submitData.name"
              type="text"
              maxlength="30"
              placeholder="Give your pixel art a name..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="submitData.category" class="preset-select">
              <option value="" disabled selected>Select a category...</option>
              <option v-for="cat in allCategoryNames" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="legal-text-container">
            <Icon icon="pixel:info-circle" />
            <p class="legal-text">
              By submitting, you confirm that this is your original work and
              agree that it may be used in PIXREVEAL for all players.
            </p>
          </div>

          <div class="form-actions">
            <button @click="uploadDrawing" class="btn-primary">
              UPLOAD NOW
            </button>
            <button @click="viewMode = 'editor'" class="btn-outline">
              CANCEL / BACK
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import InfoBox from "@/components/game-ui/InfoBox.vue";
import colorPalette from "@/data/colorPalette";
import drawings from "@/data/drawings.json";
import { allCategoryNames } from "@/stores/config";
import { Icon } from "@iconify/vue";
import { toast } from "vue3-toastify";

const resolution = ref(16);
const rawInput = ref("");
const selectedColor = ref("1");
const showGrid = ref(true);
const pixelData = ref(Array.from({ length: 16 }, () => Array(16).fill(0)));

const isAdmin = window.location.hostname === "localhost";

const viewMode = ref("editor");
const submitData = reactive({
  name: "",
  category: "",
});

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

const generateEmpty = () => {
  pixelData.value = Array.from({ length: 16 }, () => Array(16).fill(0));
  resolution.value = 16;
  syncRawInput();
};

const setDrawing = (data) => {
  if (!data) return;
  pixelData.value = data;
  resolution.value = data.length;
  syncRawInput();
};

const copyStatus = ref("Copy");

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(rawInput.value);
    copyStatus.value = "Copied!";
    setTimeout(() => {
      copyStatus.value = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
    copyStatus.value = "Error!";
  }
};

const getUploadErrorMessage = (payload) => {
  if (payload?.error && typeof payload.error === "string") return payload.error;
  if (payload?.message && typeof payload.message === "string")
    return payload.message;
  return "Upload failed. Please try again.";
};

const uploadDrawing = async () => {
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: submitData.name,
        category: submitData.category,
        data: pixelData.value,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      toast.error(getUploadErrorMessage(json), {
        icon: "🚫",
      });
      return;
    }

    submitData.name = "";
    submitData.category = "";
    viewMode.value = "editor";
    toast.success("Upload successful. Thx for contributing to PixReveal!");
  } catch (err) {
    toast.error("Network error. Please check your connection and try again.", {
      icon: "📡",
    });
  }
};

const pixelCanvasRef = ref(null);

const downloadDrawing = () => {
  const dataUrl = pixelCanvasRef.value?.getImageUrl();

  if (dataUrl) {
    const link = document.createElement("a");
    const fileName = "my-pixel-art";

    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  }
};
</script>

<style scoped>
.back-btn {
  margin: 0 auto 16px 0;
}

.submit-trigger {
  width: 100%;
  margin-top: 2rem;
  padding: 12px;
  background-color: #5d3fd3;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.submit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  h3 {
    margin: 0;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #ccc;
}

.form-input {
  background: #2a2d3e;
  border: 1px solid var(--border-color);
  color: white;
  padding: 10px;
  border-radius: 4px;
}

.legal-text-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--blue-bg);
  padding: 12px;
  border-radius: 4px;
  svg {
    font-size: 32px;
    color: var(--neon-blue);
  }
}

.legal-text {
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  font-family: inherit;
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-outline.inactive {
  opacity: 0.7;
}

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
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.pixel-cell.transparent-border {
  border-color: transparent;
}

.pixel-cell:hover {
  background: rgba(255, 255, 255, 0.1);
  outline: 1px solid var(--primary);
  z-index: 11;
}

.color-palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.eraser {
  font-size: 26px;
}

.color-flag {
  height: 24px;
  width: 24px;
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
  background: transparent;
}

.color-palette-item.active {
  border-color: var(--primary);
  background: rgba(255, 77, 0, 0.15);
  box-shadow: 0 0 0 1px var(--primary);
}

.drawings-list {
  margin-top: 1rem;
}

.preset-select {
  width: 100%;
  background: #2a2d3e;
  border: 1px solid var(--border-color);
  color: var(--white);
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
}

.preset-select:hover {
  border-color: var(--primary);
}

.preset-select:focus {
  outline: none;
  border-color: var(--primary);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 24px 0 16px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #3f4257;
  color: white;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  flex: 1;
}

.btn-outline:hover {
  border-color: var(--primary);
}

.recommendation {
  margin-bottom: 32px;
  @media (max-width: 576px) {
    display: none;
  }
}

h3 {
  margin-bottom: 8px;
}

@media (min-width: 1024px) {
  .editor-section {
    padding: 32px 0;
  }
}
</style>
