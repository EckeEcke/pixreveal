import { ref, onScopeDispose } from "vue";

export function useDailyCountDown(resetHourUTC = 7) {
  const timeLeft = ref("00:00:00");
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const updateCountdown = () => {
    const now = new Date();

    const target = new Date();
    target.setUTCHours(resetHourUTC, 0, 0, 0);

    if (now.getTime() >= target.getTime()) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      timeLeft.value = "00:00:00";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timeLeft.value = [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":");
  };

  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);

  onScopeDispose(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  return { timeLeft };
}
