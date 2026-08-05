import { defineStore } from "pinia";
import { computed, ref } from "vue";

type DailyRanking = {
  name: string;
  score: number;
  avatarIndex: number;
  userId?: string;
};

type DailyWinner = {
  date: string;
  winner?: DailyRanking;
  userId?: string;
};

const getDailyWinnerId = (winner: DailyWinner): string | null => {
  if (winner.winner?.userId) {
    return winner.winner.userId;
  }

  return winner.userId ?? null;
};

export const useDailyStore = defineStore("daily", () => {
  const dailyRounds = ref([]);
  const date = ref("");
  const isLoading = ref(false);
  const hasSubmitted = ref(false);
  const mode = ref<"classic" | "inspect" | "gravity">("classic");
  const error = ref<string | null>(null);
  const dailyRankings = ref<DailyRanking[]>([]);
  const yesterdayRankings = ref<DailyRanking[]>([]);
  const winners = ref<DailyWinner[]>([]);
  const isYesterdayWinner = ref(false);

  const getDailyKey = () => {
    if (!date.value) return null;
    return `pix_daily_${date.value}`;
  };

  const storedDailyKey = ref(false);

  const hasPlayedToday = computed(() => storedDailyKey.value);

  const updateYesterdayWinnerState = () => {
    if (typeof window === "undefined") {
      isYesterdayWinner.value = false;
      return;
    }

    const playerProfile = localStorage.getItem("pixreveal:playerProfile");
    if (!playerProfile) {
      isYesterdayWinner.value = false;
      return;
    }

    try {
      const parsedProfile = JSON.parse(playerProfile);
      const currentPlayerName = parsedProfile?.name;
      const currentPlayerId = parsedProfile?.id;
      const firstWinner = winners.value[0];
      const yesterdayWinnerId = firstWinner
        ? getDailyWinnerId(firstWinner)
        : null;
      const currentPlayerKey =
        currentPlayerName && currentPlayerId
          ? `${currentPlayerName}-${currentPlayerId}`
          : null;

      console.log("daily winner check", {
        currentPlayerName,
        currentPlayerId,
        currentPlayerKey,
        yesterdayWinnerId,
        matches: Boolean(
          currentPlayerKey &&
          yesterdayWinnerId &&
          currentPlayerKey === yesterdayWinnerId,
        ),
      });

      isYesterdayWinner.value = Boolean(
        currentPlayerKey &&
        yesterdayWinnerId &&
        currentPlayerKey === yesterdayWinnerId,
      );
    } catch {
      isYesterdayWinner.value = false;
    }
  };

  const markAsPlayed = () => {
    if (typeof window !== "undefined") {
      const key = getDailyKey();
      if (key) {
        localStorage.setItem(key, "true");
        cleanupOldKeys(key);
        storedDailyKey.value = true;
      }
    }
  };

  const fetchDailyData = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch("/api/daily-challenge");
      if (!response.ok) throw new Error("Failed to fetch daily data");

      const data = await response.json();
      dailyRounds.value = data.rounds || [];
      dailyRankings.value = data.rankings || [];
      yesterdayRankings.value = data.yesterdayRankings || [];
      winners.value = data.winners || [];
      date.value = data.date || "";
      mode.value = data.mode || "classic";

      if (typeof window !== "undefined") {
        const key = `pix_daily_${date.value}`;
        storedDailyKey.value = !!localStorage.getItem(key);
        updateYesterdayWinnerState();
      }
    } catch (err: any) {
      error.value = err.message;
      console.error("Fetch error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const postRanking = async (
    name: string,
    score: number,
    avatarIndex: number,
    date: string,
    userId?: string,
  ) => {
    hasSubmitted.value = true;
    try {
      const response = await fetch("/api/post-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId, score, avatarIndex, date }),
      });
      if (!response.ok) throw new Error("Failed to post ranking");
    } catch (err: any) {
      hasSubmitted.value = false;
      console.error("Ranking error:", err);
    }
  };

  const cleanupOldKeys = (currentKey: string) => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("pix_daily_") && key !== currentKey) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    hasPlayedToday,
    isYesterdayWinner,
    markAsPlayed,
    dailyRounds,
    dailyRankings,
    yesterdayRankings,
    winners,
    date,
    isLoading,
    error,
    fetchDailyData,
    postRanking,
    mode,
    hasSubmitted,
    getDailyKey,
  };
});
