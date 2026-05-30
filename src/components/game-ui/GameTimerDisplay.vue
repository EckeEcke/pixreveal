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

          <span v-else-if="isCorrect" class="msg-bold success" key="c"
            >NICE!</span
          >
          <span v-else-if="isIncorrect" class="msg-bold error" key="i"
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
              v-if="!isSurvival"
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
    0 0 12px rgba(0, 255, 150, 0.15),
    inset 0 0 10px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #39ff14, #00ffa6);
  box-shadow: 0 0 12px #39ff14;
  transition:
    width 0.1s linear,
    background 0.3s ease;
}

.is-warning {
  background: linear-gradient(90deg, #fbbf24, #ff9f1a);
  box-shadow: 0 0 10px #fbbf24;
}

.is-danger {
  background: linear-gradient(90deg, #ff4757, #ff1e1e);
  box-shadow: 0 0 12px #ff4757;
}

.is-correct {
  background: linear-gradient(90deg, #39ff14, #00ffa6);
}

.is-incorrect {
  background: linear-gradient(90deg, #ff4757, #ff1e1e);
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
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: sweep 0.6s ease-out forwards;
}

.pulse-text {
  animation: text-pulse 1.2s infinite ease-in-out;
  color: var(--white);
}
</style>