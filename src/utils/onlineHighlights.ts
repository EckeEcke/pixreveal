import type { OnlineAnswerSummary, OnlineHighlight, Player } from "@/types/player";
import type { Round } from "@/types/game";
import { replayPixelGrid } from "@/utils/pixelReveal";

export const MAX_ONLINE_HIGHLIGHTS = 20;
export const MAX_HIGHLIGHTS_PER_PLAYER = 4;
export const MAX_HIGHLIGHT_CANDIDATES = 4;

export type OnlineHighlightData = {
  onlineHighlights?: OnlineHighlight[];
  onlineAnswerSummaries?: OnlineAnswerSummary[];
  bestCorrectHighlight?: OnlineHighlight | null;
  worstIncorrectHighlight?: OnlineHighlight | null;
};

export function summarizeOnlineAnswers(answers: readonly OnlineAnswerSummary[]): OnlineAnswerSummary[] {
  const byRound = new Map<number, OnlineAnswerSummary>();
  for (const { roundIndex, givenAnswer, isCorrect, elapsedMs, visiblePixelCount } of answers) {
    byRound.set(roundIndex, { roundIndex, givenAnswer, isCorrect, elapsedMs, visiblePixelCount });
  }
  return [...byRound.values()].sort((a, b) => a.roundIndex - b.roundIndex);
}

// Keep the fastest and sparsest correct guess, plus an early and a late miss.
export function selectOnlineHighlightCandidates(highlights: readonly OnlineHighlight[]): OnlineHighlight[] {
  const byRound = new Map<number, OnlineHighlight>();
  for (const highlight of highlights) {
    if (highlight.pixels?.length) byRound.set(highlight.roundIndex, highlight);
  }
  const entries = [...byRound.values()];
  const correct = entries.filter(entry => entry.isCorrect);
  const wrong = entries.filter(entry => !entry.isCorrect);
  const fastest = (a: OnlineHighlight, b: OnlineHighlight) =>
    a.elapsedMs - b.elapsedMs || a.visiblePixelCount - b.visiblePixelCount || a.roundIndex - b.roundIndex;
  const fewest = (a: OnlineHighlight, b: OnlineHighlight) =>
    a.visiblePixelCount - b.visiblePixelCount || fastest(a, b);
  const latest = (a: OnlineHighlight, b: OnlineHighlight) =>
    b.elapsedMs - a.elapsedMs || b.visiblePixelCount - a.visiblePixelCount || a.roundIndex - b.roundIndex;
  const choices = [
    [...correct].sort(fastest)[0], [...correct].sort(fewest)[0],
    [...wrong].sort(fewest)[0], [...wrong].sort(latest)[0],
    ...entries.sort(fastest),
  ];
  const selected = new Map<number, OnlineHighlight>();
  for (const entry of choices) {
    if (entry) selected.set(entry.roundIndex, entry);
    if (selected.size === MAX_HIGHLIGHT_CANDIDATES) break;
  }
  return [...selected.values()].sort((a, b) => a.roundIndex - b.roundIndex);
}

export function compactOnlineHighlightData(data: OnlineHighlightData) {
  const source = data.onlineHighlights?.length ? data.onlineHighlights : [
    data.bestCorrectHighlight, data.worstIncorrectHighlight,
  ].filter((highlight): highlight is OnlineHighlight => !!highlight);
  return {
    onlineHighlights: selectOnlineHighlightCandidates(source),
    onlineAnswerSummaries: summarizeOnlineAnswers([...source, ...(data.onlineAnswerSummaries ?? [])]),
  };
}

export type OnlineHighlightSlide = {
  key: string;
  title: string;
  message: string;
  username: string;
  avatarIndex: number;
  avatarSpriteSheet?: Player["avatarSpriteSheet"];
  nameEffect?: Player["nameEffect"];
  avatarEffect?: Player["avatarEffect"];
  highlight: OnlineHighlight;
  roundResult?: { correct: number; total: number };
};

export type OnlineGuess = OnlineHighlightSlide & { correctAnswer?: string };

export function getOnlineGuessSummaries(players: readonly Player[]) {
  return players.flatMap(player => {
    const data = compactOnlineHighlightData(player);
    return data.onlineAnswerSummaries.map(answer => ({
      player, answer, fallback: data.onlineHighlights.find(image => image.roundIndex === answer.roundIndex),
    }));
  });
}

export function buildOnlineGuesses(players: readonly Player[], rounds: readonly Round[], roundIndex: number): OnlineGuess[] {
  return getOnlineGuessSummaries(players).filter(entry => entry.answer.roundIndex === roundIndex).map(({ player, answer, fallback }) => {
    const round = rounds[roundIndex];
    const pixels = round?.revealSeed !== undefined
      ? replayPixelGrid(round.data, answer.visiblePixelCount, round.revealSeed) : fallback?.pixels ?? [];
    return {
      key: `${player.playerId}-${roundIndex}`, title: "", message: "", username: player.username || "Player",
      avatarIndex: player.avatarIndex, avatarSpriteSheet: player.avatarSpriteSheet,
      avatarEffect: player.avatarEffect, nameEffect: player.nameEffect,
      highlight: { ...answer, pixels }, correctAnswer: round?.answer,
    };
  });
}

