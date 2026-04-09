// stores/online.ts
import { defineStore } from "pinia";
import { useChannelStore } from "./channel";
import { useGameStore } from "./game";
import { usePlayerStore } from "./player";
import { useConfigStore } from "./config";
import { useRouter } from "vue-router";

export const useOnlineStore = defineStore("online", () => {
  const channelStore = useChannelStore();
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const configStore = useConfigStore();
  const router = useRouter();

  const setupEvents = () => {
    const channel = channelStore.activeChannel;
    if (!channel) return;

    channel.bind("client-game-started", (data: any) => {
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/game");
    });

    channel.bind(
      "client-player-finished",
      (data: { playerId: string; points: number; correctAnswers: number }) => {
        const player = channelStore.playersOnline.find(
          (p) => p.playerId === data.playerId,
        );
        if (player) {
          player.points = data.points;
          player.hasFinished = true;
          player.correctAnswers = data.correctAnswers;
        }
      },
    );
  };

  const triggerGameStart = () => {
    const channel = channelStore.activeChannel;
    if (!channel) return;

    channel.trigger("client-game-started", {
      startedAt: new Date().toISOString(),
      rounds: gameStore.rounds,
      maxRounds: configStore.maxRounds,
      revealTime: gameStore.revealTime,
    });

    router.push("/game");
  };

  const broadcastScore = () => {
    const channel = channelStore.activeChannel;
    if (!channel) return;

    const points = playerStore.points;
    const correctAnswers = playerStore.correctAnswers;
    const me = channelStore.playersOnline.find(
      (p) => p.playerId === channelStore.playerId,
    );

    if (me) {
      me.points = points;
      me.hasFinished = true;
      me.correctAnswers = correctAnswers;
    }

    channel.trigger("client-player-finished", {
      playerId: channelStore.playerId,
      points,
      correctAnswers,
    });
  };

  return {
    setupEvents,
    triggerGameStart,
    broadcastScore,
  };
});
