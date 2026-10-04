import type { CSSProperties } from "vue";
import classicSpriteSheet from "@/assets/avatars/avatars.webp";
import unlockablesSpriteSheet from "@/assets/avatars/avatars2.webp";

export type AvatarSpriteSheet = "classic" | "unlockables";

const spriteSheets: Record<AvatarSpriteSheet, string> = {
  classic: classicSpriteSheet,
  unlockables: unlockablesSpriteSheet,
};

export const getAvatarStyle = (
  avatarIndex: number | null | undefined,
  spriteSheet: AvatarSpriteSheet = "classic",
): CSSProperties => {
  const index = Math.max(0, Math.floor(avatarIndex ?? 0));
  const column = index % 6;
  const row = Math.floor(index / 6);

  return {
    backgroundImage: `url(${spriteSheets[spriteSheet]})`,
    backgroundPosition: `${column * 20}% ${row * 20}%`,
    backgroundSize: "600%",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    transform: "scale(1.05)",
  };
};