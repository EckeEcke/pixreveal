import { ref, computed } from "vue";
import type { Ref } from "vue";
import { defineStore } from "pinia";
import type { Drawing, RoundOption } from "./game";
import allDrawings from "@/data/drawings.json";
import { useConfigStore } from "./config";
import { useSoundStore } from "./sound";
import { useGameStore } from "./game";
import {
  workerClearInterval,
  workerSetInterval,
} from "@/services/workerTimers";

export const useSurvivalStore = defineStore("survival", () => {
  const drawings: Ref<Drawing[]> = ref([]);
  const currentDrawing: Ref<Drawing | undefined> = ref(undefined);
  const highscore = ref(
    Number(localStorage.getItem("survival_highscore") || "0"),
  );
  const solvedCount = ref(0);
  const timeLeft = ref(30);
  const maxTime = ref(30);
  const isActive = ref(false);
  const isGameOver = ref(false);
  const hasAnswered = ref(false);
  const newHighscore = ref(false);
  const timerInterval = ref<number | null>(null);

  const gameStore = useGameStore(); // Zugriff auf den globalen GameState

  const timerPercentage = computed(
    () => (timeLeft.value / maxTime.value) * 100,
  );

  const startSurvival = () => {
    const configStore = useConfigStore();
    newHighscore.value = false;

    // Filterung & Shuffle
    const preferred = (allDrawings as Drawing[]).filter((d) =>
      configStore.selectedCategories.includes(d.category),
    );
    const remaining = (allDrawings as Drawing[]).filter(
      (d) => !configStore.selectedCategories.includes(d.category),
    );

    drawings.value = [
      ...[...preferred].sort(() => Math.random() - 0.5),
      ...[...remaining].sort(() => Math.random() - 0.5),
    ];

    solvedCount.value = 0;
    timeLeft.value = 30;
    isGameOver.value = false;
    isActive.value = true;

    setNextDrawing();
    runTimer();
  };

  const setNextDrawing = () => {
    if (drawings.value.length > 0) {
      const next = drawings.value.pop();
      if (next) {
        next.options = generateOptions(next);
        currentDrawing.value = next;
        // WICHTIG: Setze den globalen State auf revealing, damit die View reagiert
        gameStore.setGameState("revealing");
      }
    } else {
      triggerGameOver();
    }
  };

  const generateOptions = (correctDrawing: Drawing): RoundOption[] => {
    const selectedDistractors = (allDrawings as Drawing[])
      .filter((d) => d.name !== correctDrawing.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((d) => ({ title: d.name, isCorrect: false }));

    return [
      ...selectedDistractors,
      { title: correctDrawing.name, isCorrect: true },
    ].sort(() => Math.random() - 0.5);
  };

  const runTimer = () => {
    workerClearInterval(timerInterval.value);
    timerInterval.value = workerSetInterval(() => {
      // NUR abziehen, wenn wir wirklich im Spielprozess sind
      if (gameStore.gameState !== "revealing") return;

      if (timeLeft.value > 0) {
        timeLeft.value--;
        if (timeLeft.value <= 3) useSoundStore().playSound("timer");
      } else {
        triggerGameOver();
      }
    }, 1000);
  };

  const handleCorrectAnswer = () => {
    solvedCount.value++;
    if (solvedCount.value > highscore.value) {
      newHighscore.value = true;
      highscore.value = solvedCount.value;
      saveHighscore();
    }
    addTime(3);
  };

  const handleWrongAnswer = () => {
    useSoundStore().playSound("incorrect");
    reduceTime(5);
  };

  const addTime = (seconds: number) => {
    timeLeft.value = Math.min(maxTime.value, timeLeft.value + seconds);
  };

  const reduceTime = (seconds: number) => {
    timeLeft.value = Math.max(0, timeLeft.value - seconds);
    if (timeLeft.value === 0) triggerGameOver();
  };

  const triggerGameOver = () => {
    if (isGameOver.value) return;
    isActive.value = false;
    isGameOver.value = true;
    gameStore.setGameState("gameover");

    if (timerInterval.value) {
      workerClearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  };

  const saveHighscore = () => {
    localStorage.setItem("survival_highscore", highscore.value.toString());
  };

  const reset = () => {
    workerClearInterval(timerInterval.value);
    timerInterval.value = null;
    isActive.value = false;
    isGameOver.value = false;
    solvedCount.value = 0;
  };

  return {
    drawings,
    currentDrawing,
    highscore,
    newHighscore,
    solvedCount,
    timeLeft,
    isActive,
    isGameOver,
    timerPercentage,
    hasAnswered,
    maxTime,
    startSurvival,
    handleCorrectAnswer,
    handleWrongAnswer,
    setNextDrawing,
    triggerGameOver,
    reset,
  };
});
