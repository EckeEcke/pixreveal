<template>
  <main>
    <header></header>
    <div>
      <div v-if="isOnlinePlay">
        <h1 class="logo">GAME <span>OVER</span></h1>
        <div v-if="!waitingForFinalResults" class="results-card">
          <h2 class="rank-prophet">
            {{
              isMe(playersSortedByPoints[0].playerId)
                ? "YOU WIN!"
                : `${playersSortedByPoints[0].username.toUpperCase()} WINS!`
            }}
          </h2>
          <PlayerDisplay
            :name="playersSortedByPoints[0].username"
            :avatar-index="playersSortedByPoints[0].avatarIndex"
            :points="playersSortedByPoints[0].points"
            :has-finished="playersSortedByPoints[0].hasFinished"
            :correct-answers="playersSortedByPoints[0].correctAnswers"
            minimalistic
          />
          <button class="btn-outline" @click="playAgain">
            <Icon icon="pixel:refresh-solid" />
            Play Again
          </button>
        </div>
        <div
          v-for="(player, index) in playersSortedByPoints"
          :key="player.playerId"
          class="player-wrapper"
        >
          <div v-if="player.hasFinished" class="position">{{ index + 1 }}.</div>
          <LoadingAnimation size="small" v-else />
          <PlayerDisplay
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :points="player.points"
            :has-finished="player.hasFinished"
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
        <PlayerDisplay
          :name="playerStore.playerName"
          :avatar-index="playerStore.avatarIndex"
          :points="playerStore.points || survivalStore.solvedCount"
          :correct-answers="playerStore.correctAnswers"
          minimalistic
        />
        <div
          v-if="
            playerStore.gameMode === 'classic' ||
            playerStore.gameMode === 'inspect'
          "
          class="rank-text"
        >
          <div>YOUR RANK IS</div>
          <div :class="getRankData(playerStore.points).class">
            {{ getRankData(playerStore.points).title }}
          </div>
          <div class="rank-desc">
            {{ getRankData(playerStore.points).description }}
          </div>
        </div>

        <div
          v-if="
            playerStore.gameMode === 'survival' && survivalStore.newHighscore
          "
          class="rank-prophet highscore-message"
        >
          NEW HIGHSCORE!
        </div>

        <div class="share-section">
          <h2>Challenge your friends!</h2>
          <ShareIcons :msg="getShareMessage(playerStore.points)" />
        </div>
        <button class="btn-outline pulse-btn" @click="playAgain">
          <Icon icon="pixel:refresh-solid" />
          Play Again
        </button>
      </div>
    </div>
    <LobbyChat v-if="isOnlinePlay" />
  </main>
</template>

<script setup>
import { computed } from "vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useRouter } from "vue-router";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { useSoundStore } from "@/stores/sound";
import LobbyChat from "@/components/LobbyChat.vue";
import { useGameStore } from "@/stores/game";
import { Icon } from "@iconify/vue";
import ShareIcons from "@/components/ShareIcons.vue";
import { useSurvivalStore } from "@/stores/survival";
import { useConfigStore } from "@/stores/config";

const playerStore = usePlayerStore();
const survivalStore = useSurvivalStore();
const configStore = useConfigStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();

const isMe = (id) => id === onlineStore.playerId;

const playersOnline = computed(() => onlineStore.playersOnline);

const playersSortedByPoints = computed(() => {
  return [...playersOnline.value].sort((a, b) => b.points - a.points);
});

const waitingForFinalResults = computed(() =>
  playersOnline.value.some((player) => !player.hasFinished),
);

const isOnlinePlay = computed(
  () => onlineStore.playersOnline && onlineStore.playersOnline.length > 1,
);

soundStore.playSound("complete");

const getRankData = (score) => {
  const adjustedScore =
    (score / configStore.maxRounds) * (15 / configStore.revealTime) * 10;
  if (adjustedScore > 120) {
    return {
      title: "PIXEL PROPHET",
      class: "rank-prophet",
      description: "You see the art before it even exists. Pure sorcery!",
    };
  }
  if (score > 90) {
    return {
      title: "EAGLE EYE",
      class: "rank-eagle",
      description: "Sharp as a 4K monitor in a 720p world. Impressive!",
    };
  }
  if (score > 60) {
    return {
      title: "GRID GLITCHER",
      class: "rank-glitcher",
      description: "You're getting there. Not a total blur, but not HD yet.",
    };
  }
  if (score > 30) {
    return {
      title: "BLURRY VISION",
      class: "rank-blurry",
      description: "Were you squinting the whole time? Needs more focus.",
    };
  }
  return {
    title: "AFK ARCHITECT",
    class: "rank-afk",
    description: "Did you even turn your monitor on? Or are you a bot?",
  };
};

const getShareMessage = (score, mode) => {
  if (mode === "classic") {
    const rankTitle = getRankData(score).title;
    return `I earned the title ${rankTitle} in PIX REVEAL! Think you can beat that?`;
  }

  if (mode === "survival")
    return `I scored ${survivalStore.solvedCount} in Survival mode on PIX REVEAL! Think you can beat that?`;

  return "Play PIX REVEAL!";
};

const playAgain = () => {
  soundStore.playSound("click");
  onlineStore.reset();
  router.push("/");
};

gameStore.reset();
</script>

<style scoped>
.player-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
}

.position {
  color: var(--primary);
  font-weight: 700;
  font-size: 32px;
  width: 40px;
}

.btn-outline {
  margin-top: 32px;
}

.results-card {
  position: relative;
  overflow: hidden;
  border: 2px solid #334155;
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
  margin: 32px 0;
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
    text-align: center;
  }
  margin: 32px auto 0;
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes sharp-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes glitch {
  0% {
    transform: translate(1px, 1px);
  }
  50% {
    transform: translate(-1px, -1px);
  }
  100% {
    transform: translate(1px, -1px);
  }
}

@keyframes blur-fade {
  0%,
  100% {
    filter: blur(0px);
    opacity: 1;
  }
  50% {
    filter: blur(2px);
    opacity: 0.5;
  }
}

@keyframes slow-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.3;
  }
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

@keyframes shine {
  0% {
    left: -100%;
  }
  20% {
    left: 100%;
  }
  100% {
    left: 150%;
  }
}
</style>
