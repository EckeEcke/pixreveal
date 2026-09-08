<template>
  <main class="challenge-over">
    <section class="results-card">
      <h1 class="logo">CHALLENGE <span>OVER</span></h1>
      <p v-if="!session">Loading results...</p>
      <template v-else>
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
import {
  useChallengeStore,
  type ChallengeSession,
  type ChallengeParticipant,
} from "@/stores/challenge"

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

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

@media (max-width: 650px) {
  .actions {
    flex-direction: column;
  }
}
</style>