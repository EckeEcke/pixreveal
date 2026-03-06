import drawings from "@/data/drawings.json";
import type { Drawing } from "@/stores/game";

export const shuffle = <T>(array: readonly T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

export const getRandomUserName = () => {
  const shuffled = shuffle(drawings as unknown as Drawing[]);
  const suitableDrawing = shuffled.find((d) => d.name && d.name.length <= 12);
  return suitableDrawing?.name || "PLAYER";
};
