import { defineStore } from "pinia";
import { ref } from "vue";

export const useDailyStore = defineStore("daily", () => {
  const dailyRounds = ref([]);
  const date = ref("");
  const isLoading = ref(false);
  const mode = ref("classic");
  const error = ref(null);
  const dailyRankings = ref([]);
  const getDailyKey = () => {
    const date = new Date().toISOString().split("T")[0];
    return `pix_daily_${date}`;
  };

  const hasPlayedToday = ref(
    typeof window !== "undefined"
      ? !!localStorage.getItem(getDailyKey())
      : false,
  );

  const markAsPlayed = () => {
    if (typeof window !== "undefined") {
      const key = getDailyKey();
      localStorage.setItem(key, "true");
      hasPlayedToday.value = true;
      cleanupOldKeys(key);
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
      date.value = data.date || "";
      mode.value = data.mode || "classic";
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
  ) => {
    try {
      const response = await fetch("/api/post-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, avatarIndex, date }),
      });
      if (!response.ok) throw new Error("Failed to post ranking");
    } catch (err: any) {
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
    markAsPlayed,
    dailyRounds,
    dailyRankings,
    date,
    isLoading,
    error,
    fetchDailyData,
    postRanking,
    mode,
  };
});
