import type { Drawing, RoundOption } from "@/types/game";
import { shuffle } from "@/utils/random";

export function createRoundOptions(drawing: Drawing, pool: Drawing[]): RoundOption[] {
  const sameCategoryAndColor: Drawing[] = [];
  const sameColor: Drawing[] = [];
  const sameCategory: Drawing[] = [];
  const fallback: Drawing[] = [];

  for (const candidate of pool) {
    if (candidate.name === drawing.name) continue;

    if (
      candidate.category === drawing.category &&
      candidate.primaryColor === drawing.primaryColor
    ) {
      sameCategoryAndColor.push(candidate);
    } else if (candidate.primaryColor === drawing.primaryColor) {
      sameColor.push(candidate);
    } else if (candidate.category === drawing.category) {
      sameCategory.push(candidate);
    } else {
      fallback.push(candidate);
    }
  }

  const distractors = [
    ...shuffle(sameCategoryAndColor),
    ...shuffle(sameColor),
    ...shuffle(sameCategory),
    ...shuffle(fallback),
  ].slice(0, 3);

  return shuffle([
    { title: drawing.name, isCorrect: true },
    ...distractors.map((candidate) => ({ title: candidate.name, isCorrect: false })),
  ]);
}
