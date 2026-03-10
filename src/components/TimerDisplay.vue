<template>
  <div class="timer-wrapper">
    <div class="timer-bar-container">
      <div class="timer-glow"></div>

      <div
        class="timer-bar-fill"
        :class="{
          'is-empty': count <= 0,
          'is-danger': count <= 3,
          'is-warning': count < 7,
          'is-correct': isCorrect,
          'is-incorrect': showIncorrect,
        }"
        :style="{
          width: isCorrect || showIncorrect ? '100%' : progressWidth + '%',
        }"
      ></div>
      <div v-if="isCorrect" class="timer-glow-sweep animate-sweep"></div>
      <div v-if="isCorrect" class="text-success-msg timer-text" key="correct">
        NICE!
      </div>
      <div
        v-else-if="showIncorrect"
        class="text-success-msg timer-text"
        key="incorrect"
      >
        NOPE!
      </div>
      <div
        v-else
        :key="count"
        class="timer-text"
        :class="{
          'is-shaking': count > 0 && count <= 3,
          'text-danger': count <= 0,
        }"
      >
        <span v-if="count > 0"
          >{{ count }} <Icon icon="pixel:star-solid"
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
  isCorrect: {
    type: Boolean,
    default: false,
  },
  isIncorrect: {
    type: Boolean,
    default: false,
  },
});

const showIncorrect = computed(() => props.isIncorrect && props.count > 0);

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
  margin-bottom: 32px;
}

.timer-bar-container {
  position: relative;
  height: 24px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 2px;
  overflow: hidden;
  border: 2px solid #1a1c26;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.timer-bar-fill {
  height: 100%;
  background: var(--neon-success);
  box-shadow: 0 0 15px var(--neon-success);
  transition:
    width 0.1s linear,
    background-color 0.3s ease;
}

.is-warning {
  background-color: var(--neon-yellow);
  box-shadow: 0 0 15px var(--neon-yellow);
}

.is-danger {
  background-color: var(--neon-error);
  box-shadow: 0 0 15px var(--neon-error);
}

.is-empty {
  background-color: var(--neon-error) !important;
  box-shadow: 0 0 20px var(--neon-error) !important;
  width: 0% !important;
}

.timer-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 10px var(--primary);
  letter-spacing: 2px;
  span {
    display: flex;
    align-items: center;
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

.is-correct {
  background-color: var(--neon-success, #39ff14) !important;
  box-shadow: 0 0 20px var(--neon-success, #39ff14) !important;
  width: 100% !important;
  transition:
    width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    background-color 0.3s ease !important;
}

.is-incorrect {
  background-color: var(--neon-error) !important;
  box-shadow: 0 0 20px var(--neon-error) !important;
  width: 100% !important;
  transition:
    width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    background-color 0.3s ease !important;
}

.text-success-msg {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 4px;
}

.text-slide-enter-active {
  animation: slide-in 0.4s ease-out;
}
.text-slide-leave-active {
  animation: slide-out 0.2s ease-in;
}

@keyframes slide-in {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.timer-glow-sweep {
  position: absolute;
  top: 0;
  left: -150%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
  transform: skewX(-20deg);
  pointer-events: none;
}

.animate-sweep {
  animation: sweep-effect 0.8s ease-out forwards;
}

@keyframes sweep-effect {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
