<template>
  <main>
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>
    <div class="card">
      <header class="hall-header">
      <div>
      <h1 class="logo">
        HALL OF <span>FAME</span>
      </h1>
      <p class="subline">
        <Icon icon="pixel:sparkles" /> All winners of Daily Challenge
        <Icon icon="pixel:sparkles" />
      </p>
      <p class="desc">A place for every Daily Challenge champion. Set today's highest score to join them.</p>
      </div>
      <ButtonLinkPrimary :link="dailyStore.hasPlayedToday ? '/rankings-daily' : '/daily'" class="daily-link">{{ dailyStore.hasPlayedToday ? "Today's results" : "Play today's Daily" }}</ButtonLinkPrimary>
      </header>

      <section v-if="topChampions.length" class="top-champions" aria-labelledby="top-champions-heading">
        <h2 id="top-champions-heading">MOST DAILY WINS</h2>
        <ol class="champions-grid">
          <li v-for="(champion, index) in topChampions" :key="champion.profileId" class="champion-entry" :class="`champion-place-${index + 1}`">
            <div class="champion-standing">
              <PositionInfo :position="index + 1" />
              <span v-if="champion.profileId === playerStore.playerId" class="champion-you">YOU</span>
            </div>
            <TopPlayerDisplay
              :name="champion.latest.winner.name"
              :avatar-index="champion.latest.winner.avatarIndex"
              :avatar-sprite-sheet="champion.latest.winner.avatarSpriteSheet"
              :name-effect="champion.latest.winner.nameEffect"
              :avatar-effect="champion.latest.winner.avatarEffect"
              class="champion-profile"
            />
            <div class="champion-wins"><strong>{{ champion.wins }}</strong><span>DAILY {{ champion.wins === 1 ? 'WIN' : 'WINS' }}</span></div>
          </li>
        </ol>
      </section>

      <div v-if="groupedWinners.length" class="month-nav">
        <button
          class="pagination-btn"
          :disabled="currentMonthIndex >= groupedWinners.length - 1"
          aria-label="Previous month"
          @click="currentMonthIndex++"
          data-sfx="click"
        >
          <Icon icon="pixel:angle-left-solid" />
        </button>
        <label class="month-label">
          <span class="sr-only">Choose month</span>
          <select v-model="currentMonthIndex" aria-label="Choose month">
            <option v-for="(group, index) in groupedWinners" :key="group.monthKey" :value="index">{{ group.label }}</option>
          </select>
        </label>
        <button
          class="pagination-btn"
          :disabled="currentMonthIndex <= 0"
          aria-label="Next month"
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
          :class="{ latest: isLatest(entry), own: isOwnWinner(entry) }"
          :style="{ '--glow': glowColor(entry.winner.avatarIndex) }"
        >
          <span v-if="isLatest(entry)" class="champion-label">CURRENT CHAMPION</span>
          <time class="day-badge" :datetime="entry.date" :title="fullDate(entry.date)">{{ dayNumber(entry.date) }}</time>
          <TopPlayerDisplay
            :name="entry.winner.name"
            :avatar-index="entry.winner.avatarIndex"
            :avatar-sprite-sheet="entry.winner.avatarSpriteSheet"
            :score="entry.winner.score"
            :name-effect="entry.winner.nameEffect"
            :avatar-effect="entry.winner.avatarEffect"
            class="player-card"
          />
          <span v-if="isOwnWinner(entry)" class="you-label">YOU</span>
        </div>
      </div>

      <p v-else class="desc">No winners yet — be the first!</p>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { Icon } from "@iconify/vue"
import { useDailyStore } from "@/stores/daily"
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue"
import PositionInfo from "@/components/game-ui/PositionInfo.vue"

import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue"
import { usePlayerStore } from "@/stores/player"
import { getTopChampions, getWinnerProfileId } from "@/utils/championStats"

const dailyStore = useDailyStore()
const playerStore = usePlayerStore()
const fullDate = date => new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const isOwnWinner = entry => {
  return getWinnerProfileId(entry) === playerStore.playerId
}

const winners = computed(() => dailyStore.winners.filter(entry => entry.winner).slice().sort((a, b) => b.date.localeCompare(a.date)))
const topChampions = computed(() => getTopChampions(winners.value))

