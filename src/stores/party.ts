import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useChannelStore } from "./channel";
import { useGameStore } from "./game";
import { useConfigStore } from "./config";
import { useRouter } from "vue-router";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";

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
  let buzzerTimer: number | null = null;
  let answerTimer: number | null = null;
  let stateBroadcastInterval: number | null = null;

  type PartyStatePayload = {
    sentAt: number;
    roundIndex: number;
    buzzerState: BuzzerState;
    activePlayerId: string | null;
    players: PartyPlayer[];
    roundTimeLimit: number;
    buzzerTimeLimit: number;
  };

  const activePlayer = computed(() =>
    players.value.find((p) => p.playerId === activePlayerId.value),
  );

  const isHost = computed(() => channelStore.isHost);
const channel = computed(() => channelStore.activeChannel);
const eventsBound = ref(false);
const boundChannel = ref<any>(null);
let boundIsHost: boolean | null = null;
const eventBindings: { event: string; handler: (...args: any[]) => void }[] = [];

const unbindEvents = () => {
  if (!boundChannel.value) return;
  eventBindings.forEach(({ event, handler }) => {
    boundChannel.value.unbind(event, handler);
  });
  eventBindings.length = 0;
  boundChannel.value = null;
  eventsBound.value = false;
  boundIsHost = null;
  if (stateBroadcastInterval) {
    workerClearInterval(stateBroadcastInterval);
    stateBroadcastInterval = null;
  }
};

  const clearStateBroadcastInterval = () => {
    if (!stateBroadcastInterval) return;
    workerClearInterval(stateBroadcastInterval);
    stateBroadcastInterval = null;
  };

  const buildPartyState = (): PartyStatePayload => ({
    sentAt: Date.now(),
    roundIndex: gameStore.currentRoundIndex,
    buzzerState: buzzerState.value,
    activePlayerId: activePlayerId.value,
    players: players.value,
    roundTimeLimit: roundTimeLimit.value,
    buzzerTimeLimit: buzzerTimeLimit.value,
  });

  const broadcastPartyState = (reason: string) => {
    if (!isHost.value) return;
    channel.value?.trigger("client-party-state", {
      reason,
      state: buildPartyState(),
    });
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
      .filter((p) => !p.isHost && p.isOnline)
      .map((p) => ({
        playerId: p.playerId,
        username: p.username,
        avatarIndex: p.avatarIndex,
        points: 0,
      }));

    gameStore.prepareGame(configStore.revealTime);
    channelStore.setGameRunning(true);

    channel.value?.trigger("client-party-game-started", {
      rounds: gameStore.rounds,
      revealTime: configStore.revealTime,
    });

    router.push("/party-host");
    broadcastPlayerScores();
    broadcastPartyState("game-started");
  };

  const openBuzzer = () => {
    buzzerState.value = "open";
    activePlayerId.value = null;
    roundResult.value = null;
    hasAnswered.value = false;

    channel.value?.trigger("client-party-buzzer-open", {});
    broadcastPartyState("buzzer-open");

    workerClearTimeout(buzzerTimer);
    buzzerTimer = workerSetTimeout(() => {
      if (buzzerState.value === "open") skipRound();
    }, buzzerTimeLimit.value * 1000);
  };

  const handleBuzz = (playerId: string) => {
    if (buzzerState.value !== "open") return;

    workerClearTimeout(buzzerTimer);
    buzzerTimer = null;

    buzzerState.value = "answering";
    activePlayerId.value = playerId;
    if (playerId === channelStore.playerId) hasAnswered.value = false;

    channel.value?.trigger("client-party-buzzer-locked", {
      playerId,
      options: gameStore.currentRound?.options,
    });
    broadcastPartyState("buzzer-locked");

    workerClearTimeout(answerTimer);
    answerTimer = workerSetTimeout(() => {
      if (buzzerState.value === "answering") {
        resolveAnswer(playerId, false);
      }
    }, roundTimeLimit.value * 1000);
  };

  const resolveAnswer = (playerId: string, isCorrect: boolean) => {
    workerClearTimeout(answerTimer);
    answerTimer = null;

    roundResult.value = isCorrect ? "correct" : "incorrect";

    const player = players.value.find((p) => p.playerId === playerId);
    if (player) player.points += isCorrect ? 1 : -2;

    if (isCorrect) {
    }

    if (isHost.value) {
      isRevealing.value = false;
    }

    workerSetTimeout(() => {
      channel.value?.trigger("client-party-round-result", {
        playerId,
        isCorrect,
        correctAnswer: gameStore.currentRound?.answer,
      });

      buzzerState.value = "locked";
      broadcastPlayerScores();
      broadcastPartyState("round-result");
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
    broadcastPartyState("next-round");
    openBuzzer();
  };

  const skipRound = () => {
    channel.value?.trigger("client-party-round-result", {
      playerId: null,
      isCorrect: false,
      correctAnswer: gameStore.currentRound?.answer,
    });
    if (isHost.value) {
      isRevealing.value = false;
    }
    buzzerState.value = "locked";
    roundResult.value = "incorrect";
    activePlayerId.value = null;
    hasAnswered.value = false;
    broadcastPartyState("skip-round");
  };

  const endGame = () => {
    gameStore.isGameOver = true;
    channelStore.setGameRunning(false);
    clearStateBroadcastInterval();
    channel.value?.trigger("client-party-game-over", {
      players: players.value,
    });
    broadcastPartyState("game-over");
    router.push("/gameover");
  };

  const setupEvents = () => {
    const c = channel.value;
    if (!c || channelStore.mode !== "party") return;
    if (
      eventsBound.value &&
      boundChannel.value === c &&
      boundIsHost === isHost.value
    )
      return;

    unbindEvents();
    boundChannel.value = c;
    eventsBound.value = true;
    boundIsHost = isHost.value;

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
      channelStore.setGameRunning(true);
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

      bindEvent(
        "client-party-state-request",
        (data: { requestedBy?: string }) => {
          broadcastPartyState(`state-request:${data?.requestedBy || "unknown"}`);
        },
      );
    }

    bindEvent("client-party-buzzer-open", () => {
      buzzerState.value = "open";
      roundResult.value = null;
      activePlayerId.value = null;
      hasAnswered.value = false;
    });

    bindEvent(
      "client-party-buzzer-locked",
      (data: { playerId: string; options?: any[] }) => {
        activePlayerId.value = data.playerId;

        if (data.playerId === channelStore.playerId) {
          buzzerState.value = "answering";
          hasAnswered.value = false;
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

    bindEvent(
      "client-party-state",
      (data: { state?: PartyStatePayload; reason?: string }) => {
        if (isHost.value) return;
        const state = data?.state;
        if (!state) return;

        if (Array.isArray(state.players)) players.value = state.players;
        if (typeof state.roundTimeLimit === "number")
          roundTimeLimit.value = state.roundTimeLimit;
        if (typeof state.buzzerTimeLimit === "number")
          buzzerTimeLimit.value = state.buzzerTimeLimit;

        if (typeof state.roundIndex === "number") {
          gameStore.setRoundIndex(state.roundIndex);
        }

        activePlayerId.value = state.activePlayerId ?? null;
        buzzerState.value = state.buzzerState ?? buzzerState.value;

        if (
          buzzerState.value !== "answering" ||
          activePlayerId.value !== channelStore.playerId
        ) {
          hasAnswered.value = false;
        }
      },
    );

    clearStateBroadcastInterval();
    if (isHost.value && channelStore.onlineGameRunning) {
      stateBroadcastInterval = workerSetInterval(() => {
        broadcastPartyState("periodic");
      }, 3000);
    }

    bindEvent("client-party-game-over", (data: { players: PartyPlayer[] }) => {
      players.value = data.players;
      gameStore.isGameOver = true;
      channelStore.setGameRunning(false);
      router.push("/gameover");
    });
  };

  watch(
    () => [channelStore.mode, channel.value, channelStore.isHost],
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
    hasAnswered.value = false;
    channelStore.setGameRunning(false);
    workerClearTimeout(buzzerTimer);
    buzzerTimer = null;
    workerClearTimeout(answerTimer);
    answerTimer = null;
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
    endGame,
    pressBuzzer,
    submitAnswer,
    setupEvents,
    reset,
  };
});
