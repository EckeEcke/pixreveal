import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { shuffle } from "@/utils/random";
import { useConfigStore } from "./config";
import type { S } from "vue-router/dist/index-DFCq6eJK.js";

type PixelGrid = number[][];

export type Drawing = {
  name: string;
  category: string;
  data: PixelGrid;
  primaryColor: number;
  options?: Object[];
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

export const useGameStore = defineStore("game", () => {
  const rounds = ref<any[]>([]);
  const currentRoundIndex = ref(0);

  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);
  const playSound = ref(false);
  const revealTime = ref(15);
  const configStore = useConfigStore();
  const maxRounds = computed(() => configStore.maxRounds);
  const filteredDrawings = computed(() => configStore.filteredDrawings);

  const currentRound = computed(() => rounds.value[currentRoundIndex.value]);

  const prepareGame = (customRevealTime: number, customRounds?: any[]) => {
    if (customRounds) {
      rounds.value = customRounds;
      configStore.maxRounds = customRounds.length;
      configStore.revealTime = customRevealTime;
    } else {
      const shuffled = shuffle(filteredDrawings.value);
      const selectedDrawings = shuffled.slice(0, maxRounds.value);

      rounds.value = selectedDrawings.map((drawing) => {
        const pool = shuffle(
          filteredDrawings.value.filter(
            (drawing) => !selectedDrawings.includes(drawing),
          ),
        );

        const colorMatches = pool.filter(
          (d: Drawing) => d.primaryColor === drawing.primaryColor,
        );

        const categoryMatches = pool.filter(
          (d: Drawing) =>
            !colorMatches.includes(d) && d.category === drawing.category,
        );

        const fallbackMatches = pool.filter(
          (d: Drawing) =>
            !colorMatches.includes(d) && !categoryMatches.includes(d),
        );

        const prioritizedPool = [
          ...colorMatches,
          ...categoryMatches,
          ...fallbackMatches,
        ];

        const finalDistractors = prioritizedPool.slice(0, 3);

        const options = shuffle([
          { name: drawing.name, isCorrect: true },
          ...finalDistractors.map((d: Drawing) => ({
            name: d.name,
            isCorrect: false,
          })),
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

  const reset = () => {
    rounds.value = [];
    currentRoundIndex.value = 0;
    selectedOption.value = null;
    isGameOver.value = false;
  };

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
