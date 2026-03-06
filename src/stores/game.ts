import { defineStore } from "pinia";
import { ref, computed } from "vue";
import drawings from "@/data/drawings.json";

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

const shuffle = <T>(array: readonly T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

export const useGameStore = defineStore("game", () => {
  const rounds = ref<any[]>([]);
  const currentRoundIndex = ref(0);
  const maxRounds = 10;
  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);
  const playSound = ref(false);

  const currentRound = computed(() => rounds.value[currentRoundIndex.value]);

  const getRandomUserName = () => {
    const shuffled = shuffle(drawings as unknown as Drawing[]);
    return shuffled[0]?.name || "PLAYER";
  };

  const prepareGame = (customRounds?: any[]) => {
    if (customRounds) {
      rounds.value = customRounds;
    } else {
      const shuffled = shuffle(drawings as unknown as Drawing[]);
      const selectedDrawings = shuffled.slice(0, 10);

      rounds.value = selectedDrawings.map((drawing) => {
        const otherNames = (drawings as unknown as Drawing[])
          .filter((d: Drawing) => d.name !== drawing.name)
          .map((d: Drawing) => d.name);

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
    }
    currentRoundIndex.value = 0;
    isGameOver.value = false;
    selectedOption.value = null;
  };

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
    playSound,
    prepareGame,
    nextRound,
    getRandomUserName,
  };
});
