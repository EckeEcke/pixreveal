import { ref, type Ref, watch } from "vue";
import { defineStore } from "pinia";
import { getRandomUserName } from "@/utils/random";
import { useConfigStore } from "./config";
import { generatePlayerId } from "@/utils/crypto";
import type { OnlineHighlight } from "@/types/player";

const STORAGE_KEY = "pixreveal:playerProfile";
const CONTROLLER_ID_KEY = "pixreveal:controllerId";

export const usePlayerStore = defineStore("player", () => {
  const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const savedControllerId = sessionStorage.getItem(CONTROLLER_ID_KEY) || "";

  const controllerId: Ref<string> = ref(savedControllerId);
  if (!controllerId.value) {
    controllerId.value = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    sessionStorage.setItem(CONTROLLER_ID_KEY, controllerId.value);
  }

  const playerId: Ref<string> = ref(savedProfile.id || "");
  if (!playerId.value) {
    playerId.value = generatePlayerId();
  }

  const playerName: Ref<string> = ref(savedProfile.name || "");
  const avatarIndex: Ref<number> = ref(savedProfile.avatar ?? 0);
  const points: Ref<number> = ref(0);
  const correctAnswers = ref(0);
  const answerHistory: Ref<boolean[]> = ref([]);
  const onlineHighlights = ref<OnlineHighlight[]>([]);
  const bestCorrectHighlight = ref<OnlineHighlight | null>(null);
  const worstIncorrectHighlight = ref<OnlineHighlight | null>(null);
  const gameMode = ref<
    "classic" | "inspect" | "gravity" | "survival" | string
  >("classic");
  const isCreatorMode: Ref<boolean> = ref(false);

  watch([playerName, avatarIndex, playerId], ([newName, newAvatar, newId]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: newName,
        avatar: newAvatar,
        id: newId,
      }),
    );
  }, { immediate: true });

  const setUser = (user: { username: string; avatar: number }) => {
    setPlayerName(user.username);
    setAvatar(user.avatar);
    points.value = 0;
    correctAnswers.value = 0;
    answerHistory.value = [];
    onlineHighlights.value = [];
    bestCorrectHighlight.value = null;
    worstIncorrectHighlight.value = null;
  };

  const setPlayerName = (newName: string) => {
    playerName.value =
      newName.trim().length > 0
        ? newName
        : playerName.value || getRandomUserName();
  };

  const setAvatar = (newIndex: number) => {
    avatarIndex.value = newIndex ?? 0;
  };

  const addPoints = (earnedPoints: number) => {
    const pointsToAdd = Math.min(earnedPoints, useConfigStore().revealTime);
    points.value += pointsToAdd;
    if (earnedPoints > 0) correctAnswers.value++;
  };

  const pushToAnswerHistory = (isCorrect: boolean) => {
    answerHistory.value.push(isCorrect);
  }

  const recordHighlight = (highlight: OnlineHighlight) => {
    onlineHighlights.value.push(highlight);

    const current = highlight.isCorrect
      ? bestCorrectHighlight.value
      : worstIncorrectHighlight.value;

    if (!current) {
      if (highlight.isCorrect) bestCorrectHighlight.value = highlight;
      else worstIncorrectHighlight.value = highlight;
      return;
    }

    const isBetter = highlight.isCorrect
      ? highlight.elapsedMs < current.elapsedMs ||
        (highlight.elapsedMs === current.elapsedMs &&
          highlight.visiblePixelCount < current.visiblePixelCount)
      : highlight.elapsedMs > current.elapsedMs ||
        (highlight.elapsedMs === current.elapsedMs &&
          highlight.visiblePixelCount > current.visiblePixelCount);

    if (isBetter) {
      if (highlight.isCorrect) bestCorrectHighlight.value = highlight;
      else worstIncorrectHighlight.value = highlight;
    }
  }

  return {
    controllerId,
    playerId,
    playerName,
    avatarIndex,
    points,
    correctAnswers,
    gameMode,
    isCreatorMode,
    answerHistory,
    onlineHighlights,
    bestCorrectHighlight,
    worstIncorrectHighlight,
    setUser,
    setAvatar,
    addPoints,
    pushToAnswerHistory,
    recordHighlight,
  };
});
