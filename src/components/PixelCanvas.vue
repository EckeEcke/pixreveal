<template>
  <div class="canvas-wrapper" ref="wrapper">
    <canvas ref="canvasRef" :width="internalSize" :height="internalSize"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import colorPalette from "../data/colorPalette";

const props = defineProps({
  pixelArray: Array,
  resolution: Number,
  isRevealing: Boolean,
  isStatusIcon: Boolean,
  timerDuration: Number | undefined,
});

const timerDuration = props.timerDuration || 15;

const canvasRef = ref(null);
const internalSize = 600;

let intervalId = null;

const startReveal = () => {
  if (intervalId) clearInterval(intervalId);
  if (animationFrame) cancelAnimationFrame(animationFrame);

  displayedPixels.value = [];
  particles.value = [];

  if (!props.pixelArray || !props.pixelArray[0]) return;

  const allVisible = [];
  props.pixelArray.forEach((row, y) => {
    if (Array.isArray(row)) {
      row.forEach((val, x) => {
        if (val !== 0) allVisible.push({ x, y, val });
      });
    }
  });

  const totalDurationMs = props.isStatusIcon ? 500 : timerDuration * 1000;
  const dynamicSpeed = allVisible.length > 0 ? totalDurationMs / allVisible.length : 0;

  allVisible.sort(() => Math.random() - 0.5);

  intervalId = setInterval(() => {
    if (allVisible.length > 0) {
      const next = allVisible.pop();
      displayedPixels.value.push(next);

      const res = props.pixelArray.length;
      const cellSize = internalSize / res;

      const color = colorPalette[next.val] || "#fff";
      createParticles(next.x, next.y, color, cellSize);
    } else {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, dynamicSpeed);

  render();
};

const displayedPixels = ref([]);
const particles = ref([]);
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

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const pixelsToDraw = props.isRevealing ? displayedPixels.value : allPixelsFromProp();

  const res = props.pixelArray.length;
  const cellSize = internalSize / res;
  const gap = cellSize * 0.15;

  ctx.clearRect(0, 0, internalSize, internalSize);

  pixelsToDraw.forEach(({ x, y, val }) => {
    const color = colorPalette[val];
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;

    ctx.fillRect(
      x * cellSize + gap,
      y * cellSize + gap,
      cellSize - gap * 2,
      cellSize - gap * 2
    );

    if (val === 1) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  });

  ctx.shadowBlur = 0;
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

const allPixelsFromProp = () => {
  const list = [];
  props.pixelArray.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) list.push({ x, y, val });
    });
  });
  return list;
};

watch(
  () => props.pixelArray,
  () => {
    if (props.pixelArray && props.pixelArray.length > 0) {
      startReveal();
    }
  },
  { deep: true }
);

onMounted(() => {
  startReveal();
});
</script>

<style scoped>
.canvas-wrapper {
  background: #000;
  border: 2px solid #1a1c26;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;
  position: sticky;
  top: 0;
}

canvas {
  max-width: 100%;
  height: auto;
}

.is-hidden {
  opacity: 0;
}
</style>
