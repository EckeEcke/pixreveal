import { ref } from "vue";
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers";
import { backoffDelay } from "@/utils/realtime";

// ─── Constants ────────────────────────────────────────────────────────────────

const ANSWER_RETRY_BASE_MS = 350;
const ANSWER_RETRY_MAX_MS = 2500;
const ANSWER_RETRY_MAX_ATTEMPTS = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseAnswerRetryOptions {
  getPlayerId: () => string;
  getChannel: () => any;
  getIsHost: () => boolean;
  onResolveAnswer: (playerId: string, isCorrect: boolean) => void;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useAnswerRetry({
  getPlayerId,
  getChannel,
  getIsHost,
  onResolveAnswer,
}: UseAnswerRetryOptions) {
  const nextAnswerSeq = ref(1);
  const pendingAnswer = ref<{
    seq: number;
    attempts: number;
    payload: any;
  } | null>(null);

  let answerRetryTimeoutId: number | null = null;

  const clearAnswerRetry = () => {
    if (answerRetryTimeoutId) {
      workerClearTimeout(answerRetryTimeoutId);
      answerRetryTimeoutId = null;
    }
    pendingAnswer.value = null;
  };

  const submitAnswer = (
    option: { name: string; isCorrect: boolean } | undefined,
  ) => {
    const seq = nextAnswerSeq.value++;
    const payload = {
      playerId: getPlayerId(),
      seq,
      answer: option ? option.name : "Time up",
      isCorrect: option ? option.isCorrect : false,
    };
    pendingAnswer.value = { seq, attempts: 0, payload };

    const send = () => getChannel()?.trigger("client-party-answer", payload);
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

    if (answerRetryTimeoutId) workerClearTimeout(answerRetryTimeoutId);
    answerRetryTimeoutId = workerSetTimeout(retry, ANSWER_RETRY_BASE_MS);

    // Host resolves immediately since it is the authority.
    if (getIsHost()) {
      onResolveAnswer(getPlayerId(), payload.isCorrect);
    }
  };

  // Call when a `client-party-answer-ack` arrives for this player.
  const handleAnswerAck = (data: { targetId?: string; seq?: number }) => {
    if (!data?.targetId || data.targetId !== getPlayerId()) return;
    if (!pendingAnswer.value) return;
    if (data.seq !== pendingAnswer.value.seq) return;
    clearAnswerRetry();
  };

  const reset = () => {
    clearAnswerRetry();
    nextAnswerSeq.value = 1;
  };

  return {
    pendingAnswer,
    submitAnswer,
    handleAnswerAck,
    reset,
  };
}
