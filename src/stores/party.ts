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
import { backoffDelay, hashStringToRange } from "@/utils/realtime";
import type { BuzzerState, PartyPlayer, PartyStatePayload } from "@/types/party";


export const usePartyStore = defineStore("party", () => {
  const channelStore = useChannelStore();
  const gameStore = useGameStore();
  const configStore = useConfigStore();
  const router = useRouter();

  const HEARTBEAT_PERIOD_MS = 15000;
  const HEARTBEAT_JITTER_MS = 6000;
  const HOST_HEARTBEAT_PERIOD_MS = 8000;
  const STALE_AFTER_MS = 20000;
  const STALE_CONFIRM_AFTER_MS = 7000;
  const MAX_RESYNC_ATTEMPTS = 4;

  const BUZZ_RETRY_BASE_MS = 350;
  const BUZZ_RETRY_MAX_MS = 2500;
  const BUZZ_RETRY_MAX_ATTEMPTS = 6;

  const ANSWER_RETRY_BASE_MS = 350;
  const ANSWER_RETRY_MAX_MS = 2500;
  const ANSWER_RETRY_MAX_ATTEMPTS = 6;

  const players = ref<PartyPlayer[]>([]);
  const buzzerState = ref<BuzzerState>("locked");
  const activePlayerId = ref<string | null>(null);
  const answerStartedAt = ref<number | null>(null);
  const hasAnswered = ref(false);
  const isRevealing = ref(true);
  const roundTimeLimit = ref(15);
  const buzzerTimeLimit = ref(15);
  const roundResult = ref<"correct" | "incorrect" | null>(null);
  let buzzerTimer: number | null = null;
  let answerTimer: number | null = null;
  let stateBroadcastInterval: number | null = null;
  let buzzAckTimeout: number | null = null;
  let buzzRetryTimeoutId: number | null = null;
  let heartbeatIntervalId: number | null = null;
  let heartbeatStartTimeoutId: number | null = null;
  let hostHeartbeatIntervalId: number | null = null;
  let staleCheckIntervalId: number | null = null;
  let resyncIntervalId: number | null = null;
  let answerRetryTimeoutId: number | null = null;
  const answerDeadlineAt = ref<number | null>(null);

  const lastHostActivityAt = ref<number>(Date.now());
  const connectionStale = ref(false);
  const playerLastSeen = ref<Record<string, number>>({});
  const staleSuspectedAt = ref<number | null>(null);
  const lastResyncRequestAt = ref<number>(0);
  const nextResyncAt = ref<number>(0);
  const resyncBackoffMs = ref<number>(0);
  const resyncAttempts = ref(0);

  const nextBuzzSeq = ref(1);
  const pendingBuzz = ref<{ seq: number; attempts: number } | null>(null);

  const nextAnswerSeq = ref(1);
  const pendingAnswer = ref<{
    seq: number;
    attempts: number;
    payload: any;
  } | null>(null);

  const markHostActivity = () => {
    lastHostActivityAt.value = Date.now();
    connectionStale.value = false;
    staleSuspectedAt.value = null;
    resyncAttempts.value = 0;
    lastResyncRequestAt.value = 0;
    nextResyncAt.value = 0;
    resyncBackoffMs.value = 0;
  };

  const controllerJitterMs = () =>
    hashStringToRange(String(channelStore.playerId || ""), HEARTBEAT_JITTER_MS);

  const isLightsOut = ref(false);
  const lightsOutUntilAt = ref<number | null>(null);
  const lightsOutByPlayerId = ref<string | null>(null);
  const lightsOutUsedBy = ref<Record<string, boolean>>({});
  let lightsOutTimeoutId: number | null = null;

  const xlzActiveForRoundIndex = ref<number | null>(null);
  const xlzUsedBy = ref<Record<string, boolean>>({});

  const freezeUntilAt = ref<number | null>(null);
  const freezeByPlayerId = ref<string | null>(null);
  const freezeUsedBy = ref<Record<string, boolean>>({});
  const isFrozen = ref(false);
  let freezeTimeoutId: number | null = null;

  const emojiStatistics = ref<string[]>([]);

  const lightsOutUsedByMe = computed(() => {
    const me = channelStore.playerId || "";
    if (!me) return false;
    return Boolean(lightsOutUsedBy.value?.[me]);
  });

  const xlzUsedByMe = computed(() => {
    const me = channelStore.playerId || "";
    if (!me) return false;
    return Boolean(xlzUsedBy.value?.[me]);
  });

  const isXlzActive = computed(
    () => xlzActiveForRoundIndex.value === gameStore.currentRoundIndex,
  );

  const freezeUsedByMe = computed(() => {
    const me = channelStore.playerId || "";
    if (!me) return false;
    return Boolean(freezeUsedBy.value?.[me]);
  });

  const clearFreezeTimeout = () => {
    if (!freezeTimeoutId) return;
    workerClearTimeout(freezeTimeoutId);
    freezeTimeoutId = null;
  };

  const setFreezeUntil = (untilAt: number, byPlayerId: string | null) => {
    const normalizedUntilAt = Math.max(Date.now(), untilAt);
    freezeUntilAt.value = normalizedUntilAt;
    freezeByPlayerId.value = byPlayerId ?? null;

    const me = channelStore.playerId || null;
    // Initiator wird nicht gefreezed, aber Freeze-Zustand bleibt global sichtbar
    isFrozen.value = Boolean(me && byPlayerId && me !== byPlayerId);

    clearFreezeTimeout();
    const delay = Math.max(0, normalizedUntilAt - Date.now());
    freezeTimeoutId = workerSetTimeout(() => {
      freezeTimeoutId = null;
      if (freezeUntilAt.value !== normalizedUntilAt) return;
      isFrozen.value = false;
      freezeUntilAt.value = null;
      freezeByPlayerId.value = null;
    }, delay);
  };

  const clearLightsOutTimeout = () => {
    if (!lightsOutTimeoutId) return;
    workerClearTimeout(lightsOutTimeoutId);
    lightsOutTimeoutId = null;
  };

  const setLightsOutUntil = (untilAt: number, byPlayerId: string | null) => {
    const normalizedUntilAt = Math.max(Date.now(), untilAt);
    isLightsOut.value = true;
    lightsOutUntilAt.value = normalizedUntilAt;
    lightsOutByPlayerId.value = byPlayerId;

    clearLightsOutTimeout();
    const delay = Math.max(0, normalizedUntilAt - Date.now());
    lightsOutTimeoutId = workerSetTimeout(() => {
      lightsOutTimeoutId = null;
      if (lightsOutUntilAt.value !== normalizedUntilAt) return;
      isLightsOut.value = false;
      lightsOutUntilAt.value = null;
      lightsOutByPlayerId.value = null;
    }, delay);
  };

  const triggerLightsOut = () => {
    if (!channel.value) return;
    if (isLightsOut.value) return;
    if (lightsOutUsedByMe.value) return;

    if (!isHost.value) {
      channel.value.trigger("client-party-lightsout-request", {
        playerId: channelStore.playerId,
        ts: Date.now(),
      });
      return;
    }

    const untilAt = Date.now() + 4000;
    const hostId = String(channelStore.playerId || "host");
    setLightsOutUntil(untilAt, hostId);
    channel.value.trigger("client-party-lightsout", { untilAt, byPlayerId: hostId });
  };

  const triggerXlz = () => {
    if (!channel.value) return;
    if (xlzUsedByMe.value) return;
    if (isXlzActive.value) return;

    if (!isHost.value) {
      channel.value.trigger("client-party-xlz-request", {
        playerId: channelStore.playerId,
        ts: Date.now(),
      });
      return;
    }

    const hostId = String(channelStore.playerId || "host");
    xlzUsedBy.value = { ...xlzUsedBy.value, [hostId]: true };
    xlzActiveForRoundIndex.value = gameStore.currentRoundIndex;
    channel.value.trigger("client-party-xlz", {
      roundIndex: gameStore.currentRoundIndex,
    });
    broadcastPartyState("xlz");
  };

  const triggerFreeze = () => {
    if (!channel.value) return;
    if (freezeUsedByMe.value) return;

    if (!isHost.value) {
      channel.value.trigger("client-party-freeze-request", {
        playerId: channelStore.playerId,
        ts: Date.now(),
      });
      return;
    }

    const hostId = String(channelStore.playerId || "host");
    freezeUsedBy.value = { ...freezeUsedBy.value, [hostId]: true };
    const untilAt = Date.now() + 4000;
    // Host friert sich selbst nicht ein (byPlayerId = hostId)
    setFreezeUntil(untilAt, hostId);
    channel.value.trigger("client-party-freeze", { untilAt, byPlayerId: hostId });
    broadcastPartyState("freeze");
  };

  const incrementPlayerPowerupsUsed = (playerId: string) => {
    const player = players.value.find((p) => p.playerId === playerId);
    if (!player) return;
    player.powerupsUsed += 1;
  };

  const incrementPlayerEmojisSent = (playerId: string) => {
    const player = players.value.find((p) => p.playerId === playerId);
    if (!player) return;
    player.emojisSent += 1;
  };

  const activePlayer = computed(() =>
    players.value.find((p) => p.playerId === activePlayerId.value),
  );

  const isHost = computed(() => channelStore.isHost);
  const channel = computed(() => channelStore.activeChannel);
  const eventsBound = ref(false);
  const boundChannel = ref<any>(null);
  let boundIsHost: boolean | null = null;
  const eventBindings: { event: string; handler: (...args: any[]) => void }[] =
    [];

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
    workerClearTimeout(buzzAckTimeout);
    buzzAckTimeout = null;
    workerClearTimeout(buzzRetryTimeoutId);
    buzzRetryTimeoutId = null;
    pendingBuzz.value = null;

    if (heartbeatStartTimeoutId) {
      workerClearTimeout(heartbeatStartTimeoutId);
      heartbeatStartTimeoutId = null;
    }
    if (heartbeatIntervalId) {
      workerClearInterval(heartbeatIntervalId);
      heartbeatIntervalId = null;
    }
    if (hostHeartbeatIntervalId) {
      workerClearInterval(hostHeartbeatIntervalId);
      hostHeartbeatIntervalId = null;
    }
    if (staleCheckIntervalId) {
      workerClearInterval(staleCheckIntervalId);
      staleCheckIntervalId = null;
    }
    if (resyncIntervalId) {
      workerClearInterval(resyncIntervalId);
      resyncIntervalId = null;
    }

    workerClearTimeout(answerRetryTimeoutId);
    answerRetryTimeoutId = null;
    pendingAnswer.value = null;

    clearLightsOutTimeout();
    isLightsOut.value = false;
    lightsOutUntilAt.value = null;
    lightsOutByPlayerId.value = null;
    lightsOutUsedBy.value = {};
    answerStartedAt.value = null;
    xlzActiveForRoundIndex.value = null;
    xlzUsedBy.value = {};
    clearFreezeTimeout();
    isFrozen.value = false;
    freezeUntilAt.value = null;
    freezeByPlayerId.value = null;
    freezeUsedBy.value = {};
    emojiStatistics.value = [];
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
    answerDeadlineAt: answerDeadlineAt.value,
    lightsOutUntilAt: lightsOutUntilAt.value,
    lightsOutByPlayerId: lightsOutByPlayerId.value,
    lightsOutUsedBy: lightsOutUsedBy.value,
    xlzActiveForRoundIndex: xlzActiveForRoundIndex.value,
    xlzUsedBy: xlzUsedBy.value,
    freezeUntilAt: freezeUntilAt.value,
    freezeByPlayerId: freezeByPlayerId.value,
    freezeUsedBy: freezeUsedBy.value,
    playerLastSeen: isHost.value ? playerLastSeen.value : undefined,
    players: players.value,
    roundTimeLimit: roundTimeLimit.value,
    buzzerTimeLimit: buzzerTimeLimit.value,
  });

  const ensureAnswerTimer = () => {
    if (!isHost.value) return;
    if (buzzerState.value !== "answering" || !activePlayerId.value) return;
    if (answerTimer) return;

    const now = Date.now();
    const deadline =
      answerDeadlineAt.value ?? now + roundTimeLimit.value * 1000;
    answerDeadlineAt.value = deadline;

    const delay = Math.max(0, deadline - now);
    answerTimer = workerSetTimeout(() => {
      answerTimer = null;
      if (buzzerState.value === "answering" && activePlayerId.value) {
        resolveAnswer(activePlayerId.value, false);
      }
    }, delay);
  };

  const broadcastPartyState = (reason: string) => {
    if (!isHost.value) return;
    ensureAnswerTimer();
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
        wrongAnswers: p.wrongAnswers,
        correctAnswers: p.correctAnswers,
        quickestAnswer: p.quickestAnswer,
        powerupsUsed: p.powerupsUsed,
        emojisSent: p.emojisSent,
        isDecrypter: p.isDecrypter,
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
        wrongAnswers: 0,
        correctAnswers: 0,
        quickestAnswer: null,
        powerupsUsed: 0,
        emojisSent: 0,
        isDecrypter: false,
      }));

    lightsOutUsedBy.value = {};
    xlzActiveForRoundIndex.value = null;
    xlzUsedBy.value = {};
    isFrozen.value = false;
    freezeUntilAt.value = null;
    freezeByPlayerId.value = null;
    freezeUsedBy.value = {};
    emojiStatistics.value = [];
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
    gameStore.setGameState("revealing");
    buzzerState.value = "open";
    activePlayerId.value = null;
    answerStartedAt.value = null;
    roundResult.value = null;
    hasAnswered.value = false;
    answerDeadlineAt.value = null;

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
    answerStartedAt.value = Date.now();
    if (playerId === channelStore.playerId) hasAnswered.value = false;
    answerDeadlineAt.value = Date.now() + roundTimeLimit.value * 1000;

    channel.value?.trigger("client-party-buzzer-locked", {
      playerId,
      options: gameStore.currentRound?.options,
    });
    broadcastPartyState("buzzer-locked");

    workerClearTimeout(answerTimer);
    answerTimer = null;
    ensureAnswerTimer();
  };

  const handleRoundTimeout = () => {
    if (!isHost.value) return;
    workerClearTimeout(buzzerTimer);
    buzzerTimer = null;
    resolveAnswer(null, false);
  };

  const resolveAnswer = (playerId: string | null, isCorrect: boolean) => {
    workerClearTimeout(answerTimer);
    answerTimer = null;
    answerDeadlineAt.value = null;
    const elapsedMs =
      playerId && typeof answerStartedAt.value === "number"
        ? Math.max(0, Date.now() - answerStartedAt.value)
        : null;
    answerStartedAt.value = null;

    roundResult.value = isCorrect ? "correct" : "incorrect";

    if (!playerId) {
      activePlayerId.value = null;
      hasAnswered.value = false;
    }

    if (playerId) {
      const player = players.value.find((p) => p.playerId === playerId);
      if (player) {
        const isFinalRound = gameStore.currentRoundIndex === configStore.maxRounds - 1;
        const idx = gameStore.currentRoundIndex;
        const max = configStore.maxRounds;
        const isBonusRound =
          (max >= 10 && idx === 4) || (max >= 15 && idx === 9) || (max >= 20 && idx === 14);
        const multiplier = isFinalRound || isBonusRound ? 2 : 1;
        player.points += isCorrect ? 1 * multiplier : -2 * multiplier;
        if (isCorrect) {
          player.correctAnswers += 1;
          if (xlzActiveForRoundIndex.value === gameStore.currentRoundIndex) {
            player.isDecrypter = true;
          }
        } else {
          player.wrongAnswers += 1;
        }
        if (typeof elapsedMs === "number") {
          if (player.quickestAnswer === null || elapsedMs < player.quickestAnswer) {
            player.quickestAnswer = elapsedMs;
          }
        }
      }
    }

    if (isHost.value) {
      isRevealing.value = false;
      channel.value?.trigger("client-party-round-result", {
        playerId,
        isCorrect,
        correctAnswer: gameStore.currentRound?.answer,
      });

      workerSetTimeout(() => {
        buzzerState.value = "locked";
        broadcastPlayerScores();
        broadcastPartyState("round-result-finalized");
      }, 1000);
    }
  };

  const nextRound = () => {
    isRevealing.value = true;
    gameStore.nextRound();
    if (gameStore.isGameOver) {
      endGame();
      return;
    }
    answerDeadlineAt.value = null;
    channel.value?.trigger("client-party-next-round", {
      roundIndex: gameStore.currentRoundIndex,
    });
    broadcastPartyState("next-round");
    openBuzzer();
  };

  const skipRound = () => {
    if (!isHost.value) return;

    channel.value?.trigger("client-party-round-result", {
      playerId: null,
      isCorrect: false,
      correctAnswer: gameStore.currentRound?.answer,
    });

    isRevealing.value = false;
    buzzerState.value = "locked";
    roundResult.value = "incorrect";
    activePlayerId.value = null;
    hasAnswered.value = false;
    answerDeadlineAt.value = null;

    broadcastPlayerScores();
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

    markHostActivity();

    bindEvent("client-join-blocked", (data: { targetId?: string }) => {
      markHostActivity();
      if (data?.targetId && data.targetId !== channelStore.playerId) return;
      channelStore.reset();
      router.push("/");
    });

    bindEvent("client-player-inactive", (data: { playerId: string }) => {
      markHostActivity();
      if (!isHost.value) return;
      players.value = players.value.filter(
        (player) => player.playerId !== data.playerId,
      );
      channelStore.removePlayer(data.playerId);
    });

    bindEvent("client-host-inactive", (data: { playerId: string }) => {
      markHostActivity();
      if (data.playerId === channelStore.playerId) return;
      channelStore.resetConnection?.();
      router.push("/party-player");
    });

    bindEvent("client-party-game-started", (data: any) => {
      markHostActivity();
      channelStore.setGameRunning(true);
      gameStore.prepareGame(data.revealTime, data.rounds);
      router.push("/party-player");
    });

    if (isHost.value) {
      bindEvent(
        "client-party-buzz",
        (data: { playerId: string; seq?: number }) => {
          markHostActivity();
          const canAccept = buzzerState.value === "open";
          handleBuzz(data.playerId);
          if (data?.seq) {
            channel.value?.trigger("client-party-buzz-ack", {
              targetId: data.playerId,
              seq: data.seq,
              accepted: canAccept,
            });
          }
        },
      );

      bindEvent(
        "client-party-answer",
        (data: { playerId: string; isCorrect: boolean; seq?: number }) => {
          markHostActivity();
          if (
            buzzerState.value === "answering" &&
            activePlayerId.value === data.playerId
          ) {
            resolveAnswer(data.playerId, data.isCorrect);
          }
          if (data?.seq) {
            channel.value?.trigger("client-party-answer-ack", {
              targetId: data.playerId,
              seq: data.seq,
            });
          }
        },
      );

      bindEvent("client-party-emoji", (data: { emoji: string; playerId?: string }) => {
        markHostActivity();
        if (isHost.value) {
          if (data?.playerId) incrementPlayerEmojisSent(data.playerId);
          if (data?.emoji) emojiStatistics.value.push(data.emoji);
        }
        window.dispatchEvent(
          new CustomEvent("emoji-received", { detail: data.emoji }),
        );
      });

      bindEvent(
        "client-party-heartbeat",
        (data: { playerId?: string; ts?: number }) => {
          const id = data?.playerId;
          if (!id) return;
          const ts = typeof data.ts === "number" ? data.ts : Date.now();
          playerLastSeen.value[id] = ts;
        },
      );

      bindEvent(
        "client-party-state-request",
        (data: { requestedBy?: string }) => {
          markHostActivity();
          broadcastPartyState(
            `state-request:${data?.requestedBy || "unknown"}`,
          );
        },
      );
    }

    bindEvent("client-party-buzzer-open", () => {
      markHostActivity();
      buzzerState.value = "open";
      roundResult.value = null;
      activePlayerId.value = null;
      hasAnswered.value = false;
      answerDeadlineAt.value = null;
      workerClearTimeout(buzzAckTimeout);
      buzzAckTimeout = null;
      workerClearTimeout(buzzRetryTimeoutId);
      buzzRetryTimeoutId = null;
      pendingBuzz.value = null;
    });

    bindEvent(
      "client-party-buzzer-locked",
      (data: { playerId: string; options?: any[] }) => {
        markHostActivity();
        workerClearTimeout(buzzAckTimeout);
        buzzAckTimeout = null;
        workerClearTimeout(buzzRetryTimeoutId);
        buzzRetryTimeoutId = null;
        pendingBuzz.value = null;
        activePlayerId.value = data.playerId;

        if (data.playerId === channelStore.playerId) {
          buzzerState.value = "answering";
          hasAnswered.value = false;
        } else {
          buzzerState.value = "locked";
        }
      },
    );

    bindEvent(
      "client-party-buzz-ack",
      (data: { targetId?: string; seq?: number; accepted?: boolean }) => {
        if (!data?.targetId || data.targetId !== channelStore.playerId) return;
        if (!pendingBuzz.value) return;
        if (data.seq !== pendingBuzz.value.seq) return;
        workerClearTimeout(buzzRetryTimeoutId);
        buzzRetryTimeoutId = null;
        pendingBuzz.value = null;
      },
    );

    bindEvent(
      "client-party-answer-ack",
      (data: { targetId?: string; seq?: number }) => {
        if (!data?.targetId || data.targetId !== channelStore.playerId) return;
        if (!pendingAnswer.value) return;
        if (data.seq !== pendingAnswer.value.seq) return;
        workerClearTimeout(answerRetryTimeoutId);
        answerRetryTimeoutId = null;
        pendingAnswer.value = null;
      },
    );

    bindEvent("client-party-round-result", (data: any) => {
      markHostActivity();
      roundResult.value = data.isCorrect ? "correct" : "incorrect";
      buzzerState.value = "locked";
      activePlayerId.value = data.playerId;
      answerDeadlineAt.value = null;
    });

    bindEvent(
      "client-party-player-scores",
      (data: { players: PartyPlayer[] }) => {
        players.value = data.players;
      },
    );

    bindEvent("client-party-next-round", () => {
      markHostActivity();
      gameStore.nextRound();
      hasAnswered.value = false;
    });

    bindEvent(
      "client-party-state",
      (data: { state?: PartyStatePayload; reason?: string }) => {
        if (isHost.value) return;
        markHostActivity();
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
        answerDeadlineAt.value =
          typeof state.answerDeadlineAt === "number"
            ? state.answerDeadlineAt
            : null;

        if (typeof state.lightsOutUntilAt === "number") {
          const byPlayerId =
            typeof state.lightsOutByPlayerId === "string"
              ? state.lightsOutByPlayerId
              : null;
          if (state.lightsOutUntilAt > Date.now()) {
            setLightsOutUntil(state.lightsOutUntilAt, byPlayerId);
          } else {
            isLightsOut.value = false;
            lightsOutUntilAt.value = null;
            lightsOutByPlayerId.value = null;
            clearLightsOutTimeout();
          }
        } else if (state.lightsOutUntilAt === null) {
          isLightsOut.value = false;
          lightsOutUntilAt.value = null;
          lightsOutByPlayerId.value = null;
          clearLightsOutTimeout();
        }

        if (state.lightsOutUsedBy && typeof state.lightsOutUsedBy === "object") {
          lightsOutUsedBy.value = state.lightsOutUsedBy;
        }

        if (typeof state.xlzActiveForRoundIndex === "number") {
          xlzActiveForRoundIndex.value = state.xlzActiveForRoundIndex;
        } else if (state.xlzActiveForRoundIndex === null) {
          xlzActiveForRoundIndex.value = null;
        }

        if (state.xlzUsedBy && typeof state.xlzUsedBy === "object") {
          xlzUsedBy.value = state.xlzUsedBy;
        }

        if (typeof state.freezeUntilAt === "number") {
          const byPlayerId =
            typeof state.freezeByPlayerId === "string" ? state.freezeByPlayerId : null;
          if (state.freezeUntilAt > Date.now()) {
            setFreezeUntil(state.freezeUntilAt, byPlayerId);
          } else {
            clearFreezeTimeout();
            isFrozen.value = false;
            freezeUntilAt.value = null;
            freezeByPlayerId.value = null;
          }
        } else if (state.freezeUntilAt === null) {
          clearFreezeTimeout();
          isFrozen.value = false;
          freezeUntilAt.value = null;
          freezeByPlayerId.value = null;
        }

        if (state.freezeUsedBy && typeof state.freezeUsedBy === "object") {
          freezeUsedBy.value = state.freezeUsedBy;
        }
        if (state.playerLastSeen && typeof state.playerLastSeen === "object") {
          playerLastSeen.value = state.playerLastSeen;
        }

        if (
          buzzerState.value !== "answering" ||
          activePlayerId.value !== channelStore.playerId
        ) {
          hasAnswered.value = false;
        }
      },
    );

    bindEvent(
      "client-party-lightsout",
      (data?: { untilAt?: number; byPlayerId?: string }) => {
        const untilAt =
          typeof data?.untilAt === "number" ? data.untilAt : Date.now() + 4000;
        const byPlayerId =
          typeof data?.byPlayerId === "string" ? data.byPlayerId : null;
        setLightsOutUntil(untilAt, byPlayerId);
      },
    );

    bindEvent(
      "client-party-lightsout-request",
      (data?: { playerId?: string; ts?: number }) => {
        if (!isHost.value) return;
        const playerId = data?.playerId;
        if (!playerId) return;
        if (!channelStore.onlineGameRunning) return;
        if (isLightsOut.value) return;
        if (lightsOutUsedBy.value?.[playerId]) return;

        lightsOutUsedBy.value = { ...lightsOutUsedBy.value, [playerId]: true };
        incrementPlayerPowerupsUsed(playerId);
        const untilAt = Date.now() + 4000;
        setLightsOutUntil(untilAt, playerId);
        channel.value?.trigger("client-party-lightsout", { untilAt, byPlayerId: playerId });
        broadcastPartyState("lightsout");
      },
    );

    bindEvent("client-party-xlz", (data?: { roundIndex?: number }) => {
      const roundIndex =
        typeof data?.roundIndex === "number"
          ? data.roundIndex
          : gameStore.currentRoundIndex;
      xlzActiveForRoundIndex.value = roundIndex;
    });

    bindEvent(
      "client-party-freeze",
      (data?: { untilAt?: number; byPlayerId?: string }) => {
        const untilAt =
          typeof data?.untilAt === "number" ? data.untilAt : Date.now() + 4000;
        const byPlayerId =
          typeof data?.byPlayerId === "string" ? data.byPlayerId : null;
        setFreezeUntil(untilAt, byPlayerId);
      },
    );

    bindEvent(
      "client-party-freeze-request",
      (data?: { playerId?: string; ts?: number }) => {
        if (!isHost.value) return;
        const playerId = data?.playerId;
        if (!playerId) return;
        if (!channelStore.onlineGameRunning) return;
        if (freezeUsedBy.value?.[playerId]) return;

        freezeUsedBy.value = { ...freezeUsedBy.value, [playerId]: true };
        incrementPlayerPowerupsUsed(playerId);
        const untilAt = Date.now() + 4000;
        // Initiator wird nicht gefreezed (byPlayerId = playerId)
        setFreezeUntil(untilAt, playerId);
        channel.value?.trigger("client-party-freeze", { untilAt, byPlayerId: playerId });
        broadcastPartyState("freeze");
      },
    );

    bindEvent(
      "client-party-xlz-request",
      (data?: { playerId?: string; ts?: number }) => {
        if (!isHost.value) return;
        const playerId = data?.playerId;
        if (!playerId) return;
        if (!channelStore.onlineGameRunning) return;
        if (xlzUsedBy.value?.[playerId]) return;
        if (xlzActiveForRoundIndex.value === gameStore.currentRoundIndex) return;

        xlzUsedBy.value = { ...xlzUsedBy.value, [playerId]: true };
        incrementPlayerPowerupsUsed(playerId);
        xlzActiveForRoundIndex.value = gameStore.currentRoundIndex;
        channel.value?.trigger("client-party-xlz", {
          roundIndex: gameStore.currentRoundIndex,
        });
        broadcastPartyState("xlz");
      },
    );

    bindEvent("client-party-host-heartbeat", () => {
      if (isHost.value) return;
      markHostActivity();
    });

    clearStateBroadcastInterval();
    if (isHost.value && channelStore.onlineGameRunning) {
      stateBroadcastInterval = workerSetInterval(() => {
        ensureAnswerTimer();
        broadcastPartyState("periodic");
      }, 10000);
    }

    bindEvent("client-party-game-over", (data: { players: PartyPlayer[] }) => {
      markHostActivity();
      players.value = data.players;
      gameStore.isGameOver = true;
      channelStore.setGameRunning(false);
      router.push("/gameover");
    });

    if (!heartbeatIntervalId) {
      const start = () => {
        if (isHost.value || !channelStore.onlineGameRunning) return;
        heartbeatIntervalId = workerSetInterval(() => {
          if (!channelStore.onlineGameRunning) return;
          channel.value?.trigger("client-party-heartbeat", {
            playerId: channelStore.playerId,
            ts: Date.now(),
          });
        }, HEARTBEAT_PERIOD_MS);
      };

      heartbeatStartTimeoutId = workerSetTimeout(start, controllerJitterMs());
    }

    if (!hostHeartbeatIntervalId && isHost.value && channelStore.onlineGameRunning) {
      hostHeartbeatIntervalId = workerSetInterval(() => {
        if (!isHost.value || !channelStore.onlineGameRunning) return;
        channel.value?.trigger("client-party-host-heartbeat", { ts: Date.now() });
      }, HOST_HEARTBEAT_PERIOD_MS);
    }

    if (!staleCheckIntervalId) {
      staleCheckIntervalId = workerSetInterval(() => {
        if (isHost.value) return;
        const age = Date.now() - lastHostActivityAt.value;

        if (age <= STALE_AFTER_MS) {
          connectionStale.value = false;
          staleSuspectedAt.value = null;
          resyncAttempts.value = 0;
          lastResyncRequestAt.value = 0;
          return;
        }

        if (!staleSuspectedAt.value) {
          staleSuspectedAt.value = Date.now();
          resyncAttempts.value = 0;
          lastResyncRequestAt.value = 0;
        }
      }, 1000);
    }

    if (!resyncIntervalId) {
      resyncIntervalId = workerSetInterval(() => {
        if (isHost.value) return;
        if (!staleSuspectedAt.value) return;

        const now = Date.now();
        const age = now - lastHostActivityAt.value;
        if (age <= STALE_AFTER_MS) return;

        if (
          resyncAttempts.value < MAX_RESYNC_ATTEMPTS &&
          now >= nextResyncAt.value
        ) {
          if (!resyncBackoffMs.value) resyncBackoffMs.value = 2000;
          lastResyncRequestAt.value = now;
          resyncAttempts.value++;
          channel.value?.trigger("client-party-state-request", {
            requestedBy: channelStore.playerId,
          });
          const next = Math.min(resyncBackoffMs.value * 2, 20000);
          resyncBackoffMs.value = next;
          nextResyncAt.value = now + next;
        }

        if (
          staleSuspectedAt.value &&
          now - staleSuspectedAt.value >= STALE_CONFIRM_AFTER_MS &&
          age > STALE_AFTER_MS
        ) {
          connectionStale.value = true;
        }
      }, 1000);
    }
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
    const seq = nextBuzzSeq.value++;
    const payload = { playerId: channelStore.playerId, seq };
    pendingBuzz.value = { seq, attempts: 0 };

    const send = () => {
      channel.value?.trigger("client-party-buzz", payload);
    };
    send();

    workerClearTimeout(buzzAckTimeout);
    buzzAckTimeout = workerSetTimeout(() => {
      buzzAckTimeout = null;
      if (buzzerState.value === "open") {
        channel.value?.trigger("client-party-state-request", {
          requestedBy: channelStore.playerId,
        });
      }
    }, 400);

    const retry = () => {
      if (!pendingBuzz.value) return;
      if (buzzerState.value !== "open") {
        pendingBuzz.value = null;
        return;
      }
      if (pendingBuzz.value.attempts >= BUZZ_RETRY_MAX_ATTEMPTS) return;
      pendingBuzz.value.attempts++;
      send();
      const delay = backoffDelay(
        BUZZ_RETRY_BASE_MS,
        pendingBuzz.value.attempts,
        BUZZ_RETRY_MAX_MS,
      );
      buzzRetryTimeoutId = workerSetTimeout(retry, delay);
    };
    workerClearTimeout(buzzRetryTimeoutId);
    buzzRetryTimeoutId = workerSetTimeout(retry, BUZZ_RETRY_BASE_MS);
  };

  const submitAnswer = (
    option: { name: string; isCorrect: boolean } | undefined,
  ) => {
    const seq = nextAnswerSeq.value++;
    const payload = {
      playerId: channelStore.playerId,
      seq,
      answer: option ? option.name : "Time up",
      isCorrect: option ? option.isCorrect : false,
    };
    pendingAnswer.value = { seq, attempts: 0, payload };

    const send = () => channel.value?.trigger("client-party-answer", payload);
    send();

    const retry = () => {
      if (!pendingAnswer.value) return;
      if (pendingAnswer.value.attempts >= ANSWER_RETRY_MAX_ATTEMPTS) return;
      pendingAnswer.value.attempts++;
      send();
      const delay = backoffDelay(
        ANSWER_RETRY_BASE_MS,
        pendingAnswer.value.attempts,
        ANSWER_RETRY_MAX_MS,
      );
      answerRetryTimeoutId = workerSetTimeout(retry, delay);
    };
    workerClearTimeout(answerRetryTimeoutId);
    answerRetryTimeoutId = workerSetTimeout(retry, ANSWER_RETRY_BASE_MS);

    if (isHost.value) {
      resolveAnswer(channelStore.playerId, payload.isCorrect);
    }
  };

  const sendEmoji = (emoji: string) => {
    if (!emoji) return;
    channel.value?.trigger("client-party-emoji", {
      emoji,
      playerId: channelStore.playerId,
    });
  };

  const reset = () => {
    unbindEvents();
    players.value = [];
    buzzerState.value = "locked";
    activePlayerId.value = null;
    answerStartedAt.value = null;
    roundResult.value = null;
    hasAnswered.value = false;
    answerDeadlineAt.value = null;
    channelStore.setGameRunning(false);
    workerClearTimeout(buzzerTimer);
    buzzerTimer = null;
    workerClearTimeout(answerTimer);
    answerTimer = null;
    lightsOutByPlayerId.value = null;
    xlzActiveForRoundIndex.value = null;
    xlzUsedBy.value = {};
    clearFreezeTimeout();
    isFrozen.value = false;
    freezeUntilAt.value = null;
    freezeByPlayerId.value = null;
    freezeUsedBy.value = {};
    emojiStatistics.value = [];
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
    answerDeadlineAt,
    connectionStale,
    playerLastSeen,
    startGame,
    openBuzzer,
    handleBuzz,
    handleRoundTimeout,
    resolveAnswer,
    nextRound,
    endGame,
    pressBuzzer,
    submitAnswer,
    setupEvents,
    sendEmoji,
    pendingBuzz,
    pendingAnswer,
    broadcastPartyState,
    reset,
    isLightsOut,
    lightsOutUntilAt,
    lightsOutByPlayerId,
    lightsOutUsedBy,
    lightsOutUsedByMe,
    triggerLightsOut,
    xlzActiveForRoundIndex,
    xlzUsedBy,
    xlzUsedByMe,
    isXlzActive,
    triggerXlz,
    isFrozen,
    freezeUntilAt,
    freezeByPlayerId,
    freezeUsedBy,
    freezeUsedByMe,
    triggerFreeze,
    emojiStatistics,
  };
});