const captions = {
  fastest: [
    "The time to beat. Nobody did.",
    "That guess deserves a speed limit.",
    "The drawing barely got a word in.",
    "Quickest correct answer. Bragging rights included.",
  ],
  tiedFastest: [
    "The stopwatch refuses to pick a favorite.",
    "Shared speed record. Shared bragging rights.",
    "Too close for the timer to call.",
    "Apparently, the fast lane has room for company.",
  ],
  blind: [
    "The drawing could have stayed home.",
    "No picture. Just suspiciously good instincts.",
    "Evidence was apparently optional.",
    "Either psychic or very lucky. We'll allow it.",
  ],
  fewest: [
    "The rest of the pixels were just decoration.",
    "Doing the most with the least.",
    "A very economical use of pixels.",
    "The smallest pixel budget. Spent wisely.",
  ],
  onlyCorrect: [
    "Someone read the pixels. Everyone else read something else.",
    "One correct answer in a room full of plot twists.",
    "The group chat might need an explanation.",
    "A rare case of everyone else being wrong.",
  ],
  allCorrect: [
    "A rare moment of total agreement.",
    "Looks like the correct answer was too obvious.",
    "Everyone gets to say 'I knew that one.'",
    "Nobody needs to explain their answer this time.",
  ],
  allWrong: [
    "A rare moment of agreement with absolutely no points to show for it.",
    "The drawing remains undefeated this round.",
    "Several theories. Zero correct answers.",
    "Everyone took a swing. The pixels ducked.",
  ],
  onlyWrong: [
    "Everyone else got the memo.",
    "The group had a plan. This guess had a different one.",
    "One answer went on a little side quest.",
    "A solo adventure in the wrong direction.",
  ],
  quick: [
    "The reveal was still warming up.",
    "Apparently, waiting for more pixels was unnecessary.",
    "A correct answer with places to be.",
    "That guess came with express shipping.",
  ],
  sparse: [
    "A few pixels and a very busy imagination.",
    "Some assembly required. Apparently, not much.",
    "Eight pixels or fewer. The rest can stay in bed.",
    "That is a lot of recognition per pixel.",
  ],
  patient: [
    "Let the pixels finish their sentence.",
    "Gave the drawing a chance to explain itself.",
    "A little suspense, then the right answer.",
    "Waited for the plot to make sense.",
  ],
  correct: [
    "Successfully translated from pixel.",
    "Case closed. On to the next mystery.",
    "A small victory for staring at squares.",
    "That guess will hold up in pixel court.",
  ],
  blindMiss: [
    "The pixels would like to be consulted next time.",
    "A bold interpretation of absolutely nothing.",
    "The crystal ball needs new batteries.",
    "No evidence was harmed in the making of this guess.",
  ],
  quickMiss: [
    "That answer arrived before the evidence.",
    "The guess was ready. The accuracy wasn't.",
    "Fast delivery. Wrong address.",
    "A confident start to the wrong conclusion.",
  ],
  wrong: [
    "The drawing would like to file a correction.",
    "An interesting theory. The pixels disagree.",
    "A plot twist the drawing did not approve.",
    "The drawing and the answer have creative differences.",
  ],
} as const;

