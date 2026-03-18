import { defineStore } from "pinia";
import { ref, computed } from "vue";
import drawings from "@/data/drawings.json";
import { shuffle } from "@/utils/random";

type PixelGrid = number[][];

export type Drawing = {
  name: string;
  categories: String[];
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
  const maxRounds = ref(10);
  const selectedOption = ref<RoundOption | null>(null);
  const isGameOver = ref(false);
  const playSound = ref(false);
  const revealTime = ref(15);

  const currentRound = computed(() => rounds.value[currentRoundIndex.value]);

  const prepareGame = (customRevealTime: number, customRounds?: any[]) => {
    if (customRounds) {
      rounds.value = customRounds;
      maxRounds.value = customRounds.length;
      revealTime.value = customRevealTime;
    } else {
      const shuffled = shuffle(drawings as unknown as Drawing[]);
      const selectedDrawings = shuffled.slice(0, maxRounds.value);

      rounds.value = selectedDrawings.map((drawing) => {
        // 1. Initialer Pool (alles außer das aktuelle Bild) - direkt shufflen
        const pool = shuffle(
          (drawings as unknown as Drawing[]).filter(
            (d: Drawing) => d.name !== drawing.name,
          ),
        );

        // 2. STRIKTE PRIORISIERUNG

        // Prio 1: Gleiche Farbe
        const colorMatches = pool.filter(
          (d: Drawing) => d.primaryColor === drawing.primaryColor,
        );

        // Prio 2: Gleiche Kategorien (nur die nehmen, die noch nicht in Prio 1 sind)
        const categoryMatches = pool.filter(
          (d: Drawing) =>
            !colorMatches.includes(d) &&
            d.categories.some((cat: string) =>
              drawing.categories.includes(cat),
            ),
        );

        // Rest: Alles andere (Fallback)
        const fallbackMatches = pool.filter(
          (d: Drawing) =>
            !colorMatches.includes(d) && !categoryMatches.includes(d),
        );

        // 3. Ergebnisse der Reihe nach zusammenführen
        // Da pool bereits geshuffelt war, sind auch die Untergruppen geshuffelt
        const prioritizedPool = [
          ...colorMatches,
          ...categoryMatches,
          ...fallbackMatches,
        ];

        // 4. Einfach die ersten 3 nehmen
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
    maxRounds,
    selectedOption,
    isGameOver,
    playSound,
    revealTime,
    prepareGame,
    nextRound,
    reset,
  };
});
