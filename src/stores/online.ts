import { defineStore } from "pinia";
import { ref, watch } from "vue";
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

  const eventsBound = ref(false);
  const boundChannel = ref<any>(null);

  const setupEvents = () => {
    const channel = channelStore.activeChannel;
    if (!channel || channelStore.mode !== "regular") return;
    if (eventsBound.value && boundChannel.value === channel) return;

    boundChannel.value = channel;
    eventsBound.value = true;


    channel.bind("client-game-started", (data: any) => {
      channelStore.setGameRunning(true);
      onlineGameRunning.value = true;
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/online");
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

    // Join-blocking is handled centrally in `channelStore` to avoid race conditions.

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
      revealTime: configStore.revealTime,
    });

    router.push("/online");
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

  watch(
    () => [channelStore.mode, channelStore.activeChannel],
    ([mode, channel]) => {
      if (mode !== "regular" || !channel) {
        eventsBound.value = false;
        boundChannel.value = null;
        return;
      }
      setupEvents();
    },
    { immediate: true },
  );

  return {
    setupEvents,
    triggerGameStart,
    broadcastScore,
    onlineGameRunning,
    stopGame,
  };
});