export function buildOnlineHighlights(players: readonly Player[], replayRounds: readonly Round[] = []): OnlineHighlightSlide[] {
  const entries: Array<{ player: Player; highlight: OnlineHighlight }> = [];
  const answers: OnlineAnswerSummary[] = [];
  const byRound = new Map<number, OnlineAnswerSummary[]>();

  for (const player of players) {
    const data = compactOnlineHighlightData(player);
    for (const answer of data.onlineAnswerSummaries) {
      const fallback = data.onlineHighlights.find(image => image.roundIndex === answer.roundIndex);
      if (!answer.givenAnswer) continue;
      if (replayRounds[answer.roundIndex]?.revealSeed !== undefined || fallback) {
        entries.push({ player, highlight: { ...answer, pixels: fallback?.pixels ?? [] } });
      }
    }
    for (const answer of data.onlineAnswerSummaries) {
      answers.push(answer);
      const round = byRound.get(answer.roundIndex) ?? [];
      round.push(answer);
      byRound.set(answer.roundIndex, round);
    }
  }

  const correct = answers.filter(answer => answer.isCorrect);
  const fastestMs = Math.min(...correct.map(answer => answer.elapsedMs));
  const fastestCount = correct.filter(answer => answer.elapsedMs === fastestMs).length;
  const fewestPixels = Math.min(...correct.map(answer => answer.visiblePixelCount));
  // Metadata from every participant is enough; their images may have been discarded.
  const participantCount = players.length;

  const candidates = entries.map(({ player, highlight }) => {
    const round = byRound.get(highlight.roundIndex)!;
    const completeRound = participantCount >= 2 && round.length === participantCount;
    const correctInRound = round.filter(answer => answer.isCorrect).length;
    let category: keyof typeof captions;
    let title: string;

    if (highlight.isCorrect) {
      if (completeRound && correctInRound === 1) {
        category = "onlyCorrect"; title = "Only correct guess";
      } else if (completeRound && correctInRound === participantCount) {
        category = "allCorrect"; title = "Everyone got it";
      } else if (highlight.visiblePixelCount === 0) {
        category = "blind"; title = "Blind guess";
      } else if (highlight.elapsedMs === fastestMs) {
        category = fastestCount > 1 ? "tiedFastest" : "fastest";
        title = fastestCount > 1 ? "Joint fastest guess" : "Fastest guess";
      } else if (highlight.visiblePixelCount === fewestPixels) {
        category = "fewest"; title = "Fewest pixels";
      } else if (highlight.visiblePixelCount <= 8) {
        category = "sparse"; title = "Only a few pixels";
      } else if (highlight.elapsedMs <= 2000) {
        category = "quick"; title = "Quick recognition";
      } else if (highlight.elapsedMs >= 5000) {
        category = "patient"; title = "Took their time";
      } else {
        category = "correct"; title = "Correct answer";
      }
    } else if (completeRound && correctInRound === 0) {
      category = "allWrong"; title = "Everyone missed";
    } else if (completeRound && correctInRound === participantCount - 1) {
      category = "onlyWrong"; title = "Only wrong guess";
    } else if (highlight.visiblePixelCount === 0) {
      category = "blindMiss"; title = "Blind guess missed";
    } else if (highlight.elapsedMs <= 2000) {
      category = "quickMiss"; title = "Quick miss";
    } else {
      category = "wrong"; title = "Wrong answer";
    }

    const key = `${player.playerId}-${highlight.roundIndex}`;
    const variant = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % captions[category].length;
    return { playerId: player.playerId, category, slide: {
      key, title, message: captions[category][variant]!,
      username: player.username || "Player", avatarIndex: player.avatarIndex,
      avatarSpriteSheet: player.avatarSpriteSheet, nameEffect: player.nameEffect,
      avatarEffect: player.avatarEffect, highlight,
      roundResult: completeRound ? { correct: correctInRound, total: participantCount } : undefined,
    } };
  });

  const priority: Record<keyof typeof captions, number> = {
    onlyCorrect: 105, onlyWrong: 105, allWrong: 95, allCorrect: 90,
    blind: 85, fewest: 80, blindMiss: 75, sparse: 70, quickMiss: 65,
    fastest: 55, tiedFastest: 55, wrong: 50, quick: 45, patient: 40, correct: 20,
  };
  const selected: typeof candidates = [];
  const playerCounts = new Map<string, number>();
  const categoryCounts = new Map<keyof typeof captions, number>();
  const rounds = new Map<number, typeof candidates>();
  const comparable = (a: OnlineHighlight, b: OnlineHighlight) =>
    a.givenAnswer !== b.givenAnswer || a.isCorrect !== b.isCorrect ||
    (a.isCorrect && b.isCorrect && a.elapsedMs === b.elapsedMs);
  const score = (candidate: typeof candidates[number]) =>
    priority[candidate.category] - (categoryCounts.get(candidate.category) ?? 0) * 12;

  // Prefer a first appearance for each player and a new drawing before comparisons.
  for (const firstAppearance of [true, false]) {
    for (const uniqueRound of [true, false]) {
      while (selected.length < MAX_ONLINE_HIGHLIGHTS) {
        const eligible = candidates.filter(candidate => {
          if (selected.includes(candidate)) return false;
          const count = playerCounts.get(candidate.playerId) ?? 0;
          if (count >= MAX_HIGHLIGHTS_PER_PLAYER || (firstAppearance && count > 0)) return false;
          const sameRound = rounds.get(candidate.slide.highlight.roundIndex) ?? [];
          if (uniqueRound) return sameRound.length === 0;
          return sameRound.length < 2 && sameRound.every(other =>
            comparable(candidate.slide.highlight, other.slide.highlight));
        }).sort((a, b) => score(b) - score(a) ||
          a.slide.highlight.roundIndex - b.slide.highlight.roundIndex ||
          (a.slide.key < b.slide.key ? -1 : a.slide.key > b.slide.key ? 1 : 0));
        const next = eligible[0];
        if (!next) break;
        selected.push(next);
        playerCounts.set(next.playerId, (playerCounts.get(next.playerId) ?? 0) + 1);
        categoryCounts.set(next.category, (categoryCounts.get(next.category) ?? 0) + 1);
        const round = rounds.get(next.slide.highlight.roundIndex) ?? [];
        round.push(next);
        rounds.set(next.slide.highlight.roundIndex, round);
      }
    }
  }
  return selected.map(({ slide }) => {
    const round = replayRounds[slide.highlight.roundIndex];
    return round?.revealSeed === undefined ? slide : {
      ...slide, highlight: { ...slide.highlight, pixels: replayPixelGrid(round.data, slide.highlight.visiblePixelCount, round.revealSeed) },
    };
  });
}
