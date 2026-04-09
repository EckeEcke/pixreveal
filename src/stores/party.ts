import { defineStore } from "pinia";
import { ref, computed } from "vue";
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

    if (isCorrect) {
      const player = players.value.find((p) => p.playerId === playerId);
      if (player) player.points++;
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
    if (!c) return;

    c.bind("client-party-game-started", (data: any) => {
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/party-player");
    });

    if (isHost.value) {
      c.bind("client-party-buzz", (data: { playerId: string }) => {
        handleBuzz(data.playerId);
      });

      c.bind(
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

    c.bind("client-party-game-started", (data: any) => {
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/party-player");
    });

    c.bind("client-party-buzzer-open", () => {
      buzzerState.value = "open";
      roundResult.value = null;
      activePlayerId.value = null;
    });

    c.bind(
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

    c.bind("client-party-round-result", (data: any) => {
      roundResult.value = data.isCorrect ? "correct" : "incorrect";
      buzzerState.value = "locked";
      activePlayerId.value = data.playerId;
    });

    c.bind("client-party-player-scores", (data: { players: PartyPlayer[] }) => {
      players.value = data.players;
    });

    c.bind("client-party-next-round", () => {
      gameStore.nextRound();
      hasAnswered.value = false;
    });

    c.bind("client-party-game-over", (data: { players: PartyPlayer[] }) => {
      players.value = data.players;
      router.push("/gameover");
    });
  };

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
