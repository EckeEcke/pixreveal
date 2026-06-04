import { ref } from "vue";
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers";
import { backoffDelay } from "@/utils/realtime";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUZZ_RETRY_BASE_MS = 350;
const BUZZ_RETRY_MAX_MS = 2500;
const BUZZ_RETRY_MAX_ATTEMPTS = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseBuzzerRetryOptions {
  getPlayerId: () => string;
  getChannel: () => any;
  getBuzzerState: () => string;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useBuzzerRetry({
  getPlayerId,
  getChannel,
  getBuzzerState,
}: UseBuzzerRetryOptions) {
  const nextBuzzSeq = ref(1);
  const pendingBuzz = ref<{ seq: number; attempts: number } | null>(null);

  let buzzAckTimeoutId: number | null = null;
  let buzzRetryTimeoutId: number | null = null;

  const clearBuzzTimers = () => {
    if (buzzAckTimeoutId) {
      workerClearTimeout(buzzAckTimeoutId);
      buzzAckTimeoutId = null;
    }
    if (buzzRetryTimeoutId) {
      workerClearTimeout(buzzRetryTimeoutId);
      buzzRetryTimeoutId = null;
    }
    pendingBuzz.value = null;
  };

  const pressBuzzer = () => {
    if (getBuzzerState() !== "open") return;

    const seq = nextBuzzSeq.value++;
    const payload = { playerId: getPlayerId(), seq };
    pendingBuzz.value = { seq, attempts: 0 };

    const send = () => getChannel()?.trigger("client-party-buzz", payload);
    send();

    // If no ack arrives quickly, request a state resync to check if the buzz
    // was actually processed.
    if (buzzAckTimeoutId) workerClearTimeout(buzzAckTimeoutId);
    buzzAckTimeoutId = workerSetTimeout(() => {
      buzzAckTimeoutId = null;
      if (getBuzzerState() === "open") {
        getChannel()?.trigger("client-party-state-request", {
          requestedBy: getPlayerId(),
        });
      }
    }, 400);

    const retry = () => {
      if (!pendingBuzz.value) return;
      if (getBuzzerState() !== "open") {
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

    if (buzzRetryTimeoutId) workerClearTimeout(buzzRetryTimeoutId);
    buzzRetryTimeoutId = workerSetTimeout(retry, BUZZ_RETRY_BASE_MS);
  };

  // Call this when a `client-party-buzz-ack` arrives for this player.
  const handleBuzzAck = (data: {
    targetId?: string;
    seq?: number;
    accepted?: boolean;
  }) => {
    if (!data?.targetId || data.targetId !== getPlayerId()) return;
    if (!pendingBuzz.value) return;
    if (data.seq !== pendingBuzz.value.seq) return;
    clearBuzzTimers();
  };

  // Call when buzzer opens so stale pending state is cleared.
  const handleBuzzerOpen = () => {
    clearBuzzTimers();
  };

  const reset = () => {
    clearBuzzTimers();
    nextBuzzSeq.value = 1;
  };

  return {
    pendingBuzz,
    pressBuzzer,
    handleBuzzAck,
    handleBuzzerOpen,
    reset,
  };
}
