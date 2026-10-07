<template>
  <ModalWrapper @close="emit('close')">
    <button
      class="close-btn"
      type="button"
      aria-label="Close challenges"
      data-sfx="back"
      @click="emit('close')"
    >
      <Icon icon="pixel:window-close-solid" />
    </button>

    <div class="heading-row">
      <h2>Your Challenges</h2>
      <p>{{ challenges.length }} created challenge links</p>
    </div>

    <div class="challenge-list">
      <div v-if="challenges.length === 0" class="empty-state">
        <p>No active challenge links found.</p>
      </div>

      <article
        v-for="challenge in challenges"
        :key="challenge.sessionId"
        class="challenge-row"
      >
        <div class="challenge-icon" aria-hidden="true" :class="getIconClass(challenge)">
          <Icon :icon="getChallengeIcon(challenge)" />
        </div>
        <div class="challenge-copy">
          <div class="challenge-header">
            <h3>Mode: {{ challenge.mode }}</h3>
            <span class="score-badge">
              <Icon icon="pixel:star-solid" class="star-icon" /> 
              {{ challenge.score }}
            </span>
          </div>
          <p class="expiry-text">Expires: {{ formatDate(challenge.expiresAt) }}</p>

          <div class="challenge-actions">
            <button
              class="action-btn share-btn"
              type="button"
              data-sfx="click"
              @click="handleShare(challenge)"
            >
              <Icon icon="pixel:share" />
              <span>Share</span>
            </button>
            <button
              class="action-btn check-btn"
              type="button"
              data-sfx="click"
              @click="handleOpenLink(challenge)"
            >
              <Icon icon="pixel:external-link" />
              <span>Check</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { Icon } from "@iconify/vue"
import ModalWrapper from "@/components/modals/ModalWrapper.vue"
import { useChallengeStore, type StoredChallenge } from "@/stores/challenge"

const emit = defineEmits<{ close: [] }>()
const challengeStore = useChallengeStore()

const challenges = ref<(StoredChallenge & { won?: boolean; draw?: boolean })[]>([])

const DB_NAME = "pixreveal_challenges_db"
const STORE_NAME = "challenges"

const loadChallengesFromDB = async () => {
  return new Promise<StoredChallenge[]>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        resolve([])
        return
      }
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        const result = getAllRequest.result as StoredChallenge[]
        result.sort((a, b) => b.createdAt - a.createdAt)
        resolve(result)
      }
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }
    request.onerror = () => reject(request.error)
  })
}

const checkAndUpdateStatuses = async (loadedChallenges: (StoredChallenge & { won?: boolean; draw?: boolean })[]) => {
  const sessionIds = loadedChallenges.map(c => c.sessionId)
  if (sessionIds.length === 0) return

  try {
    const response = await fetch('/api/friend-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionIds })
    })

    if (!response.ok) return
    const statuses = await response.json()

    for (const challenge of loadedChallenges) {
      const statusData = statuses[challenge.sessionId]
      if (statusData) {
        const hasOpp = Boolean(statusData.hasOpponent)
        if (challenge.hasOpponent !== hasOpp) {
          challenge.hasOpponent = hasOpp
          challenge.won = statusData.won
          challenge.draw = statusData.draw
          await challengeStore.updateChallengeStatus(challenge.sessionId, hasOpp)
        }
      }
    }
  } catch (error) {
    console.error("Failed to check batch challenge statuses", error)
  }
}

const getChallengeIcon = (challenge: StoredChallenge & { won?: boolean; draw?: boolean }) => {
  if (!challenge.hasOpponent) {
    return "at-icons:swords"
  }
  if (challenge.draw) {
    return "pixel:handshake-solid"
  }
  return challenge.won ? "pixel:trophy" : "pixel:times-solid"
}

const getIconClass = (challenge: StoredChallenge & { won?: boolean; draw?: boolean }) => {
  if (!challenge.hasOpponent) return "status-pending"
  if (challenge.draw) return "status-draw"
  return challenge.won ? "status-win" : "status-lose"
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const handleShare = async (challenge: StoredChallenge) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "PixReveal Challenge",
        text: `Can you beat my score in PixReveal?`,
        url: challenge.link,
      })
      return
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing", error)
      } else {
        return
      }
    }
  }

  try {
    await navigator.clipboard.writeText(challenge.link)
  } catch (error) {
    console.error("Could not copy link", error)
  }
}

const handleOpenLink = (challenge: StoredChallenge) => {
  window.open(challenge.link, "_blank", "noopener,noreferrer")
}

onMounted(async () => {
  try {
    const loaded = await loadChallengesFromDB()
    challenges.value = loaded
    await checkAndUpdateStatuses(loaded)
  } catch (error) {
    console.error("Failed to load challenges from IndexedDB", error)
  }
})
</script>

<style scoped>
.heading-row {
  padding-right: 34px;
  margin-bottom: 18px;
}

.heading-row h2 {
  margin-bottom: 4px;
}

.heading-row p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.45;
}

.challenge-list {
  display: grid;
  gap: 8px;
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 8px;
}

.challenge-list::-webkit-scrollbar {
  width: 6px;
}

.challenge-list::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--primary);
}

.challenge-row {
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.035);
}

.challenge-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.22);
  font-size: 20px;
}

.status-pending {
  color: rgba(255, 255, 255, 0.4);
}

.status-win {
  color: var(--neon-success);
}

.status-draw {
  color: var(--neon-yellow);
}

.status-lose {
  color: var(--neon-error);
}

.challenge-copy {
  min-width: 0;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.star-icon {
  color: var(--neon-yellow);
}

h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-display), sans-serif;
  font-size: 14px;
  text-transform: capitalize;
}

.score-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.9);
}

.expiry-text {
  margin: 4px 0 8px 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
}

.challenge-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-family: inherit;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

@media (max-width: 420px) {
  .challenge-row {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 9px;
  }

  .challenge-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>