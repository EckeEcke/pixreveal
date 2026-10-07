<template>
  <div class="challenge-detail-card">
    <h2>Challenge details</h2>

    <div class="result-banner">
      <span class="badge" :class="banner.tone">{{ banner.text }}</span>
    </div>

    <div class="score-board">
      <div
        class="player-side"
        :class="{ winner: winnerSide === 'challenger' }"
      >
        <span>{{ challenge.challenger.username }}</span>
        <strong>{{ challenge.challenger.score }} pts</strong>
      </div>

      <div class="vs">VS</div>

      <div
        v-if="challenge.opponent"
        class="player-side"
        :class="{ winner: winnerSide === 'opponent' }"
      >
        <span>{{ challenge.opponent.username }}</span>
        <strong>{{ challenge.opponent.score }} pts</strong>
      </div>
      <div v-else class="player-side waiting">
        <span>Waiting for opponent...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { usePlayerStore } from "@/stores/player"
import type { ChallengeSession } from "@/stores/challenge"

const props = defineProps<{
  challenge: Pick<ChallengeSession, "challenger" | "opponent">
}>()

const playerStore = usePlayerStore()

type Side = "challenger" | "opponent"

const role = computed<Side | "spectator">(() => {
  const myId = playerStore.playerId
  if (!myId) return "spectator"
  if (props.challenge.challenger.playerId === myId) return "challenger"
  if (props.challenge.opponent?.playerId === myId) return "opponent"
  return "spectator"
})

const winnerSide = computed<Side | "draw" | null>(() => {
  const { challenger, opponent } = props.challenge
  if (!opponent) return null
  if (challenger.score === opponent.score) return "draw"
  return challenger.score > opponent.score ? "challenger" : "opponent"
})

const banner = computed<{
  text: string
  tone: "pending" | "win" | "lose" | "draw" | "spectator"
}>(() => {
  const { challenger, opponent } = props.challenge

  if (!opponent) return { text: "WAITING FOR OPPONENT", tone: "pending" }
  if (winnerSide.value === "draw") return { text: "DRAW", tone: "draw" }

  if (role.value === "spectator") {
    const winner = winnerSide.value === "challenger" ? challenger : opponent
    return { text: `${winner.username} WINS`, tone: "spectator" }
  }

  return role.value === winnerSide.value
    ? { text: "YOU WIN", tone: "win" }
    : { text: "YOU LOSE", tone: "lose" }
})
</script>

<style scoped>
.challenge-detail-card {
  padding: 20px;
  border-radius: 12px;
  background: #1a1a1a;
  color: #fff;
  max-width: 500px;
  margin: 0 auto;
}

.score-board {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  background: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
}

.player-side {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-side.winner strong {
  color: #ffd54f;
}

.player-side.waiting {
  opacity: 0.6;
}

.vs {
  opacity: 0.6;
  font-weight: 700;
}

.badge {
  display: inline-block;
  padding: 8px 16px;
  font-weight: bold;
  border-radius: 6px;
  text-align: center;
  width: 100%;
}

.badge.win {
  background-color: #2e7d32;
  color: #fff;
}

.badge.lose {
  background-color: #c62828;
  color: #fff;
}

.badge.draw {
  background-color: #f57f17;
  color: #fff;
}

.badge.pending {
  background-color: #37474f;
  color: #cfd8dc;
}

.badge.spectator {
  background-color: #455a64;
  color: #cfd8dc;
}
</style>