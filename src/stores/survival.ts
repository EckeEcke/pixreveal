import { ref, computed } from "vue";
import type { Ref } from "vue";
import { defineStore } from "pinia";
import type { Drawing } from "./game";
import allDrawings from "@/data/drawings.json";
import { useSoundStore } from "./sound";

export const useSurvivalStore = defineStore("survival", () => {
  const drawings: Ref<Drawing[]> = ref([]);
  const currentDrawing: Ref<Drawing | undefined> = ref(undefined);
  const highscore = ref(localStorage.getItem("survival_highscore") || "0");
  const solvedCount = ref(0);
  const timeLeft = ref(15);
  const maxTime = ref(30);
  const isActive = ref(false);
  const isGameOver = ref(false);
  const hasAnswered = ref(false);
  const newHighscore = ref(false);
  const timerInterval: Ref<number | undefined> = ref(undefined);

  const timerPercentage = computed(
    () => (timeLeft.value / maxTime.value) * 100,
  );

  const startSurvival = () => {
    drawings.value = [...(allDrawings as Drawing[])].sort(
      () => Math.random() - 0.5,
    );
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

      next!.options = generateOptions(next!);

      currentDrawing.value = next;
    } else {
      triggerGameOver();
    }
  };

  const generateOptions = (correctDrawing: Drawing) => {
    const distractors = allDrawings
      .filter((d) => d.name !== correctDrawing.name)
      .map((d) => ({ name: d.name, isCorrect: false }));

    const selectedDistraktors = distractors
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const finalOptions = [
      ...selectedDistraktors,
      { name: correctDrawing.name, isCorrect: true },
    ];

    return finalOptions.sort(() => Math.random() - 0.5);
  };

  const runTimer = () => {
    if (timerInterval.value) clearInterval(timerInterval.value);

    timerInterval.value = setInterval(() => {
      if (timeLeft.value > 0) {
        if (hasAnswered.value) return;
        timeLeft.value--;
        if (timeLeft.value <= 3) useSoundStore().playSound("timer");
        if (timeLeft.value === 0) triggerGameOver;
      } else {
        triggerGameOver();
      }
    }, 1000);
  };

  const handleCorrectAnswer = () => {
    solvedCount.value++;
    if (solvedCount.value > Number(highscore.value)) {
      newHighscore.value = true;
      highscore.value = solvedCount.value.toString();
    }
    addTime(3);
  };

  const handleWrongAnswer = () => {
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
    isActive.value = false;
    isGameOver.value = true;
    clearInterval(timerInterval.value);
    saveHighscore();
  };

  const saveHighscore = () => {
    const currentBest = localStorage.getItem("survival_highscore") || "0";
    if (solvedCount.value > parseInt(currentBest)) {
      localStorage.setItem("survival_highscore", solvedCount.value.toString());
    }
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
  };
});
