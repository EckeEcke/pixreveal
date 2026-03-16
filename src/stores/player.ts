import { computed, ref, type Ref } from "vue";
import { defineStore } from "pinia";
import { getRandomUserName } from "@/utils/random";

type Player = {
  playerId: string;
};

export const usePlayerStore = defineStore("player", () => {
  const playerName: Ref<string> = ref("");
  const avatarIndex: Ref<number> = ref(0);
  const points: Ref<number> = ref(0);
  const correctAnswers = ref(0);
  const gameMode: Ref<"classic" | "survival" | undefined> = ref(undefined);
  const isCreatorMode = ref(false);

  const setUser = (user: { username: string; avatar: number }) => {
    playerName.value =
      user && user.username.length > 0 ? user.username : getRandomUserName();
    avatarIndex.value = user ? user.avatar : 0;
    points.value = 0;
    correctAnswers.value = 0;
  };

  const addPoints = (earnedPoints: number) => {
    points.value += earnedPoints;
    if (earnedPoints > 0) correctAnswers.value++;
  };

  return {
    playerName,
    avatarIndex,
    points,
    correctAnswers,
    isCreatorMode,
    setUser,
    addPoints,
  };
});
