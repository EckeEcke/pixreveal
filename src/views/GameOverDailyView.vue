<template>
  <main>
    <Transition name="fade" mode="out-in">
      <GameTransition
        v-if="showIntro && !dailyStore.hasSubmitted"
        first="GAME"
        second="OVER"
        @done="
          () => {
            showIntro = false;
            soundStore.playSound('complete');
          }
        "
      />
    </Transition>
    <div class="ranking-card">
      <h1 class="logo">GAME <span>OVER</span></h1>
      <GameOverStar :points="playerStore.points" />

      <div v-if="!dailyStore.hasSubmitted">
        <p>
          See where you rank today and lock in your score on the global leaderboard!
        </p>
        <ButtonPrimary
          v-if="!isPosting"
          data-sfx="click"
          class="btn-primary"
          @click="showAvatarModal = true"
        >
          <Icon icon="pixel:arrow-circle-up-solid" /> POST SCORE TO LEADERBOARD
        </ButtonPrimary>
        <LoadingAnimation v-else :text="'POSTING...'" />
      </div>
      <ButtonSecondary
        data-sfx="click"
        class="btn-secondary"
        @clicked="$router.push('/')"
      >
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK TO HOME
      </ButtonSecondary>
      <div>
        <h2>Challenge your friends!</h2>
        <ShareIcons :msg="shareMessage" />
      </div>
      <DailyCountdown />
    </div>
    <PlayerEditModal
      v-if="showAvatarModal"
      title="SUBMIT SCORE TO LEADERBOARD"
      btn-text="SUBMIT"
      @btn-click="post"
      @close="showAvatarModal = false"
    />
  </main>
</template>

<script setup>
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useDailyStore } from "@/stores/daily";
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import GameOverStar from "@/components/game-ui/GameOverStar.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ShareIcons from "@/components/page-ui/ShareIcons.vue";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import DailyCountdown from "@/components/page-ui/DailyCountdown.vue";

const router = useRouter();

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const dailyStore = useDailyStore();

const isPosting = ref(false);
const showIntro = ref(true);

const showAvatarModal = ref(false);

const shareMessage = computed(
  () =>
    `I reached ${playerStore.points}⭐ in PixReveal Daily Challenge! Can you beat my score?`,
);

const post = () => {
  showAvatarModal.value = false;
  if (!playerStore.playerName) {
    showAvatarModal.value = true;
    return;
  }
  
  const userId = `${playerStore.playerName}-${playerStore.playerId}`;
  
  dailyStore.dailyRankings.push({
    name: playerStore.playerName,
    userId,
    score: playerStore.points,
    avatarIndex: playerStore.avatarIndex,
  });

  dailyStore.postRanking(
    playerStore.playerName,
    playerStore.points,
    playerStore.avatarIndex,
    dailyStore.date,
    userId,
  );

  toast.success(
    "Score submitted. Check your position on the daily leaderboard!",
  );
  soundStore.playSound("confirm");
  router.push("/rankings-daily");
};
</script>

<style scoped>
h2 {
  font-size: 18px;
  text-align: center;
}

h1 {
  margin: 0;
}

p {
  text-align: center;
  line-height: 1.5;
}

.ranking-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  max-width: 400px;
  margin-bottom: 64px;
}

.ranking-card::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -60%;
  width: 30%;
  height: 300%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
  animation: shine 4s infinite;
}

.btn-primary {
  animation: pulse 2s infinite;
  margin: 0 auto;
  width: 100%;
  padding: 18px;
  font-size: 18px;
}

.btn-secondary {
  width: 100%;
}
</style>
