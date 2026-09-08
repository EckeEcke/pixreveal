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

        <template v-if="!createdLink">
        <h2 class="challenge-modal-title">CHALLENGE A FRIEND</h2>
        <p>They will play the same drawings as you. Can they beat your score?</p>
        <div class="edit-card">
            <p>Edit your avatar before creating a challenge</p>

            <div class="player-preview" @click="showPlayerEditModal = true">
                <div
                class="avatar"
                :style="avatarStyleFor(playerStore.avatarIndex)"
                />
                <div class="player-info">
                    <strong>{{ playerStore.playerName }}</strong>
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

        <!-- Step 2: Link ist fertig & bereit zum Teilen -->
        <template v-else>
        <h2 class="challenge-modal-title">CHALLENGE READY!</h2>
        <p>Share this link with a friend and see who scores higher.</p>

        <div class="challenge-link-box">
            <input :value="createdLink" readonly aria-label="Challenge link" />
            <button
            type="button"
            title="Copy challenge link"
            @click="copyChallengeLink"
            >
            <Icon icon="pixel:copy" />
            </button>
        </div>

        <p v-if="challengeCopied" class="challenge-copied">
            Challenge link copied.
        </p>

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
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import ModalWrapper from "@/components/modals/ModalWrapper.vue"
import ShareIcons from "@/components/page-ui/ShareIcons.vue"
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue"
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue"
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue"
import { usePlayerStore } from "@/stores/player"
import { useChallengeStore } from "@/stores/challenge"
import avatarSheet from "@/assets/avatars/avatars.webp"

defineEmits(["close"])

const playerStore = usePlayerStore()
const challengeStore = useChallengeStore()

const createdLink = ref("")
const isCreating = ref(false)
const challengeCopied = ref(false)
const showPlayerEditModal = ref(false)

const challengeShareMessage = computed(
  () =>
    `${playerStore.playerName} challenges you to beat their PixReveal score!`
)

const avatarStyleFor = (avatarIndex) => ({
  backgroundImage: `url(${avatarSheet})`,
  backgroundPosition: `${(avatarIndex % 6) * 20}% ${Math.floor(avatarIndex / 6) * 20}%`,
  backgroundSize: "600%",
  imageRendering: "pixelated"
})

const handleCreateChallenge = async () => {
  if (isCreating.value) return
  isCreating.value = true
  try {
    const sessionId = await challengeStore.createChallenge()
    createdLink.value = `${window.location.origin}/challenge?sessionId=${encodeURIComponent(sessionId)}`
  } catch (error) {
    console.error("Failed to create challenge", error)
  } finally {
    isCreating.value = false
  }
}

const copyChallengeLink = async () => {
  if (!createdLink.value) return
  try {
    await navigator.clipboard.writeText(createdLink.value)
    challengeCopied.value = true
    window.setTimeout(() => (challengeCopied.value = false), 2500)
  } catch (error) {
    console.error("Failed to copy challenge link", error)
  }
}
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

.player-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 20px 0 12px;
  cursor: pointer;
}

.avatar {
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
}

.edit-player-btn {
  margin: 0 auto 20px;
}

.create-btn {
  width: 100%;
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
}

.challenge-link-box button {
  display: grid;
  width: 44px;
  flex: 0 0 44px;
  place-items: center;
  border: 1px solid var(--primary);
  border-radius: 4px;
  background: transparent;
  color: var(--white);
  cursor: pointer;
  font-size: 20px;
}

.challenge-link-box button:hover {
  background: var(--primary);
}

.challenge-copied {
  margin: 8px 0 0;
  color: var(--neon-success);
  font-size: 13px;
}

p {
    text-align: center;
}

.edit-card {
    background: black;
    padding: 8px;
    margin: 32px 0;
    border-radius: 8px;
    p {
        font-weight: bold;
    }
}

.edit-icon {
    font-size: 24px;
    color: var(--primary);
}
</style>