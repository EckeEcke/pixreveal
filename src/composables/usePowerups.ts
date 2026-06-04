import { ref, computed } from "vue";
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsePowerupsOptions {
  getPlayerId: () => string;
  getIsHost: () => boolean;
  getChannel: () => any;
  getCurrentRoundIndex: () => number;
  getOnlineGameRunning: () => boolean;
  onBroadcastPartyState: (reason: string) => void;
  onIncrementPowerupsUsed: (playerId: string) => void;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function usePowerups({
  getPlayerId,
  getIsHost,
  getChannel,
  getCurrentRoundIndex,
  getOnlineGameRunning,
  onBroadcastPartyState,
  onIncrementPowerupsUsed,
}: UsePowerupsOptions) {
  // ── Lights Out ──────────────────────────────────────────────────────────────

  const isLightsOut = ref(false);
  const lightsOutUntilAt = ref<number | null>(null);
  const lightsOutByPlayerId = ref<string | null>(null);
  const lightsOutUsedBy = ref<Record<string, boolean>>({});
  let lightsOutTimeoutId: number | null = null;

  const lightsOutUsedByMe = computed(() => {
    const me = getPlayerId();
    return me ? Boolean(lightsOutUsedBy.value[me]) : false;
  });

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

  const clearLightsOut = () => {
    clearLightsOutTimeout();
    isLightsOut.value = false;
    lightsOutUntilAt.value = null;
    lightsOutByPlayerId.value = null;
  };

  const triggerLightsOut = () => {
    const channel = getChannel();
    if (!channel) return;
    if (isLightsOut.value) return;
    if (lightsOutUsedByMe.value) return;

    if (!getIsHost()) {
      channel.trigger("client-party-lightsout-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      });
      return;
    }

    const hostId = String(getPlayerId() || "host");
    lightsOutUsedBy.value = { ...lightsOutUsedBy.value, [hostId]: true };
    const untilAt = Date.now() + 4000;
    setLightsOutUntil(untilAt, hostId);
    channel.trigger("client-party-lightsout", { untilAt, byPlayerId: hostId });
    onBroadcastPartyState("lightsout");
  };

  const handleLightsOutRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return;
    const playerId = data?.playerId;
    if (!playerId) return;
    if (!getOnlineGameRunning()) return;
    if (isLightsOut.value) return;
    if (lightsOutUsedBy.value[playerId]) return;

    lightsOutUsedBy.value = { ...lightsOutUsedBy.value, [playerId]: true };
    onIncrementPowerupsUsed(playerId);
    const untilAt = Date.now() + 4000;
    setLightsOutUntil(untilAt, playerId);
    getChannel()?.trigger("client-party-lightsout", {
      untilAt,
      byPlayerId: playerId,
    });
    onBroadcastPartyState("lightsout");
  };

  // ── XLZ ─────────────────────────────────────────────────────────────────────

  const xlzActiveForRoundIndex = ref<number | null>(null);
  const xlzByPlayerId = ref<string | null>(null);
  const xlzUsedBy = ref<Record<string, boolean>>({});

  const xlzUsedByMe = computed(() => {
    const me = getPlayerId();
    return me ? Boolean(xlzUsedBy.value[me]) : false;
  });

  const isXlzActive = computed(
    () => xlzActiveForRoundIndex.value === getCurrentRoundIndex(),
  );

  const triggerXlz = () => {
    const channel = getChannel();
    if (!channel) return;
    if (xlzUsedByMe.value) return;
    if (isXlzActive.value) return;

    if (!getIsHost()) {
      channel.trigger("client-party-xlz-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      });
      return;
    }

    const hostId = String(getPlayerId() || "host");
    xlzUsedBy.value = { ...xlzUsedBy.value, [hostId]: true };
    xlzActiveForRoundIndex.value = getCurrentRoundIndex();
    xlzByPlayerId.value = hostId;
    channel.trigger("client-party-xlz", {
      roundIndex: getCurrentRoundIndex(),
      byPlayerId: hostId,
    });
    onBroadcastPartyState("xlz");
  };

  const handleXlzRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return;
    const playerId = data?.playerId;
    if (!playerId) return;
    if (!getOnlineGameRunning()) return;
    if (xlzUsedBy.value[playerId]) return;
    if (xlzActiveForRoundIndex.value === getCurrentRoundIndex()) return;

    xlzUsedBy.value = { ...xlzUsedBy.value, [playerId]: true };
    onIncrementPowerupsUsed(playerId);
    xlzActiveForRoundIndex.value = getCurrentRoundIndex();
    xlzByPlayerId.value = playerId;
    getChannel()?.trigger("client-party-xlz", {
      roundIndex: getCurrentRoundIndex(),
      byPlayerId: playerId,
    });
    onBroadcastPartyState("xlz");
  };

  // ── Freeze ───────────────────────────────────────────────────────────────────

  const freezeUntilAt = ref<number | null>(null);
  const freezeByPlayerId = ref<string | null>(null);
  const freezeUsedBy = ref<Record<string, boolean>>({});
  const isFrozen = ref(false);
  let freezeTimeoutId: number | null = null;

  const freezeUsedByMe = computed(() => {
    const me = getPlayerId();
    return me ? Boolean(freezeUsedBy.value[me]) : false;
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

    const me = getPlayerId() || null;
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

  const clearFreeze = () => {
    clearFreezeTimeout();
    isFrozen.value = false;
    freezeUntilAt.value = null;
    freezeByPlayerId.value = null;
  };

  const triggerFreeze = () => {
    const channel = getChannel();
    if (!channel) return;
    if (freezeUsedByMe.value) return;

    if (!getIsHost()) {
      channel.trigger("client-party-freeze-request", {
        playerId: getPlayerId(),
        ts: Date.now(),
      });
      return;
    }

    const hostId = String(getPlayerId() || "host");
    freezeUsedBy.value = { ...freezeUsedBy.value, [hostId]: true };
    const untilAt = Date.now() + 4000;
    setFreezeUntil(untilAt, hostId);
    channel.trigger("client-party-freeze", { untilAt, byPlayerId: hostId });
    onBroadcastPartyState("freeze");
  };

  const handleFreezeRequest = (data?: { playerId?: string }) => {
    if (!getIsHost()) return;
    const playerId = data?.playerId;
    if (!playerId) return;
    if (!getOnlineGameRunning()) return;
    if (freezeUsedBy.value[playerId]) return;

    freezeUsedBy.value = { ...freezeUsedBy.value, [playerId]: true };
    onIncrementPowerupsUsed(playerId);
    const untilAt = Date.now() + 4000;
    setFreezeUntil(untilAt, playerId);
    getChannel()?.trigger("client-party-freeze", {
      untilAt,
      byPlayerId: playerId,
    });
    onBroadcastPartyState("freeze");
  };

  // ── Reset ────────────────────────────────────────────────────────────────────

  const reset = () => {
    clearLightsOut();
    lightsOutUsedBy.value = {};

    xlzActiveForRoundIndex.value = null;
    xlzByPlayerId.value = null;
    xlzUsedBy.value = {};

    clearFreeze();
    freezeUsedBy.value = {};
  };

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
    xlzActiveForRoundIndex,
    xlzByPlayerId,
    xlzUsedBy,
    xlzUsedByMe,
    isXlzActive,
    triggerXlz,
    handleXlzRequest,

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

    reset,
  };
}
