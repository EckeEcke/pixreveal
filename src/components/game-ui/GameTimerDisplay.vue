<template>
  <div
    class="timer-wrapper"
    :class="{ 'shake-active': count > 0 && count <= 3 && !isCorrect }"
  >
    <div class="timer-bar-inset">
      <div
        class="timer-progress"
        :class="statusClass"
        :style="{ width: displayWidth + '%' }"
      >
        <div v-if="isCorrect" class="sweep-effect"></div>
      </div>

      <div class="timer-content">
        <transition name="text-pop" mode="out-in">
          <span
            v-if="isCreatorMode && count === 0"
            class="msg-bold success"
            key="d"
            >MAKE YOUR GUESS!</span
          >

          <span
            v-else-if="isCorrect"
            class="msg-bold success feedback"
            :class="`tier-${correctTier}`"
            :key="`c-${correctTier}`"
          >
            {{ correctLabels[correctTier] }}
          </span>
          <span
            v-else-if="isIncorrect"
            class="msg-bold error feedback nope"
            key="i"
            >NOPE!</span
          >
          <span v-else-if="isSuddenDeath" class="msg-bold pulse-text" key="sd"
            >SUDDEN DEATH</span
          >
          <span v-else-if="count <= 0" class="msg-bold danger" key="t"
            >TIME UP</span
          >
          <span v-else class="timer-digits" :key="count"
            >{{ count }}
            <Icon
              v-if="!isSurvival &&!hideStar"
              icon="pixel:star-solid"
              class="pill-icon gold-text"
            /><template v-else>s</template></span
          >
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { Icon } from "@iconify/vue"

const props = defineProps<{
  count: number
  max?: number
  isCorrect?: boolean
  isIncorrect?: boolean
  isSurvival: boolean
  isSuddenDeath?: boolean
  isCreatorMode?: boolean
  hideStar?: boolean
}>()

const displayWidth = computed(() => {
  if (props.isSuddenDeath) return 100
  return props.isCorrect || props.isIncorrect
    ? 100
    : Math.max(0, (props.count / (props.max || 15)) * 100)
})

const statusClass = computed(() => ({
  "is-correct": props.isCorrect,
  "is-incorrect": props.isIncorrect,
  "is-danger":
    (props.isSuddenDeath || props.count <= 3) &&
    !props.isCorrect &&
    !props.isIncorrect,
  "is-warning":
    !props.isSuddenDeath &&
    props.count < 7 &&
    props.count > 3 &&
    !props.isCorrect &&
    !props.isIncorrect,
}))

const CLOSE_CALL_SECONDS = 2
const TIER_AWESOME = 0.66
const TIER_GREAT = 0.33

const correctLabels = {
  awesome: "WOW!",
  great: "GREAT!",
  nice: "NICE!",
  close: "PHEW!",
} as const

const correctTier = computed<keyof typeof correctLabels>(() => {
  if (props.isSuddenDeath) return "nice"
  if (props.count <= CLOSE_CALL_SECONDS) return "close"
  const ratio = props.count / (props.max || 15)
  if (ratio >= TIER_AWESOME) return "awesome"
  if (ratio >= TIER_GREAT) return "great"
  return "nice"
})
</script>

<style scoped>
.timer-wrapper {
  width: 100%
}

.timer-bar-inset {
  height: 36px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  box-shadow:
    inset 0 0 10px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.timer-progress {
  height: 100%;
  background: color-mix(in srgb, var(--neon-success) 95%, white);
  border-radius: 4px;
  box-shadow: 0 0 12px #39ff14;
  transition:
    width 0.1s linear,
    background 0.3s ease;
}

.is-warning {
  background: color-mix(in srgb, var(--neon-yellow) 95%, white);
  box-shadow: 0 0 10px #fbbf24;
}

.is-danger {
  background: color-mix(in srgb, var(--neon-error) 95%, white);
  box-shadow: 0 0 12px #ff4757;
}

.is-correct {
  background: color-mix(in srgb, var(--neon-success) 95%, white);
}

.is-incorrect {
  background: color-mix(in srgb, var(--neon-error) 95%, white);
}

.timer-content {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timer-digits {
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1px;
  text-shadow:
    0 0 4px rgba(255, 255, 255, 0.3),
    1px 1px 0 #000;
}

.pill-icon {
  font-size: 24px;
}

.gold-text {
  color: #fbbf24;
  margin-bottom: -4px;
  filter: drop-shadow(1px 1px 1px black);
}

.msg-bold {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 1px;
  text-shadow:
    0 0 4px rgba(255, 255, 255, 0.3),
    1px 1px 0 #000;
}

.shake-active {
  animation: shake 0.3s infinite;
}

.text-pop-enter-active {
  animation: pop 0.2s ease-out;
}

.sweep-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 14%;
  height: 100%;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.55);
  box-shadow:
    -12px 0 0 rgba(255, 255, 255, 0.28),
    -24px 0 0 rgba(255, 255, 255, 0.12);
  transform: translateX(-300%);
  animation: sweep-pixel 0.5s steps(12) forwards;
}

@keyframes sweep-pixel {
  to {
    transform: translateX(800%);
  }
}

.pulse-text {
  animation: text-pulse 1.2s infinite ease-in-out;
  color: var(--white);
}

.msg-bold.feedback {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-shadow: 1px 1px 0 #000;
}

.msg-bold.feedback.success {
  animation: feedback-pop 0.3s steps(6) both;
}

.msg-bold.feedback.tier-great {
  font-size: 22px;
}

.msg-bold.feedback.tier-awesome {
  font-size: 24px;
  animation: feedback-pop-big 0.4s steps(8) both;
}

.msg-bold.feedback.tier-close {
  animation: feedback-close 0.45s steps(9) both;
}

.msg-bold.feedback.nope {
  animation: feedback-shake 0.4s steps(8) both;
}

@keyframes feedback-pop {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes feedback-pop-big {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.35);
    opacity: 1;
  }
  75% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes feedback-close {
  0% {
    transform: scale(0.5) rotate(0deg);
    opacity: 0;
  }
  30% {
    transform: scale(1.1) rotate(-5deg);
    opacity: 1;
  }
  60% {
    transform: scale(1) rotate(4deg);
  }
  80% {
    transform: scale(1) rotate(-2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes feedback-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  50% {
    transform: translateX(6px);
  }
  75% {
    transform: translateX(-3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .msg-bold.feedback.success,
  .msg-bold.feedback.nope,
  .msg-bold.feedback.tier-awesome,
  .msg-bold.feedback.tier-close {
    animation: none;
  }
}
</style>