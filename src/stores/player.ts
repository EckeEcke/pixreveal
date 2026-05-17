import { ref, type Ref, watch } from "vue";
import { defineStore } from "pinia";
import { getRandomUserName } from "@/utils/random";
import { useConfigStore } from "./config";

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

  const playerName: Ref<string> = ref(savedProfile.name || "");
  const avatarIndex: Ref<number> = ref(savedProfile.avatar ?? 0);
  const points: Ref<number> = ref(0);
  const correctAnswers = ref(0);
  const isCreatorMode = ref(false);

  watch([playerName, avatarIndex], ([newName, newAvatar]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: newName,
        avatar: newAvatar,
      }),
    );
  });

  const setUser = (user: { username: string; avatar: number }) => {
    setPlayerName(user.username);
    setAvatar(user.avatar);
    points.value = 0;
    correctAnswers.value = 0;
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

  return {
    controllerId,
    playerName,
    avatarIndex,
    points,
    correctAnswers,
    isCreatorMode,
    setUser,
    setAvatar,
    addPoints,
  };
});
