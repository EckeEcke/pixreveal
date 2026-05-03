<template>
  <div class="daily-status-container">
    <div class="countdown-wrapper">
      <span class="label">Next Challenge in:</span>
      <span class="timer-value">{{ timeLeft }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const timeLeft = ref("00:00:00");
let timerInterval = null;

const updateCountdown = () => {
  const now = new Date();

  const target = new Date();
  target.setUTCHours(7, 0, 0, 0);

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

  timeLeft.value = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.daily-status-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mode-info,
.countdown-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: var(--white);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
}

.timer-value {
  color: #ff3e6d;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .daily-status-container {
    align-items: center;
  }

  .mode-info,
  .countdown-wrapper {
    width: 100%;
    max-width: 250px;
  }
}
</style>
