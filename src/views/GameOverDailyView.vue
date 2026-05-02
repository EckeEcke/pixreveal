<template>
  <Transition name="fade" mode="out-in">
    <GameOverTransition
      v-if="showIntro"
      message="GAME OVER"
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
      <GameOverStats />
    </div>
    <div v-if="!hasSubmitted">
      <InfoBox
        message="Set your nickname and select an avatar to display in the rankings besides your score."
      />
      <div class="player-info-wrapper">
        <div class="player-avatar" :style="avatarStyle" @click="showAvatarModal = true">
          <Icon icon="pixel:pencil" class="edit-badge" />
        </div>
        <div class="player-name" @click="showAvatarModal = true">
          <span>{{ playerStore.playerName || "SET PLAYER NAME" }}</span>
          <span class="info-text">Tap to change</span>
        </div>
      </div>
      <button v-if="!isPosting" class="confirm-btn" data-sfx="click" @click="post">
        SUBMIT SCORE
      </button>
      <LoadingAnimation v-else :text="'SUBMITTING...'" />
    </div>
    <div v-else>
      <InfoBox
        icon="✅"
        message="Your score has been submitted! Check the rankings below to see how you did today."
      />
      <button class="confirm-btn" @click="$router.push('/')" data-sfx="click">
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK TO HOME
      </button>
    </div>
  </div>
  <div class="content">
    <DailyRankings />
  </div>
  <PlayerEditModal v-if="showAvatarModal" @close="showAvatarModal = false" />
</template>

<script setup>
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useDailyStore } from "@/stores/daily";
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import avatarSpriteSheet from "@/assets/avatars/avatars.webp";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import DailyRankings from "@/components/game-ui/DailyRankings.vue";
import GameOverStats from "@/components/game-ui/GameOverStats.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import GameOverTransition from "@/components/game-ui/GameOverTransition.vue";
import InfoBox from "@/components/game-ui/InfoBox.vue";

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const dailyStore = useDailyStore();

const hasSubmitted = ref(false);
const isPosting = ref(false);
const showIntro = ref(true);

const showAvatarModal = ref(false);

const avatarStyle = computed(() => {
  const index = playerStore.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${col * 20}% ${row * 20}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});

const post = async () => {
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
    dailyStore.date
  );
  hasSubmitted.value = true;
  isPosting.value = false;
  soundStore.playSound("confirm");
};
</script>

<style scoped>
h3 {
  margin-top: 0;
  text-align: center;
}

.ranking-card {
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

.player-info-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  margin-top: 32px;
}

.player-avatar {
  position: relative;
  width: 72px;
  height: 72px;
  background-color: #2d3748;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.player-info-wrapper:hover .player-avatar {
  transform: scale(1.05);
  border-color: var(--primary);
}

.edit-badge {
  position: absolute;
  right: -8px;
  bottom: -8px;
  background: var(--primary);
  border-radius: 50%;
  padding: 4px;
  font-size: 16px;
  color: white;
}

.player-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: flex-start;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  .info-text {
    font-size: 14px;
    font-weight: 400;
    text-transform: none;
    opacity: 0.7;
  }
}

.confirm-btn {
  display: flex;
  place-items: center;
  gap: 4px;
  background: var(--primary);
  padding: 12px 16px;
  width: 100%;
  border: none;
  color: black;
  font-size: 16px;
  font-family: inherit;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 32px;
}
</style>
