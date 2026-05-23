export type BonusRoundType = "blur" | "sepia" | "bw";

export const getBonusRoundType = (
  currentRoundIndex: number,
  maxRounds: number,
): BonusRoundType | null => {
  if (maxRounds >= 10 && currentRoundIndex === 4) return "blur";
  if (maxRounds >= 15 && currentRoundIndex === 9) return "sepia";
  if (maxRounds >= 20 && currentRoundIndex === 14) return "bw";
  return null;
};

