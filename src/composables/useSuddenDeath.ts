import { ref } from "vue";
import type { PartyPlayer } from "@/types/party";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseSuddenDeathOptions {
  getChannel: () => any;
  getCurrentRoundIndex: () => number;
  getCurrentRound: () => any;
  onAddSuddenDeathRound: () => void;
  onOpenBuzzer: () => void;
  onBroadcastPartyState: (reason: string) => void;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useSuddenDeath({
  getChannel,
  getCurrentRoundIndex,
  getCurrentRound,
  onAddSuddenDeathRound,
  onOpenBuzzer,
  onBroadcastPartyState,
}: UseSuddenDeathOptions) {
  const isSuddenDeath = ref(false);
  const suddenDeathPlayerIds = ref<string[]>([]);
  const showSuddenDeathTransition = ref(false);

  /**
   * Returns the players tied for the highest score.
   * Returns an empty array if there's no tie (< 2 candidates).
   */
  const getSuddenDeathCandidates = (players: PartyPlayer[]): PartyPlayer[] => {
    if (players.length < 2) return [];

    let maxPts = -Infinity;
    for (const p of players) {
      if (p.points > maxPts) maxPts = p.points;
    }

    const candidates = players.filter((p) => p.points === maxPts);
    return candidates.length >= 2 ? candidates : [];
  };

  const startSuddenDeath = (candidates: PartyPlayer[]) => {
    isSuddenDeath.value = true;
    suddenDeathPlayerIds.value = candidates.map((c) => c.playerId);
    showSuddenDeathTransition.value = true;

    onAddSuddenDeathRound();
    getChannel()?.trigger("client-party-next-round", {
      roundIndex: getCurrentRoundIndex(),
      newRound: getCurrentRound(),
    });
    onBroadcastPartyState("sudden-death-start");
    onOpenBuzzer();
  };

  const nextSuddenDeathRound = (
    isRevealing: { value: boolean },
    answerDeadlineAt: { value: number | null },
  ) => {
    isRevealing.value = true;
    onAddSuddenDeathRound();
    answerDeadlineAt.value = null;
    getChannel()?.trigger("client-party-next-round", {
      roundIndex: getCurrentRoundIndex(),
      newRound: getCurrentRound(),
    });
    onBroadcastPartyState("next-sudden-death-round");
    onOpenBuzzer();
  };

  const eliminatePlayer = (playerId: string) => {
    suddenDeathPlayerIds.value = suddenDeathPlayerIds.value.filter(
      (id) => id !== playerId,
    );
  };

  const reset = () => {
    isSuddenDeath.value = false;
    suddenDeathPlayerIds.value = [];
    showSuddenDeathTransition.value = false;
  };

  return {
    isSuddenDeath,
    suddenDeathPlayerIds,
    showSuddenDeathTransition,
    getSuddenDeathCandidates,
    startSuddenDeath,
    nextSuddenDeathRound,
    eliminatePlayer,
    reset,
  };
}
