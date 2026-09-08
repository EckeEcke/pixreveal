<template>
    <div>
    <main class="challenge-page">
        <section v-if="loading" class="challenge-card">Loading challenge...</section>
        <section v-else-if="error" class="challenge-card">
        <h1>Challenge unavailable</h1>
        <p>{{ error }}</p>
        <ButtonSecondary @clicked="$router.push('/')">Go back</ButtonSecondary>
        </section>
        <section v-else-if="challenge" class="challenge-card" :class="{ 'is-completed': challenge.opponent }">
        <h1 class="logo">
          Pix<span>Reveal</span>
        </h1>

        <template v-if="challenge.opponent">
            <h2>Challenge results</h2>
            <AnswerComparison
                :rounds="challenge.rounds"
                :participants="participants"
            />
            <ButtonSecondary class="accept" @clicked="$router.push('/')">Go back</ButtonSecondary>
        </template>

        <template v-else>
            <h2>{{ challenge.challenger.username }} challenges you!</h2>
            <div class="challenger">
                <TopPlayerDisplay
                :avatar-index="challenge.challenger.avatarIndex"
                />        
                <p>Can you beat their score?</p>
            </div>

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

            <ButtonPrimary class="accept" @clicked="acceptChallenge">
                Accept the challenge
            </ButtonPrimary>
        </template>
        </section>
    </main>
    <PlayerEditModal
        v-if="showPlayerEditModal"
        title="YOUR PLAYER"
        btn-text="DONE"
        @btn-click="showPlayerEditModal = false"
        @close="showPlayerEditModal = false"
    />
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { usePlayerStore } from "@/stores/player";
import { useChallengeStore, type ChallengeSession, type ChallengeParticipant } from "@/stores/challenge";
import avatarSheet from "@/assets/avatars/avatars.webp";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue";
import AnswerComparison from "@/components/game-ui/AnswerComparison.vue";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const challengeStore = useChallengeStore();
const challenge = ref<ChallengeSession | null>(null);
const loading = ref(true);
const error = ref("");
const showPlayerEditModal = ref(false);

const participants = computed<ChallengeParticipant[]>(() => {
  if (!challenge.value) return [];
  return challenge.value.opponent
    ? [challenge.value.challenger, challenge.value.opponent]
    : [challenge.value.challenger];
});

const avatarStyleFor = (avatarIndex: number) => ({
  backgroundImage: `url(${avatarSheet})`,
  backgroundPosition: `${(avatarIndex % 6) * 20}% ${Math.floor(avatarIndex / 6) * 20}%`,
  backgroundSize: "600%",
  imageRendering: "pixelated",
} as const);

const acceptChallenge = async () => {
  if (!challenge.value) return;
  await challengeStore.startAcceptedChallenge(challenge.value);
  router.push(`/challenge-${challenge.value.mode}`);
};

onMounted(async () => {
  const sessionId = String(route.query.sessionId || "");
  if (!sessionId) {
    error.value = "No challenge session was provided.";
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/friend-challenge?sessionId=${encodeURIComponent(sessionId)}`);
    if (!response.ok) throw new Error("This challenge has expired or does not exist.");
    challenge.value = (await response.json()) as ChallengeSession;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Could not load challenge.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.challenge-page { 
    display: grid; 
    min-height: 80vh; 
    place-items: center; 
    padding: 24px; 
}

.challenge-card { 
    width: min(100%, 520px); 
    padding: 32px; 
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px; 
    background: rgba(0, 0, 0, .55); 
    text-align: center; 
}

.challenge-card.is-completed {
    width: min(100%, 900px);
}

.eyebrow, .mode { 
    color: var(--neon-yellow); 
    font-weight: 900; 
    letter-spacing: 1px; 

}
.challenger { 
    display: flex;
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    gap: 0; 
    margin: 28px 0; 
    text-align: left;
    p {
        margin: 0;
    }
}

.challenger span { 
    display: block; 
    color: rgba(255,255,255,.7); 
}

.avatar { 
    width: 56px; 
    height: 56px; 
    border-radius: 6px; 
    background-color: #2d3748; 
}

.edit-player { 
    margin: 0 auto 12px; 
}

.accept { 
    width: 100%; 
    margin-top: 20px; 
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

.player-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 20px 0 12px;
  cursor: pointer;
}
</style>