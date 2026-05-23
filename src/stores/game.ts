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
  options?: RoundOption[];
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

export type GameState =
  | "starting"
  | "revealing"
  | "answering"
  | "feedback"
  | "revealed"
  | "gameover";

export const useGameStore = defineStore("game", () => {
  // =============================
  // STATE
  // =============================

  const gameState = ref<GameState>("starting");

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

  const setGameState = (newState: GameState) => {
    gameState.value = newState;
  };

  const stopAllTimers = () => {
    // Platzhalter für timer cleanup
  };

  const prepareGame = (customRevealTime: number, customRounds?: Round[]) => {
    stopAllTimers();
    revealTime.value = customRevealTime;

    if (customRounds) {
      rounds.value = customRounds;
      configStore.maxRounds = customRounds.length;
      configStore.revealTime = customRevealTime;
    } else {
      const shuffled = shuffle([...filteredDrawings.value]);
      const selectedDrawings = shuffled.slice(0, maxRounds.value);
      rounds.value = buildRounds(selectedDrawings);
    }

    currentRoundIndex.value = 0;
    isGameOver.value = false;
    selectedOption.value = null;
    setGameState("starting"); // Erste Runde zeigt die Transition
  };

  const nextRound = () => {
    if (currentRoundIndex.value < rounds.value.length - 1) {
      currentRoundIndex.value++;
      setGameState("revealing");
    } else {
      isGameOver.value = true;
      setGameState("gameover");
    }
  };

  const setRoundIndex = (index: number) => {
    stopAllTimers();
    const next = Math.max(0, Math.min(index, rounds.value.length - 1));
    currentRoundIndex.value = next;
    selectedOption.value = null;
    isGameOver.value = false;
    setGameState("revealing");
  };

  const reset = () => {
    stopAllTimers();
    rounds.value = [];
    currentRoundIndex.value = 0;
    selectedOption.value = null;
    isGameOver.value = false;
    playSound.value = false;
    setGameState("starting");
  };

  return {
    gameState,
    rounds,
    currentRound,
    currentRoundIndex,
    selectedOption,
    isGameOver,
    playSound,
    revealTime,
    prepareGame,
    nextRound,
    setRoundIndex,
    setGameState,
    reset,
  };
});
