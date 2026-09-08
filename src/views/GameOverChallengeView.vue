<template>
  <main class="challenge-over">
    <section class="results-card">
      <h1 class="logo">CHALLENGE <span>OVER</span></h1>
      <p v-if="!session">Loading results...</p>
      <template v-else>
        <div class="score-grid">
        <div             
            v-for="(player, index) in participants"
            :key="player.username"
            class="player-card"
            :class="getPlayerStateClass(player.score)"
            >
                <TopPlayerDisplay
                    :avatar-index="player.avatarIndex"
                    :is-winner="!isDraw && player.score === highestScore"
                    :role="index === 0 ? 'Player 1' : 'Player 2'"
                    class="player"
                />
                <div class="player-name">{{ player.username }}</div>
            </div>
          
            <div v-for="(player, index) in participants"
            :key="`score-${player.username}`"
            class="score-display"
            >
                {{ player.score }} 
                <Icon
                    icon="pixel:star-solid"
                    class="star-icon"
                />
            </div>
        </div>

        <AnswerComparison
          :rounds="session.rounds"
          :participants="participants"
        />

        <div class="actions">
          <ButtonSecondary @clicked="$router.push('/')">
            Go back
          </ButtonSecondary>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue"
import AnswerComparison from "@/components/game-ui/AnswerComparison.vue"
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue"
import {
  useChallengeStore,
  type ChallengeSession,
  type ChallengeParticipant,
} from "@/stores/challenge"
import { Icon } from "@iconify/vue";

const route = useRoute()
const router = useRouter()
const challengeStore = useChallengeStore()
const session = ref<ChallengeSession | null>(challengeStore.session)

const participants = computed<ChallengeParticipant[]>(() => {
  if (!session.value) return []
  return session.value.opponent
    ? [session.value.challenger, session.value.opponent]
    : [session.value.challenger]
})

const highestScore = computed(() => {
  if (!participants.value.length) return 0
  return Math.max(...participants.value.map((p) => p.score))
})

const isDraw = computed(() => {
  if (participants.value.length < 2) return false
  return participants.value[0].score === participants.value[1].score
})

const getPlayerStateClass = (score: number) => {
  if (participants.value.length < 2) return ""
  if (isDraw.value) return "status-draw"
  return score === highestScore.value ? "status-win" : "status-loss"
}

onMounted(async () => {
  if (session.value) return
  const sessionId = String(route.query.sessionId || "")
  if (!sessionId) return
  const response = await fetch(
    `/api/friend-challenge?sessionId=${encodeURIComponent(sessionId)}`
  )
  if (response.ok) {
    session.value = (await response.json()) as ChallengeSession
  }
})
</script>

<style scoped>
.challenge-over {
  display: grid;
  min-height: 80vh;
  place-items: center;
}

.results-card {
  width: min(100%, 900px);
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(15, 12, 29, 0.8);
  text-align: center;
  box-sizing: border-box;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.score-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    background: rgba(255, 255, 255, 0.06);
    padding: 14px;
    .star-icon {
        color: var(--neon-yellow);
    }
}

.player {
    box-sizing: border-box;
}

.player-card {
  padding: 14px 8px 8px;
  border-radius: 8px;
}

.player-name {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 13px;
    @media (min-width: 450px) {
        font-size: 18px;
    }
}

:deep(.status-win) {
  background: rgba(0, 100, 50, 0.9)!important;
  border-top: 3px solid rgba(0, 255, 150, 0.7) !important;
  border-left: 3px solid rgba(0, 255, 150, 0.7) !important;
  border-bottom: 3px solid rgba(0, 100, 50, 0.9) !important;
  border-right: 3px solid rgba(0, 100, 50, 0.9) !important;
  box-shadow: 0 4px 16px rgba(0, 220, 120, 0.15);

}

:deep(.status-loss) {
  background: rgba(150, 20, 30, 0.9) !important;
  border-top: 3px solid rgba(255, 120, 130, 0.7) !important;
  border-left: 3px solid rgba(255, 120, 130, 0.7) !important;
  border-bottom: 3px solid rgba(150, 20, 30, 0.9) !important;
  border-right: 3px solid rgba(150, 20, 30, 0.9) !important;
}

:deep(.status-draw) {
  background: rgba(100, 110, 120, 0.15) !important;
  border-top: 3px solid rgba(150, 160, 170, 0.6) !important;
  border-left: 3px solid rgba(150, 160, 170, 0.6) !important;
  border-bottom: 3px solid rgba(40, 50, 60, 0.8) !important;
  border-right: 3px solid rgba(40, 50, 60, 0.8) !important;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

@media (max-width: 650px) {
  .score-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>