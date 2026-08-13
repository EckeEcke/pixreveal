vue
<template>
  <div class="daily-status-container">
    <div class="countdown-wrapper">
      <span class="label">
        <Icon icon="pixel:clock" class="clock" /> Next Challenge in:
      </span>
      <span class="timer-value">{{ timeLeft }}</span>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useDailyCountDown } from "@/composables/useDailyCountDown";

const { timeLeft } = useDailyCountDown();
</script>

<style scoped>
.daily-status-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.countdown-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap:nowrap;
  color: var(--white);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}

.value {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
}

.timer-value {
  color: #ff3e6d;
  font-weight: 800;
  font-size: 24px;
  letter-spacing: 1px;
  width: 115px;
}

.clock {
  font-size: 20px;
  color: var(--primary);
  animation: pulse 2s infinite;
}

@media (max-width: 768px) {
  .daily-status-container {
    align-items: center;
  }

  .countdown-wrapper {
    width: 100%;
  }
}
</style>
