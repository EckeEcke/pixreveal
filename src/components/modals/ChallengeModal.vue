<template>
  <div>
    <ModalWrapper @close="$emit('close')">
      <div class="close-btn-wrapper">
        <button
          type="button"
          class="close-btn"
          data-sfx="back"
          title="Close"
          @click="$emit('close')"
        >
          <Icon icon="pixel:window-close-solid" />
        </button>
      </div>

      <!-- Schritt 1: Challenge erstellen -->
      <template v-if="!createdLink">
        <h2 class="challenge-modal-title">CHALLENGE A FRIEND</h2>
        <Icon icon="at-icons:swords" class="sword-icon" />
        <p>They will play the same drawings as you. Can they beat your score?</p>

        <div v-if="!achievementsStore.isUnlocked('edit-player')" class="edit-card">
          <p>Edit your avatar before creating a challenge<br> (no signup needed)</p>
          <div class="player-preview" @click="showPlayerEditModal = true">
            <div class="avatar" :style="avatarStyleFor(playerStore.avatarIndex)"></div>
            <div class="player-info">
              <strong :class="nameEffectClass">{{ playerStore.playerName }}</strong>
              <Icon class="edit-icon" icon="pixel:edit-solid" />
            </div>
          </div>
        </div>

        <ButtonPrimary
          class="create-btn"
          :disabled="isCreating"
          @clicked="handleCreateChallenge"
        >
          {{ isCreating ? "Creating..." : "Create Challenge Link" }}
        </ButtonPrimary>
      </template>

      <!-- Schritt 2: Link teilen -->
      <template v-else>
        <Icon icon="at-icons:swords" class="sword-icon sword-icon--ready" />
        <h2 class="challenge-modal-title">CHALLENGE READY!</h2>
        <p class="challenge-subtitle">
          Share this link with a friend and see who scores higher.
        </p>

        <div class="challenge-link-box">
          <input
            ref="linkInput"
            :value="createdLink"
            readonly
            aria-label="Challenge link"
            @focus="selectLink"
            @click="selectLink"
          />
          <button
            type="button"
            class="copy-btn"
            :class="{ 'is-copied': challengeCopied }"
            :title="challengeCopied ? 'Copied!' : 'Copy challenge link'"
            :aria-label="challengeCopied ? 'Copied' : 'Copy challenge link'"
            @click="copyChallengeLink"
          >
            <Icon :icon="challengeCopied ? 'pixel:check-solid' : 'pixel:copy'" />
          </button>
        </div>

        <p
          class="challenge-hint"
          :class="{ 'is-copied': challengeCopied }"
          aria-live="polite"
        >
          {{ challengeCopied ? "Link copied!" : "Your friend plays the same drawings as you." }}
        </p>

        <p class="share-label">Share via</p>
        <ShareIcons :msg="challengeShareMessage" :url="createdLink" />
      </template>
    </ModalWrapper>

    <PlayerEditModal
      v-if="showPlayerEditModal"
      title="YOUR PLAYER"
      btn-text="DONE"
      @btn-click="showPlayerEditModal = false"
      @close="showPlayerEditModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from "vue"
import { Icon } from "@iconify/vue"
import ModalWrapper from "@/components/modals/ModalWrapper.vue"
import ShareIcons from "@/components/page-ui/ShareIcons.vue"
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue"
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue"
import { usePlayerStore } from "@/stores/player"
import { useChallengeStore } from "@/stores/challenge"
import { useAchievementsStore } from "@/stores/achievements"
import { getAvatarStyle } from "@/utils/avatar"

defineEmits(["close"])

const playerStore = usePlayerStore()
const challengeStore = useChallengeStore()
const achievementsStore = useAchievementsStore()

const createdLink = ref("")
const isCreating = ref(false)
const challengeCopied = ref(false)
const showPlayerEditModal = ref(false)
const linkInput = ref(null)

let copiedTimer = null

const challengeShareMessage = computed(
  () => `${playerStore.playerName} challenges you to beat their PixReveal score!`,
)

const canNativeShare = computed(
  () => typeof navigator !== "undefined" && typeof navigator.share === "function",
)

