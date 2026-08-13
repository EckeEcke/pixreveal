<template>
  <div
    class="player-hud"
    :class="[
      size,
      {
        pending: isPending,
        active: isActive,
        first: position === 1 || shiny,
        rounded: rounded,
      },
    ]"
  >
    <PositionInfo v-if="position" :position="position" />
    <div
      v-if="avatarIndex !== undefined"
      class="hud-avatar"
      :style="avatarStyle"
    ></div>
    <div>
      <div class="hud-username" :class="{ first: position === 1 || shiny }">
        {{ name }}<template v-if="showYouIndicator"> (YOU)</template>
      </div>
      <div v-if="subline" class="hud-subline">{{ subline }}</div>
      <div v-if="sublineSmall" class="hud-subline-small">
        {{ sublineSmall }}
      </div>
    </div>
    <div
      v-if="
        roundIndex ||
        roundIndex === 0 ||
        highscore ||
        highscore === 0 ||
        points ||
        points === 0
      "
      class="elements-right"
    >
      <div v-if="roundIndex || roundIndex === 0" class="hud-rounds">
        <Icon icon="pixel:image-solid" class="image-icon" />
        <div class="round-counter-view">
          <transition name="slide-up" mode="out-in">
            <span :key="roundIndex">{{ roundIndex }}</span>
          </transition>
          <span>/{{ maxRounds }}</span>
        </div>
      </div>
      <div v-if="highscore || highscore === 0" class="hud-highscore">
        <transition name="score-pop" mode="out-in">
          <div :key="highscore" class="highscore-wrapper">
            <Icon icon="pixel:crown-solid" class="star-icon" /> {{ highscore }}
          </div>
        </transition>
      </div>
      <div v-if="points || points === 0" class="hud-points">
        <transition name="score-pop" mode="out-in">
          <div :key="points" class="score-wrapper">
            <Icon icon="pixel:star-solid" class="star-icon" />
            <span :class="{ negative: points < 0 }">{{ points }}</span>
          </div>
        </transition>
        <transition name="float-bonus">
          <span v-if="showBonus" class="hud-bonus-popup">+{{ lastBonus }}</span>
        </transition>
        <transition name="float-malus">
          <span v-if="showMalus" class="hud-malus-popup">-{{ lastMalus }}</span>
        </transition>
      </div>
    </div>
    <div v-if="isHost" class="host-info">
      <Icon icon="pixel:crown-solid" /> HOST
    </div>
    <div v-if="answerHistory?.length" class="hud-round-history">
      <span
        v-for="(correct, i) in answerHistory"
        :key="i"
        class="history-box"
        :class="correct ? 'correct' : 'incorrect'"
      ></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { CSSProperties } from "vue";
