<template>
  <div
    class="player-hud"
    :class="{ pending: hasFinished === false }"
  >
    <div class="hud-avatar" :style="avatarStyle"></div>
    <div>
      <div class="hud-username">
        {{ name }}<template v-if="showYouIndicator"> (YOU)</template>
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
            <Icon icon="pixel:crown-solid" class="star-icon" />
            {{ highscore }}
          </div>
        </transition>
      </div>
      <div v-if="points || points === 0" class="hud-points">
        <transition name="score-pop" mode="out-in">
          <div :key="points" class="score-wrapper">
            <Icon icon="pixel:star-solid" class="star-icon" /> {{ points }}
          </div>
        </transition>
        <transition name="float-bonus">
          <span v-if="showBonus" class="hud-bonus-popup">+{{ lastBonus }}</span>
        </transition>
      </div>
    </div>

    <div v-if="isHost" class="host-info">
      <Icon icon="pixel:crown-solid" />
      HOST
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import avatarSheet from "@/assets/avatars/avatars.jpg";
import { Icon } from "@iconify/vue";

const props = defineProps({
  name: String,
  avatarIndex: Number,
  points: Number | undefined,
  highscore: Number | undefined,
  hasFinished: Boolean | undefined,
  isHost: Boolean,
  correctAnswers: Number | undefined,
  roundIndex: Number | undefined,
  maxRounds: Number | undefined,
  showYouIndicator: Boolean,
});

const showBonus = ref(false);
const lastBonus = ref(0);
const showCorrectBonus = ref(false);

watch(
  () => props.points,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      lastBonus.value = newVal - oldVal;
      showBonus.value = false;
      nextTick(() => {
        showBonus.value = true;
        setTimeout(() => {
          showBonus.value = false;
        }, 750);
      });
    }
  },
);

watch(
  () => props.correctAnswers,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      showCorrectBonus.value = false;

      nextTick(() => {
        showCorrectBonus.value = true;
        setTimeout(() => {
          showCorrectBonus.value = false;
        }, 800);
      });
    }
  },
);

const avatarStyle = computed(() => {
  const index = props.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});
</script>

<style scoped>
.elements-right {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
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

@keyframes score-bump {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
    color: var(--neon-yellow);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes score-bump-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
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

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  20% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

.player-hud {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--card-bg);
  border: 2px solid #1a1c26;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  backdrop-filter: blur(5px);
  min-width: 240px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
  background-image: radial-gradient(
    circle at 2px 2px,
    rgba(255, 255, 255, 0.15) 1px,
    transparent 0
  );
  background-size: 100% 4px;
  background: rgba(15, 15, 25, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hud-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.hud-avatar {
  width: 44px;
  height: 44px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
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
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
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
}
</style>