const avatarStyleFor = (avatarIndex) =>
  getAvatarStyle(avatarIndex, playerStore.avatarSpriteSheet)

const nameEffectClass = computed(() =>
  playerStore.playerNameEffect === "none"
    ? undefined
    : `name-effect-${playerStore.playerNameEffect}`,
)

const handleCreateChallenge = async () => {
  if (isCreating.value) return
  isCreating.value = true
  try {
    const sessionId = await challengeStore.createChallenge()
    void achievementsStore.unlock("create-challenge")
    createdLink.value = `${window.location.origin}/challenge?sessionId=${encodeURIComponent(sessionId)}`
  } catch (error) {
    console.error("Failed to create challenge", error)
  } finally {
    isCreating.value = false
  }
}

const selectLink = () => linkInput.value?.select()

const copyChallengeLink = async () => {
  if (!createdLink.value) return
  try {
    await navigator.clipboard.writeText(createdLink.value)
    challengeCopied.value = true
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => (challengeCopied.value = false), 2000)
  } catch (error) {
    console.error("Failed to copy challenge link", error)
    // Fallback: Text markieren, damit der Spieler manuell kopieren kann
    selectLink()
  }
}

const nativeShare = async () => {
  try {
    await navigator.share({
      title: "PixReveal Challenge",
      text: challengeShareMessage.value,
      url: createdLink.value,
    })
  } catch (error) {
    // AbortError = Nutzer hat den Dialog geschlossen, kein echter Fehler
    if (error?.name !== "AbortError") console.error("Failed to share", error)
  }
}

onBeforeUnmount(() => window.clearTimeout(copiedTimer))
</script>

<style scoped>
.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.challenge-modal-title {
  margin: 0 0 8px;
  text-align: center;
}

p {
  text-align: center;
}

.sword-icon {
  display: block;
  margin: 16px auto 4px;
  text-align: center;
  font-size: 32px;
  color: var(--primary);
}

.sword-icon--ready {
  margin-top: 0;
}

/* --- Schritt 1 --- */
.edit-card {
  background: black;
  padding: 8px 16px;
  margin: 32px 0;
  border-radius: 8px;
}

.edit-card p {
  font-weight: bold;
}

.player-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 20px 0 12px;
  cursor: pointer;
}

.avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background-color: #2d3748;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-info strong {
  font-size: 18px;
  color: var(--white);
  text-transform: uppercase;
}

.edit-icon {
  font-size: 24px;
  color: var(--primary);
}

.create-btn {
  width: 100%;
}

/* --- Schritt 2 --- */
.challenge-subtitle {
  font-size: 15px;
  color: var(--white);
}

.challenge-link-box {
  display: flex;
  gap: 8px;
  max-width: 560px;
  margin: 20px auto 0;
}

.challenge-link-box input {
  min-width: 0;
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  color: var(--white);
  font-size: 12px;
  cursor: text;
}

.copy-btn {
  display: grid;
  width: 44px;
  flex: 0 0 44px;
  place-items: center;
  border: 1px solid var(--primary);
  border-radius: 4px;
  background: var(--primary);
  color: var(--black, #000);
  cursor: pointer;
  font-size: 20px;
  transition: background 0.15s, border-color 0.15s, transform 0.05s;
}

.copy-btn:hover {
  filter: brightness(1.1);
}

.copy-btn:active {
  transform: translateY(2px);
}

.copy-btn.is-copied {
  background: var(--neon-success);
  border-color: var(--neon-success);
}

.challenge-hint {
  min-height: 20px; /* verhindert Layout-Sprung beim Textwechsel */
  margin: 8px 0 0;
  font-size: 13px;
  opacity: 0.7;
}

.challenge-hint.is-copied {
  color: var(--neon-success);
  opacity: 1;
}

.share-label {
  margin: 20px 0 8px;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
}

.native-share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px auto 0;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  color: var(--white);
  font-size: 13px;
  cursor: pointer;
}

.native-share-btn:hover {
  border-color: var(--primary);
}

@media (prefers-reduced-motion: reduce) {
  .copy-btn {
    transition: none;
  }
}
</style>