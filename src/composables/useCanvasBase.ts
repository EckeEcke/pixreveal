import { ref, onUnmounted, type Ref } from "vue";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GridConfig {
  cellSize: number;
  gap: number;
  baseSize: number;
}

export function useCanvasBase(internalSize: number = 600) {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const particles = ref<Particle[]>([]);
  const animationFrameId = ref<number | null>(null);

  const getContext = (): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.value;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  const calculateGrid = (resolution: number): GridConfig => {
    if (!resolution || resolution === 0)
      return { cellSize: 0, gap: 0, baseSize: 0 };
    const cellSize = internalSize / resolution;
    const gap = cellSize * 0.05;
    const baseSize = cellSize - gap * 2;
    return { cellSize, gap, baseSize };
  };

  const createParticles = (
    x: number,
    y: number,
    color: string,
    cellSize: number,
  ): void => {
    const count = 4;
    for (let i = 0; i < count; i++) {
      particles.value.push({
        x: x + cellSize / 2,
        y: y + cellSize / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color,
      });
    }
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D): void => {
    for (let i = particles.value.length - 1; i >= 0; i--) {
      const p = particles.value[i];
      if (!p) return;
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
  };

  const stopAnimation = (): void => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  };

  onUnmounted(() => {
    stopAnimation();
  });

  return {
    canvasRef,
    particles,
    getContext,
    calculateGrid,
    createParticles,
    updateAndDrawParticles,
    getAnimationFrameId: (): number | null => animationFrameId.value,
    setAnimationFrameId: (id: number): void => {
      animationFrameId.value = id;
    },
    stopAnimation,
  };
}
