<template>
  <main>
    <Transition name="fade" mode="out-in">
      <GameTransition
        v-if="showIntro"
        first="GAME"
        second="OVER"
        @done="handleIntroDone"
      />
    </Transition>
    <div>
      <div v-if="isOnlinePlay">
        <div v-if="!waitingForFinalResults" class="results-card">
          <h1 class="logo">GAME <span>OVER</span></h1>
          <h2 class="rank-prophet">
            {{
              isMe(playersSortedByPoints[0].playerId)
                ? "YOU WIN!"
                : `${playersSortedByPoints[0].username.toUpperCase()} WINS!`
            }}
          </h2>
          <ButtonPrimary
            class="btn-primary pulse-btn"
            data-sfx="click"
            @mouseenter="soundStore.handleHoverSound"
            @clicked="playAgain"
          >
            <Icon icon="pixel:refresh-solid" />
            Play Again
          </ButtonPrimary>
        </div>
        <div v-for="(player, index) in playersSortedByPoints" :key="player.playerId">
          <PlayerDisplay
            :position="player.hasFinished ? index + 1 : undefined"
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :points="player.points"
            :is-pending="!player.hasFinished"
            :correct-answers="player.correctAnswers"
            :show-you-indicator="isMe(player.playerId)"
          />
        </div>
        <div v-if="waitingForFinalResults">
          <LoadingAnimation text="WAITING FOR REMAINING PLAYERS" />
        </div>
      </div>
      <div v-else class="results-card">
        <h1 class="logo">GAME <span>OVER</span></h1>
        <GameOverStar
          class="game-over-star"
          :points="
            playerStore.gameMode === 'survival'
              ? survivalStore.solvedCount
              : playerStore.points
          "
        />
        <GameOverCrown
          v-if="playerStore.gameMode === 'survival' && !survivalStore.newHighscore"
          class="game-over-crown"
          :highscore="survivalStore.highscore"
        />
        <div v-if="showSingleplayerRank">
          <SingleplayerRanks :points="playerStore.points" />
        </div>

        <div
          v-if="playerStore.gameMode === 'survival' && survivalStore.newHighscore"
          class="rank-prophet highscore-message"
        >
          <Icon icon="pixel:sparkles" />
          NEW HIGHSCORE!
          <Icon icon="pixel:sparkles" />
        </div>

        <ButtonPrimary
          class="btn-primary pulse-btn"
          data-sfx="click"
          @mouseenter="soundStore.handleHoverSound"
          @clicked="playAgain"
        >
          <Icon icon="pixel:refresh-solid" /> Play Again</ButtonPrimary
        >

        <div class="share-section">
          <h2>Challenge your friends!</h2>
          <ShareIcons :msg="getShareMessage(playerStore.points)" />
        </div>
      </div>
    </div>
    <LobbyChat v-if="isOnlinePlay" />
    <WinnerAnimation
      v-if="isOnlinePlay && !waitingForFinalResults && winnerPlayer"
      :show="showWinnerAnimation"
      :winner-name="winnerPlayer.username"
      :avatar-index="winnerPlayer.avatarIndex"
      @done="showWinnerAnimation = false"
    />
  </main>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import { useRouter } from "vue-router";
import { useChannelStore } from "@/stores/channel";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import { useSoundStore } from "@/stores/sound";
import LobbyChat from "@/components/game-ui/LobbyChat.vue";
import { useGameStore } from "@/stores/game";
import { Icon } from "@iconify/vue";
import ShareIcons from "@/components/page-ui/ShareIcons.vue";
import { useSurvivalStore } from "@/stores/survival";
import { useConfigStore } from "@/stores/config";
import GameOverCrown from "@/components/game-ui/GameOverCrown.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import SingleplayerRanks from "@/components/game-ui/SingleplayerRanks.vue";
import { getRankData } from "@/utils/ranks";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import GameOverStar from "@/components/game-ui/GameOverStar.vue";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";

