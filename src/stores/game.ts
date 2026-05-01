import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { shuffle } from "@/utils/random";
import { useConfigStore } from "./config";

type PixelGrid = number[][];

export type Drawing = {
  name: string;
  category: string;
  data: PixelGrid;
  primaryColor: number;
};

export type RoundOption = {
  title: string;
  isCorrect: boolean;
};

export type Round = {
  answer: string;
  data: PixelGrid;
  options: RoundOption[];
};

export const useGameStore = defineStore("game", () => {
  // =============================
  // STATE
  // =============================

  const rounds = ref<Round[]>([]);
  const currentRoundIndex = ref(0);

  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);
  const playSound = ref(false);
  const revealTime = ref(15);

  const configStore = useConfigStore();

  // =============================
  // COMPUTED
  // =============================

  const maxRounds = computed(() => configStore.maxRounds);
  const filteredDrawings = computed(() => configStore.filteredDrawings);

  const currentRound = computed<Round | null>(() => {
    return rounds.value[currentRoundIndex.value] ?? null;
  });

  // =============================
  // PURE HELPERS
  // =============================

  function getDistractors(drawing: Drawing, pool: Drawing[]): Drawing[] {
    const colorMatches: Drawing[] = [];
    const categoryMatches: Drawing[] = [];
    const fallbackMatches: Drawing[] = [];

    for (const d of pool) {
      if (d.primaryColor === drawing.primaryColor) {
        colorMatches.push(d);
      } else if (d.category === drawing.category) {
        categoryMatches.push(d);
      } else {
        fallbackMatches.push(d);
      }
    }

    return [...colorMatches, ...categoryMatches, ...fallbackMatches].slice(
      0,
      3,
    );
  }

  function createRound(
    drawing: Drawing,
    allDrawings: Drawing[],
    selectedDrawings: Drawing[],
  ): Round {
    const pool = shuffle(
      allDrawings.filter((d) => !selectedDrawings.includes(d)),
    );

    const distractors = getDistractors(drawing, pool);

    const options: RoundOption[] = shuffle([
      { title: drawing.name, isCorrect: true },
      ...distractors.map((d) => ({
        title: d.name,
        isCorrect: false,
      })),
    ]);

    return {
      answer: drawing.name,
      data: drawing.data,
      options,
    };
  }

  function buildRounds(drawings: Drawing[]): Round[] {
    return drawings.map((drawing) =>
      createRound(drawing, filteredDrawings.value, drawings),
    );
  }

  // =============================
  // ACTIONS
  // =============================

  const prepareGame = (customRevealTime: number, customRounds?: Round[]) => {
    if (customRounds) {
      rounds.value = customRounds;
      configStore.maxRounds = customRounds.length;
      configStore.revealTime = customRevealTime;
    } else {
      const shuffled = shuffle([...filteredDrawings.value]); // defensive copy
      const selectedDrawings = shuffled.slice(0, maxRounds.value);

      rounds.value = buildRounds(selectedDrawings);
    }

    // reset state
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

  const reset = () => {
    rounds.value = [];
    currentRoundIndex.value = 0;
    selectedOption.value = null;
    isGameOver.value = false;
    playSound.value = false;
  };

  // =============================
  // EXPORT
  // =============================

  return {
    rounds,
    currentRound,
    currentRoundIndex,
    selectedOption,
    isGameOver,
    playSound,
    revealTime,
    prepareGame,
    nextRound,
    reset,
  };
});
