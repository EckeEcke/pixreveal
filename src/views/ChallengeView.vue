<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

const props = defineProps<{
  challenge: {
    challenger: {
      playerId: string
      name: string
      score: number
    }
    opponent?: {
      playerId: string
      name: string
      score: number
    }
  }
}>()

const playerStore = usePlayerStore()

const isParticipant = computed(() => {
  if (!session.value) return false

  const myId = playerStore.playerId
  const challengerId = session.value.challenger?.playerId
  const opponentId = session.value.opponent?.playerId

  return (
    (challengerId && challengerId === myId) ||
    (opponentId && opponentId === myId)
  )
})

const hasWon = computed(() => {
  if (!session.value?.opponent || isDraw.value || !isParticipant.value) return false
  
  const challengerScore = session.value.challenger.score
  const opponentScore = session.value.opponent.score
  
  const isUserOpponent = session.value.opponent.playerId === playerStore.playerId

  if (isUserOpponent) {
    return opponentScore > challengerScore
  } else {
    return challengerScore > opponentScore
  }
})

const isDraw = computed(() => {
  if (!props.challenge?.opponent) return false
  return props.challenge.challenger.score === props.challenge.opponent.score
})
</script>

<template>
  <div class="challenge-detail-card">
    <h2>Duell-Details</h2>

    <div v-if="isParticipant" class="result-banner">
      <template v-if="isDraw">
        <span class="badge draw">DRAW</span>
      </template>
      <template v-else>
        <span v-if="hasWon" class="badge win">YOU WIN</span>
        <span v-else class="badge lose">YOU LOSE</span>
      </template>
    </div>

    <div v-else class="spectator-banner">
      <span class="badge spectator">Only participants can see the results.</span>
    </div>

    <div class="score-board" v-if="challenge">
      <div class="player-side">
        <span>{{ challenge.challenger.name }}</span>
        <strong>{{ challenge.challenger.score }} Pkt.</strong>
      </div>
      <div class="vs">VS</div>
      <div class="player-side" v-if="challenge.opponent">
        <span>{{ challenge.opponent.name }}</span>
        <strong>{{ challenge.opponent.score }} Pkt.</strong>
      </div>
      <div class="player-side" v-else>
        <span>Wartet auf Gegner...</span>
      </div>
    </div>
  </div>
</template>

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

.badge.spectator {
  background-color: #455a64;
  color: #cfd8dc;
  font-size: 0.9rem;
}
</style>