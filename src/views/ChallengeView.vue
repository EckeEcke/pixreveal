<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player' // Passe den Pfad bei Bedarf an

// Beispiel für die Challenge-Daten (ersetze das durch deine echten Props oder deinen Store)
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
  if (!challenge.value) return false

  const myId = playerStore.playerId
  const challengerId = challenge.value.challenger?.playerId
  const opponentId = challenge.value.opponent?.playerId

  return (
    (challengerId && challengerId === myId) ||
    (opponentId && opponentId === myId) ||
    hasLocalChallengeRecord(challenge.value.sessionId)
  )
})

const isDraw = computed(() => {
  if (!props.challenge?.opponent) return false
  return props.challenge.challenger.score === props.challenge.opponent.score
})

// Berechnen, ob der eingeloggte Spieler gewonnen hat
const hasWon = computed(() => {
  if (!props.challenge?.opponent || isDraw.value || !isParticipant.value) return false
  
  const challengerScore = props.challenge.challenger.score
  const opponentScore = props.challenge.opponent.score
  const isUserOpponent = props.challenge.opponent.playerId === playerStore.playerId

  if (isUserOpponent) {
    return opponentScore > challengerScore
  } else {
    return challengerScore > opponentScore
  }
})
</script>

<template>
  <div class="challenge-detail-card">
    <h2>Duell-Details</h2>

    <!-- Fall 1: User ist Teilnehmer und das Spiel ist vorbei / hat ein Ergebnis -->
    <div v-if="isParticipant" class="result-banner">
      <template v-if="isDraw">
        <span class="badge draw">UNENTSCHIEDEN</span>
      </template>
      <template v-else>
        <span v-if="hasWon" class="badge win">YOU WIN</span>
        <span v-else class="badge lose">YOU LOSE</span>
      </template>
    </div>

    <!-- Fall 2: User ist nur Zuschauer / Fremter (nicht beteiligt) -->
    <div v-else class="spectator-banner">
      <span class="badge spectator">Zuschaueransicht (Du bist nicht an diesem Duell beteiligt)</span>
    </div>

    <!-- Ergebnisübersicht -->
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