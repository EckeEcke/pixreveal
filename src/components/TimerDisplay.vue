<template>
  <div class="timer-wrapper">
    <div class="timer-bar-container">
      <div class="timer-glow"></div>

      <div
        class="timer-bar-fill"
        :class="{ 'is-empty': count <= 0, 'is-warning': count < 5 }"
        :style="{ width: progressWidth + '%' }"
      ></div>
      <div
        :key="count"
        class="timer-text"
        :class="{
          'text-danger': count <= 0,
          'is-shaking': count > 0 && count <= 3,
        }"
      >
        <span v-if="props.count > 0"
          >{{ props.count }} <Icon icon="pixel:star-solid"
        /></span>
        <span v-else>TIME UP</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    default: 15,
  },
});

const progressWidth = computed(() => {
  return Math.max(0, Math.min(100, (props.count / props.max) * 100));
});
</script>

<style scoped>
.timer-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.timer-bar-container {
  margin-top: 16px;
  position: relative;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(255, 77, 0, 0.2);
  border-radius: 4px;
}

.timer-bar-fill {
  height: 100%;
  background: var(--neon-orange);
  box-shadow: 0 0 15px var(--neon-orange);
  border-radius: 4px;
  transition:
    width 0.1s linear,
    background-color 0.3s ease;
}

.is-warning {
  background-color: #ffcc00;
  box-shadow: 0 0 15px #ffcc00;
}

.is-empty {
  background-color: #ff0044 !important;
  box-shadow: 0 0 20px #ff0044 !important;
  width: 0% !important;
}

.timer-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  letter-spacing: 2px;
  span {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    svg {
      color: var(--neon-yellow);
      filter: drop-shadow(0 0 5px var(--neon-yellow));
    }
  }
}

.text-danger {
  color: #ff0044;
  text-shadow: 0 0 15px #ff0044;
  animation: blink 0.5s infinite alternate;
}

.is-shaking {
  animation: shake-impact 0.4s ease-out;
  color: #ff0044;
  text-shadow: 0 0 15px #ff0044;
}

@keyframes shake-impact {
  0% {
    transform: translate(-50%, -50%) scale(1.5);
  }
  20% {
    transform: translate(-50%, -50%) translateX(-4px) rotate(-2deg);
  }
  40% {
    transform: translate(-50%, -50%) translateX(4px) rotate(2deg);
  }
  60% {
    transform: translate(-50%, -50%) translateX(-2px);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.5;
  }
}
</style>
