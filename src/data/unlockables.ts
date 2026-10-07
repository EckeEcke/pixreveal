export const BONUS_AVATAR_ACHIEVEMENT_THRESHOLD = 3;
export const BONUS_AVATAR_COUNT = 3;

export type PlayerNameEffect = "none" | "arcade-glow" | "glitcher" | "chromatic-shadow";
export type PlayerAvatarEffect = "none" | "avatar-effect-inverted" | "avatar-effect-sepia" | "avatar-effect-blur";

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
    unlockAt: 4,
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
    unlockAt: 10,
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
    unlockAt: 6,
  },
  {
    id: "chromatic-shadow",
    title: "Chromatic Shadow",
    description: "Offset cyan and pink shadows behind your name.",
    unlockAt: 9,
  },
  {
    id: "glitcher",
    title: "Glitcher",
    description: "A glitched text effect.",
    unlockAt: 12,
  },
];

export type PlayerBadge = {
  id: string;
  title: string;
  icon: string;
};