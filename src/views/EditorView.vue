<template>
  <div class="app-container">
    <button class="back-btn" @click="$router.back()" data-sfx="back">
      <Icon icon="pixel:angle-left-solid" />
    </button>

    <main class="game-layout">
      <section class="canvas-section">
        <div class="canvas-card panel">
          <div class="toolbar" role="toolbar" aria-label="Drawing tools">
            <div class="tool-group">
              <button
                v-for="t in TOOLS"
                :key="t.id"
                type="button"
                class="tool-btn"
                :class="{ active: tool === t.id }"
                :title="`${t.label} (${t.key})`"
                :aria-label="t.label"
                :aria-pressed="tool === t.id"
                :disabled="locked"
                @click="tool = t.id"
              >
                <Icon :icon="t.icon" />
                <span class="key">{{ t.key }}</span>
              </button>
              <button
                type="button"
                class="tool-btn"
                :class="{ active: mirror }"
                title="Mirror horizontally (M)"
                aria-label="Mirror"
                :aria-pressed="mirror"
                :disabled="locked"
                @click="mirror = !mirror"
              >
                <span class="glyph">⇔</span>
                <span class="key">M</span>
              </button>
            </div>

            <div class="tool-group">
              <button
                type="button"
                class="tool-btn"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
                :disabled="!canUndo || locked"
                @click="undo"
              >
                <span class="glyph">↶</span>
              </button>
              <button
                type="button"
                class="tool-btn"
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
                :disabled="!canRedo || locked"
                @click="redo"
              >
                <span class="glyph">↷</span>
              </button>
            </div>
          </div>

          <div class="canvas-stage">
            <PixelCanvas
              ref="pixelCanvasRef"
              :pixel-array="pixelData"
              :resolution="resolution"
              :is-revealing="false"
            />

            <svg
              ref="overlayRef"
              class="interaction-layer"
              :class="{ locked }"
              :viewBox="`0 0 ${metrics.size} ${metrics.size}`"
              preserveAspectRatio="none"
              aria-label="Drawing area"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="endStroke"
              @pointercancel="endStroke"
              @pointerleave="onPointerLeave"
              @contextmenu.prevent
            >
              <defs>
                <pattern
                  id="editor-grid"
                  patternUnits="userSpaceOnUse"
                  :width="metrics.cellSize"
                  :height="metrics.cellSize"
                >
                  <rect
                    class="grid-cell"
                    :x="metrics.gap"
                    :y="metrics.gap"
                    :width="metrics.baseSize"
                    :height="metrics.baseSize"
                  />
                </pattern>
              </defs>

              <rect
                v-if="showGrid"
                :width="metrics.size"
                :height="metrics.size"
                fill="url(#editor-grid)"
                pointer-events="none"
              />

              <line
                v-if="mirror"
                class="axis"
                :x1="metrics.size / 2"
                :x2="metrics.size / 2"
                y1="0"
                :y2="metrics.size"
              />

              <rect
                v-for="p in pops"
                :key="p.id"
                class="pop"
                :x="cellPos(p.x)"
                :y="cellPos(p.y)"
                :width="metrics.baseSize"
                :height="metrics.baseSize"
              />

              <rect
                v-for="(g, i) in ghostCells"
                :key="`ghost-${i}`"
                class="ghost"
                :class="`ghost-${tool}`"
                :x="cellPos(g.x)"
                :y="cellPos(g.y)"
                :width="metrics.baseSize"
                :height="metrics.baseSize"
                :fill="ghostFill"
              />
            </svg>

            <Transition name="fade">
              <div v-if="isEmpty && !locked" class="empty-hint">
                Click or drag to draw
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <section class="editor-section panel">
        <div v-if="viewMode === 'editor'">
          <div class="palette-container">
            <div class="section-head">
              <h3>Color Palette</h3>
              <span
                class="current-color"
                :style="{
                  '--swatch': tool === 'eraser' ? 'transparent' : currentColor,
                }"
              >
                <Icon v-if="tool === 'eraser'" :icon="ICON_ERASER" />
              </span>
            </div>
            <div class="color-palette">
              <button
                v-for="entry in paletteEntries"
                :key="entry.key"
                type="button"
                class="swatch"
                :class="{ active: selectedColor === entry.key && tool !== 'eraser' }"
                :style="{ '--swatch': entry.color }"
                :aria-label="`Color ${entry.color}`"
                @click="selectColor(entry.key)"
              ></button>
            </div>
          </div>

          <div class="action-buttons">
            <button type="button" class="action-btn" @click="downloadDrawing">
              <Icon icon="pixel:download-solid" /> Download
            </button>
            <button type="button" class="action-btn danger" @click="clearCanvas">
              <Icon icon="pixel:trash-alt-solid" /> Clear
            </button>
            <button
              type="button"
              class="action-btn"
              title="Fill all empty pixels with the selected color"
              @click="fillEmpty"
            >
              <Icon icon="pixel:paint-brush-solid" /> Fill empty
            </button>
            <button
              type="button"
              class="action-btn"
              :class="{ on: showGrid }"
              :aria-pressed="showGrid"
              title="Toggle grid (G)"
              @click="showGrid = !showGrid"
            >
              <Icon icon="pixel:grid" /> Grid
            </button>
            <button
              v-if="isAdmin"
              type="button"
              class="action-btn"
              :class="{ on: copyStatus === 'Copied!' }"
              @click="copyToClipboard"
            >
              {{ copyStatus }}
            </button>
          </div>

          <div v-if="isAdmin" class="drawings-list">
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

          <ButtonPrimary data-sfx="click" @clicked="viewMode = 'submit'">
            SUBMIT TO PIXREVEAL
          </ButtonPrimary>
          <p class="submit-note">
            Once approved, your art is available for all players to guess.
          </p>
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

          <InfoBox
            icon="ℹ️"
            message="By submitting, you confirm that this is your original work and agree that it may be used in PIXREVEAL for all players."
          />

          <div class="form-actions">
            <ButtonPrimary data-sfx="click" @clicked="uploadDrawing">
              UPLOAD NOW
            </ButtonPrimary>
            <button
              type="button"
              class="action-btn"
              @click="viewMode = 'editor'"
            >
              Cancel / Back
            </button>
          </div>
        </div>
      </section>
    </main>

    <router-link class="gallery-link" to="/user-gallery">
      <Icon icon="pixel:image-solid" /> User Art Gallery
    </router-link>
  </div>
