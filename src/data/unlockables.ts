export const BONUS_AVATAR_ACHIEVEMENT_THRESHOLD = 2;
export const BONUS_AVATAR_COUNT = 3;

export type PlayerNameEffect = "none" | "arcade-glow" | "glitcher" | "chromatic-shadow" | "stardust";
export type PlayerAvatarEffect = "none" | "avatar-effect-inverted" | "avatar-effect-sepia" | "avatar-effect-blur" | "avatar-effect-hologram";

export const AVATAR_EFFECTS: Array<{
  id: Exclude<PlayerAvatarEffect, "none">;
  title: string;
  description: string;
  unlockAt: number;
}> = [
  {
    id: "avatar-effect-inverted",
    title: "Inverted",
    description: "An inverted color filter for your avatar.",
    unlockAt: 3,
  },
  {
    id: "avatar-effect-hologram",
    title: "Hologram",
    description: "A cyan hologram with scanlines and a passing light beam.",
    unlockAt: 5,
  },
  {
    id: "avatar-effect-sepia",
    title: "Sepia",
    description: "A vintage sepia tone filter for your avatar.",
    unlockAt: 7,
  },
  {
    id: "avatar-effect-blur",
    title: "Glitch Blur",
    description: "A glitched blur effect for your avatar.",
    unlockAt: 9,
  },
];

export const NAME_EFFECTS: Array<{
  id: Exclude<PlayerNameEffect, "none">;
  title: string;
  description: string;
  unlockAt: number;
}> = [
  {
    id: "arcade-glow",
    title: "Arcade Glow",
    description: "A static cyan glow around your name.",
    unlockAt: 4,
  },
  {
    id: "stardust",
    title: "Stardust",
    description: "A golden light trail sweeps across the letters of your name.",
    unlockAt: 6,
  },
  {
    id: "chromatic-shadow",
    title: "Chromatic Shadow",
    description: "Offset cyan and pink shadows behind your name.",
    unlockAt: 8,
  },
  {
    id: "glitcher",
    title: "Glitcher",
    description: "A glitched text effect.",
    unlockAt: 10,
  },
];

export type PlayerBadge = {
  id: string;
  title: string;
  icon: string;
};
