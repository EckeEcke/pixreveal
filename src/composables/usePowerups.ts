import { ref, computed } from "vue"
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers"
import { useSoundStore } from "@/stores/sound"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsePowerupsOptions {
  getPlayerId: () => string
  getIsHost: () => boolean
  getChannel: () => any
  getCurrentRoundIndex: () => number
  getOnlineGameRunning: () => boolean
  onBroadcastPartyState: (reason: string) => void
  onIncrementPowerupsUsed: (playerId: string) => void
}

const POWERUP_TYPES = [
  "lightsOut",
  "freeze",
  "xlz",
  "devil",
  "upsideDown",
  "fart",
] as const
export type PowerupType = (typeof POWERUP_TYPES)[number]

// ─── Composable ───────────────────────────────────────────────────────────────

export function usePowerups({
  getPlayerId,
  getIsHost,
  getChannel,
  getOnlineGameRunning,
  onBroadcastPartyState,
  onIncrementPowerupsUsed,
}: UsePowerupsOptions) {

  const soundStore = useSoundStore()
  // ── Lights Out ──────────────────────────────────────────────────────────────

  const isLightsOut = ref(false)
  const lightsOutUntilAt = ref<number | null>(null)
  const lightsOutByPlayerId = ref<string | null>(null)
  const lightsOutUsedBy = ref<Record<string, boolean>>({})
  let lightsOutTimeoutId: number | null = null

  const lightsOutUsedByMe = computed(() => {
    const me = getPlayerId()
    return me ? Boolean(lightsOutUsedBy.value[me]) : false
  })

  const clearLightsOutTimeout = () => {
    if (!lightsOutTimeoutId) return
    workerClearTimeout(lightsOutTimeoutId)
    lightsOutTimeoutId = null
  }

  const setLightsOutUntil = (untilAt: number, byPlayerId: string | null) => {
    const normalizedUntilAt = Math.max(Date.now(), untilAt)
    isLightsOut.value = true
    lightsOutUntilAt.value = normalizedUntilAt
    lightsOutByPlayerId.value = byPlayerId

    clearLightsOutTimeout()
    const delay = Math.max(0, normalizedUntilAt - Date.now())
    lightsOutTimeoutId = workerSetTimeout(() => {
      lightsOutTimeoutId = null
      if (lightsOutUntilAt.value !== normalizedUntilAt) return
      isLightsOut.value = false
      lightsOutUntilAt.value = null
      lightsOutByPlayerId.value = null
    }, delay)
  }

  const clearLightsOut = () => {
    clearLightsOutTimeout()
    isLightsOut.value = false
    lightsOutUntilAt.value = null
    lightsOutByPlayerId.value = null
  }

  const triggerLightsOut = () => {
    const channel = getChannel()
    if (!channel) return
    if (isLightsOut.value) return

    if (!getIsHost()) {
      channel.trigger("client-party-lightsout-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      })
      return
    }

    const hostId = String(getPlayerId() || "host")
    lightsOutUsedBy.value = { ...lightsOutUsedBy.value, [hostId]: true }
    const untilAt = Date.now() + 4000
    setLightsOutUntil(untilAt, hostId)
    channel.trigger("client-party-lightsout", { untilAt, byPlayerId: hostId })
    onBroadcastPartyState("lightsout")
  }

  const handleLightsOutRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return
    const playerId = data?.playerId
    if (!playerId) return
    if (!getOnlineGameRunning()) return
    if (isLightsOut.value) return

    lightsOutUsedBy.value = { ...lightsOutUsedBy.value, [playerId]: true }
    onIncrementPowerupsUsed(playerId)
    const untilAt = Date.now() + 4000
    setLightsOutUntil(untilAt, playerId)
    getChannel()?.trigger("client-party-lightsout", {
      untilAt,
      byPlayerId: playerId,
    })
    onBroadcastPartyState("lightsout")
  }

  // ── XLZ / Scramble ──────────────────────────────────────────────────────────

  const xlzCharges = ref(0)
  const xlzByPlayerId = ref<string | null>(null)
  const xlzUsedBy = ref<Record<string, boolean>>({})

  const xlzUsedByMe = computed(() => {
    const me = getPlayerId()
    return me ? Boolean(xlzUsedBy.value[me]) : false
  })

  const isXlzActive = computed(() => xlzCharges.value > 0)

  const clearXlz = () => {
    xlzCharges.value = 0
    xlzByPlayerId.value = null
  }

  const triggerXlz = () => {
    const channel = getChannel()
    if (!channel) return

    if (!getIsHost()) {
      channel.trigger("client-party-xlz-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      })
      return
    }

    const hostId = String(getPlayerId() || "host")
    xlzCharges.value += 1
    xlzByPlayerId.value = hostId
    channel.trigger("client-party-xlz", {
      byPlayerId: hostId,
      charges: xlzCharges.value,
    })
    onBroadcastPartyState("xlz")
  }

  const handleXlzRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return
    const playerId = data?.playerId
    if (!playerId) return
    if (!getOnlineGameRunning()) return

    xlzUsedBy.value = { ...xlzUsedBy.value, [playerId]: true }
    onIncrementPowerupsUsed(playerId)
    xlzCharges.value += 1
    xlzByPlayerId.value = playerId
    getChannel()?.trigger("client-party-xlz", {
      byPlayerId: playerId,
      charges: xlzCharges.value,
    })
    onBroadcastPartyState("xlz")
  }

  const consumeXlzCharge = (): boolean => {
    if (xlzCharges.value <= 0) return false
    xlzCharges.value -= 1
    if (xlzCharges.value <= 0) {
      xlzCharges.value = 0
      xlzByPlayerId.value = null
    }
    return true
  }

  // ── Devil ────────────────────────────────────────────────────────────────────

  const devilCharges = ref(0)
  const devilByPlayerId = ref<string | null>(null)
  const devilUsedBy = ref<Record<string, boolean>>({})

  const devilUsedByMe = computed(() => {
    const me = getPlayerId()
    return me ? Boolean(devilUsedBy.value[me]) : false
  })

  const isDevilActive = computed(() => devilCharges.value > 0)

  const clearDevil = () => {
    devilCharges.value = 0
    devilByPlayerId.value = null
  }

  const triggerDevil = () => {
    const channel = getChannel()
    if (!channel) return

    if (!getIsHost()) {
      channel.trigger("client-party-devil-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      })
      return
    }

    const hostId = String(getPlayerId() || "host")
    devilCharges.value += 1
    devilByPlayerId.value = hostId
    channel.trigger("client-party-devil", {
      byPlayerId: hostId,
      charges: devilCharges.value,
    })
    onBroadcastPartyState("devil")
  }

  const handleDevilRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return
    const playerId = data?.playerId
    if (!playerId) return
    if (!getOnlineGameRunning()) return

    devilUsedBy.value = { ...devilUsedBy.value, [playerId]: true }
    onIncrementPowerupsUsed(playerId)
    devilCharges.value += 1
    devilByPlayerId.value = playerId
    getChannel()?.trigger("client-party-devil", {
      byPlayerId: playerId,
      charges: devilCharges.value,
    })
    onBroadcastPartyState("devil")
  }

  const consumeDevilCharge = (): boolean => {
    if (devilCharges.value <= 0) return false
    devilCharges.value -= 1
    if (devilCharges.value <= 0) {
      devilCharges.value = 0
      devilByPlayerId.value = null
    }
    return true
  }

  // ── Freeze ───────────────────────────────────────────────────────────────────

  const freezeUntilAt = ref<number | null>(null)
  const freezeByPlayerId = ref<string | null>(null)
  const freezeUsedBy = ref<Record<string, boolean>>({})
  const isFrozen = ref(false)
  let freezeTimeoutId: number | null = null

  const freezeUsedByMe = computed(() => {
    const me = getPlayerId()
    return me ? Boolean(freezeUsedBy.value[me]) : false
  })

  const clearFreezeTimeout = () => {
    if (!freezeTimeoutId) return
    workerClearTimeout(freezeTimeoutId)
    freezeTimeoutId = null
  }

  const setFreezeUntil = (untilAt: number, byPlayerId: string | null) => {
    const normalizedUntilAt = Math.max(Date.now(), untilAt)
    freezeUntilAt.value = normalizedUntilAt
    freezeByPlayerId.value = byPlayerId ?? null

    const me = getPlayerId() || null
    isFrozen.value = Boolean(me && byPlayerId && me !== byPlayerId)

    clearFreezeTimeout()
    const delay = Math.max(0, normalizedUntilAt - Date.now())
    freezeTimeoutId = workerSetTimeout(() => {
      freezeTimeoutId = null
      if (freezeUntilAt.value !== normalizedUntilAt) return
      isFrozen.value = false
      freezeUntilAt.value = null
      freezeByPlayerId.value = null
    }, delay)
  }

  const clearFreeze = () => {
    clearFreezeTimeout()
    isFrozen.value = false
    freezeUntilAt.value = null
    freezeByPlayerId.value = null
  }

  const triggerFreeze = () => {
    const channel = getChannel()
    if (!channel) return

    if (!getIsHost()) {
      channel.trigger("client-party-freeze-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      })
      return
    }

    const hostId = String(getPlayerId() || "host")
    freezeUsedBy.value = { ...freezeUsedBy.value, [hostId]: true }
    const untilAt = Date.now() + 4000
    setFreezeUntil(untilAt, hostId)
    channel.trigger("client-party-freeze", { untilAt, byPlayerId: hostId })
    onBroadcastPartyState("freeze")
  }

  const handleFreezeRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return
    const playerId = data?.playerId
    if (!playerId) return
    if (!getOnlineGameRunning()) return

    freezeUsedBy.value = { ...freezeUsedBy.value, [playerId]: true }
    onIncrementPowerupsUsed(playerId)
    const untilAt = Date.now() + 4000
    setFreezeUntil(untilAt, playerId)
    getChannel()?.trigger("client-party-freeze", {
      untilAt,
      byPlayerId: playerId,
    })
    onBroadcastPartyState("freeze")
  }

  // ── Upside Down ──────────────────────────────────────────────────────────────

  const isUpsideDown = ref(false)
  const upsideDownUntilAt = ref<number | null>(null)
  const upsideDownByPlayerId = ref<string | null>(null)
  const upsideDownUsedBy = ref<Record<string, boolean>>({})
  let upsideDownTimeoutId: number | null = null

  const upsideDownUsedByMe = computed(() => {
    const me = getPlayerId()
    return me ? Boolean(upsideDownUsedBy.value[me]) : false
  })

  const clearUpsideDownTimeout = () => {
    if (!upsideDownTimeoutId) return
    workerClearTimeout(upsideDownTimeoutId)
    upsideDownTimeoutId = null
  }

  const setUpsideDownUntil = (untilAt: number, byPlayerId: string | null) => {
    const normalizedUntilAt = Math.max(Date.now(), untilAt)
    isUpsideDown.value = true
    upsideDownUntilAt.value = normalizedUntilAt
    upsideDownByPlayerId.value = byPlayerId

    clearUpsideDownTimeout()
    const delay = Math.max(0, normalizedUntilAt - Date.now())
    upsideDownTimeoutId = workerSetTimeout(() => {
      upsideDownTimeoutId = null
      if (upsideDownUntilAt.value !== normalizedUntilAt) return
      isUpsideDown.value = false
      upsideDownUntilAt.value = null
      upsideDownByPlayerId.value = null
    }, delay)
  }

  const clearUpsideDown = () => {
    clearUpsideDownTimeout()
    isUpsideDown.value = false
    upsideDownUntilAt.value = null
    upsideDownByPlayerId.value = null
  }

  const triggerUpsideDown = () => {
    const channel = getChannel()
    if (!channel) return
    if (isUpsideDown.value) return

    if (!getIsHost()) {
      channel.trigger("client-party-upsidedown-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      })
      return
    }

    const hostId = String(getPlayerId() || "host")
    upsideDownUsedBy.value = { ...upsideDownUsedBy.value, [hostId]: true }
    const untilAt = Date.now() + 5000
    setUpsideDownUntil(untilAt, hostId)
    channel.trigger("client-party-upsidedown", {
      untilAt,
      byPlayerId: hostId,
    })
    onBroadcastPartyState("upsidedown")
  }

  const handleUpsideDownRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return
    const playerId = data?.playerId
    if (!playerId) return
    if (!getOnlineGameRunning()) return
    if (isUpsideDown.value) return

    upsideDownUsedBy.value = { ...upsideDownUsedBy.value, [playerId]: true }
    onIncrementPowerupsUsed(playerId)
    const untilAt = Date.now() + 5000
    setUpsideDownUntil(untilAt, playerId)
    getChannel()?.trigger("client-party-upsidedown", {
      untilAt,
      byPlayerId: playerId,
    })
    onBroadcastPartyState("upsidedown")
  }

  // ── Fart ─────────────────────────────────────────────────────────────────────

  const fartCharges = ref(0)
  const fartByPlayerId = ref<string | null>(null)
  const fartUsedBy = ref<Record<string, boolean>>({})

  const fartUsedByMe = computed(() => {
    const me = getPlayerId()
    return me ? Boolean(fartUsedBy.value[me]) : false
  })

  const isFartActive = computed(() => fartCharges.value > 0)

  const clearFart = () => {
    fartCharges.value = 0
    fartByPlayerId.value = null
  }

  const triggerFart = () => {
    const channel = getChannel()
    console.log(channel, getIsHost())
    if (!channel) return

    if (!getIsHost()) {
      channel.trigger("client-party-fart-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      })
      return
    }

    const hostId = String(getPlayerId() || "host")
    fartCharges.value += 2
    fartByPlayerId.value = hostId
    channel.trigger("client-party-fart", {
      byPlayerId: hostId,
      pressesRemaining: fartCharges.value,
    })
    onBroadcastPartyState("fart")
  }

  const handleFartRequest = (data?: { playerId?: string }) => {
    console.log(getIsHost())
    if (!getIsHost()) return
    const playerId = data?.playerId
    if (!playerId) return
    if (!getOnlineGameRunning()) return

    fartUsedBy.value = { ...fartUsedBy.value, [playerId]: true }
    onIncrementPowerupsUsed(playerId)
    fartCharges.value += 2
    fartByPlayerId.value = playerId
    getChannel()?.trigger("client-party-fart", {
      byPlayerId: playerId,
      pressesRemaining: fartCharges.value,
    })
    onBroadcastPartyState("fart")
  }

  const consumeFartCharge = (buzzingPlayerId: string): boolean => {
    if (fartCharges.value <= 0) return false
    if (!fartByPlayerId.value) return false
    if (buzzingPlayerId === fartByPlayerId.value) return false

    fartCharges.value -= 1
    if (fartCharges.value <= 0) {
      fartCharges.value = 0
      fartByPlayerId.value = null
    }
    return true
  }

  // ── Inventory ────────────────────────────────────────────────────────────────

  const powerupInventory = ref<string[]>([])
  const processedAwardIds = ref<Set<string>>(new Set())

  const receivePowerupAward = (awardId: string) => {
    if (!awardId) return
    if (processedAwardIds.value.has(awardId)) return
    processedAwardIds.value.add(awardId)

    const available = POWERUP_TYPES.filter(
      (type) => !powerupInventory.value.includes(type),
    )
    if (available.length === 0) return

    const picked = available[Math.floor(Math.random() * available.length)]
    if (picked) {
      const nextInventory = [...powerupInventory.value, picked]

      if (nextInventory.length > 3) {
        nextInventory.shift()
      }

      powerupInventory.value = nextInventory
      soundStore.playSound("reward")
    }
  }

  const removePowerupFromInventory = (type: string) => {
    const idx = powerupInventory.value.indexOf(type)
    if (idx === -1) return
    const next = [...powerupInventory.value]
    next.splice(idx, 1)
    powerupInventory.value = next
  }

  const resetInventory = () => {
    powerupInventory.value = []
    processedAwardIds.value = new Set()
  }

  // ── Reset ────────────────────────────────────────────────────────────────────

  const reset = () => {
    clearLightsOut()
    lightsOutUsedBy.value = {}

    clearXlz()
    xlzUsedBy.value = {}

    clearDevil()
    devilUsedBy.value = {}

    clearFreeze()
    freezeUsedBy.value = {}

    clearUpsideDown()
    upsideDownUsedBy.value = {}

    clearFart()
    fartUsedBy.value = {}

    resetInventory()
  }

  return {
    // Lights Out
    isLightsOut,
    lightsOutUntilAt,
    lightsOutByPlayerId,
    lightsOutUsedBy,
    lightsOutUsedByMe,
    setLightsOutUntil,
    clearLightsOut,
    triggerLightsOut,
    handleLightsOutRequest,

    // XLZ
    xlzCharges,
    xlzByPlayerId,
    xlzUsedBy,
    xlzUsedByMe,
    isXlzActive,
    clearXlz,
    triggerXlz,
    handleXlzRequest,
    consumeXlzCharge,

    // Devil
    devilCharges,
    devilByPlayerId,
    devilUsedBy,
    devilUsedByMe,
    isDevilActive,
    clearDevil,
    triggerDevil,
    handleDevilRequest,
    consumeDevilCharge,

    // Freeze
    isFrozen,
    freezeUntilAt,
    freezeByPlayerId,
    freezeUsedBy,
    freezeUsedByMe,
    setFreezeUntil,
    clearFreeze,
    triggerFreeze,
    handleFreezeRequest,

    // Upside Down
    isUpsideDown,
    upsideDownUntilAt,
    upsideDownByPlayerId,
    upsideDownUsedBy,
    upsideDownUsedByMe,
    setUpsideDownUntil,
    clearUpsideDown,
    triggerUpsideDown,
    handleUpsideDownRequest,

    // Fart
    fartCharges,
    fartByPlayerId,
    fartUsedBy,
    fartUsedByMe,
    isFartActive,
    clearFart,
    triggerFart,
    handleFartRequest,
    consumeFartCharge,

    // Inventory
    powerupInventory,
    receivePowerupAward,
    removePowerupFromInventory,

    reset,
  }
}