</template>

<script setup>
import {
  ref,
  shallowRef,
  computed,
  reactive,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import InfoBox from "@/components/game-ui/InfoBox.vue";
import colorPalette from "@/data/colorPalette";
import drawings from "@/data/drawings.json";
import { allCategoryNames } from "@/stores/config";
import { Icon } from "@iconify/vue";
import { toast } from "vue3-toastify";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import { useConfetti } from "@/composables/useConfetti";

const DEFAULT_RESOLUTION = 16;
const HISTORY_LIMIT = 50;

const ICON_ERASER = "streamline-pixel:interface-essential-eraser";

const TOOLS = [
  { id: "pencil", label: "Pencil", key: "B", icon: "streamline-pixel:design-color-brush-paint" },
  { id: "eraser", label: "Eraser", key: "E", icon: ICON_ERASER },
  { id: "fill", label: "Flood fill", key: "F", icon: "streamline-pixel:design-color-bucket-brush" },
];

const createEmptyGrid = (size = DEFAULT_RESOLUTION) =>
  Array.from({ length: size }, () => Array(size).fill(0));
const cloneGrid = (grid) => grid.map((row) => row.slice());

const { fireConfetti } = useConfetti();

// ---------- State ----------
const pixelData = ref(createEmptyGrid());
const resolution = computed(() => pixelData.value.length);
const selectedColor = ref("1");
const tool = ref("pencil");
const mirror = ref(false);
const showGrid = ref(true);

const isAdmin = window.location.hostname === "localhost";

const viewMode = ref("editor");
const locked = computed(() => viewMode.value !== "editor");
const submitData = reactive({ name: "", category: "" });
const isUploading = ref(false);

const isEmpty = computed(() =>
  pixelData.value.every((row) => row.every((px) => px === 0)),
);

// ---------- Palette (nach Hue sortiert, Radierer ist jetzt ein Tool) ----------
const parseHex = (value) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(value).trim());
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// [Gruppe, Wert1, Wert2]: 0 = Graustufen (nach Helligkeit), 1 = Farben (nach Hue), 2 = unbekannt
const sortKey = (color) => {
  const rgb = parseHex(color);
  if (!rgb) return [2, 0, 0];
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (s < 0.15) return [0, l, 0];

  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h >= 345) h -= 360; // Rot an den Anfang, nicht ans Ende
  return [1, h, l];
};

