<template>
  <header
    class="game-header"
    :class="!playerStore.isCreatorMode ? 'header-grid' : ''"
  >
    <!-- LEFT -->
    <div v-if="!playerStore.isCreatorMode" class="header-section left">
      <div class="inset-pill blue-accent">
        <div class="pill-value">
          <transition name="slide-up" mode="out-in">
            <span :key="isSurvival ? highscore : currentRound">
              <Icon
                v-if="isSurvival"
                icon="pixel:crown-solid"
                class="pill-icon blue"
              />
              {{ isSurvival ? highscore : currentRound }}
            </span>
          </transition>
          <span v-if="!isSurvival" class="pill-total">/{{ maxRounds }}</span>
        </div>
      </div>
    </div>

    <!-- CENTER -->
    <div class="header-section center">
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
                v-if="playerStore.isCreatorMode && count === 0"
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
    </div>

    <!-- RIGHT -->
    <div v-if="!playerStore.isCreatorMode" class="header-section right">
      <div class="inset-pill gold-accent">
        <div class="pill-value">
          <transition name="score-bump" mode="out-in">
            <div :key="totalScore" class="score">
              <span class="gold-text">
                <Icon icon="pixel:star-solid" class="pill-icon" />
              </span>
              <span>{{ totalScore }}</span>
            </div>
          </transition>

          <transition name="float-up">
            <span v-if="showBonus" class="bonus-float">+{{ lastBonus }}</span>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import { usePlayerStore } from "@/stores/player";

const props = defineProps<{
  count: number;
  max?: number;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  totalScore: number;
  highscore?: number;
  currentRound?: number;
  maxRounds?: number;
  isSurvival: boolean;
}>();

const playerStore = usePlayerStore();

const showBonus = ref(false);
const lastBonus = ref(0);

const displayWidth = computed(() =>
  props.isCorrect || props.isIncorrect
    ? 100
    : Math.max(0, (props.count / (props.max || 15)) * 100),
);

const statusClass = computed(() => ({
  "is-correct": props.isCorrect,
  "is-incorrect": props.isIncorrect,
  "is-danger": props.count <= 3 && !props.isCorrect && !props.isIncorrect,
  "is-warning":
    props.count < 7 &&
    props.count > 3 &&
    !props.isCorrect &&
    !props.isIncorrect,
}));

watch(
  () => props.totalScore,
  (newV, oldV) => {
    if (newV > oldV) {
      lastBonus.value = newV - oldV;
      showBonus.value = true;
      setTimeout(() => (showBonus.value = false), 800);
    }
  },
);
</script>

<style scoped>
.game-header {
  padding: 8px 14px;
  gap: 12px;
  background: linear-gradient(
    180deg,
    rgba(20, 10, 40, 0.9),
    rgba(10, 10, 20, 0.9)
  );
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  @media (min-width: 1024px) {
    background: none;
  }
}

.header-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

.header-section.center {
  display: flex;
  justify-content: center;
}
.header-section.right {
  display: flex;
  justify-content: flex-end;
  .score {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.inset-pill {
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
  position: relative;
  transition: 0.15s ease;
}

.pill-value {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  text-shadow:
    0 0 4px rgba(255, 255, 255, 0.3),
    1px 1px 0 #000;
}

.pill-total {
  font-size: 16px;
  opacity: 0.5;
}

.gold-text {
  color: #fbbf24;
  margin-bottom: -4px;
}

.pill-icon {
  font-size: 24px;
}

.pill-icon.blue {
  color: #3b82f6;
}

.timer-wrapper {
  width: 100%;
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

.msg-bold {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 1px;
  text-shadow:
    0 0 4px rgba(255, 255, 255, 0.3),
    1px 1px 0 #000;
}

.bonus-float {
  position: absolute;
  top: -18px;
  right: 0;
  color: #39ff14;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 8px #39ff14;
}

.shake-active {
  animation: shake 0.3s infinite;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-1px);
  }
  75% {
    transform: translateX(1px);
  }
}

@keyframes pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.text-pop-enter-active {
  animation: pop 0.2s ease-out;
}

@keyframes float {
  0% {
    transform: translateY(8px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-25px);
    opacity: 0;
  }
}

.float-up-enter-active {
  animation: float 0.8s forwards;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from {
  transform: translateY(5px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-5px);
  opacity: 0;
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

@keyframes sweep {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
