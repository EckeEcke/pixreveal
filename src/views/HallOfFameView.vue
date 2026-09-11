<template>
  <main>
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>
    <div class="card">
      <h1 class="logo">
        PIX<span>REVEAL</span><br />HALL OF <span>FAME</span>
      </h1>
      <p class="subline">
        <Icon icon="pixel:sparkles" /> All winners of Daily Challenge
        <Icon icon="pixel:sparkles" />
      </p>
      <p class="desc">
        Welcome to the Hall of Fame! These players successfully solved
        the daily challenge with the highest scores. Want to enter the
        Hall of Fame? Play today's challenge, guess the revealing drawing and secure your place among the best!
      </p>

      <div v-if="groupedWinners.length" class="month-nav">
        <button
          class="pagination-btn"
          :disabled="currentMonthIndex >= groupedWinners.length - 1"
          @click="currentMonthIndex++"
          data-sfx="click"
        >
          <Icon icon="pixel:angle-left-solid" />
        </button>
        <span class="month-label"><Icon icon="pixel:calender" class="month-icon" /> {{ currentGroup.label }}</span>
        <button
          class="pagination-btn"
          :disabled="currentMonthIndex <= 0"
          @click="currentMonthIndex--"
          data-sfx="click"
        >
          <Icon icon="pixel:angle-right-solid" />
        </button>
      </div>

      <div v-if="currentGroup" class="player-grid">
        <div
          v-for="entry in currentGroup.entries"
          :key="entry.date"
          class="trophy-tile"
          :class="{ latest: isLatest(entry) }"
          :style="{ '--glow': glowColor(entry.winner.avatarIndex) }"
        >
          <span class="day-badge"><Icon icon="pixel:calender" /> {{ dayNumber(entry.date) }}</span>
          <TopPlayerDisplay
            :name="entry.winner.name"
            :avatar-index="entry.winner.avatarIndex"
            :score="entry.winner.score"
            class="player-card"
          />
        </div>
      </div>

      <p v-else class="desc">No winners yet — be the first!</p>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import { useDailyStore } from "@/stores/daily"
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue"

const dailyStore = useDailyStore()

const winners = computed(() => dailyStore.winners)

// winners assumed sorted newest first, format { date: 'YYYY-MM-DD', winner: { name, avatarIndex, score } }
const groupedWinners = computed(() => {
  const groups = {}
  winners.value.forEach((entry) => {
    const key = entry.date.slice(0, 7)
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  })

  return Object.keys(groups)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => {
      const [year, month] = key.split("-").map(Number)
      const label = new Date(year, month - 1, 1)
        .toLocaleDateString("en-US", { month: "long", year: "numeric" })
        .toUpperCase()
      return { monthKey: key, label, entries: groups[key] }
    })
})

const currentMonthIndex = ref(0)

const currentGroup = computed(
  () => groupedWinners.value[currentMonthIndex.value]
)

const latestDate = computed(() => winners.value[0]?.date)

function isLatest(entry) {
  return entry?.date === latestDate.value
}

function dayNumber(date) {
  const day = Number(date.slice(8, 10))
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th"
  return `${day}${suffix}`
}

const glowPalette = [
  "#ff4d94",
  "#4dd2ff",
  "#7dff4d",
  "#ffd24d",
  "#c04dff",
  "#ff794d",
]

function glowColor(avatarIndex) {
  return glowPalette[avatarIndex % glowPalette.length]
}
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
}

.back-btn-wrapper {
  min-width: 32px;
  width: 100%;
  max-width: 1280px;
  margin-bottom: 16px;
}

.subline {
  margin-bottom: 16px;
  display: flex;
  place-items: center;
  gap: 8px;
  text-align: center;
  color: var(--neon-yellow);
  font-weight: 700;
}

.desc {
  font-size: 14px;
  text-wrap: balance;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.25;
}

h1 {
  margin: 16px auto;
}

.card {
  display: flex;
  flex-direction: column;
  place-items: center;
  border-radius: 8px;
  padding: 24px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 1280px;
  box-sizing: border-box;
}

.month-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.month-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 1px;
  color: var(--neon-yellow, #ffd24d);
  min-width: 200px;
  text-align: center;
}

.month-icon {
  font-size: 22px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary);
  border-color: var(--neon-primary);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.player-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.trophy-tile {
  position: relative;
  border-radius: 8px;
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--glow) 14%, transparent) 0%,
    transparent 70%
  ),
  rgba(255, 255, 255, 0.03);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trophy-tile:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.08);
}

.trophy-tile.latest {
}

@keyframes pulse-glow {
  0%,
  100% {
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--glow) 14%, transparent) 0%,
      transparent 70%
    ),
    rgba(255, 255, 255, 0.03);
  }
  50% {
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--glow) 30%, transparent) 0%,
      transparent 75%
    ),
    rgba(255, 255, 255, 0.03);
  }
}

.day-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 36px;
  height: 26px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 0 7px;
  border-radius: 6px;
  white-space: nowrap;
}

.player-card {
  background: transparent;
  padding: 32px 0;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .month-label {
    font-size: 13px;
    min-width: 140px;
  }

  .player-grid {
    grid-template-columns: 1fr;
  }

  .player-card {
    padding: 16px 0;
  }

  .day-badge {
    top: 8px;
    right: 8px;
    min-width: 32px;
    height: 22px;
    font-size: 11px;
    padding: 0 6px;
  }
}
</style>