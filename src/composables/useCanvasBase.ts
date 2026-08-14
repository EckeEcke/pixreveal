import { ref, onUnmounted, type Ref } from "vue";

interface GridConfig {
  cellSize: number;
  gap: number;
  baseSize: number;
}

export function useCanvasBase(internalSize: number = 600) {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
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
    getContext,
    calculateGrid,
    getAnimationFrameId: (): number | null => animationFrameId.value,
    setAnimationFrameId: (id: number): void => {
      animationFrameId.value = id;
    },
    stopAnimation,
  };
}