<template>
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
    <div>
      <h1 class="logo">GAME <span>OVER</span></h1>
      <p class="thx">Thx for playing today!</p>
      <p class="score-title">YOUR SCORE</p>
      <GameOverStats />
    </div>
    <div v-if="!dailyStore.hasSubmitted">
      <p>
        Submit your score to the daily leaderboard and compete for the top
        position!
      </p>
      <ButtonPrimary
        v-if="!isPosting"
        data-sfx="click"
        class="btn-primary"
        @click="showAvatarModal = true"
      >
        <Icon icon="pixel:arrow-circle-up-solid" /> SUBMIT YOUR SCORE
      </ButtonPrimary>
      <LoadingAnimation v-else :text="'SUBMITTING...'" />
    </div>
    <div v-else>
      <ButtonPrimary
        data-sfx="click"
        class="btn-primary"
        @clicked="$router.push('/')"
      >
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK TO HOME
      </ButtonPrimary>
    </div>
    <div>
      <h2>Challenge your friends!</h2>
      <ShareIcons :msg="shareMessage" />
    </div>
  </div>
  <div class="content">
    <DailyRankings />
  </div>
  <PlayerEditModal
    v-if="showAvatarModal"
    title="SUBMIT SCORE TO LEADERBOARD"
    btn-text="SUBMIT"
    @btn-click="post"
    @close="showAvatarModal = false"
  />
</template>

<script setup>
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useDailyStore } from "@/stores/daily";
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import DailyRankings from "@/components/game-ui/DailyRankings.vue";
import GameOverStats from "@/components/game-ui/GameOverStats.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ShareIcons from "@/components/page-ui/ShareIcons.vue";
import { toast } from "vue3-toastify";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";

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

const post = async () => {
  showAvatarModal.value = false;
  isPosting.value = true;
  if (!playerStore.playerName) {
    showAvatarModal.value = true;
    return;
  }
  dailyStore.dailyRankings.push({
    name: playerStore.playerName,
    score: playerStore.points,
    avatarIndex: playerStore.avatarIndex,
  });
  await dailyStore.postRanking(
    playerStore.playerName,
    playerStore.points,
    playerStore.avatarIndex,
    dailyStore.date,
  );
  toast.success(
    "Score submitted. Check your position on the daily leaderboard!",
  );

  isPosting.value = false;
  soundStore.playSound("confirm");
};
</script>

<style scoped>
h2,
h3 {
  text-align: center;
}
h3 {
  margin-top: 0;
}

p {
  line-height: 1.5;
}

.ranking-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  background: var(--card-bg);
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

p {
  text-align: center;
}

.confirmation {
  margin-bottom: 32px;
}

.score-title {
  margin-bottom: 4px;
}

.thx {
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
  animation: floating 2s ease-in-out infinite;
  font-weight: bold;
  font-size: 24px;
}

.content {
  width: 100%;
  box-sizing: border-box;
  max-width: 400px;
}

.btn-primary {
  animation: pulse 2s infinite;
  margin: 0 auto;
}
</style>