import avatarSheet from "@/assets/avatars/avatars.webp";
import { Icon } from "@iconify/vue";
import PositionInfo from "./PositionInfo.vue";
const props = withDefaults(
  defineProps<{
    position?: number;
    name?: string;
    subline?: string;
    sublineSmall?: string;
    avatarIndex?: number;
    points?: number;
    highscore?: number;
    isPending?: boolean;
    isHost?: boolean;
    isActive?: boolean;
    correctAnswers?: number;
    roundIndex?: number;
    maxRounds?: number;
    showYouIndicator?: boolean;
    rounded?: boolean;
    shiny?: boolean;
    size?: "medium" | "small";
    answerHistory?: boolean[];
  }>(),
  { size: "medium" },
);
const showBonus = ref(false);
const lastBonus = ref(0);
const showMalus = ref(false);
const lastMalus = ref(0);
const animateBonus = (delta: number) => {
  lastBonus.value = delta;
  showBonus.value = false;
  nextTick(() => {
    showBonus.value = true;
    setTimeout(() => {
      showBonus.value = false;
    }, 750);
  });
};
const animateMalus = (delta: number) => {
  lastMalus.value = delta;
  showMalus.value = false;
  nextTick(() => {
    showMalus.value = true;
    setTimeout(() => {
      showMalus.value = false;
    }, 750);
  });
};
watch(
  () => props.points,
  (newVal, oldVal) => {
    const current = typeof newVal === "number" ? newVal : 0;
    const previous = typeof oldVal === "number" ? oldVal : 0;
    const delta = current - previous;
    if (delta > 0) {
      animateBonus(delta);
    } else if (delta < 0) {
      animateMalus(Math.abs(delta));
    }
  },
);
const avatarStyle = computed<CSSProperties>(() => {
  const index = props.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated" as CSSProperties["imageRendering"],
  };
});
</script>
<style scoped>
.elements-right {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
  margin-left: auto;
}
.hud-points,
.hud-rounds,
.hud-highscore {
  display: flex;
  flex-direction: row;
  gap: 4px;
  position: relative;
  padding: 8px;
  font-size: 20px;
  font-weight: 700;
}
.score-wrapper,
.highscore-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}
.hud-points,
.hud-correct {
  position: relative;
}
.negative {
  color: var(--neon-error);
}
.round-counter-view {
  display: flex;
  overflow: hidden;
  height: 1.2em;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.score-pop-enter-from {
  opacity: 0;
}
.score-pop-enter-active {
  animation: score-bump 0.3s ease-out;
}
.score-pop-leave-active {
  animation: score-bump-out 0.15s ease-in forwards;
}
.hud-bonus-popup {
  position: absolute;
  top: -20px;
  left: 20px;
  color: var(--neon-success);
  font-weight: bold;
  font-size: 18px;
  pointer-events: none;
  z-index: 1;
}
.hud-malus-popup {
  position: absolute;
  top: -20px;
  right: 20px;
  color: var(--neon-error);
  font-weight: bold;
  font-size: 18px;
  pointer-events: none;
  z-index: 1;
}
.float-bonus-enter-active {
  animation: float-up 0.8s ease-out forwards;
}
.float-bonus-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.float-bonus-leave-active {
  display: none;
}
.float-bonus-leave-to {
  opacity: 0;
}
.float-bonus-leave-active {
  display: none;
}
.float-malus-enter-active {
  animation: float-up 0.8s ease-out forwards;
}
.float-malus-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.float-malus-leave-active {
  display: none;
}
.player-hud {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  row-gap: 4px;
  padding: 12px;
  backdrop-filter: blur(5px);
  min-width: 240px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
  background-size: 100% 4px;
  background: rgba(10, 4, 20, 0.92);
  box-sizing: border-box;
}
.rounded {
  border-radius: 8px;
}
.player-hud.first::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -60%;
  width: 30%;
  height: 300%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
  animation: shine 4s infinite;
}
.player-hud.active {
  border: 2px solid var(--neon-pink);
  box-shadow: 0 0 10px var(--neon-pink);
  animation: floating 1s ease-in-out infinite;
}
.hud-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}
.hud-avatar {
  width: 36px;
  height: 36px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  @media (min-width: 576px) {
    width: 44px;
    height: 44px;
  }
}
@container (max-width: 260px) {
  .hud-avatar {
    display: none;
  }
}
.hud-stats {
  display: flex;
  gap: 16px;
  align-items: baseline;
  font-weight: 700;
  div {
    display: flex;
    gap: 4px;
    align-items: center;
  }
}
.hud-username {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  @media (min-width: 576px) {
    font-size: 18px;
  }
  &.first {
    color: var(--neon-yellow);
  }
}
.hud-subline {
  margin-top: 2px;
  font-size: 18px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}
.hud-subline-small {
  margin-top: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}
.host-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  background: lightgray;
  padding: 8px;
  border-radius: 8px;
  color: black;
  font-size: 12px;
}
.pending {
  opacity: 0.4;
}
.star-icon {
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 5px var(--neon-yellow));
}
.image-icon {
  color: var(--neon-blue);
  filter: drop-shadow(0 0 5px var(--neon-blue));
  height: 24px;
}
.check-icon {
  color: var(--neon-success);
  filter: drop-shadow(0 0 5px var(--neon-success));
} /* SMALL VARIANT */
.player-hud.small {
  gap: 10px;
  padding: 10px;
}
.player-hud.small .hud-avatar {
  width: 34px;
  height: 34px;
}
.player-hud.small .hud-username {
  font-size: 16px;
}
.player-hud.small .hud-points,
.player-hud.small .hud-highscore,
.player-hud.small .hud-rounds {
  font-size: 17px;
  padding: 6px;
}
.player-hud.small .star-icon,
.player-hud.small .image-icon {
  width: 18px;
  height: 18px;
}
.player-hud.small .elements-right {
  gap: 8px;
  padding: 6px;
}
.hud-round-history {
  flex: 1 0 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 0;
  align-items: center;
}
.history-box {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}
.history-box.correct {
  background: var(--neon-success);
}
.history-box.incorrect {
  background: var(--neon-error);
}
.history-box:nth-child(5n) {
  width: 32px;
  height: 32px;
}
.player-hud.small .history-box {
  width: 12px;
  height: 12px;
}

.player-hud.small .history-box:nth-child(5n) {
  width: 16px;
  height: 16px;
}
</style>
