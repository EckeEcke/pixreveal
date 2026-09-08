import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useGameStore } from "./game";
import { usePlayerStore } from "./player";
import { useConfigStore } from "./config";
import type { Round } from "@/types/game";

export type ChallengeParticipant = {
  username: string;
  avatarIndex: number;
  score: number;
  answerHistory: boolean[];
};

export type ChallengeSession = {
  sessionId: string;
  mode: "classic" | "inspect" | "gravity";
  revealTime: number;
  rounds: Round[];
  challenger: ChallengeParticipant;
  opponent: ChallengeParticipant | null;
};

const STORAGE_KEY = "pixreveal:challenge-session";

export const useChallengeStore = defineStore("challenge", () => {
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
    const configStore = useConfigStore();
  const session = ref<ChallengeSession | null>(null);
  const active = computed(() => Boolean(session.value));

  const loadStored = () => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      session.value = JSON.parse(raw) as ChallengeSession;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const persist = () => {
    if (session.value) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session.value));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const setSession = (value: ChallengeSession | null) => {
    session.value = value;
    persist();
  };

  const clearSession = () => setSession(null);

  const startAcceptedChallenge = (value: ChallengeSession) => {
    setSession(value);
    playerStore.setUser({
      username: playerStore.playerName,
      avatar: playerStore.avatarIndex,
    });
    playerStore.gameMode = value.mode;
    gameStore.prepareGame(value.revealTime, value.rounds);
  };

  const createChallenge = async () => {
    if (!["classic", "inspect", "gravity"].includes(playerStore.gameMode)) {
      throw new Error("This game mode cannot be challenged");
    }

    const response = await fetch("/api/friend-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: playerStore.gameMode,
        revealTime: Number(configStore.revealTime),
        rounds: gameStore.rounds,
        score: playerStore.points,
        username: playerStore.playerName,
        avatarIndex: playerStore.avatarIndex,
        answerHistory: playerStore.answerHistory,
      }),
    });

    if (!response.ok) throw new Error("Could not create challenge");
    const data = await response.json();
    return String(data.sessionId);
  };

  const submitOpponentResult = async () => {
    if (!session.value) return;
    const response = await fetch(
      `/api/friend-challenge?sessionId=${encodeURIComponent(session.value.sessionId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: playerStore.points,
          username: playerStore.playerName,
          avatarIndex: playerStore.avatarIndex,
          answerHistory: playerStore.answerHistory,
        }),
        keepalive: true,
      },
    );

    if (response.ok) {
      session.value = (await response.json()) as ChallengeSession;
      persist();
    }
  };

  loadStored();

  return {
    session,
    active,
    setSession,
    clearSession,
    startAcceptedChallenge,
    createChallenge,
    submitOpponentResult,
  };
});
