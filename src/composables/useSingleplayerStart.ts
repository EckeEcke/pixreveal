import { ref } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { useConfigStore } from "@/stores/config";
import { useGameStore } from "@/stores/game";
import { useSurvivalStore } from "@/stores/survival";
import { getRandomUserName } from "@/utils/random";

export function useSingleplayerStart() {
  const router = useRouter();
  const player = usePlayerStore();
  const config = useConfigStore();
  const game = useGameStore();
  const survival = useSurvivalStore();
  const isStarting = ref(false);

  const startSingleplayer = async (mode: string) => {
    if (isStarting.value) return false;
    if (!["classic", "gravity", "inspect", "survival"].includes(mode)) {
      await router.push("/singleplayer");
      return false;
    }

    isStarting.value = true;
    try {
      if (!(await config.ensureUgcReady())) return false;
      survival.reset();
      game.reset();
      player.setUser({
        username: player.playerName || getRandomUserName(),
        avatar: player.avatarIndex,
      });
      player.gameMode = mode;
      if (mode !== "survival") game.prepareGame(config.revealTime);
      // Survival prepares its pool after the countdown in SurvivalView.
      await router.push(`/${mode}`);
      return true;
    } finally {
      isStarting.value = false;
    }
  };

  return { startSingleplayer, isStarting };
}
