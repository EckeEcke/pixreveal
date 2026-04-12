import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useChannelStore } from "./channel";
import { useGameStore } from "./game";
import { useConfigStore } from "./config";
import { useRouter } from "vue-router";

type BuzzerState = "open" | "locked" | "answering";

type PartyPlayer = {
  playerId: string;
  username: string;
  avatarIndex: number;
  points: number;
};

export const usePartyStore = defineStore("party", () => {
  const channelStore = useChannelStore();
  const gameStore = useGameStore();
  const configStore = useConfigStore();
  const router = useRouter();

  const players = ref<PartyPlayer[]>([]);
  const buzzerState = ref<BuzzerState>("locked");
  const activePlayerId = ref<string | null>(null);
  const hasAnswered = ref(false);
  const isRevealing = ref(true);
  const roundTimeLimit = ref(15);
  const buzzerTimeLimit = ref(15);
  const roundResult = ref<"correct" | "incorrect" | null>(null);
  let buzzerTimer: ReturnType<typeof setTimeout> | null = null;
  let answerTimer: ReturnType<typeof setTimeout> | null = null;

  const activePlayer = computed(() =>
    players.value.find((p) => p.playerId === activePlayerId.value),
  );

  const isHost = computed(() => channelStore.isHost);
const channel = computed(() => channelStore.activeChannel);
const eventsBound = ref(false);
const boundChannel = ref<any>(null);
const eventBindings: { event: string; handler: (...args: any[]) => void }[] = [];

const unbindEvents = () => {
  if (!boundChannel.value) return;
  eventBindings.forEach(({ event, handler }) => {
    boundChannel.value.unbind(event, handler);
  });
  eventBindings.length = 0;
  boundChannel.value = null;
  eventsBound.value = false;
};

  const broadcastPlayerScores = () => {
    if (!isHost.value) return;
    channel.value?.trigger("client-party-player-scores", {
      players: players.value.map((p) => ({
        playerId: p.playerId,
        username: p.username,
        avatarIndex: p.avatarIndex,
        points: p.points,
      })),
    });
  };

  const startGame = () => {
    players.value = channelStore.playersOnline
      .filter((p) => !p.isHost)
      .map((p) => ({
        playerId: p.playerId,
        username: p.username,
        avatarIndex: p.avatarIndex,
        points: 0,
      }));

    gameStore.prepareGame(configStore.revealTime);

    channel.value?.trigger("client-party-game-started", {
      rounds: gameStore.rounds,
      revealTime: configStore.revealTime,
    });

    router.push("/party-host");
    broadcastPlayerScores();
  };

  const openBuzzer = () => {
    buzzerState.value = "open";
    activePlayerId.value = null;
    roundResult.value = null;

    channel.value?.trigger("client-party-buzzer-open", {});

    buzzerTimer = setTimeout(() => {
      if (buzzerState.value === "open") skipRound();
    }, buzzerTimeLimit.value * 1000);
  };

  const handleBuzz = (playerId: string) => {
    if (buzzerState.value !== "open") return;

    if (buzzerTimer) {
      clearTimeout(buzzerTimer);
      buzzerTimer = null;
    }

    buzzerState.value = "answering";
    activePlayerId.value = playerId;

    channel.value?.trigger("client-party-buzzer-locked", {
      playerId,
      options: gameStore.currentRound.options,
    });

    if (answerTimer) clearTimeout(answerTimer);
    answerTimer = setTimeout(() => {
      if (buzzerState.value === "answering") {
        resolveAnswer(playerId, false);
      }
    }, roundTimeLimit.value * 1000);
  };

  const resolveAnswer = (playerId: string, isCorrect: boolean) => {
    if (answerTimer) clearTimeout(answerTimer);

    roundResult.value = isCorrect ? "correct" : "incorrect";

    const player = players.value.find((p) => p.playerId === playerId);
    if (player) player.points += isCorrect ? 1 : -2;

    if (isCorrect) {
    }

    if (isHost.value) {
      isRevealing.value = false;
    }

    setTimeout(() => {
      channel.value?.trigger("client-party-round-result", {
        playerId,
        isCorrect,
        correctAnswer: gameStore.currentRound.answer,
      });

      buzzerState.value = "locked";
      broadcastPlayerScores();
    }, 1000);
  };

  const nextRound = () => {
    isRevealing.value = true;
    gameStore.nextRound();
    if (gameStore.isGameOver) {
      endGame();
      return;
    }
    channel.value?.trigger("client-party-next-round", {
      roundIndex: gameStore.currentRoundIndex,
    });
    openBuzzer();
  };

  const skipRound = () => {
    channel.value?.trigger("client-party-round-result", {
      playerId: null,
      isCorrect: false,
      correctAnswer: gameStore.currentRound.answer,
    });
    if (isHost.value) {
      isRevealing.value = false;
    }
    buzzerState.value = "locked";
    roundResult.value = "incorrect";
  };

  const endGame = () => {
    gameStore.isGameOver = true;
    channel.value?.trigger("client-party-game-over", {
      players: players.value,
    });
    router.push("/gameover");
  };

  const setupEvents = () => {
    const c = channel.value;
    if (!c || channelStore.mode !== "party") return;
    if (eventsBound.value && boundChannel.value === c) return;

    unbindEvents();
    boundChannel.value = c;
    eventsBound.value = true;

    const bindEvent = (name: string, handler: (...args: any[]) => void) => {
      c.bind(name, handler);
      eventBindings.push({ event: name, handler });
    };

    bindEvent("client-join-blocked", () => {
      channelStore.reset();
      router.push("/");
    });

    bindEvent("client-player-inactive", (data: { playerId: string }) => {
      if (!isHost.value) return;
      players.value = players.value.filter(
        (player) => player.playerId !== data.playerId,
      );
      channelStore.removePlayer(data.playerId);
    });

    bindEvent("client-host-inactive", (data: { playerId: string }) => {
      if (data.playerId === channelStore.playerId) return;
      channelStore.reset();
      router.push("/");
    });

    bindEvent("client-party-game-started", (data: any) => {
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/party-player");
    });

    if (isHost.value) {
      bindEvent("client-party-buzz", (data: { playerId: string }) => {
        handleBuzz(data.playerId);
      });

      bindEvent(
        "client-party-answer",
        (data: { playerId: string; isCorrect: boolean }) => {
          if (
            buzzerState.value === "answering" &&
            activePlayerId.value === data.playerId
          ) {
            resolveAnswer(data.playerId, data.isCorrect);
          }
        },
      );
    }

    bindEvent("client-party-buzzer-open", () => {
      buzzerState.value = "open";
      roundResult.value = null;
      activePlayerId.value = null;
    });

    bindEvent(
      "client-party-buzzer-locked",
      (data: { playerId: string; options?: any[] }) => {
        activePlayerId.value = data.playerId;

        if (data.playerId === channelStore.playerId) {
          buzzerState.value = "answering";
        } else {
          buzzerState.value = "locked";
        }
      },
    );

    bindEvent("client-party-round-result", (data: any) => {
      roundResult.value = data.isCorrect ? "correct" : "incorrect";
      buzzerState.value = "locked";
      activePlayerId.value = data.playerId;
    });

    bindEvent("client-party-player-scores", (data: { players: PartyPlayer[] }) => {
      players.value = data.players;
    });

    bindEvent("client-party-next-round", () => {
      gameStore.nextRound();
      hasAnswered.value = false;
    });

    bindEvent("client-party-game-over", (data: { players: PartyPlayer[] }) => {
      players.value = data.players;
      router.push("/gameover");
    });
  };

  watch(
    () => [channelStore.mode, channel.value],
    ([mode, c]) => {
      if (mode !== "party" || !c) {
        unbindEvents();
        return;
      }
      setupEvents();
    },
    { immediate: true },
  );

  const pressBuzzer = () => {
    if (buzzerState.value !== "open") return;
    channel.value?.trigger("client-party-buzz", {
      playerId: channelStore.playerId,
    });
  };

  const submitAnswer = (
    option: { name: string; isCorrect: boolean } | undefined,
  ) => {
    if (!option) {
      channel.value?.trigger("client-party-answer", {
        playerId: channelStore.playerId,
        answer: "Time up",
        isCorrect: false,
      });
      return;
    }
    channel.value?.trigger("client-party-answer", {
      playerId: channelStore.playerId,
      answer: option.name,
      isCorrect: option.isCorrect,
    });

    if (isHost.value) {
      resolveAnswer(channelStore.playerId, option.isCorrect);
    }
  };

  const reset = () => {
    unbindEvents();
    players.value = [];
    buzzerState.value = "locked";
    activePlayerId.value = null;
    roundResult.value = null;
    if (buzzerTimer) clearTimeout(buzzerTimer);
    if (answerTimer) clearTimeout(answerTimer);
  };

  return {
    players,
    buzzerState,
    activePlayerId,
    activePlayer,
    roundResult,
    isRevealing,
    roundTimeLimit,
    buzzerTimeLimit,
    hasAnswered,
    startGame,
    openBuzzer,
    handleBuzz,
    resolveAnswer,
    nextRound,
    pressBuzzer,
    submitAnswer,
    setupEvents,
    reset,
  };
});
