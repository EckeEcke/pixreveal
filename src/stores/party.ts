import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import { useChannelStore } from "./channel"
import { useGameStore } from "./game"
import { useSoundStore } from "./sound"
import type { Round } from "@/types/game"
import { useConfigStore } from "./config"
import { useRouter } from "vue-router"
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers"
import type {
  BuzzerState,
  PartyPlayer,
  PartyStatePayload,
} from "@/types/party"
import type { Player } from "@/types/player"
import { usePowerups } from "@/composables/usePowerups"
import { useBuzzerRetry } from "@/composables/useBuzzerRetry"
import { useAnswerRetry } from "@/composables/useAnswerRetry"
import { usePartyHeartbeat } from "@/composables/usePartyHeartbeat"
import { useSuddenDeath } from "@/composables/useSuddenDeath"

export const usePartyStore = defineStore("party", () => {
  const channelStore = useChannelStore()
  const gameStore = useGameStore()
  const soundStore = useSoundStore()
  const configStore = useConfigStore()
  const router = useRouter()

  // ─── Core state ─────────────────────────────────────────────────────────────

  const players = ref<PartyPlayer[]>([])
  const buzzerState = ref<BuzzerState>("locked")
  const activePlayerId = ref<string | null>(null)
  const answerStartedAt = ref<number | null>(null)
  const hasAnswered = ref(false)
  const isRevealing = ref(true)
  const roundTimeLimit = ref(15)
  const buzzerTimeLimit = ref(15)
  const roundResult = ref<"correct" | "incorrect" | null>(null)
  const answerDeadlineAt = ref<number | null>(null)
  const buzzTransitionPending = ref(false)
  const buzzedPlayerIds = ref<string[]>([])
  const emojiStatistics = ref<string[]>([])
  const replayNavAllowedUntilAt = ref<number>(0)

  let buzzerTimer: number | null = null
  let answerTimer: number | null = null
  let stateBroadcastInterval: number | null = null

  // ─── Derived ────────────────────────────────────────────────────────────────

  const isHost = computed(() => channelStore.isHost)
  const channel = computed(() => channelStore.activeChannel)

  const activePlayer = computed(() =>
    players.value.find((p) => p.playerId === activePlayerId.value)
  )

  // ─── Player helpers ──────────────────────────────────────────────────────────

  const incrementPlayerPowerupsUsed = (playerId: string) => {
    const player = players.value.find((p) => p.playerId === playerId)
    if (player) {
      player.powerupsUsed += 1
      broadcastPlayerScores()
    }
  }

  const incrementPlayerEmojisSent = (playerId: string) => {
    const player = players.value.find((p) => p.playerId === playerId)
    if (player) player.emojisSent += 1
  }

  // ─── Composables ────────────────────────────────────────────────────────────

  const heartbeat = usePartyHeartbeat({
    getPlayerId: () => channelStore.playerId,
    getIsHost: () => isHost.value,
    getChannel: () => channel.value,
    getOnlineGameRunning: () => channelStore.onlineGameRunning,
  })

  const powerups = usePowerups({
    getPlayerId: () => channelStore.playerId,
    getIsHost: () => isHost.value,
    getChannel: () => channel.value,
    getCurrentRoundIndex: () => gameStore.currentRoundIndex,
    getOnlineGameRunning: () => channelStore.onlineGameRunning,
    onBroadcastPartyState: (reason) => broadcastPartyState(reason),
    onIncrementPowerupsUsed: (playerId) =>
      incrementPlayerPowerupsUsed(playerId),
  })

  const buzzerRetry = useBuzzerRetry({
    getPlayerId: () => channelStore.playerId,
    getChannel: () => channel.value,
    getBuzzerState: () => buzzerState.value,
  })

  const answerRetry = useAnswerRetry({
    getPlayerId: () => channelStore.playerId,
    getChannel: () => channel.value,
    getIsHost: () => isHost.value,
    onResolveAnswer: (playerId, isCorrect) =>
      resolveAnswer(playerId, isCorrect),
  })

  const suddenDeath = useSuddenDeath({
    getChannel: () => channel.value,
    getCurrentRoundIndex: () => gameStore.currentRoundIndex,
    getCurrentRound: () => gameStore.currentRound,
    getPlayers: () => players.value,
    onAddSuddenDeathRound: () => gameStore.addSuddenDeathRound(),
    onOpenBuzzer: () => openBuzzer(),
    onBroadcastPartyState: (reason) => broadcastPartyState(reason),
    setIsRevealing: (v) => {
      isRevealing.value = v
    },
    setAnswerDeadlineAt: (v) => {
      answerDeadlineAt.value = v
    },
  })

  // ─── Replay navigation window ────────────────────────────────────────────────

  const allowReplayNavigationWindow = (ms = 4000) => {
    replayNavAllowedUntilAt.value = Date.now() + ms
  }

  const consumeReplayNavigationWindow = () => {
    const ok = replayNavAllowedUntilAt.value > Date.now()
    replayNavAllowedUntilAt.value = 0
    return ok
  }

  // ─── Powerup award (last place, random) ──────────────────────────────────────

  const awardPowerupToLastPlace = () => {
    if (!isHost.value) return;
    if (players.value.length === 0) return;

    const minPoints = Math.min(...players.value.map((p) => p.points));
    const candidates = players.value.filter((p) => p.points === minPoints);
    if (candidates.length === 0) return;

    const chosen =
      candidates[Math.floor(Math.random() * candidates.length)];
    if (!chosen) return;

    const awardId = `${gameStore.currentRoundIndex}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    channel.value?.trigger("client-party-powerup-award", {
      targetPlayerId: chosen.playerId,
      awardId,
    });
  };

  // ─── Party state ─────────────────────────────────────────────────────────────

  const buildPartyState = (): PartyStatePayload => ({
    sentAt: Date.now(),
    roundIndex: gameStore.currentRoundIndex,
    buzzerState: buzzerState.value,
    activePlayerId: activePlayerId.value,
    answerDeadlineAt: answerDeadlineAt.value,
    buzzTransitionPending: buzzTransitionPending.value,
    lightsOutUntilAt: powerups.lightsOutUntilAt?.value ?? null,
    lightsOutByPlayerId: powerups.lightsOutByPlayerId?.value ?? null,
    lightsOutUsedBy: powerups.lightsOutUsedBy?.value ?? {},
    xlzCharges: powerups.xlzCharges?.value ?? 0,
    xlzByPlayerId: powerups.xlzByPlayerId?.value ?? null,
    xlzUsedBy: powerups.xlzUsedBy?.value ?? {},
    devilCharges: powerups.devilCharges?.value ?? 0,
    devilByPlayerId: powerups.devilByPlayerId?.value ?? null,
    devilUsedBy: powerups.devilUsedBy?.value ?? {},
    freezeUntilAt: powerups.freezeUntilAt?.value ?? null,
    freezeByPlayerId: powerups.freezeByPlayerId?.value ?? null,
    freezeUsedBy: powerups.freezeUsedBy?.value ?? {},
    upsideDownUntilAt: powerups.upsideDownUntilAt?.value ?? null,
    upsideDownByPlayerId: powerups.upsideDownByPlayerId?.value ?? null,
    upsideDownUsedBy: powerups.upsideDownUsedBy?.value ?? {},
    fartCharges: powerups.fartCharges?.value ?? 0,
    fartByPlayerId: powerups.fartByPlayerId?.value ?? null,
    fartUsedBy: powerups.fartUsedBy?.value ?? {},
    playerLastSeen: isHost.value ? heartbeat.playerLastSeen?.value : undefined,
    players: players.value,
    roundTimeLimit: roundTimeLimit.value,
    buzzerTimeLimit: buzzerTimeLimit.value,
    isSuddenDeath: suddenDeath.isSuddenDeath?.value ?? false,
    suddenDeathPlayerIds: suddenDeath.suddenDeathPlayerIds?.value ?? [],
    buzzedPlayerIds: buzzedPlayerIds.value,
  })

  const ensureAnswerTimer = () => {
    if (!isHost.value) return
    if (buzzerState.value !== "answering" || !activePlayerId.value) return
    if (buzzTransitionPending.value) return
    if (answerTimer) return

    const now = Date.now()
    const deadline =
      answerDeadlineAt.value ?? now + roundTimeLimit.value * 1000
    answerDeadlineAt.value = deadline

    const delay = Math.max(0, deadline - now)
    answerTimer = workerSetTimeout(() => {
      answerTimer = null
      if (buzzerState.value === "answering" && activePlayerId.value) {
        resolveAnswer(activePlayerId.value, false)
      }
    }, delay)
  }

  const broadcastPartyState = (reason: string) => {
    if (!isHost.value) return
    ensureAnswerTimer()
    channel.value?.trigger("client-party-state", {
      reason,
      state: buildPartyState(),
    })
  }

  const broadcastPlayerScores = () => {
    if (!isHost.value) return
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
        devilVictim: p.devilVictim,
        devilSurvivor: p.devilSurvivor,
      })),
    })
  }

  // ─── Game flow ───────────────────────────────────────────────────────────────

  const startGame = () => {
    players.value = channelStore.playersOnline
      .filter((p: Player) => !p.isHost && p.isOnline)
      .map((p: Player) => ({
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
        devilVictim: false,
        devilSurvivor: false,
      }))

    powerups.reset()
    emojiStatistics.value = []
    gameStore.prepareGame(configStore.revealTime)
    channelStore.setGameRunning(true)

    channel.value?.trigger("client-party-game-started", {
      rounds: gameStore.rounds,
      revealTime: configStore.revealTime,
    })

    router.push("/party-host")
    broadcastPlayerScores()
    broadcastPartyState("game-started")
  }

  const openBuzzer = () => {
    gameStore.setGameState("revealing")
    buzzerState.value = "open"
    activePlayerId.value = null
    answerStartedAt.value = null
    buzzTransitionPending.value = false
    roundResult.value = null
    hasAnswered.value = false
    answerDeadlineAt.value = null
    buzzedPlayerIds.value = []

    channel.value?.trigger("client-party-buzzer-open", {})
    broadcastPartyState("buzzer-open")

    if (buzzerTimer) workerClearTimeout(buzzerTimer)
    buzzerTimer = workerSetTimeout(() => {
      if (buzzerState.value === "open") skipRound()
    }, buzzerTimeLimit.value * 1000)
  }

  const handleBuzz = (playerId: string) => {
    if (buzzerState.value !== "open") return

    if (buzzerTimer) {
      workerClearTimeout(buzzerTimer)
      buzzerTimer = null
    }

    buzzerState.value = "answering"
    activePlayerId.value = playerId
    buzzTransitionPending.value = true
    answerStartedAt.value = null
    answerDeadlineAt.value = null

    channel.value?.trigger("client-party-buzzer-locked", {
      playerId,
      options: gameStore.currentRound?.options,
    })
    broadcastPartyState("buzzer-locked")
  }

  const startAnswerPhase = () => {
    if (!isHost.value) return
    if (!buzzTransitionPending.value) return
    if (!activePlayerId.value) return

    buzzTransitionPending.value = false
    answerStartedAt.value = Date.now()
    answerDeadlineAt.value = Date.now() + roundTimeLimit.value * 1000
    if (activePlayerId.value === channelStore.playerId)
      hasAnswered.value = false

    if (answerTimer) {
      workerClearTimeout(answerTimer)
      answerTimer = null
    }
    ensureAnswerTimer()
    broadcastPartyState("buzzer-answer-started")
  }

  const handleRoundTimeout = () => {
    if (!isHost.value) return
    if (buzzerTimer) {
      workerClearTimeout(buzzerTimer)
      buzzerTimer = null
    }
    resolveAnswer(null, false)
  }

  const resolveAnswer = (playerId: string | null, isCorrect: boolean) => {
    if (roundResult.value !== null) return
    if (answerTimer) {
      workerClearTimeout(answerTimer)
      answerTimer = null
    }
    answerDeadlineAt.value = null

    const elapsedMs =
      playerId && typeof answerStartedAt.value === "number"
        ? Math.max(0, Date.now() - answerStartedAt.value)
        : null
    answerStartedAt.value = null

    const remainingPlayers = playerId
      ? players.value.filter(
          (p) =>
            p.playerId !== playerId &&
            !buzzedPlayerIds.value.includes(p.playerId)
        )
      : []
    const shouldReopenBuzzer =
      !isCorrect && playerId !== null && remainingPlayers.length > 0

    if (shouldReopenBuzzer && playerId) {
      buzzedPlayerIds.value = Array.from(
        new Set([...buzzedPlayerIds.value, playerId])
      )
    }

    if (!shouldReopenBuzzer) {
      roundResult.value = isCorrect ? "correct" : "incorrect"
    } else {
      roundResult.value = null
    }

    if (!playerId) {
      activePlayerId.value = null
      hasAnswered.value = false
    }

    if (playerId) {
      const player = players.value.find((p) => p.playerId === playerId)
      if (player) {
        const isFinalRound =
          gameStore.currentRoundIndex === configStore.maxRounds - 1
        const idx = gameStore.currentRoundIndex
        const max = configStore.maxRounds
        const isBonusRound =
          (max >= 10 && idx === 4) ||
          (max >= 15 && idx === 9) ||
          (max >= 20 && idx === 14)
        const multiplier = isFinalRound || isBonusRound ? 2 : 1

        player.points += isCorrect ? 1 * multiplier : -2 * multiplier

        if (isCorrect) {
          player.correctAnswers += 1
          if (powerups.isXlzActive?.value) player.isDecrypter = true
          if (powerups.isDevilActive?.value) player.devilSurvivor = true
        } else {
          player.wrongAnswers += 1
          if (powerups.isDevilActive?.value) player.devilVictim = true
          if (suddenDeath.isSuddenDeath?.value) {
            suddenDeath.eliminatePlayer(playerId)
          }
        }

        if (typeof elapsedMs === "number") {
          if (
            player.quickestAnswer === null ||
            elapsedMs < player.quickestAnswer
          ) {
            player.quickestAnswer = elapsedMs
          }
        }

        powerups.consumeXlzCharge()
        powerups.consumeDevilCharge()
        powerups.consumeFartCharge(playerId)
      }
    }

    if (isHost.value) {
      if (shouldReopenBuzzer) {
        activePlayerId.value = null
        buzzerState.value = "open"
        answerStartedAt.value = null
        answerDeadlineAt.value = null
        hasAnswered.value = false

        channel.value?.trigger("client-party-buzzer-open", {})
        if (buzzerTimer) workerClearTimeout(buzzerTimer)
        buzzerTimer = workerSetTimeout(() => {
          if (buzzerState.value === "open") skipRound()
        }, buzzerTimeLimit.value * 1000)
        soundStore.playSound("partyIncorrect")
        broadcastPartyState("buzzer-reopen")
      } else {
        isRevealing.value = false
        channel.value?.trigger("client-party-round-result", {
          playerId,
          isCorrect,
          correctAnswer: gameStore.currentRound?.answer,
        })

        workerSetTimeout(() => {
          buzzerState.value = "locked"
          broadcastPlayerScores()
          awardPowerupToLastPlace()
          broadcastPartyState("round-result-finalized")
        }, 1000)
      }
    }
  }

  const nextRound = () => {
    isRevealing.value = true
    gameStore.nextRound()
    if (gameStore.isGameOver) {
      endGame()
      return
    }
    answerDeadlineAt.value = null
    channel.value?.trigger("client-party-next-round", {
      roundIndex: gameStore.currentRoundIndex,
    })
    broadcastPartyState("next-round")
    openBuzzer()
  }

  const skipRound = () => {
    if (!isHost.value) return

    channel.value?.trigger("client-party-round-result", {
      playerId: null,
      isCorrect: false,
      correctAnswer: gameStore.currentRound?.answer,
    })

    isRevealing.value = false
    buzzerState.value = "locked"
    roundResult.value = "incorrect"
    activePlayerId.value = null
    hasAnswered.value = false
    answerDeadlineAt.value = null

    broadcastPlayerScores()
    awardPowerupToLastPlace();
    broadcastPartyState("skip-round")
  }

  const endGame = () => {
    gameStore.isGameOver = true
    channelStore.setGameRunning(false)
    if (stateBroadcastInterval) {
      workerClearInterval(stateBroadcastInterval)
      stateBroadcastInterval = null
    }
    channel.value?.trigger("client-party-game-over", {
      players: players.value,
    })
    broadcastPartyState("game-over")
    router.push("/gameover-party")
  }

  const sendEmoji = (emoji: string) => {
    if (!emoji) return
    channel.value?.trigger("client-party-emoji", {
      emoji,
      playerId: channelStore.playerId,
    })
  }

  // ─── Event binding ───────────────────────────────────────────────────────────

  const eventsBound = ref(false)
  const boundChannel = ref<any>(null)
  let boundIsHost: boolean | null = null
  const eventBindings: { event: string; handler: (...args: any[]) => void }[] =
    []

  const unbindEvents = () => {
    if (!boundChannel.value) return
    eventBindings.forEach(({ event, handler }) =>
      boundChannel.value.unbind(event, handler)
    )
    eventBindings.length = 0
    boundChannel.value = null
    eventsBound.value = false
    boundIsHost = null

    if (stateBroadcastInterval) {
      workerClearInterval(stateBroadcastInterval)
      stateBroadcastInterval = null
    }

    buzzerRetry.reset()
    answerRetry.reset()
    heartbeat.stop()

    isRevealing.value = true
  }

  const setupEvents = () => {
    const c = channel.value
    if (!c || channelStore.mode !== "party") return
    if (
      eventsBound.value &&
      boundChannel.value === c &&
      boundIsHost === isHost.value
    )
      return

    unbindEvents()
    boundChannel.value = c
    eventsBound.value = true
    boundIsHost = isHost.value

    const bindEvent = (name: string, handler: (...args: any[]) => void) => {
      c.bind(name, handler)
      eventBindings.push({ event: name, handler })
    }

    heartbeat.markHostActivity()
    heartbeat.start()

    // ── Shared events (Host & Clients) ─────────────────────────────────────────

    bindEvent("client-player-inactive", (data: { playerId: string }) => {
      heartbeat.markHostActivity()
      if (!isHost.value) return
      players.value = players.value.filter((p) => p.playerId !== data.playerId)
      channelStore.removePlayer(data.playerId)
    })

    bindEvent("client-host-inactive", (data: { playerId: string }) => {
      heartbeat.markHostActivity()
      if (data.playerId === channelStore.playerId) return
      reset({ keepEvents: true })
      channelStore.reset?.()
      router.push("/")
    })

    bindEvent("client-party-game-started", (data: any) => {
      heartbeat.markHostActivity()
      channelStore.setGameRunning(true)
      gameStore.prepareGame(data.revealTime, data.rounds)
      allowReplayNavigationWindow()
      router.push("/party-player")
    })

    bindEvent("client-party-buzzer-open", () => {
      heartbeat.markHostActivity()
      buzzerState.value = "open"
      roundResult.value = null
      activePlayerId.value = null
      hasAnswered.value = false
      answerDeadlineAt.value = null
      buzzerRetry.handleBuzzerOpen()
    })

    bindEvent(
      "client-party-buzzer-locked",
      (data: { playerId: string; options?: any[] }) => {
        heartbeat.markHostActivity()
        buzzerRetry.handleBuzzerOpen()
        activePlayerId.value = data.playerId

        if (data.playerId === channelStore.playerId) {
          buzzerState.value = "answering"
          hasAnswered.value = false
        } else {
          buzzerState.value = "locked"
        }
      }
    )

    bindEvent(
      "client-party-buzz-ack",
      (data: { targetId?: string; seq?: number; accepted?: boolean }) => {
        buzzerRetry.handleBuzzAck(data)
      }
    )

    bindEvent(
      "client-party-answer-ack",
      (data: { targetId?: string; seq?: number }) => {
        answerRetry.handleAnswerAck(data)
      }
    )

    bindEvent("client-party-round-result", (data: any) => {
      heartbeat.markHostActivity()
      roundResult.value = data.isCorrect ? "correct" : "incorrect"
      buzzerState.value = "locked"
      activePlayerId.value = data.playerId
      answerDeadlineAt.value = null
    })

    bindEvent(
      "client-party-player-scores",
      (data: { players: PartyPlayer[] }) => {
        players.value = data.players
      }
    )

    bindEvent(
      "client-party-next-round",
      (data?: { roundIndex?: number; newRound?: Round }) => {
        heartbeat.markHostActivity()
        if (data?.newRound) gameStore.rounds.push(data.newRound)
        gameStore.nextRound()
        hasAnswered.value = false
      }
    )

    bindEvent(
      "client-party-state",
      (data: { state?: PartyStatePayload; reason?: string }) => {
        if (isHost.value) return
        heartbeat.markHostActivity()
        const state = data?.state
        if (!state) return

        if (Array.isArray(state.players)) players.value = state.players
        if (typeof state.roundTimeLimit === "number")
          roundTimeLimit.value = state.roundTimeLimit
        if (typeof state.buzzerTimeLimit === "number")
          buzzerTimeLimit.value = state.buzzerTimeLimit

        if (suddenDeath.isSuddenDeath) {
          suddenDeath.isSuddenDeath.value =
            typeof state.isSuddenDeath === "boolean"
              ? state.isSuddenDeath
              : false
        }
        if (suddenDeath.suddenDeathPlayerIds) {
          suddenDeath.suddenDeathPlayerIds.value = Array.isArray(
            state.suddenDeathPlayerIds
          )
            ? state.suddenDeathPlayerIds
            : []
        }

        if (typeof state.roundIndex === "number") {
          gameStore.setRoundIndex(state.roundIndex)
        }

        activePlayerId.value = state.activePlayerId ?? null
        buzzerState.value = state.buzzerState ?? buzzerState.value
        buzzTransitionPending.value = Boolean(state.buzzTransitionPending)
        answerDeadlineAt.value =
          typeof state.answerDeadlineAt === "number"
            ? state.answerDeadlineAt
            : null

        // Lights Out sync
        if (typeof state.lightsOutUntilAt === "number") {
          const byId =
            typeof state.lightsOutByPlayerId === "string"
              ? state.lightsOutByPlayerId
              : null
          if (state.lightsOutUntilAt > Date.now()) {
            powerups.setLightsOutUntil(state.lightsOutUntilAt, byId)
          } else {
            powerups.clearLightsOut()
          }
        } else if (state.lightsOutUntilAt === null) {
          powerups.clearLightsOut()
        }
        if (
          state.lightsOutUsedBy &&
          typeof state.lightsOutUsedBy === "object" &&
          powerups.lightsOutUsedBy
        ) {
          powerups.lightsOutUsedBy.value = state.lightsOutUsedBy
        }

        // XLZ sync
        if (powerups.xlzCharges) {
          powerups.xlzCharges.value =
            typeof state.xlzCharges === "number" ? state.xlzCharges : 0
        }
        if (powerups.xlzByPlayerId) {
          powerups.xlzByPlayerId.value =
            typeof state.xlzByPlayerId === "string" ? state.xlzByPlayerId : null
        }
        if (
          state.xlzUsedBy &&
          typeof state.xlzUsedBy === "object" &&
          powerups.xlzUsedBy
        ) {
          powerups.xlzUsedBy.value = state.xlzUsedBy
        }

        // Freeze sync
        if (typeof state.freezeUntilAt === "number") {
          const byId =
            typeof state.freezeByPlayerId === "string"
              ? state.freezeByPlayerId
              : null
          if (state.freezeUntilAt > Date.now()) {
            powerups.setFreezeUntil(state.freezeUntilAt, byId)
          } else {
            powerups.clearFreeze()
          }
        } else if (state.freezeUntilAt === null) {
          powerups.clearFreeze()
        }
        if (
          state.freezeUsedBy &&
          typeof state.freezeUsedBy === "object" &&
          powerups.freezeUsedBy
        ) {
          powerups.freezeUsedBy.value = state.freezeUsedBy
        }

        // Devil sync
        if (powerups.devilCharges) {
          powerups.devilCharges.value =
            typeof state.devilCharges === "number" ? state.devilCharges : 0
        }
        if (powerups.devilByPlayerId) {
          powerups.devilByPlayerId.value =
            typeof state.devilByPlayerId === "string" ? state.devilByPlayerId : null
        }
        if (
          state.devilUsedBy &&
          typeof state.devilUsedBy === "object" &&
          powerups.devilUsedBy
        ) {
          powerups.devilUsedBy.value = state.devilUsedBy
        }

        // Upside Down sync
        if (typeof state.upsideDownUntilAt === "number") {
          const byId =
            typeof state.upsideDownByPlayerId === "string"
              ? state.upsideDownByPlayerId
              : null
          if (state.upsideDownUntilAt > Date.now()) {
            powerups.setUpsideDownUntil?.(state.upsideDownUntilAt, byId)
          } else {
            powerups.clearUpsideDown?.()
          }
        } else if (state.upsideDownUntilAt === null) {
          powerups.clearUpsideDown?.()
        }
        if (
          state.upsideDownUsedBy &&
          typeof state.upsideDownUsedBy === "object" &&
          powerups.upsideDownUsedBy
        ) {
          powerups.upsideDownUsedBy.value = state.upsideDownUsedBy
        }

        // Fart sync
        if (powerups.fartCharges) {
          powerups.fartCharges.value =
            typeof state.fartCharges === "number" ? state.fartCharges : 0
        }
        if (powerups.fartByPlayerId) {
          powerups.fartByPlayerId.value =
            typeof state.fartByPlayerId === "string" ? state.fartByPlayerId : null
        }
        if (
          state.fartUsedBy &&
          typeof state.fartUsedBy === "object" &&
          powerups.fartUsedBy
        ) {
          powerups.fartUsedBy.value = state.fartUsedBy
        }

        if (
          state.playerLastSeen &&
          typeof state.playerLastSeen === "object" &&
          heartbeat.playerLastSeen
        ) {
          heartbeat.playerLastSeen.value = state.playerLastSeen
        }

        if (
          buzzerState.value !== "answering" ||
          activePlayerId.value !== channelStore.playerId
        ) {
          hasAnswered.value = false
        }

        if (Array.isArray(state.buzzedPlayerIds)) {
          buzzedPlayerIds.value = state.buzzedPlayerIds
        }
      }
    )

    // Powerup broadcast handlers
    bindEvent(
      "client-party-xlz",
      (data?: { charges?: number; byPlayerId?: string | null }) => {
        if (powerups.xlzCharges) {
          powerups.xlzCharges.value =
            typeof data?.charges === "number" ? data.charges : 0
        }
        if (powerups.xlzByPlayerId) {
          powerups.xlzByPlayerId.value =
            typeof data?.byPlayerId === "string" ? data.byPlayerId : null
        }
      }
    )

    bindEvent(
      "client-party-freeze",
      (data?: { untilAt?: number; byPlayerId?: string }) => {
        const untilAt =
          typeof data?.untilAt === "number" ? data.untilAt : Date.now() + 4000
        const byId =
          typeof data?.byPlayerId === "string" ? data.byPlayerId : null
        powerups.setFreezeUntil(untilAt, byId)
      }
    )

    bindEvent(
      "client-party-fart",
      (data?: { byPlayerId?: string; pressesRemaining?: number }) => {
        if (powerups.fartByPlayerId) {
          powerups.fartByPlayerId.value =
            typeof data?.byPlayerId === "string" ? data.byPlayerId : null
        }
        if (powerups.fartCharges) {
          powerups.fartCharges.value =
            typeof data?.pressesRemaining === "number"
              ? data.pressesRemaining
              : 2
        }
      }
    )

    bindEvent(
      "client-party-powerup-award",
      (data?: { targetPlayerId?: string; awardId?: string }) => {
        heartbeat.markHostActivity();
        if (!data?.targetPlayerId || !data?.awardId) return;
        if (data.targetPlayerId !== channelStore.playerId) return;
        powerups.receivePowerupAward(data.awardId);
      },
    );


    bindEvent("client-party-host-heartbeat", () => {
      if (!isHost.value) heartbeat.markHostActivity()
    })

    bindEvent(
      "client-party-heartbeat",
      (data: { playerId?: string; ts?: number }) => {
        if (!data?.playerId) return
        heartbeat.markPlayerSeen(data.playerId, data.ts)
      }
    )

    bindEvent(
      "client-party-state-request",
      (data: { requestedBy?: string }) => {
        heartbeat.markHostActivity()
        broadcastPartyState(`state-request:${data?.requestedBy || "unknown"}`)
      }
    )

    bindEvent(
      "client-party-emoji",
      (data: { emoji: string; playerId?: string }) => {
        heartbeat.markHostActivity()
        if (isHost.value) {
          if (data?.playerId) incrementPlayerEmojisSent(data.playerId)
          if (data?.emoji) emojiStatistics.value.push(data.emoji)
        }
        window.dispatchEvent(
          new CustomEvent("emoji-received", { detail: data.emoji })
        )
      }
    )

    bindEvent("client-party-game-over", (data: { players: PartyPlayer[] }) => {
      heartbeat.markHostActivity()
      players.value = data.players
      gameStore.isGameOver = true
      channelStore.setGameRunning(false)
      router.push("/gameover-party")
    })

    // ── Host-Only Events ───────────────────────────────────────────────────────

    if (isHost.value) {
      bindEvent(
        "client-party-buzz",
        (data: { playerId: string; seq?: number }) => {
          heartbeat.markHostActivity()
          const canAccept = buzzerState.value === "open"
    
          handleBuzz(data.playerId)
          if (data?.seq) {
            channel.value?.trigger("client-party-buzz-ack", {
              targetId: data.playerId,
              seq: data.seq,
              accepted: canAccept,
            })
          }
        }
      )

      bindEvent(
        "client-party-answer",
        (data: { playerId: string; isCorrect: boolean; seq?: number }) => {
          heartbeat.markHostActivity()
          if (
            buzzerState.value === "answering" &&
            activePlayerId.value === data.playerId
          ) {
            resolveAnswer(data.playerId, data.isCorrect)
          }
          if (data?.seq) {
            channel.value?.trigger("client-party-answer-ack", {
              targetId: data.playerId,
              seq: data.seq,
            })
          }
        }
      )

      // Powerup Requests auf dem Host: Führen Aktion aus & erhöhen die Gutschrift im players-Array
      bindEvent(
        "client-party-lightsout-request",
        (data?: { playerId?: string }) => {
          if (data?.playerId) incrementPlayerPowerupsUsed(data.playerId)
          powerups.handleLightsOutRequest?.(data)
        }
      )

      bindEvent("client-party-xlz-request", (data?: { playerId?: string }) => {
        if (data?.playerId) incrementPlayerPowerupsUsed(data.playerId)
        powerups.handleXlzRequest?.(data)
      })

      bindEvent(
        "client-party-freeze-request",
        (data?: { playerId?: string }) => {
          if (data?.playerId) incrementPlayerPowerupsUsed(data.playerId)
          powerups.handleFreezeRequest?.(data)
        }
      )

      bindEvent(
        "client-party-fart-request",
        (data?: { playerId?: string }) => {
          if (data?.playerId) incrementPlayerPowerupsUsed(data.playerId)
          powerups.handleFartRequest?.(data)
        }
      )

      bindEvent(
        "client-party-devil-request",
        (data?: { playerId?: string }) => {
          if (data?.playerId) incrementPlayerPowerupsUsed(data.playerId)
          powerups.handleDevilRequest?.(data)
        }
      )

      bindEvent(
      "client-party-devil",
      (data?: { charges?: number; byPlayerId?: string | null }) => {
        if (powerups.devilCharges) {
          powerups.devilCharges.value =
            typeof data?.charges === "number" ? data.charges : 0
        }
        if (powerups.devilByPlayerId) {
          powerups.devilByPlayerId.value =
            typeof data?.byPlayerId === "string" ? data.byPlayerId : null
        }
      }
    )

      bindEvent(
        "client-party-upsidedown-request",
        (data?: { playerId?: string }) => {
          if (data?.playerId) incrementPlayerPowerupsUsed(data.playerId)
          powerups.handleUpsideDownRequest?.(data)
        }
      )

      // Periodic state broadcast
      stateBroadcastInterval = workerSetInterval(() => {
        ensureAnswerTimer()
        broadcastPartyState("periodic")
      }, 10000)
    }
  }

  watch(
    () => [channelStore.mode, channel.value, channelStore.isHost] as const,
    ([mode, c]) => {
      if (mode !== "party" || !c) {
        unbindEvents()
        return
      }
      setupEvents()
    },
    { immediate: true }
  )

  // ─── Reset ───────────────────────────────────────────────────────────────────

  const reset = ({ keepEvents = false }: { keepEvents?: boolean } = {}) => {
    if (!keepEvents) unbindEvents()

    players.value = []
    buzzerState.value = "locked"
    activePlayerId.value = null
    answerStartedAt.value = null
    buzzTransitionPending.value = false
    buzzedPlayerIds.value = []

    if (buzzerTimer) {
      workerClearTimeout(buzzerTimer)
      buzzerTimer = null
    }
    if (answerTimer) {
      workerClearTimeout(answerTimer)
      answerTimer = null
    }

    powerups.reset()
    suddenDeath.reset()
    heartbeat.reset()
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  return {
    // State
    players,
    buzzerState,
    activePlayerId,
    activePlayer,
    roundResult,
    isRevealing,
    roundTimeLimit,
    buzzerTimeLimit,
    buzzTransitionPending,
    hasAnswered,
    answerDeadlineAt,
    emojiStatistics,

    // Heartbeat / connection
    connectionStale: heartbeat.connectionStale,
    playerLastSeen: heartbeat.playerLastSeen,

    // Powerups
    isLightsOut: powerups.isLightsOut,
    lightsOutUntilAt: powerups.lightsOutUntilAt,
    lightsOutByPlayerId: powerups.lightsOutByPlayerId,
    lightsOutUsedBy: powerups.lightsOutUsedBy,
    lightsOutUsedByMe: powerups.lightsOutUsedByMe,
    triggerLightsOut: powerups.triggerLightsOut,
    xlzCharge: powerups.xlzCharges,
    xlzByPlayerId: powerups.xlzByPlayerId,
    xlzUsedBy: powerups.xlzUsedBy,
    xlzUsedByMe: powerups.xlzUsedByMe,
    isXlzActive: powerups.isXlzActive,
    triggerXlz: powerups.triggerXlz,
    isFrozen: powerups.isFrozen,
    freezeUntilAt: powerups.freezeUntilAt,
    freezeByPlayerId: powerups.freezeByPlayerId,
    freezeUsedBy: powerups.freezeUsedBy,
    freezeUsedByMe: powerups.freezeUsedByMe,
    triggerFreeze: powerups.triggerFreeze,
    fartByPlayerId: powerups.fartByPlayerId,
    fartCharges: powerups.fartCharges,
    triggerFart: powerups.triggerFart,

    // Upside Down
    isUpsideDown: powerups.isUpsideDown,
    upsideDownUntilAt: powerups.upsideDownUntilAt,
    upsideDownByPlayerId: powerups.upsideDownByPlayerId,
    upsideDownUsedBy: powerups.upsideDownUsedBy,
    upsideDownUsedByMe: powerups.upsideDownUsedByMe,
    triggerUpsideDown: powerups.triggerUpsideDown,

    // Devil
    isDevilActive: powerups.isDevilActive,
    devilCharges: powerups.devilCharges,
    devilByPlayerId: powerups.devilByPlayerId,
    devilUsedBy: powerups.devilUsedBy,
    devilUsedByMe: powerups.devilUsedByMe,
    triggerDevil: powerups.triggerDevil,

    // Inventory & Rest
    powerupInventory: powerups.powerupInventory,
    receivePowerupAward: powerups.receivePowerupAward,
    removePowerupFromInventory: powerups.removePowerupFromInventory,
    consumeFart: powerups.consumeFartCharge,
    consumeXlz: powerups.consumeXlzCharge,
    consumeDevil: powerups.consumeDevilCharge,

    // Sudden death
    isSuddenDeath: suddenDeath.isSuddenDeath,
    suddenDeathPlayerIds: suddenDeath.suddenDeathPlayerIds,
    showSuddenDeathTransition: suddenDeath.showSuddenDeathTransition,
    getSuddenDeathCandidates: suddenDeath.getSuddenDeathCandidates,
    startSuddenDeath: suddenDeath.startSuddenDeath,
    nextSuddenDeathRound: suddenDeath.nextSuddenDeathRound,

    // Retry state
    pendingBuzz: buzzerRetry.pendingBuzz,
    pendingAnswer: answerRetry.pendingAnswer,

    // Replay
    allowReplayNavigationWindow,
    consumeReplayNavigationWindow,

    // Actions
    startGame,
    openBuzzer,
    handleBuzz,
    startAnswerPhase,
    handleRoundTimeout,
    resolveAnswer,
    nextRound,
    skipRound,
    endGame,
    pressBuzzer: buzzerRetry.pressBuzzer,
    submitAnswer: answerRetry.submitAnswer,
    sendEmoji,
    broadcastPartyState,
    setupEvents,
    reset,

    // Reopen state
    buzzedPlayerIds,
  }
})