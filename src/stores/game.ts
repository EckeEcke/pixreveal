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

export const useGameStore = defineStore("game", () => {
  const gameState = ref<GameState>("starting");
  const rounds = ref<Round[]>([]);
  const currentRoundIndex = ref(0);
  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);
  const playSound = ref(false);
  const revealTime = ref(15);

  const configStore = useConfigStore();

  const maxRounds = computed(() => configStore.maxRounds);
  const filteredDrawings = computed(() => configStore.filteredDrawings);

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
      createRound(drawing, filteredDrawings.value, playedHashes),
    );
  }

  const setGameState = (newState: GameState) => {
    gameState.value = newState;
  };

  const prepareGame = (customRevealTime: number, customRounds?: Round[]) => {
    revealTime.value = customRevealTime;

    if (customRounds) {
      rounds.value = customRounds;
      configStore.maxRounds = customRounds.length;
      configStore.revealTime = customRevealTime;
    } else {
      const sessionData = sessionStorage.getItem("pixreveal_played_hashes")
      let playedHashes: string[] = sessionData ? JSON.parse(sessionData) : []

      let availableDrawings = filteredDrawings.value.filter((d) => !playedHashes.includes(hashCode(d.name)))

      const minRequired = maxRounds.value + 3
      while (availableDrawings.length < minRequired && playedHashes.length > 0) {
        playedHashes.shift()
        availableDrawings = filteredDrawings.value.filter((d) => !playedHashes.includes(hashCode(d.name)))
      }

      const shuffled = shuffle([...availableDrawings])
      const selectedForGame = shuffled.slice(0, maxRounds.value)

      rounds.value = buildRounds(selectedForGame, playedHashes)

      selectedForGame.forEach((d) => {
        const hash = hashCode(d.name)
        if (!playedHashes.includes(hash)) {
          playedHashes.push(hash)
        }
      })
      sessionStorage.setItem("pixreveal_played_hashes", JSON.stringify(playedHashes))
    }

    currentRoundIndex.value = 0;
    isGameOver.value = false;
    selectedOption.value = null;
    setGameState("starting");
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
    const unused = filteredDrawings.value.filter(
      (d) => !usedAnswers.has(d.name),
    );
    const pool = unused.length > 0 ? unused : filteredDrawings.value;
    const nextDrawing = shuffle([...pool])[0] as Drawing;

    const sessionData = sessionStorage.getItem("pixreveal_played_names");
    const playedNames: string[] = sessionData ? JSON.parse(sessionData) : [];

    const newRound = createRound(
      nextDrawing,
      filteredDrawings.value,
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
    revealTime,
    prepareGame,
    nextRound,
    addSuddenDeathRound,
    setRoundIndex,
    setGameState,
    reset,
  };
});