const paletteEntries = Object.entries(colorPalette)
  .filter(([, color]) => color !== "transparent")
  .map(([key, color]) => ({ key, color, order: sortKey(color) }))
  .sort(
    (a, b) =>
      a.order[0] - b.order[0] ||
      a.order[1] - b.order[1] ||
      a.order[2] - b.order[2],
  );

const currentColor = computed(() => colorPalette[selectedColor.value]);

const selectColor = (key) => {
  selectedColor.value = key;
  if (tool.value === "eraser") tool.value = "pencil";
};

// ---------- Grid-Geometrie (kommt aus dem PixelCanvas) ----------
const pixelCanvasRef = ref(null);
const overlayRef = ref(null);
const metrics = ref({
  size: 600,
  cellSize: 600 / DEFAULT_RESOLUTION,
  gap: 0,
  baseSize: 600 / DEFAULT_RESOLUTION,
});

const syncMetrics = () => {
  const canvas = pixelCanvasRef.value;
  const grid = canvas?.getGridMetrics?.();
  if (!grid) return;
  metrics.value = {
    size: canvas.internalSize ?? 600,
    cellSize: grid.cellSize,
    gap: grid.gap,
    baseSize: grid.baseSize,
  };
};

watch(resolution, syncMetrics, { flush: "post" });

const cellPos = (n) => n * metrics.value.cellSize + metrics.value.gap;

// ---------- Undo / Redo ----------
const undoStack = shallowRef([]);
const redoStack = shallowRef([]);
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

const pushHistory = (before) => {
  undoStack.value = [...undoStack.value.slice(-(HISTORY_LIMIT - 1)), before];
  redoStack.value = [];
};

const undo = () => {
  if (!canUndo.value || isDrawing.value) return;
  const previous = undoStack.value[undoStack.value.length - 1];
  redoStack.value = [...redoStack.value, cloneGrid(pixelData.value)];
  undoStack.value = undoStack.value.slice(0, -1);
  pixelData.value = previous;
};

const redo = () => {
  if (!canRedo.value || isDrawing.value) return;
  const next = redoStack.value[redoStack.value.length - 1];
  undoStack.value = [...undoStack.value, cloneGrid(pixelData.value)];
  redoStack.value = redoStack.value.slice(0, -1);
  pixelData.value = next;
};

// Einzelaktionen (Clear, Fill, Flood-Fill, Preset): Snapshot vorher, nur bei Änderung speichern
const runAction = (mutate) => {
  const before = cloneGrid(pixelData.value);
  if (mutate() !== false) pushHistory(before);
};

// ---------- Pop-Effekt ----------
const pops = ref([]);
let popId = 0;

const addPop = (x, y) => {
  const id = ++popId;
  pops.value = [...pops.value.slice(-40), { id, x, y }];
  setTimeout(() => {
    pops.value = pops.value.filter((p) => p.id !== id);
  }, 300);
};