const playerStore = usePlayerStore();
const survivalStore = useSurvivalStore();
const configStore = useConfigStore();
const channelStore = useChannelStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();
const showIntro = ref(true);
const showWinnerAnimation = ref(false);
const winnerAnimationShown = ref(false);

const isMe = (id) => id === channelStore.playerId;

const playersOnline = computed(() => channelStore.playersOnline);

const playersSortedByPoints = computed(() => {
  return [...playersOnline.value].sort((a, b) => b.points - a.points);
});

const winnerPlayer = computed(() => playersSortedByPoints.value[0] ?? null);

const waitingForFinalResults = computed(() =>
  playersOnline.value.some((player) => player.isOnline && !player.hasFinished)
);

const isOnlinePlay = computed(
  () => channelStore.playersOnline && channelStore.playersOnline.length > 1
);

const showSingleplayerRank = computed(() => {
  return (
    playerStore.gameMode === "classic" ||
    playerStore.gameMode === "inspect" ||
    playerStore.gameMode === "gravity"
  );
});

const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
};

watch(
  [
    () => showIntro.value,
    () => isOnlinePlay.value,
    () => waitingForFinalResults.value,
    () => winnerPlayer.value,
  ],
  ([intro, online, waiting, winner]) => {
    if (intro) return;
    if (!online) return;
    if (waiting) return;
    if (!winner) return;
    if (winnerAnimationShown.value) return;
    winnerAnimationShown.value = true;
    showWinnerAnimation.value = true;
  },
  { immediate: true }
);

const getRankDataForShare = (score) =>
  getRankData(score, {
    maxRounds: configStore.maxRounds,
    revealTime: configStore.revealTime,
  });

const getShareMessage = (score, mode) => {
  if (mode === "classic") {
    const rankTitle = getRankDataForShare(score).title;
    return `I earned the title ${rankTitle} in PIX REVEAL! Think you can beat that?`;
  }

  if (mode === "survival")
    return `I scored ${survivalStore.solvedCount} in Survival mode on PIX REVEAL! Think you can beat that?`;

  return "Play PIX REVEAL!";
};

const playAgain = () => {
  if (onlineStore && onlineStore.reset) onlineStore?.reset();
  router.push("/");
};

gameStore.reset();

onMounted(() => {
  if (channelStore.mode === "party" && channelStore.onlineGameRunning) {
    router.replace("/gameover-party");
    return;
  }
  const winnerId = playersSortedByPoints.value[0]?.playerId;
  if (winnerId && winnerId === channelStore.playerId) soundStore.playSound("winner");
});
</script>

<style scoped>
main {
  width: 800px;
  max-width: 100%;
}
.btn-primary {
  animation: arcadeBlink 1.4s infinite;
  margin: 32px auto;
  font-size: 18px;
  padding: 18px;
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
}

.results-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  background: var(--card-bg);
  padding: 32px;
  text-align: center;
  margin-bottom: 32px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  .rank-prophet {
    margin: 0 auto 16px;
  }
}

.rank-prophet.highscore-message {
  margin: 16px 0 32px;
  animation: pulse 2s infinite ease-in-out;
}

.rank-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  margin-top: 16px;
  font-weight: 700;
}

.rank-desc {
  margin: 16px;
}

.rank-prophet {
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
  animation: floating 2s ease-in-out infinite;
  font-weight: bold;
  font-size: 24px;
}

.rank-eagle {
  color: #00ffcc;
  animation: sharp-pulse 1.5s ease-in-out infinite;
  font-size: 24px;
}

.rank-glitcher {
  color: #ff6600;
  animation: glitch 0.2s infinite;
  font-size: 24px;
}

.rank-blurry {
  color: #888888;
  animation: blur-fade 3s infinite;
  font-size: 24px;
}

.rank-afk {
  color: #ff0044;
  animation: slow-blink 2s step-end infinite;
  font-size: 24px;
}

.share-section {
  h2 {
    font-size: 18px;
    text-align: center;
  }
  margin: 32px auto 0;
}

.results-card::after {
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
</style>
