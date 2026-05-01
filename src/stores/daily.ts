import { defineStore } from "pinia";
import { ref } from "vue";

export const useDailyStore = defineStore("daily", () => {
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
  };
});
