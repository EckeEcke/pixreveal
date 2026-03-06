import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import { useGameStore } from "./game";

type Player = {
  playerId: string;
};

export const usePlayerStore = defineStore("player", () => {
  const playerName: Ref<string> = ref('');
  const avatarIndex: Ref<number> = ref(0);
  const points: Ref<number> = ref(0);
  const correctAnswers = ref(0);
  const gameStore = useGameStore();

  const setUser = (user: { username: string; avatar: number }) => {
    playerName.value =
      user.username.length > 0 ? user.username : gameStore.getRandomUserName();
    avatarIndex.value = user.avatar;
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
    setUser,
    addPoints,
  };
});
