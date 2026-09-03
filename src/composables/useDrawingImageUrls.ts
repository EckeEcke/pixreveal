import { onBeforeUnmount, ref, watch } from "vue";
import type { Ref } from "vue";
// @ts-ignore
import colorPalette from "@/data/colorPalette";

type PixelMatrix = number[][];

type DrawingLike = {
  data: PixelMatrix;
};

const CANVAS_SIZE = 256;
const BG_COLOR = "#120f1f";
const DOT_COLOR = "rgba(128, 0, 128, 0.4)";
const DOT_SPACING = 8;

const drawDotGridBackground = (ctx: any, size: number) => {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = DOT_COLOR;
  const dotSize = 1.5;
  for (let y = 0; y <= size; y += DOT_SPACING) {
    for (let x = 0; x <= size; x += DOT_SPACING) {
      ctx.fillRect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
    }
  }
};

const renderMatrixToBlob = async (matrix: PixelMatrix): Promise<Blob | null> => {
  if (!Array.isArray(matrix) || matrix.length === 0) return null;

  const res = matrix.length;
  const cellSize = CANVAS_SIZE / res;
  const gap = cellSize * 0.05;
  const baseSize = cellSize - gap * 2;

  const canUseOffscreen =
    typeof OffscreenCanvas !== "undefined" &&
    typeof (OffscreenCanvas as any).prototype?.convertToBlob === "function";

  const canvas: any = canUseOffscreen
    ? new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
    : Object.assign(document.createElement("canvas"), {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      });

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  drawDotGridBackground(ctx, CANVAS_SIZE);

  for (let y = 0; y < res; y++) {
    const row = matrix[y];
    if (!Array.isArray(row)) continue;
    for (let x = 0; x < row.length; x++) {
      const val = row[x];
      if (!val) continue;
      ctx.fillStyle = (colorPalette as any)[val] || "#fff";
      ctx.fillRect(x * cellSize + gap, y * cellSize + gap, baseSize, baseSize);
      if (val === 1) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(175, 175, 175, 0.5)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellSize + gap, y * cellSize + gap, baseSize, baseSize);
      }
    }
  }

  if (canUseOffscreen) {
    return canvas.convertToBlob({ type: "image/png" });
  }

  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob: Blob | null) => resolve(blob), "image/png");
  });
};

export const useDrawingImageUrls = (drawings: Ref<DrawingLike[]>) => {
  const imageUrls = ref<string[]>([]);
  const isGenerating = ref(false);

  const revokeAll = () => {
    for (const url of imageUrls.value) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  };

  watch(
    drawings,
    async (next) => {
      revokeAll();
      imageUrls.value = [];
      isGenerating.value = false;

      if (!Array.isArray(next) || next.length === 0) return;

      isGenerating.value = true;
      try {
        const urls: string[] = new Array(next.length).fill("");
        for (let i = 0; i < next.length; i++) {
          const drawing = next[i];
          if (!drawing?.data) continue;
          const blob = await renderMatrixToBlob(drawing.data);
          if (!blob) continue;
          urls[i] = URL.createObjectURL(blob);
          await new Promise((r) => setTimeout(r, 0));
        }
        imageUrls.value = urls;
      } finally {
        isGenerating.value = false;
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => revokeAll());

  return { imageUrls, isGenerating };
};