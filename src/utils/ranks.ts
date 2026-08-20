export type RankData = {
  title: string;
  class: string;
  description: string;
};

export const getRankData = (
  score: number,
  opts: { maxRounds: number; revealTime: number },
): RankData => {
  const safeScore = typeof score === "number" ? score : 0;
  const maxRounds = Math.max(1, Number(opts.maxRounds) || 1);
  const revealTime = Math.max(1, Number(opts.revealTime) || 10);

  const adjustedScore = (safeScore / maxRounds) * (15 / revealTime) * 10; // 15 refers to old default revealtime of 15s

  if (adjustedScore > 120) {
    return {
      title: "PIXEL PROPHET",
      class: "rank-prophet",
      description: "You see the art before it even exists. Pure sorcery!",
    };
  }
  if (adjustedScore > 90) {
    return {
      title: "EAGLE EYE",
      class: "rank-eagle",
      description: "Sharp as a 4K monitor in a 720p world. Impressive!",
    };
  }
  if (adjustedScore > 60) {
    return {
      title: "GRID GLITCHER",
      class: "rank-glitcher",
      description: "You're getting there. Not a total blur, but not HD yet.",
    };
  }
  if (adjustedScore > 30) {
    return {
      title: "BLURRY VISION",
      class: "rank-blurry",
      description: "Were you squinting the whole time? Needs more focus.",
    };
  }
  return {
    title: "AFK ARCHITECT",
    class: "rank-afk",
    description: "Did you even turn your monitor on? Or are you a bot?",
  };
};

