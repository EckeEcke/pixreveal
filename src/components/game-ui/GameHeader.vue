<template>
  <header
    class="game-header"
    :class="!playerStore.isCreatorMode ? 'header-grid' : ''"
  >
    <div
      v-if="!playerStore.isCreatorMode && (isSurvival || maxRounds)"
      class="header-section left"
    >
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

    <div class="header-section center">
      <GameTimerDisplay
        :count="count"
        :max="max"
        :is-correct="isCorrect"
        :is-incorrect="isIncorrect"
        :is-survival="isSurvival"
        :is-sudden-death="isSuddenDeath"
        :is-creator-mode="playerStore.isCreatorMode"
      />
    </div>

    <div
      v-if="!playerStore.isCreatorMode && totalScore !== undefined"
      class="header-section right"
    >
      <div class="inset-pill gold-accent">
        <div class="pill-value">
          <transition name="slide-up" mode="out-in">
            <div :key="totalScore" class="score">
              <span class="gold-text">
                <Icon icon="pixel:star-solid" class="pill-icon" />
              </span>
              <span>{{ totalScore }}</span>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <span
      v-if="!playerStore.isCreatorMode && props.isBonus"
      class="bonus-info"
      aria-label="Bonus round active"
    >
      2x
    </span>
  </header>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { usePlayerStore } from "@/stores/player"
import GameTimerDisplay from "./GameTimerDisplay.vue"

const props = defineProps<{
  count: number
  max?: number
  isCorrect?: boolean
  isIncorrect?: boolean
  totalScore?: number
  highscore?: number
  currentRound?: number
  maxRounds?: number
  isSurvival: boolean
  isBonus?: boolean
  isSuddenDeath?: boolean
}>()

const playerStore = usePlayerStore()
</script>

<style scoped>
.game-header {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 8px 14px;
  gap: 12px;
  background: linear-gradient(
    180deg,
    rgba(20, 10, 40, 0.9),
    rgba(10, 10, 20, 0.9)
  );
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
  @media (min-width: 1024px) {
    background: none;
  }
}

.header-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

.header-section.center:only-child {
  grid-column: 1 / -1;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 2px 2px 6px rgba(10, 10, 10, 0.4);
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

.pill-icon {
  font-size: 24px;
}

.pill-icon.blue {
  color: #3b82f6;
}

.gold-text {
  color: #fbbf24;
  margin-bottom: -4px;
  filter: drop-shadow(1px 1px 1px black);
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

.bonus-info {
  position: absolute;
  bottom: -48px;
  right: 16px;
  font-size: 32px;
  color: white;
  font-weight: 900;
  text-shadow: 1px 1px 1px var(--primary);
  animation: pulse 1s infinite;
  z-index: 99;
}
</style>