// ---------- Zeichnen ----------
const isDrawing = ref(false);
const hoverCell = ref(null);
let lastCell = null;
let strokeValue = 0;
let strokeBefore = null;
let strokeChanged = false;

const cellFromEvent = (e) => {
  const rect = overlayRef.value?.getBoundingClientRect();
  if (!rect || !rect.width) return null;
  const res = resolution.value;
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * res);
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * res);
  if (x < 0 || y < 0 || x >= res || y >= res) return null;
  return { x, y };
};

const setPixel = (x, y, value) => {
  const row = pixelData.value[y];
  if (!row || row[x] === undefined || row[x] === value) return;
  row[x] = value;
  strokeChanged = true;
  addPop(x, y);
};

const paintCell = (x, y, value) => {
  setPixel(x, y, value);
  if (mirror.value) setPixel(resolution.value - 1 - x, y, value);
};

// Bresenham: schließt Lücken bei schnellen Mausbewegungen
const lineCells = (from, to) => {
  const cells = [];
  let { x: x0, y: y0 } = from;
  const { x: x1, y: y1 } = to;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    cells.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return cells;
};

const floodFill = ({ x, y }, value) => {
  const grid = pixelData.value;
  const target = grid[y][x];
  if (target === value) return false;
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (grid[cy]?.[cx] !== target) continue;
    grid[cy][cx] = value;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  return true;
};

const pickColor = ({ x, y }) => {
  const value = pixelData.value[y][x];
  if (value === 0) {
    tool.value = "eraser";
    return;
  }
  selectedColor.value = String(value);
  tool.value = "pencil";
};

const onPointerDown = (e) => {
  if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) return;
  const cell = cellFromEvent(e);
  if (!cell) return;

  const rightClick = e.pointerType === "mouse" && e.button === 2;

  const erase = tool.value === "eraser" || rightClick;
  const value = erase ? 0 : Number(selectedColor.value);

  if (tool.value === "fill") {
    runAction(() => {
      const changed = floodFill(cell, value);
      if (changed) addPop(cell.x, cell.y);
      return changed;
    });
    return;
  }

  overlayRef.value.setPointerCapture(e.pointerId);
  strokeBefore = cloneGrid(pixelData.value);
  strokeChanged = false;
  strokeValue = value;
  isDrawing.value = true;
  paintCell(cell.x, cell.y, strokeValue);
  lastCell = cell;
};

const onPointerMove = (e) => {
  const cell = cellFromEvent(e);
  hoverCell.value = e.pointerType === "touch" ? null : cell;
  if (!isDrawing.value) return;
  if (!cell) {
    lastCell = null;
    return;
  }
  for (const c of lineCells(lastCell ?? cell, cell)) {
    paintCell(c.x, c.y, strokeValue);
  }
  lastCell = cell;
};

const endStroke = (e) => {
  if (e?.pointerType === "touch") hoverCell.value = null;
  if (!isDrawing.value) return;
  isDrawing.value = false;
  lastCell = null;
  if (strokeChanged && strokeBefore) pushHistory(strokeBefore);
  strokeBefore = null;
};

const onPointerLeave = () => {
  hoverCell.value = null;
};

// ---------- Hover-Vorschau ----------
const ghostCells = computed(() => {
  if (!hoverCell.value || isDrawing.value || locked.value) return [];
  const { x, y } = hoverCell.value;
  const mirrored = resolution.value - 1 - x;
  return mirror.value && mirrored !== x
    ? [{ x, y }, { x: mirrored, y }]
    : [{ x, y }];
});

const ghostFill = computed(() =>
  tool.value === "pencil" || tool.value === "fill" ? currentColor.value : "none",
);

// ---------- Aktionen ----------
const clearCanvas = () =>
  runAction(() => {
    if (isEmpty.value && resolution.value === DEFAULT_RESOLUTION) return false;
    pixelData.value = createEmptyGrid();
  });

