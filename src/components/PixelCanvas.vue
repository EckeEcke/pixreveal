<template>
  <div class="canvas-wrapper" ref="wrapper">
    <canvas
      ref="canvasRef"
      :width="internalSize"
      :height="internalSize"
      @mousemove="$emit('mousemove', $event)"
      @touchmove-prevent="$emit('touchmove', $event)"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import colorPalette from "../data/colorPalette";
import { useSoundStore } from "@/stores/sound";

const props = defineProps({
  pixelArray: Array,
  resolution: Number,
  isRevealing: Boolean,
  isStatusIcon: Boolean,
  timerDuration: Number | undefined,
  pauseReveal: Boolean | undefined,
  mousePos: Object,
  isMagnifierMode: Boolean,
});

defineEmits(["mousemove", "touchmove"]);

const soundStore = useSoundStore();
const timerDuration = props.timerDuration || 15;

const canvasRef = ref(null);
const internalSize = 600;

const displayedPixels = ref([]);
const particles = ref([]);
let intervalId = null;
let animationFrame = null;

const createParticles = (x, y, color, cellSize) => {
  const count = 6;
  for (let i = 0; i < count; i++) {
    particles.value.push({
      x: x * cellSize + cellSize / 2,
      y: y * cellSize + cellSize / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      color: color,
    });
  }
};

const allPixelsFromProp = () => {
  const list = [];
  if (!props.pixelArray) return list;
  props.pixelArray.forEach((row, y) => {
    if (Array.isArray(row)) {
      row.forEach((val, x) => {
        if (val !== 0) list.push({ x, y, val });
      });
    }
  });
  return list;
};

const startReveal = () => {
  if (intervalId) clearInterval(intervalId);

  displayedPixels.value = [];
  particles.value = [];

  if (!props.pixelArray || !props.pixelArray[0]) return;

  const allVisible = allPixelsFromProp();

  if (!props.isRevealing) {
    displayedPixels.value = allVisible;
    if (!animationFrame) render();
    return;
  }

  const totalDurationMs = props.isStatusIcon ? 500 : timerDuration * 1000;
  const dynamicSpeed =
    allVisible.length > 0 ? totalDurationMs / allVisible.length : 0;

  allVisible.sort(() => Math.random() - 0.5);

  intervalId = setInterval(() => {
    if (props.pauseReveal) return;
    if (allVisible.length > 0) {
      const next = allVisible.pop();
      displayedPixels.value.push({ ...next, createdAt: Date.now() });
      const res = props.pixelArray.length;
      const cellSize = internalSize / res;
      const color = colorPalette[next.val] || "#fff";

      createParticles(next.x, next.y, color, cellSize);
      soundStore.playSound("reveal");
    } else {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, dynamicSpeed);

  if (!animationFrame) render();
};

const render = () => {
  if (props.pauseReveal) {
    animationFrame = requestAnimationFrame(render);
    return;
  }
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const res = props.pixelArray.length;
  const cellSize = internalSize / res;
  const gap = cellSize * 0.05;
  const baseSize = cellSize - gap * 2;
  const now = Date.now();

  const drawPixels = () => {
    const pixelsToDraw = props.isRevealing
      ? displayedPixels.value
      : allPixelsFromProp();

    pixelsToDraw.forEach((p) => {
      const color = colorPalette[p.val];
      let scale = 1;
      if (props.isRevealing && p.createdAt) {
        const elapsed = now - p.createdAt;
        scale = Math.min(1, elapsed / 100);
      }

      const currentSize = baseSize * scale;
      const offset = (baseSize - currentSize) / 2;

      ctx.shadowColor = color;
      ctx.shadowBlur = 15 * scale;
      ctx.fillStyle = color;

      ctx.fillRect(
        p.x * cellSize + gap + offset,
        p.y * cellSize + gap + offset,
        currentSize,
        currentSize,
      );

      if (p.val === 1) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * scale})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);
      }
    });
  };

  ctx.clearRect(0, 0, internalSize, internalSize);

  if (props.isMagnifierMode && !props.isStatusIcon) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(props.mousePos.x, props.mousePos.y, 60, 0, Math.PI * 2);
    ctx.clip();

    drawPixels();

    ctx.restore();

    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ec4899";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(props.mousePos.x, props.mousePos.y, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    drawPixels();
  }

  for (let i = particles.value.length - 1; i >= 0; i--) {
    const p = particles.value[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;

    if (p.life <= 0) {
      particles.value.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  }
  ctx.globalAlpha = 1.0;

  animationFrame = requestAnimationFrame(render);
};

watch(
  () => props.pixelArray,
  () => {
    if (props.pixelArray && props.pixelArray.length > 0) {
      startReveal();
    }
  },
  { deep: true },
);

onMounted(() => {
  startReveal();
});

onUnmounted(() => {
  clearInterval(intervalId);
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.canvas-wrapper {
  background: #000;
  border: 2px solid #1a1c26;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  overflow: hidden;
  line-height: 0;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
