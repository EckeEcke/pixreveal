import { ref, computed } from "vue";
import drawings from "@/data/drawings";

type PixelGrid = number[][];

type Drawing = {
  name: string;
  data: PixelGrid;
};

type RoundOption = {
  title: string;
  isCorrect: boolean;
};

type Round = {
  answer: string;
  data: PixelGrid;
  options: RoundOption[];
};

export function useGame() {
  const rounds = ref<Round[]>([]);
  const currentRoundIndex = ref(0);
  const maxRounds = 10;
  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);

  const shuffle = <T>(array: readonly T[]): T[] =>
    [...array].sort(() => Math.random() - 0.5);

  const initGame = () => {
    const shuffled = shuffle(drawings as Drawing[]);
    const selectedDrawings = shuffled.slice(0, 10);

    rounds.value = selectedDrawings.map((drawing) => {
      const otherNames = drawings
        .filter((d) => d.name !== drawing.name)
        .map((d) => d.name);

      const distractors = shuffle(otherNames).slice(0, 3);

      const options = shuffle([
        { title: drawing.name, isCorrect: true },
        ...distractors.map((name) => ({ title: name, isCorrect: false })),
      ]);

      return {
        answer: drawing.name,
        data: drawing.data,
        options,
      };
    });

    currentRoundIndex.value = 0;
    isGameOver.value = false;
    selectedOption.value = null;
  };

  const currentRound = computed(() => rounds.value[currentRoundIndex.value]);

  const nextRound = () => {
    if (currentRoundIndex.value < rounds.value.length - 1) {
      currentRoundIndex.value++;
      selectedOption.value = null;
    } else {
      isGameOver.value = true;
    }
  };

  return {
    rounds,
    currentRound,
    currentRoundIndex,
    maxRounds,
    selectedOption,
    isGameOver,
    initGame,
    nextRound,
  };
}