const fillEmpty = () =>
  runAction(() => {
    const value = Number(selectedColor.value);
    let changed = false;
    pixelData.value = pixelData.value.map((row) =>
      row.map((px) => {
        if (px !== 0) return px;
        changed = true;
        return value;
      }),
    );
    return changed;
  });

const setDrawing = (data) => {
  if (!data) return;
  runAction(() => {
    pixelData.value = cloneGrid(data); // Kopie, damit die JSON-Daten nicht mutiert werden
  });
};

const copyStatus = ref("Copy");

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(pixelData.value));
    copyStatus.value = "Copied!";
    setTimeout(() => {
      copyStatus.value = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
    copyStatus.value = "Error!";
  }
};

const downloadDrawing = () => {
  const dataUrl = pixelCanvasRef.value?.getImageUrl();

  if (dataUrl) {
    const link = document.createElement("a");
    link.download = "my-pixel-art.png";
    link.href = dataUrl;
    link.click();
  }
};

// ---------- Upload ----------
const getUploadErrorMessage = (payload) => {
  if (payload?.error && typeof payload.error === "string") return payload.error;
  if (payload?.message && typeof payload.message === "string")
    return payload.message;
  return "Upload failed. Please try again.";
};

const uploadDrawing = async () => {
  if (isUploading.value) return;

  if (!submitData.name.trim() || !submitData.category) {
    toast.error("Please enter a name and pick a category.", { icon: "✏️" });
    return;
  }

  isUploading.value = true;
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: submitData.name.trim(),
        category: submitData.category,
        data: pixelData.value,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      toast.error(getUploadErrorMessage(json), { icon: "🚫" });
      return;
    }

    submitData.name = "";
    submitData.category = "";
    viewMode.value = "editor";
    toast.success("Upload successful. Thx for contributing to PixReveal!");
    fireConfetti();
  } catch (err) {
    toast.error("Network error. Please check your connection and try again.", {
      icon: "📡",
    });
  } finally {
    isUploading.value = false;
  }
};

// ---------- Shortcuts ----------
const onKeydown = (e) => {
  if (locked.value) return;
  const target = e.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
  ) {
    return;
  }

  const key = e.key.toLowerCase();
  const mod = e.ctrlKey || e.metaKey;

  if (mod && key === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
    return;
  }
  if (mod && key === "y") {
    e.preventDefault();
    redo();
    return;
  }
  if (mod || e.altKey || e.repeat) return;

  const match = TOOLS.find((t) => t.key.toLowerCase() === key);
  if (match) tool.value = match.id;
  else if (key === "m") mirror.value = !mirror.value;
  else if (key === "g") showGrid.value = !showGrid.value;
};

