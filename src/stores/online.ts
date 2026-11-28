import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useChannelStore } from "./channel";
import { useGameStore } from "./game";
import { usePlayerStore } from "./player";
import { useConfigStore } from "./config";
import { useRouter } from "vue-router";
import type { Player } from "@/types/player";
import type { Round } from "@/types/game";
import { buildOnlineHighlights, compactOnlineHighlightData, type OnlineHighlightData } from "@/utils/onlineHighlights";
import { createRevealSeed } from "@/utils/pixelReveal";

export const useOnlineStore = defineStore("online", () => {
  const channelStore = useChannelStore();
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const configStore = useConfigStore();
  const router = useRouter();
  const onlineGameRunning = ref(false);
  const replayRounds = ref<Round[]>([]);
  const replayNavAllowedUntilAt = ref(0);

  const allowReplayNavigationWindow = (ms = 4000) => {
    replayNavAllowedUntilAt.value = Date.now() + ms;
  };

  const consumeReplayNavigationWindow = () => {
    const ok = replayNavAllowedUntilAt.value > Date.now();
    replayNavAllowedUntilAt.value = 0;
    return ok;
  };

  const resetScoresForNextMatch = () => {
    playerStore.points = 0;
    playerStore.correctAnswers = 0;
    playerStore.answerHistory = [];
    playerStore.onlineHighlights = [];
    playerStore.onlineAnswerSummaries = [];

    channelStore.playersOnline.forEach((p: Player) => {
      p.points = 0;
      p.correctAnswers = 0;
      p.hasFinished = false;
      p.answerHistory = [];
      p.onlineHighlights = [];
      p.onlineAnswerSummaries = [];
      p.bestCorrectHighlight = undefined;
      p.worstIncorrectHighlight = undefined;
    });
  };

  const eventsBound = ref(false);
  const boundChannel = ref<any>(null);

  const applyHighlightData = (player: Player, data: OnlineHighlightData) => {
    Object.assign(player, compactOnlineHighlightData(data));
    player.bestCorrectHighlight = undefined;
    player.worstIncorrectHighlight = undefined;
  };
  const broadcastFinalHighlights = () => {
    if (!channelStore.isHost || !channelStore.activeChannel ||
      !channelStore.playersOnline.filter(player => player.isOnline).every(player => player.hasFinished)) return;
    const selected = new Set(buildOnlineHighlights(channelStore.playersOnline, replayRounds.value).map(slide => slide.key));
    const players = channelStore.playersOnline.map(player => {
      const data = compactOnlineHighlightData(player);
      data.onlineHighlights = data.onlineHighlights.filter(highlight =>
        selected.has(`${player.playerId}-${highlight.roundIndex}`));
      applyHighlightData(player, data);
      return { playerId: player.playerId, ...data };
    });
    channelStore.activeChannel.trigger("client-online-highlights", { players });
  };

  const setupEvents = () => {
    const channel = channelStore.activeChannel;
    if (!channel || channelStore.mode !== "regular") return;
    if (eventsBound.value && boundChannel.value === channel) return;

    boundChannel.value = channel;
    eventsBound.value = true;


    channel.bind("client-game-started", (data: any) => {
      channelStore.setGameRunning(true);
      onlineGameRunning.value = true;
      resetScoresForNextMatch();
      gameStore.prepareGame(data.revealTime, data.rounds);
      replayRounds.value = [...gameStore.rounds];
      allowReplayNavigationWindow();
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
      (data: OnlineHighlightData & {
        playerId: string;
        points: number;
        correctAnswers: number;
        answerHistory: boolean[];
      }) => {
        const player = channelStore.playersOnline.find(
          (p: Player) => p.playerId === data.playerId,
        );
        if (player) {
          player.points = data.points;
          player.hasFinished = true;
          player.correctAnswers = data.correctAnswers;
          player.answerHistory = data.answerHistory;
          applyHighlightData(player, data);
          broadcastFinalHighlights();
        }
      },
    );

    channel.bind(
      "client-online-highlights",
      (data: {
        players?: Array<OnlineHighlightData & {
          playerId: string;
        }>;
      }) => {
        for (const highlightPlayer of data.players ?? []) {
          const player = channelStore.playersOnline.find(
            (candidate) => candidate.playerId === highlightPlayer.playerId,
          );
          if (!player) continue;
          applyHighlightData(player, highlightPlayer);
        }
      },
    );
  };

  const triggerGameStart = () => {
    const channel = channelStore.activeChannel;
    if (!channel) return;
    channelStore.setGameRunning(true);
    onlineGameRunning.value = true;
    allowReplayNavigationWindow();

    // Always (re)build rounds at the moment we broadcast so everyone plays the exact same game.
    // This also ensures lobby setting changes are reflected in the next match.
    resetScoresForNextMatch();
    gameStore.prepareGame(configStore.revealTime);
    gameStore.rounds.forEach((round) => {
      round.revealSeed = createRevealSeed();
    });
    replayRounds.value = [...gameStore.rounds];

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
    const answerHistory = playerStore.answerHistory;
    const highlightData = compactOnlineHighlightData(playerStore);
    if (replayRounds.value.length > 0 && replayRounds.value.every(round => round.revealSeed !== undefined)) {
      highlightData.onlineHighlights = [];
    }
    const me = channelStore.playersOnline.find(
      (p: Player) => p.playerId === channelStore.playerId,
    );

    if (me) {
      me.points = points;
      me.hasFinished = true;
      me.correctAnswers = correctAnswers;
      me.answerHistory = answerHistory
      applyHighlightData(me, highlightData);
    }

    channel.trigger("client-player-finished", {
      playerId: channelStore.playerId,
      points,
      correctAnswers,
      answerHistory,
      ...highlightData,
    });
    broadcastFinalHighlights();
  };

  const stopGame = () => {
    onlineGameRunning.value = false;
    replayRounds.value = [];
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
    replayRounds,
    setupEvents,
    triggerGameStart,
    broadcastScore,
    onlineGameRunning,
    stopGame,
    allowReplayNavigationWindow,
    consumeReplayNavigationWindow,
  };
});
