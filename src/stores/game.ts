import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { shuffle } from "@/utils/random";
import { useConfigStore } from "./config";
import type { Drawing, RoundOption, Round, GameState } from "@/types/game";

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

function dedupeByName(arr: Drawing[]): Drawing[] {
  const seen = new Set<string>();
  const result: Drawing[] = [];
  for (const item of arr) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      result.push(item);
    }
  }
  return result;
}

export const useGameStore = defineStore("game", () => {
  const gameState = ref<GameState>("starting");
  const rounds = ref<Round[]>([]);
  const currentRoundIndex = ref(0);
  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);
  const playSound = ref(false);

  const scores = ref<number[]>([]);
  const isLoadingScores = ref(false);

  const fetchScores = async () => {
    if (isLoadingScores.value || scores.value.length > 0) return;
    isLoadingScores.value = true;

    try {
      const res = await fetch("/api/singleplayer-scores?mode=classic");
      if (res.ok) {
        const data = await res.json();
        scores.value = (data.scores || []).sort(
          (a: number, b: number) => a - b,
        );
      }
    } catch (err) {
      console.error("Failed to fetch scores", err);
    } finally {
      isLoadingScores.value = false;
    }
  };

  fetchScores();

  const getPercentile = (playerScore: number): number | null => {
    if (!scores.value.length) return null;

    const lowerScoresCount = scores.value.filter((s) => s < playerScore).length;
    const percentile = Math.floor(
      (lowerScoresCount / scores.value.length) * 100,
    );

    return Math.min(99, Math.max(0, percentile));
  };

  const configStore = useConfigStore();

  const maxRounds = computed(() => configStore.maxRounds);
  const filteredDrawings = computed(() => configStore.filteredDrawings);
  const uniqueFilteredDrawings = computed(() =>
    dedupeByName(filteredDrawings.value),
  );

  const currentRound = computed<Round | null>(
    () => rounds.value[currentRoundIndex.value] ?? null,
  );

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
    playedHashes: string[],
  ): Round {
    const pool = shuffle(
      allDrawings.filter(
        (d) =>
          d.name !== drawing.name && !playedHashes.includes(hashCode(d.name)),
      ),
    );

    const distractors = getDistractors(drawing, pool);

    const options: RoundOption[] = shuffle([
      { title: drawing.name, isCorrect: true },
      ...distractors.map((d) => ({ title: d.name, isCorrect: false })),
    ]);

    return {
      answer: drawing.name,
      data: drawing.data,
      options,
    };
  }

  function buildRounds(drawings: Drawing[], playedHashes: string[]): Round[] {
    return drawings.map((drawing) =>
      createRound(drawing, uniqueFilteredDrawings.value, playedHashes),
    );
  }

  const setGameState = (newState: GameState) => {
    gameState.value = newState;
  };

  const createRounds = (maxRounds: number) => {
    const sessionData = sessionStorage.getItem("pixreveal_played_hashes");
    let playedHashes: string[] = sessionData ? JSON.parse(sessionData) : [];

    let availableDrawings = uniqueFilteredDrawings.value.filter(
      (d) => !playedHashes.includes(hashCode(d.name)),
    );

    const minRequired = maxRounds + 3;
    while (availableDrawings.length < minRequired && playedHashes.length > 0) {
      playedHashes.shift();
      availableDrawings = uniqueFilteredDrawings.value.filter(
        (d) => !playedHashes.includes(hashCode(d.name)),
      );
    }

    const shuffled = shuffle([...availableDrawings]);
    const selectedForGame = shuffled.slice(0, maxRounds);

    rounds.value = buildRounds(selectedForGame, playedHashes);

    selectedForGame.forEach((d) => {
      const hash = hashCode(d.name);
      if (!playedHashes.includes(hash)) {
        playedHashes.push(hash);
      }
    });
    sessionStorage.setItem(
      "pixreveal_played_hashes",
      JSON.stringify(playedHashes),
    );
  };

  const resetAndStartGame = () => {
    currentRoundIndex.value = 0;
    isGameOver.value = false;
    selectedOption.value = null;
    setGameState("starting");
  };

  const prepareGame = (customRevealTime: number, customRounds?: Round[]) => {
    if (customRounds) {
      rounds.value = customRounds;
      configStore.maxRounds = customRounds.length;
      configStore.revealTime = customRevealTime;
    } else {
      createRounds(maxRounds.value);
    }

    resetAndStartGame()
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

  const addSuddenDeathRound = () => {
    const usedAnswers = new Set(rounds.value.map((r) => r.answer));
    const unused = uniqueFilteredDrawings.value.filter(
      (d) => !usedAnswers.has(d.name),
    );
    const pool = unused.length > 0 ? unused : uniqueFilteredDrawings.value;
    const nextDrawing = shuffle([...pool])[0] as Drawing;

    const sessionData = sessionStorage.getItem("pixreveal_played_names");
    const playedNames: string[] = sessionData ? JSON.parse(sessionData) : [];

    const newRound = createRound(
      nextDrawing,
      uniqueFilteredDrawings.value,
      playedNames,
    );

    rounds.value.push(newRound);
    currentRoundIndex.value = rounds.value.length - 1;
  };

  const setRoundIndex = (index: number) => {
    const next = Math.max(0, Math.min(index, rounds.value.length - 1));
    currentRoundIndex.value = next;
    selectedOption.value = null;
    isGameOver.value = false;
    setGameState("revealing");
  };

  const reset = () => {
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
    scores,
    isLoadingScores,
    fetchScores,
    getPercentile,
    createRounds,
    prepareGame,
    resetAndStartGame,
    nextRound,
    addSuddenDeathRound,
    setRoundIndex,
    setGameState,
    reset,
  };
});