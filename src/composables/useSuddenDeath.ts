import { ref } from "vue";
import type { PartyPlayer } from "@/types/party";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseSuddenDeathOptions {
  getChannel: () => any;
  getCurrentRoundIndex: () => number;
  getCurrentRound: () => any;
  getPlayers: () => PartyPlayer[];
  onAddSuddenDeathRound: () => void;
  onOpenBuzzer: () => void;
  onBroadcastPartyState: (reason: string) => void;
  setIsRevealing: (value: boolean) => void;
  setAnswerDeadlineAt: (value: number | null) => void;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useSuddenDeath({
  getChannel,
  getCurrentRoundIndex,
  getCurrentRound,
  getPlayers,
  onAddSuddenDeathRound,
  onOpenBuzzer,
  onBroadcastPartyState,
  setIsRevealing,
  setAnswerDeadlineAt,
}: UseSuddenDeathOptions) {
  const isSuddenDeath = ref(false);
  const suddenDeathPlayerIds = ref<string[]>([]);
  const showSuddenDeathTransition = ref(false);

  /**
   * Returns the players tied for the highest score.
   * Returns an empty array if there's no tie (< 2 candidates).
   */
  const getSuddenDeathCandidates = (): PartyPlayer[] => {
    const players = getPlayers();
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

  const nextSuddenDeathRound = () => {
    setIsRevealing(true);
    onAddSuddenDeathRound();
    setAnswerDeadlineAt(null);
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
