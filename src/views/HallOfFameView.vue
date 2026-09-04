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
      <ButtonPrimary
        v-if="!isYesterday"
        data-sfx="click"
        class="btn-primary"
        @clicked="startDaily"
      >
        {{
          dailyStore.hasPlayedToday
            ? "CHECK TODAY'S RANKINGS"
            : "PLAY DAILY CHALLENGE"
        }}
      </ButtonPrimary>
      <div class="player-grid">
      <TopPlayerDisplay
        v-for="player in paginatedWinners"
            :key="player.date"
            :name="player.winner.name"
            :avatar-index="player.winner.avatarIndex"
            :score="player.winner.score"
            :subline="player.date"
            class="player-card"
        />
    </div>
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1" 
        @click="currentPage--"
        data-sfx="click"
      >
        <Icon icon="pixel:angle-left-solid" />
      </button>
      <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages" 
        @click="currentPage++"
        data-sfx="click"
      >
        <Icon icon="pixel:angle-right-solid" />
      </button>
    </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import { useDailyStore } from "@/stores/daily"
import { useGameStore } from "@/stores/game"
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue"
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue"
import { useRouter } from "vue-router"
import { usePlayerStore } from "@/stores/player"

const dailyStore = useDailyStore()
const { prepareGame } = useGameStore()
const playerStore = usePlayerStore()
const router = useRouter()

const ITEMS_PER_PAGE = 20
const currentPage = ref(1)

const startDaily = () => {
  prepareGame(10, dailyStore.dailyRounds)
  playerStore.gameMode = dailyStore.mode
  if (dailyStore.hasPlayedToday) {
    router.push("/rankings-daily")
  } else {
    router.push("/daily")
  }
}

const winners = computed(() => dailyStore.winners)

const totalPages = computed(() => {
  return Math.ceil(winners.value.length / ITEMS_PER_PAGE) || 1
})

const paginatedWinners = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return winners.value.slice(start, end)
})
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

.player-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 64px auto;
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
  margin-bottom: 16px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
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

.pagination-info {
  font-size: 14px;
  color: #fff;
}

.player-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 32px 0;
  border-radius: 8px;
}
</style>