const groupedWinners = computed(() => {
  const groups = {}

  const uniqueMap = new Map()
  winners.value.forEach((entry) => {
    if (!uniqueMap.has(entry.date)) {
      uniqueMap.set(entry.date, entry)
    }
  })

  uniqueMap.forEach((entry) => {
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

watch(groupedWinners, groups => {
  currentMonthIndex.value = Math.max(0, Math.min(currentMonthIndex.value, groups.length - 1))
})

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
.top-champions {
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  margin-bottom: 56px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}
.top-champions h2 {
  margin: 0 0 24px;
  font-size: 14px;
  text-align: left;
}
.champions-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
}
.champion-entry {
  --medal: #ffd24d;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--medal) 28%, #0f0c1d);
}
.champion-place-1 { grid-column: 2; grid-row: 1; padding-block: 28px; }
.champion-place-2 { --medal: #bfc9de; grid-column: 1; grid-row: 1; margin-top: 24px; }
.champion-place-3 { --medal: #d79a70; grid-column: 3; grid-row: 1; margin-top: 40px; }
.champion-standing { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--medal); }
.champion-you { font-size: 10px; color: var(--neon-cyan); }
.champion-profile { min-width: 0; gap: 16px; }
.champion-profile :deep(.player-pill) { min-width: 0; max-width: 100%; box-sizing: border-box; padding: 8px 12px; }
.champion-profile :deep(.player-name) { font-size: 14px; }
.top-champions .champion-profile :deep(.player-pill) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  box-shadow: none;
}
.top-champions .champion-profile :deep(.player-name) {
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: center;
  line-height: 1.4;
}
.champion-profile :deep(.avatar-container) { width: 64px; height: 64px; }
.champion-place-1 .champion-profile :deep(.avatar-container) { width: 88px; height: 88px; }
.champion-wins { display: flex; align-items: baseline; justify-content: center; gap: 8px; color: var(--medal); }
.champion-wins strong { font-size: 32px; line-height: 1; font-weight: 900; }
.champion-wins span { font-size: 10px; font-weight: 700; letter-spacing: .04em; }
.champion-place-1 .champion-wins strong { font-size: 40px; }
@media (max-width: 700px) {
  .top-champions { padding: 16px 12px; }
  .top-champions h2 { margin-bottom: 16px; font-size: 13px; }
  .champions-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  .champion-entry { grid-column: auto; grid-row: auto; margin: 0; padding: 14px 12px; display: grid; grid-template-columns: 34px minmax(0, 1fr) max-content; gap: 8px; column-gap: 12px; align-items: center; }
  .champion-standing { flex-direction: column; gap: 6px; }
  .champion-profile { display: flex; flex-direction: row; justify-content: flex-start; grid-column: 2; grid-row: 1; gap: 12px; }
  .champion-standing { grid-column: 1; grid-row: 1; }
  .champion-profile :deep(.player-pill) { flex: 1; min-width: 0; justify-content: flex-start; }
  .champion-profile :deep(.avatar-container), .champion-place-1 .champion-profile :deep(.avatar-container) { width: 56px; height: 56px; flex-shrink: 0; }
  .champion-profile :deep(.player-pill) { padding: 0; border: 0; background: none; box-shadow: none; }
  .champion-profile :deep(.player-name) { font-size: 13px; letter-spacing: 0; }
  .top-champions .champion-profile :deep(.player-name) { text-align: left; overflow-wrap: anywhere; font-size: 12px; }
  .champion-wins { grid-column: 3; grid-row: 1; justify-self: end; flex-direction: column; align-items: flex-end; text-align: right; gap: 4px; }
  .champion-wins strong, .champion-place-1 .champion-wins strong { font-size: 28px; }
  .champion-wins span { font-size: 8px; letter-spacing: 0; white-space: nowrap; }
}
@media (max-width: 380px) {
  .champion-entry { padding: 12px 8px; row-gap: 6px; grid-template-columns: 34px minmax(0, 1fr) max-content; }
  .champion-profile :deep(.avatar-container), .champion-place-1 .champion-profile :deep(.avatar-container) { width: 48px; height: 48px; }
}

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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
  padding: 48px 0 24px;
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

.daily-link { margin-bottom: 32px; }
.desc { max-width: 65ch; line-height: 1.6; margin-bottom: 20px; }
.month-nav { width: 100%; }
.month-label { position: relative; min-width: 0; }
.month-label select { appearance: none; max-width: 100%; min-width: 0; background: #0d0a14; color: inherit; font: inherit; border: 1px solid var(--border-color); border-radius: 4px; padding: 10px 12px; text-align: center; text-align-last: center; cursor: pointer; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.trophy-tile.latest { outline: 1px solid var(--neon-yellow); }
.champion-label { position: absolute; top: 12px; left: 12px; font-size: 10px; font-weight: 900; color: var(--neon-yellow); }
.you-label { display: block; text-align: center; font-size: 11px; font-weight: 900; color: var(--neon-cyan); margin: 0 0 12px; }
.own { border: 1px solid var(--neon-cyan); }
.player-card :deep(.player-pill) { min-width: 0; box-sizing: border-box; }
.player-card :deep(.player-score) { flex-shrink: 0; }
@media (max-width: 640px) {
 .card { padding: 20px 16px; }
 .month-nav { gap: 8px; }
 .pagination-btn { flex-shrink: 0; }
 .month-label { flex: 1; }
 .month-label select { width: 100%; font-size: 11px; padding-inline: 4px; }
 .trophy-tile { display: grid; grid-template-columns: 36px minmax(0, 1fr); align-items: center; gap: 12px; padding: 14px 12px; }
 .champion-label { position: static; grid-column: 1 / -1; }
 .day-badge { position: static; min-width: 0; padding: 0; height: auto; background: none; border: 0; font-size: 12px; }
 .player-card { flex-direction: row; gap: 12px; padding: 0; }
 .player-card :deep(.avatar-container) { width: 44px; height: 44px; border-radius: 6px; }
 .player-card :deep(.player-pill) { flex: 1; max-width: none; padding: 0; border: 0; background: none; box-shadow: none; justify-content: flex-start; gap: 8px; }
 .player-card :deep(.player-name) { font-size: 13px; letter-spacing: 0; }
 .player-card :deep(.player-score) { margin-left: auto; font-size: 14px; gap: 4px; }
 .player-card :deep(.score-divider) { display: none; }
 .trophy-tile .you-label { grid-column: 2; margin: 0; text-align: left; }
}

.card, .back-btn-wrapper { max-width: 1100px; }
.hall-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 32px; width: 100%; }
.hall-header > div { min-width: 0; }
.hall-header .logo { margin: 0 0 12px; font-size: 28px; text-align: left; }
.hall-header .subline { margin: 0 0 8px; font-size: 13px; }
.hall-header .desc { margin: 0; text-align: left; font-size: 13px; }
.hall-header .daily-link { margin: 0; flex-shrink: 0; }
@media (max-width: 800px) { .hall-header { align-items: flex-start; flex-direction: column; gap: 16px; } }
@media (max-width: 640px) { .hall-header .logo { font-size: 24px; } .hall-header .subline { font-size: 12px; } }
</style>
