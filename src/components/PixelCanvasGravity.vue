<template>
  <div class="canvas-wrapper">
    <canvas
      ref="canvasRef"
      :width="internalSize"
      :height="internalSize"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import colorPalette from "../data/colorPalette";
import { useSoundStore } from "@/stores/sound";
import { useConfigStore } from "@/stores/config";

const props = defineProps({
  pixelArray: Array,
  isStatusIcon: Boolean,
  isRevealing: Boolean,
  pauseReveal: Boolean,
});

const configStore = useConfigStore();
const soundStore = useSoundStore();
const canvasRef = ref(null);
const internalSize = 600;
const res = 16;

const gravity = 0.5;
const bounce = -0.3;
const activePixels = ref([]);
const particles = ref([]);
let animationFrame = null;

const createParticles = (x, y, color, cellSize) => {
  const count = 4;
  for (let i = 0; i < count; i++) {
    particles.value.push({
      x: x + cellSize / 2,
      y: y + cellSize / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      color: color,
    });
  }
};

const initGravityEffect = () => {
  if (!props.pixelArray || !props.pixelArray.length) return;

  const newList = [];
  const duration = configStore.revealTime || 15;
  const cellSize = internalSize / res;

  const maxDelayFrames =
    !props.isRevealing || props.isStatusIcon
      ? 0
      : Math.max(0, (duration - 2) * 60);

  props.pixelArray.forEach((row, y) => {
    if (Array.isArray(row)) {
      row.forEach((val, x) => {
        if (val !== 0) {
          const isInstant = !props.isRevealing || props.isStatusIcon;
          newList.push({
            val,
            x: x * cellSize,
            targetY: y * cellSize,
            currentY: isInstant ? y * cellSize : -50,
            velocity: 0,
            landed: isInstant,
            delay: isInstant ? 0 : Math.floor(Math.random() * maxDelayFrames),
            createdAt: Date.now(),
            particleGenerated: isInstant,
          });
        }
      });
    }
  });
  activePixels.value = newList;
};

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas || props.pauseReveal) {
    animationFrame = requestAnimationFrame(render);
    return;
  }

  const ctx = canvas.getContext("2d");
  const cellSize = internalSize / res;
  const gap = cellSize * 0.05;
  const baseSize = cellSize - gap * 2;
  const now = Date.now();

  ctx.clearRect(0, 0, internalSize, internalSize);

  activePixels.value.forEach((p) => {
    if (props.isRevealing && !props.isStatusIcon && p.delay > 0) {
      p.delay--;
      return;
    }

    let scale = 1;
    let drawY = p.currentY;

    if (props.isStatusIcon) {
      const elapsed = now - p.createdAt;
      scale = Math.min(1, elapsed / 200);
      drawY = p.targetY;
    } else if (!props.isRevealing) {
      drawY = p.targetY;
      scale = 1;
    } else if (!p.landed) {
      p.velocity += gravity;
      p.currentY += p.velocity;
      if (p.currentY >= p.targetY) {
        p.currentY = p.targetY;
        if (Math.abs(p.velocity) > 2) {
          soundStore.playSound("reveal");
          if (!p.particleGenerated) {
            createParticles(p.x, p.targetY, colorPalette[p.val], cellSize);
            p.particleGenerated = true;
          }
        }
        p.velocity *= bounce;
        if (Math.abs(p.velocity) < 0.5) p.landed = true;
      }
      drawY = p.currentY;
    }

    const color = colorPalette[p.val] || "#fff";
    const currentSize = baseSize * scale;
    const centerOffset = (baseSize - currentSize) / 2;

    ctx.fillStyle = color;

    if (p.val === 1) {
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = color;
      ctx.shadowBlur = props.isStatusIcon ? 15 * scale : p.landed ? 0 : 10;
    }

    ctx.fillRect(
      p.x + gap + centerOffset,
      drawY + gap + centerOffset,
      currentSize,
      currentSize,
    );

    if (p.val === 1) {
      ctx.strokeStyle = "rgba(175, 175, 175, 0.5)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(
        p.x + gap + centerOffset,
        drawY + gap + centerOffset,
        currentSize,
        currentSize,
      );
    }
  });

  for (let i = particles.value.length - 1; i >= 0; i--) {
    const part = particles.value[i];
    part.x += part.vx;
    part.y += part.vy;
    part.life -= 0.02;
    if (part.life <= 0) {
      particles.value.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = part.life;
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x, part.y, 3, 3);
  }
  ctx.globalAlpha = 1.0;

  animationFrame = requestAnimationFrame(render);
};

watch(
  [() => props.pixelArray, () => props.isRevealing],
  () => initGravityEffect(),
  { deep: true },
);

onMounted(() => {
  initGravityEffect();
  render();
});

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.canvas-wrapper {
  background-image: radial-gradient(
    circle at center,
    #1a1c26 0%,
    #0a0b10 60%,
    #000000 100%
  );
  border: 2px solid #1a1c26;
  overflow: hidden;
  line-height: 0;
  touch-action: none;
  padding: 16px 0;
}
canvas {
  max-width: 100%;
  height: auto;
  cursor: none;
}
</style>
