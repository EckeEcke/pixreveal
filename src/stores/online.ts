// stores/online.ts
import { defineStore } from "pinia";
import { ref } from "vue";
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
  const onlineGameRunning = ref(false);

  const setupEvents = () => {
    const channel = channelStore.activeChannel;
    if (!channel) return;

    channel.bind("client-game-started", (data: any) => {
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/game");
    });

    channel.bind(
      "client-player-inactive",
      (data: { playerId: string; playerName?: string }) => {
        if (!channelStore.isHost) return;
        channelStore.removePlayer(data.playerId);
        channel.trigger("client-join-blocked", {
          targetId: data.playerId,
        });
      },
    );

    channel.bind("client-host-inactive", (data: { playerId: string }) => {
      if (data.playerId === channelStore.playerId) return;
      channelStore.reset();
      router.push("/");
    });

    channel.bind("client-join-blocked", (data: { targetId: string }) => {
      if (data.targetId !== channelStore.playerId) return;
      channelStore.reset();
      router.push("/");
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
    channelStore.setGameRunning(true);
    onlineGameRunning.value = true;

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

  const stopGame = () => {
    onlineGameRunning.value = false;
    channelStore.setGameRunning(false);
  };

  return {
    setupEvents,
    triggerGameStart,
    broadcastScore,
    onlineGameRunning,
    stopGame,
  };
});
