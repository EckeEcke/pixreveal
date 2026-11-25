<template>
  <div class="full-width">
    <main>
      <Transition name="fade" mode="out-in">
        <GameTransition
          v-if="showIntro"
          first="GAME"
          second="OVER"
          @done="handleIntroDone"
        />
      </Transition>

      <div class="scale-wrapper" ref="wrapperRef">
        <div class="gameover-wrapper">
          <div class="results-card">
            <h1 class="logo">GAME <span>OVER</span></h1>
            <GameOverStar
              class="game-over-star"
              :points="
                playerStore.gameMode === 'survival'
                  ? survivalStore.solvedCount
                  : playerStore.points
              "
              @done="starDone = true"
            />
            <GameOverCrown
              v-if="
                playerStore.gameMode === 'survival' &&
                !survivalStore.newHighscore
              "
              class="game-over-crown"
              :highscore="survivalStore.highscore"
            />
            <div v-if="showSingleplayerRank">
              <SingleplayerRanks :percentile="percentile" :active="starDone" />
            </div>

            <GameOverPercentile
              v-if="showSingleplayerRank && percentile !== null"
              :percentile="percentile"
              :active="starDone"
            />

            <div
              v-if="
                playerStore.gameMode === 'survival' &&
                survivalStore.newHighscore
              "
              class="rank-prophet highscore-message"
            >
              <Icon icon="pixel:sparkles" />
              NEW HIGHSCORE!
              <Icon icon="pixel:sparkles" />
            </div>

            <div class="gameover-actions">
              <ButtonSecondary
                class="btn-primary pulse-btn"
                :disabled="isRestarting"
                data-sfx="click"
                @mouseenter="soundStore.handleHoverSound"
                @clicked="playAgainSingleplayer"
              >
                <Icon icon="pixel:refresh-solid" /> Play Again
              </ButtonSecondary>

              <ButtonSecondary
                data-sfx="back"
                @mouseenter="soundStore.handleHoverSound"
                @clicked="goBackSingleplayer"
              >
                <Icon icon="pixel:arrow-left" /> Go back
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useGameStore } from "@/stores/game";
import { Icon } from "@iconify/vue";
import { useSurvivalStore } from "@/stores/survival";
import { useConfigStore } from "@/stores/config";
import GameOverCrown from "@/components/game-ui/GameOverCrown.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import SingleplayerRanks from "@/components/game-ui/SingleplayerRanks.vue";
import GameOverPercentile from "@/components/game-ui/GameOverPercentile.vue";
import { getRankData } from "@/utils/ranks";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import GameOverStar from "@/components/game-ui/GameOverStar.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { useConfetti } from "@/composables/useConfetti";
import { useSingleplayerStart } from "@/composables/useSingleplayerStart";
import { useAchievementsStore } from "@/stores/achievements";

const playerStore = usePlayerStore();
const survivalStore = useSurvivalStore();
const configStore = useConfigStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const achievementsStore = useAchievementsStore();
const { startSingleplayer, isStarting: isRestarting } = useSingleplayerStart();
const router = useRouter();
const showIntro = ref(true);
const wrapperRef = ref(null);

const starDone = ref(false);

const { fireConfetti } = useConfetti();

const resizeGame = () => {
  if (!wrapperRef.value) return;
  const baseWidth = 1000;
  const baseHeight = 1000;

  wrapperRef.value.style.transform = "none";

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;
  const scale = Math.max(Math.min(scaleX, scaleY), 1);

  wrapperRef.value.style.transform = `scale(${scale})`;
};

onMounted(() => {
  resizeGame();
  window.addEventListener("resize", resizeGame);
  submitSingleplayerScore();
  const allSingleplayerModes = ["classic", "inspect", "gravity", "survival"];
  if (allSingleplayerModes.includes(playerStore.gameMode)) {
    void achievementsStore.unlock("play-singleplayer");
  }
  if (playerStore.gameMode === "survival" && survivalStore.highscore >= 20) {
    void achievementsStore.unlock("survivor");
  }
  const singleplayerModes = ["classic", "inspect", "gravity"];
  const answerHistory = playerStore.answerHistory;
  if (
    singleplayerModes.includes(playerStore.gameMode) &&
    gameStore.rounds.length > 0 &&
    answerHistory.length === gameStore.rounds.length &&
    answerHistory.every(Boolean)
  ) {
    void achievementsStore.unlock("perfect-round");
  }
  if (playerStore.gameMode === "survival" && survivalStore.newHighscore) {
    fireConfetti();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeGame);
});

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

const getRankDataForShare = (score) =>
  getRankData(score, {
    maxRounds: gameStore.rounds.length,
    revealTime: configStore.revealTime,
  });

const percentile = computed(() => {
  const maxScore =
    Number(configStore.revealTime) * Number(configStore.maxRounds);
  if (!maxScore) return null;

  const normalizedScore = Number(playerStore.points) / maxScore;
  return gameStore.getPercentile(normalizedScore);
});

const getShareMessage = (score, mode) => {
  if (mode === "survival")
    return `I scored ${survivalStore.solvedCount} in Survival mode on PIX REVEAL! Think you can beat my highscore?`;

  if (percentile.value !== null) {
    return `I am in the top ${percentile.value}% of PixReveal players! 🏆 Think you can beat that?`;
  }

  return "Check out PixReveal!";
};

const playAgainSingleplayer = () => startSingleplayer(playerStore.gameMode);

const goBackSingleplayer = () => {
  survivalStore.reset();
  gameStore.reset();
  router.push("/singleplayer");
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
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  @media (min-width: 1000px) {
    width: calc(100dvw - 16px);
    height: calc(100dvh - 32px);
  }
  overflow: hidden;
  box-sizing: border-box;
}

.scale-wrapper {
  transform-origin: center center;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: flex;
  justify-content: center;
  width: 100%;
}

.gameover-wrapper {
  width: 800px;
  max-width: 100%;
}

.gameover-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.btn-primary {
  animation: arcadeBlink 1.4s infinite;
  font-size: 18px;
  padding: 18px;
  box-sizing: border-box;
}

.btn-secondary,
.btn-primary {
  width: 100%;
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
  background:
    radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), transparent 50%),
    linear-gradient(135deg, rgba(32, 16, 46, 0.95), rgba(18, 9, 28, 0.98));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 32px;
  text-align: center;
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

.full-width {
  width: 100%;
}
</style>
