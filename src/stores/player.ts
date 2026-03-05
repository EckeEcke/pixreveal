import { ref, type Ref } from "vue";
import { defineStore } from "pinia";

type Player = {
  playerId: string;
};

export const usePlayerStore = defineStore("player", () => {
  const playerName: Ref<string | undefined> = ref(undefined);
  const avatarIndex: Ref<number | undefined> = ref(undefined);
  const points: Ref<number> = ref(0);
  const playersOnline: Ref<Player[]> = ref([]);
  const correctAnswers = ref(0)

  const setUser = (user: { username: string; avatar: number }) => {
    playerName.value = user.username;
    avatarIndex.value = user.avatar;
    points.value = 0;
  };

  const removePlayer = (memberId: string) => {
    playersOnline.value.filter((p) => p.playerId !== memberId);
  };

  const resetPlayersOnline = () => playersOnline.value = []

  const addPoints = (earnedPoints: number) => {
    points.value += earnedPoints;
    if (earnedPoints > 0) correctAnswers.value++
  };

  return {
    playerName,
    avatarIndex,
    points,
    playersOnline,
    correctAnswers,
    setUser,
    addPoints,
    removePlayer,
    resetPlayersOnline
  };
});
