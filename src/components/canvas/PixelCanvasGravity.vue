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
const animatedPhysicsPixels = ref([]);

const SHINE_DURATION = 500;
const shineState = ref(null);

const SHAKE_DURATION = 800;
const SHAKE_MAGNITUDE = 6;
const shakeState = ref(null);

const POP_DURATION = 350;
const popState = ref(null);

const initGravityEffect = () => {
  if (!props.pixelArray || !props.pixelArray.length) return;

  animatedPhysicsPixels.value = [];
  const newList = [];
  const duration = configStore.revealTime || 15;
  const resolution = props.pixelArray.length;
  const { cellSize } = calculateGrid(resolution);

  const isInstant = !props.isRevealing || props.isStatusIcon;

  let totalPixelCount = 0;
  props.pixelArray.forEach((row) => {
    if (Array.isArray(row)) {
      row.forEach((val) => {
        if (val !== 0) totalPixelCount++;
      });
    }
  });

  const maxDelayFrames = isInstant ? 0 : Math.max(0, (duration - 1) * 60);
  const delayPerPixel =
    totalPixelCount > 1 ? maxDelayFrames / (totalPixelCount - 1) : 0;

  let sequenceIndex = 0;

  for (let y = resolution - 1; y >= 0; y--) {
    const row = props.pixelArray[y];
    if (Array.isArray(row)) {
      for (let x = 0; x < row.length; x++) {
        const val = row[x];
        if (val !== 0) {
          newList.push({
            val,
            x: x * cellSize,
            targetY: y * cellSize,
            currentY: isInstant ? y * cellSize : -50,
            velocity: 0,
            landed: isInstant,
            delay: isInstant
              ? 0
              : Math.floor(sequenceIndex * delayPerPixel),
            createdAt: Date.now(),
          });
          sequenceIndex++;
        }
      }
    }
  }

  activePixels.value = newList;
};

const preparePhysicsPixels = () => {
  const resolution = props.pixelArray?.length || 16;
  const { cellSize, gap } = calculateGrid(resolution);

  const drops = [];
  props.pixelArray.forEach((row, y) => {
    if (Array.isArray(row)) {
      row.forEach((val, x) => {
        if (val !== 0) {
          drops.push({
            xPos: x * cellSize + gap,
            yPos: y * cellSize + gap,
            color: colorPalette[val] || "#fff",
            vx: (Math.random() - 0.5) * 6,
            vy: -1 - Math.random() * 3,
            gravity: 0.65,
            rot: 0,
            vRot: (Math.random() - 0.5) * 0.2,
          });
        }
      });
    }
  });

  animatedPhysicsPixels.value = drops;
  activePixels.value = [];
};

const triggerCorrectAnswer = () => {
  // Alle Pixel sofort an ihre Ziel-Position setzen
  activePixels.value.forEach((p) => {
    p.currentY = p.targetY;
    p.landed = true;
    p.delay = 0;
  });

  playPop();
  playShine();

  if (!getAnimationFrameId()) render();
};

const triggerIncorrectAnswer = () => {
  // 1. Motiv sofort vollständig anzeigen
  activePixels.value.forEach((p) => {
    p.currentY = p.targetY;
    p.landed = true;
    p.delay = 0;
  });

  // 2. Shake-Effekt starten
  playShake();

  // 3. Drop erst nach 1 Sekunde ausführen
  setTimeout(() => {
    preparePhysicsPixels();
  }, 1000);

  if (!getAnimationFrameId()) render();
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

const updateAndDrawPhysicsPixels = (ctx, baseSize) => {
  for (let i = animatedPhysicsPixels.value.length - 1; i >= 0; i--) {
    const p = animatedPhysicsPixels.value[i];

    p.xPos += p.vx;
    p.yPos += p.vy;
    p.vy += p.gravity;
    p.rot += p.vRot;

    if (p.yPos > internalSize + 80 || p.yPos < -150) {
      animatedPhysicsPixels.value.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(p.xPos + baseSize / 2, p.yPos + baseSize / 2);
    ctx.rotate(p.rot);

    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(-baseSize / 2, -baseSize / 2, baseSize, baseSize);

    ctx.restore();
  }
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

  let shakeX = 0;
  let shakeY = 0;
  if (shakeState.value) {
    const elapsed = now - shakeState.value.startTime;
    const progress = elapsed / SHAKE_DURATION;
    if (progress >= 1) {
      shakeState.value = null;
    } else {
      const decay = 1 - progress;
      const magnitude = SHAKE_MAGNITUDE * decay;
      shakeX = Math.sin(progress * Math.PI * 10) * magnitude;
      shakeY = Math.cos(progress * Math.PI * 7) * magnitude;
    }
  }

  let scaleFactor = 1;
  if (popState.value) {
    const elapsed = now - popState.value.startTime;
    const progress = elapsed / POP_DURATION;
    if (progress >= 1) {
      popState.value = null;
    } else {
      scaleFactor = 1 + Math.sin(progress * Math.PI) * 0.07;
    }
  }

  ctx.save();
  ctx.translate(internalSize / 2 + shakeX, internalSize / 2 + shakeY);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.translate(-internalSize / 2, -internalSize / 2);

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

  if (animatedPhysicsPixels.value.length > 0) {
    updateAndDrawPhysicsPixels(ctx, baseSize);
  }

  if (shineState.value) {
    const elapsed = now - shineState.value.startTime;
    const progress = elapsed / SHINE_DURATION;
    if (progress >= 1) {
      shineState.value = null;
    } else {
      drawShine(ctx, internalSize, progress);
    }
  }

  ctx.restore();
  
  setAnimationFrameId(requestAnimationFrame(render));
};

const playShine = () => {
  shineState.value = { startTime: Date.now() };
  if (!getAnimationFrameId()) render();
};

const playShake = () => {
  shakeState.value = { startTime: Date.now() };
  if (!getAnimationFrameId()) render();
};

const playPop = () => {
  popState.value = { startTime: Date.now() };
  if (!getAnimationFrameId()) render();
};

defineExpose({
  getImageUrl: () => canvasRef.value?.toDataURL("image/png") || null,
  playShine,
  playShake,
  playPop,
  triggerCorrectAnswer,
  triggerIncorrectAnswer,
});

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