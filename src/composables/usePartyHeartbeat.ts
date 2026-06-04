import { ref } from "vue";
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";
import { hashStringToRange } from "@/utils/realtime";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEARTBEAT_PERIOD_MS = 15000;
const HEARTBEAT_JITTER_MS = 6000;
const HOST_HEARTBEAT_PERIOD_MS = 8000;
const STALE_AFTER_MS = 20000;
const STALE_CONFIRM_AFTER_MS = 7000;
const MAX_RESYNC_ATTEMPTS = 4;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsePartyHeartbeatOptions {
  getPlayerId: () => string;
  getIsHost: () => boolean;
  getChannel: () => any;
  getOnlineGameRunning: () => boolean;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function usePartyHeartbeat({
  getPlayerId,
  getIsHost,
  getChannel,
  getOnlineGameRunning,
}: UsePartyHeartbeatOptions) {
  // ── Shared state ───────────────────────────────────────────────────────────

  const lastHostActivityAt = ref<number>(Date.now());
  const connectionStale = ref(false);
  const playerLastSeen = ref<Record<string, number>>({});

  // ── Stale detection (controller-side) ──────────────────────────────────────

  const staleSuspectedAt = ref<number | null>(null);
  const lastResyncRequestAt = ref<number>(0);
  const nextResyncAt = ref<number>(0);
  const resyncBackoffMs = ref<number>(0);
  const resyncAttempts = ref(0);

  let heartbeatIntervalId: number | null = null;
  let heartbeatStartTimeoutId: number | null = null;
  let hostHeartbeatIntervalId: number | null = null;
  let staleCheckIntervalId: number | null = null;
  let resyncIntervalId: number | null = null;

  // ── Host activity tracking ─────────────────────────────────────────────────

  const markHostActivity = () => {
    lastHostActivityAt.value = Date.now();
    connectionStale.value = false;
    staleSuspectedAt.value = null;
    resyncAttempts.value = 0;
    lastResyncRequestAt.value = 0;
    nextResyncAt.value = 0;
    resyncBackoffMs.value = 0;
  };

  // Call when host receives a player heartbeat.
  const markPlayerSeen = (playerId: string, ts?: number) => {
    playerLastSeen.value[playerId] = typeof ts === "number" ? ts : Date.now();
  };

  // ── Start / stop ───────────────────────────────────────────────────────────

  const start = () => {
    // Controller heartbeat – staggered start to avoid thundering herd.
    if (!heartbeatIntervalId) {
      const jitter = hashStringToRange(
        String(getPlayerId() || ""),
        HEARTBEAT_JITTER_MS,
      );

      heartbeatStartTimeoutId = workerSetTimeout(() => {
        if (getIsHost() || !getOnlineGameRunning()) return;
        heartbeatIntervalId = workerSetInterval(() => {
          if (!getOnlineGameRunning()) return;
          getChannel()?.trigger("client-party-heartbeat", {
            playerId: getPlayerId(),
            ts: Date.now(),
          });
        }, HEARTBEAT_PERIOD_MS);
      }, jitter);
    }

    // Host heartbeat so controllers can detect stale state.
    if (!hostHeartbeatIntervalId && getIsHost() && getOnlineGameRunning()) {
      hostHeartbeatIntervalId = workerSetInterval(() => {
        if (!getIsHost() || !getOnlineGameRunning()) return;
        getChannel()?.trigger("client-party-host-heartbeat", {
          ts: Date.now(),
        });
      }, HOST_HEARTBEAT_PERIOD_MS);
    }

    // Stale detection – runs on controllers only.
    if (!staleCheckIntervalId) {
      staleCheckIntervalId = workerSetInterval(() => {
        if (getIsHost()) return;
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

    // Resync backoff – fires state-request events when stale is suspected.
    if (!resyncIntervalId) {
      resyncIntervalId = workerSetInterval(() => {
        if (getIsHost()) return;
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
          getChannel()?.trigger("client-party-state-request", {
            requestedBy: getPlayerId(),
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

  const stop = () => {
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
  };

  const reset = () => {
    stop();
    lastHostActivityAt.value = Date.now();
    connectionStale.value = false;
    staleSuspectedAt.value = null;
    resyncAttempts.value = 0;
    lastResyncRequestAt.value = 0;
    nextResyncAt.value = 0;
    resyncBackoffMs.value = 0;
    playerLastSeen.value = {};
  };

  return {
    // State
    lastHostActivityAt,
    connectionStale,
    playerLastSeen,
    // Actions
    markHostActivity,
    markPlayerSeen,
    start,
    stop,
    reset,
  };
}
