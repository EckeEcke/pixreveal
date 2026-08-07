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

    <div class="results-card">
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
        v-if="
          playerStore.gameMode === 'survival' && !survivalStore.newHighscore
        "
        class="game-over-crown"
        :highscore="survivalStore.highscore"
      />
      <div v-if="showSingleplayerRank">
        <SingleplayerRanks :points="playerStore.points" />
      </div>

      <div
        v-if="showSingleplayerRank && percentile !== null"
        class="percentile-tag"
      >
        <Icon icon="pixel:chart-up" />
        Better than <span>{{ percentile }}%</span> of players
      </div>

      <div
        v-if="playerStore.gameMode === 'survival' && survivalStore.newHighscore"
        class="rank-prophet highscore-message"
      >
        <Icon icon="pixel:sparkles" />
        NEW HIGHSCORE!
        <Icon icon="pixel:sparkles" />
      </div>

      <div class="gameover-actions">
        <ButtonPrimary
          class="btn-primary pulse-btn"
          data-sfx="click"
          @mouseenter="soundStore.handleHoverSound"
          @clicked="playAgainSingleplayer"
        >
          <Icon icon="pixel:refresh-solid" /> Play Again</ButtonPrimary
        >
        <ButtonSecondary
          data-sfx="back"
          @mouseenter="soundStore.handleHoverSound"
          @clicked="goBackSingleplayer"
        >
          <Icon icon="pixel:arrow-left" /> Go back
        </ButtonSecondary>
      </div>

      <div class="share-section">
        <h2>Challenge your friends!</h2>
        <ShareIcons
          :msg="getShareMessage(playerStore.points, playerStore.gameMode)"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
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
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { useConfetti } from "@/composables/useConfetti";

const playerStore = usePlayerStore();
const survivalStore = useSurvivalStore();
const configStore = useConfigStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();
const showIntro = ref(true);

const { fireConfetti } = useConfetti();

const showSingleplayerRank = computed(() => {
  return (
    playerStore.gameMode === "classic" ||
    playerStore.gameMode === "inspect" ||
    playerStore.gameMode === "gravity" ||
    playerStore.gameMode === "blur"
  );
});

const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
};

const getRankDataForShare = (score) =>
  getRankData(score, {
    maxRounds: configStore.maxRounds,
    revealTime: configStore.revealTime,
  });

const percentile = computed(() => {
  const maxScore = Number(configStore.revealTime) * Number(configStore.maxRounds);
  if (!maxScore) return null;
  
  const normalizedScore = Number(playerStore.points) / maxScore;
  return gameStore.getPercentile(normalizedScore);
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

const playAgainSingleplayer = () => {
  gameStore.reset?.();
  router.push("/singleplayer");
};

const goBackSingleplayer = () => {
  gameStore.reset?.();
  router.push("/");
};

const submitSingleplayerScore = () => {
  if (!showSingleplayerRank.value || playerStore.points <= 0) return;

  fetch("/api/post-singleplayer", {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: playerStore.gameMode,
      score: playerStore.points,
      revealTime: configStore.revealTime,
      rounds: configStore.maxRounds,
    }),
  }).catch((error) => {
    console.error("Failed to submit score", error);
  });
};

onMounted(() => {
  submitSingleplayerScore();
  if (playerStore.gameMode === "survival" && survivalStore.newHighscore) {
    fireConfetti();
  }
});
</script>

<style scoped>
main {
  width: 800px;
  max-width: 100%;
}
.gameover-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 32px;
}
.btn-primary {
  animation: arcadeBlink 1.4s infinite;
  font-size: 18px;
  padding: 18px;
  box-sizing: border-box;
}

.btn-secondary,
.btn-primary {
  width: 200%;
}

@media (min-width: 500px) {
  .btn-secondary,
  .btn-primary {
    width: calc(50% - 8px);
  }
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

.percentile-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  font-size: 14px;
  color: #cccccc;

  span {
    color: #00ffcc;
    font-weight: bold;
  }

  svg {
    font-size: 16px;
    color: #00ffcc;
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