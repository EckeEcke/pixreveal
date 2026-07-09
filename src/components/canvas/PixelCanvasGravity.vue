<template>
  <div class="canvas-wrapper" :class="{ crt: addCRT }">
    <canvas
      ref="canvasRef"
      :width="internalSize"
      :height="internalSize"
    ></canvas>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from "vue";
import colorPalette from "../../data/colorPalette";
import { useSoundStore } from "@/stores/sound";
import { useConfigStore } from "@/stores/config";
import { useCanvasBase } from "@/composables/useCanvasBase";

const props = defineProps({
  pixelArray: Array,
  isStatusIcon: Boolean,
  isRevealing: Boolean,
  pauseReveal: Boolean,
});

const internalSize = 600;
const {
  canvasRef,
  getContext,
  calculateGrid,
  createParticles,
  updateAndDrawParticles,
  setAnimationFrameId,
  getAnimationFrameId,
  stopAnimation,
} = useCanvasBase(internalSize);

const configStore = useConfigStore();
const soundStore = useSoundStore();

const addCRT = computed(() => useConfigStore().addCRTFilter);

const gravity = 0.5;
const bounce = -0.3;
const activePixels = ref([]);

const SHINE_DURATION = 500; // ms, einmaliger Durchlauf
const shineState = ref(null); // { startTime }

const initGravityEffect = () => {
  if (!props.pixelArray || !props.pixelArray.length) return;

  const newList = [];
  const duration = configStore.revealTime || 15;
  const resolution = props.pixelArray.length;
  const { cellSize } = calculateGrid(resolution);

  const maxDelayFrames =
    !props.isRevealing || props.isStatusIcon
      ? 0
      : Math.max(0, (duration - 1) * 60);

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

const drawShine = (ctx, size, progress) => {
  const bandWidth = size * 0.35;
  const diagLen = size * Math.SQRT2;
  const travel = diagLen + bandWidth * 2;
  const pos = -bandWidth + progress * travel;

  ctx.save();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.globalCompositeOperation = "source-atop";
  ctx.translate(size / 2, size / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.translate(-diagLen / 2, -diagLen / 2);

  const gradient = ctx.createLinearGradient(pos, 0, pos + bandWidth, 0);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.9)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(pos, -diagLen, bandWidth, diagLen * 3);
  ctx.restore();
};

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas || props.pauseReveal) {
    setAnimationFrameId(requestAnimationFrame(render));
    return;
  }

  const ctx = getContext();
  if (!ctx) return;

  const resolution = props.pixelArray?.length || 16;
  const { cellSize, gap, baseSize } = calculateGrid(resolution);
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
      scale = Math.min(1, (now - p.createdAt) / 200);
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
    ctx.shadowColor = color;
    ctx.shadowBlur = p.val === 1 ? 0 : props.isStatusIcon ? 15 * scale : 10;

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

  if (shineState.value) {
    const elapsed = now - shineState.value.startTime;
    const progress = elapsed / SHINE_DURATION;
    if (progress >= 1) {
      shineState.value = null;
    } else {
      drawShine(ctx, internalSize, progress);
    }
  }

  updateAndDrawParticles(ctx);
  setAnimationFrameId(requestAnimationFrame(render));
};

const playShine = () => {
  shineState.value = { startTime: Date.now() };
  if (!getAnimationFrameId()) render();
};

defineExpose({ playShine });

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
  stopAnimation();
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