onMounted(() => {
  syncMetrics();
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.game-layout {
  background: none;
  gap: 24px;
  align-items: start;
  padding-right: 0;
}

.canvas-section {
  min-width: 0;
}

.back-btn {
  margin: 0 auto 16px 0;
}

/* ---------- Gemeinsamer Card-Look ---------- */
.panel {
  box-sizing: border-box;
  padding: 16px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);

  @media (min-width: 576px) {
    padding: 24px;
  }
}

/* ---------- Toolbar ---------- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tool-group {
  display: flex;
  gap: 6px;
}

.tool-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font-size: 22px;
  color: var(--white);
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.4);
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    background-color 0.12s ease,
    box-shadow 0.12s ease;

  @media (max-width: 419px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

.tool-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}

.tool-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}

.tool-btn.active {
  background: color-mix(in srgb, var(--primary) 22%, transparent);
  border-color: var(--primary);
  box-shadow:
    0 3px 0 rgba(0, 0, 0, 0.4),
    0 0 12px color-mix(in srgb, var(--primary) 45%, transparent);
}

.tool-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tool-btn .key {
  position: absolute;
  right: 4px;
  bottom: 1px;
  font-size: 9px;
  font-weight: 900;
  opacity: 0.55;
}

.glyph {
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

@media (hover: none) {
  .tool-btn .key {
    display: none;
  }
}

/* ---------- Canvas + Overlay ---------- */
.canvas-stage {
  --canvas-border: 2px; /* entspricht dem border von .canvas-wrapper in PixelCanvas.vue */

  position: relative;
  width: 100%;
  max-width: 604px;
  margin: 0 auto;
  border-radius: 4px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 28px rgba(168, 85, 247, 0.22);
}

.interaction-layer {
  position: absolute;
  top: var(--canvas-border);
  left: var(--canvas-border);
  width: calc(100% - 2 * var(--canvas-border));
  height: calc(100% - 2 * var(--canvas-border));
  z-index: 10;
  cursor: crosshair;
  touch-action: none;
}

.interaction-layer.locked {
  pointer-events: none;
}

.grid-cell {
  fill: none;
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 1.5;
}

.axis {
  stroke: var(--neon-cyan);
  stroke-width: 2;
  stroke-dasharray: 6 6;
  opacity: 0.6;
  pointer-events: none;
}

.ghost {
  pointer-events: none;
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 2;
  opacity: 0.75;
}

.ghost-eraser {
  stroke-dasharray: 5 4;
}

.pop {
  fill: #fff;
  pointer-events: none;
  transform-box: fill-box;
  transform-origin: center;
  animation: cell-pop 0.28s ease-out forwards;
}

@keyframes cell-pop {
  from {
    opacity: 0.85;
    transform: scale(1.5);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

.empty-hint {
  position: absolute;
  inset: 0;
  z-index: 11;
  display: grid;
  place-items: center;
  padding: 16px;
  text-align: center;
  font-family: "8bit";
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  animation: hint-blink 1.8s ease-in-out infinite;
}

@keyframes hint-blink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop {
    display: none;
  }
  .empty-hint {
    animation: none;
  }
}

/* ---------- Palette ---------- */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  h3 {
    margin: 0;
  }
}

.current-color {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  font-size: 18px;
  background: var(--swatch);
  border: 2px solid var(--white);
  border-radius: 4px;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 6px;
}

.swatch {
  aspect-ratio: 1;
  background: var(--swatch);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;
}

.swatch:hover {
  transform: translateY(-1px) scale(1.05);
  border-color: rgba(255, 255, 255, 0.6);
}

.swatch.active {
  border-color: #fff;
  transform: scale(1.08);
  box-shadow:
    0 0 0 2px var(--primary),
    0 0 12px var(--primary);
}

/* ---------- Aktionen ---------- */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 20px 0 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--white);
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.4);
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    background-color 0.12s ease,
    box-shadow 0.12s ease;
}

.action-btn:hover {
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}

.action-btn.danger:hover {
  border-color: var(--neon-error);
  color: var(--neon-error);
}

.action-btn.on {
  border-color: color-mix(in srgb, var(--neon-mint) 60%, transparent);
  background: color-mix(in srgb, var(--neon-mint) 10%, transparent);
}

.drawings-list {
  margin: 16px 0;
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

.preset-select:hover,
.preset-select:focus {
  outline: none;
  border-color: var(--primary);
}

.btn-primary {
  width: 100%;
}

.submit-note {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  color: var(--color-secondary);
  opacity: 0.8;
}

.recommendation {
  margin-bottom: 24px;
  @media (max-width: 576px) {
    display: none;
  }
  p {
    margin: 0;
  }
}

h1 {
  text-align: left;
  font-family: inherit;
  font-size: 16px;
  margin: 0;
  margin-bottom: 4px;
}

h3 {
  margin-top: 0;
  margin-bottom: 8px;
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

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery-link {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0 32px;
  color: var(--white);
  text-decoration: underline;
  opacity: 0.75;
  transition: opacity 0.15s ease;
}

.gallery-link:hover {
  opacity: 1;
}
</style>