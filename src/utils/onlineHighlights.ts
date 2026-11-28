import type { OnlineHighlight, Player } from "@/types/player";

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
};

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

export function buildOnlineHighlights(players: readonly Player[]): OnlineHighlightSlide[] {
  const entries: Array<{ player: Player; highlight: OnlineHighlight }> = [];
  const byRound = new Map<number, typeof entries>();

  for (const player of players) {
    const source = player.onlineHighlights?.length ? player.onlineHighlights : [
      player.bestCorrectHighlight, player.worstIncorrectHighlight,
    ].filter((highlight): highlight is OnlineHighlight => !!highlight);
    const seenRounds = new Set<number>();
    for (const highlight of source) {
      if (seenRounds.has(highlight.roundIndex) || !highlight.pixels?.length) continue;
      seenRounds.add(highlight.roundIndex);
      const entry = { player, highlight };
      entries.push(entry);
      const round = byRound.get(highlight.roundIndex) ?? [];
      round.push(entry);
      byRound.set(highlight.roundIndex, round);
    }
  }

  const correct = entries.filter(({ highlight }) => highlight.isCorrect);
  const fastestMs = Math.min(...correct.map(({ highlight }) => highlight.elapsedMs));
  const fastestCount = correct.filter(({ highlight }) => highlight.elapsedMs === fastestMs).length;
  const fewestPixels = Math.min(...correct.map(({ highlight }) => highlight.visiblePixelCount));
  // Round-wide claims require an answer snapshot from every participant.
  const participantCount = players.length;

  return entries.sort((a, b) => a.highlight.roundIndex - b.highlight.roundIndex).map(({ player, highlight }) => {
    const round = byRound.get(highlight.roundIndex)!;
    const completeRound = round.length === participantCount;
    const correctInRound = round.filter(entry => entry.highlight.isCorrect).length;
    let category: keyof typeof captions;
    let title: string;

    if (highlight.isCorrect) {
      if (highlight.visiblePixelCount === 0) {
        category = "blind"; title = "Blind guess";
      } else if (highlight.elapsedMs === fastestMs) {
        category = fastestCount > 1 ? "tiedFastest" : "fastest";
        title = fastestCount > 1 ? "Joint fastest guess" : "Fastest guess";
      } else if (completeRound && correctInRound === 1) {
        category = "onlyCorrect"; title = "Only correct guess";
      } else if (highlight.visiblePixelCount === fewestPixels) {
        category = "fewest"; title = "Fewest pixels";
      } else if (highlight.visiblePixelCount <= 8) {
        category = "sparse"; title = "Only a few pixels";
      } else if (completeRound && correctInRound === participantCount) {
        category = "allCorrect"; title = "Everyone got it";
      } else if (highlight.elapsedMs <= 2000) {
        category = "quick"; title = "Quick recognition";
      } else if (highlight.elapsedMs >= 5000) {
        category = "patient"; title = "Took their time";
      } else {
        category = "correct"; title = "Correct answer";
      }
    } else if (highlight.visiblePixelCount === 0) {
      category = "blindMiss"; title = "Blind guess missed";
    } else if (highlight.elapsedMs <= 2000) {
      category = "quickMiss"; title = "Quick miss";
    } else {
      category = "wrong"; title = "Wrong answer";
    }

    const key = `${player.playerId}-${highlight.roundIndex}`;
    const variant = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % captions[category].length;
    return {
      key, title, message: captions[category][variant]!,
      username: player.username || "Player", avatarIndex: player.avatarIndex,
      avatarSpriteSheet: player.avatarSpriteSheet, nameEffect: player.nameEffect,
      avatarEffect: player.avatarEffect, highlight,
    };
  });
}
