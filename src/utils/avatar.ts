import type { CSSProperties } from "vue";
import classicSpriteSheet from "@/assets/avatars/avatars.webp";
import unlockablesSpriteSheet from "@/assets/avatars/avatars2.webp";
import { type PlayerAvatarEffect } from "@/data/unlockables";

export type AvatarSpriteSheet = "classic" | "unlockables";

const spriteSheets: Record<AvatarSpriteSheet, string> = {
  classic: classicSpriteSheet,
  unlockables: unlockablesSpriteSheet,
};

export const getAvatarStyle = (
  avatarIndex: number | null | undefined,
  spriteSheet: AvatarSpriteSheet = "classic",
  avatarEffect: PlayerAvatarEffect = "none",
): CSSProperties => {
  const index = Math.max(0, Math.floor(avatarIndex ?? 0));
  const column = index % 6;
  const row = Math.floor(index / 6);

  return {
    backgroundImage: `url(${spriteSheets[spriteSheet]})`,
    backgroundPosition: `${column * 20}% ${row * 20}%`,
    backgroundSize: "605%",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    transformOrigin: "center",
    transform: "scale(1)",
  };
};