export const BONUS_AVATAR_ACHIEVEMENT_THRESHOLD = 3;
export const BONUS_AVATAR_COUNT = 3;

export type PlayerNameEffect = "none" | "arcade-glow" | "glitcher" | "chromatic-shadow";

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
