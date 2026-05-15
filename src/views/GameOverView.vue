<template>
  <main>
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
    <div>
      <div v-if="isPartyMode">
        <div class="results-card party-results-card">
          <h1 class="logo">PARTY <span>OVER</span></h1>
          <p class="party-subtitle rank-prophet">
            {{ getPartyOverMessage }}
          </p>
          <div class="party-actions">
            <button
              class="btn-primary pulse-btn"
              data-sfx="click"
              @click="playAgain"
              @mouseenter="soundStore.handleHoverSound"
            >
              <Icon icon="pixel:refresh-solid" />
              Play again
            </button>
          </div>
        </div>
        <div
          v-for="(player, index) in partyPlayersSorted"
          :key="player.playerId"
        >
          <PlayerDisplay
            :position="index + 1"
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :points="player.points"
            :show-you-indicator="player.playerId === channelStore.playerId"
          />
        </div>
      </div>
      <div v-else-if="isOnlinePlay">
        <div v-if="!waitingForFinalResults" class="results-card">
          <h1 class="logo">GAME <span>OVER</span></h1>
          <h2 class="rank-prophet">
            {{
              isMe(playersSortedByPoints[0].playerId)
                ? "YOU WIN!"
                : `${playersSortedByPoints[0].username.toUpperCase()} WINS!`
            }}
          </h2>
          <button
            class="btn-primary"
            data-sfx="click"
            @click="playAgain"
            @mouseenter="soundStore.handleHoverSound"
          >
            <Icon icon="pixel:refresh-solid" />
            Play Again
          </button>
        </div>
        <div
          v-for="(player, index) in playersSortedByPoints"
          :key="player.playerId"
        >
          <PlayerDisplay
            :position="player.hasFinished ? index + 1 : undefined"
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :points="player.points"
            :is-pending="!player.hasFinished"
            :correct-answers="player.correctAnswers"
            :show-you-indicator="isMe(player.playerId)"
          />
          <LoadingAnimation v-if="!player.hasFinished" size="small" />
        </div>
        <div v-if="waitingForFinalResults">
          <LoadingAnimation text="WAITING FOR REMAINING PLAYERS" />
        </div>
      </div>
      <div v-else class="results-card">
        <h1 class="logo">GAME <span>OVER</span></h1>
        <h2>Your results</h2>
        <GameOverStats />
        <div
          v-if="
            playerStore.gameMode === 'classic' ||
            playerStore.gameMode === 'inspect' ||
            playerStore.gameMode === 'gravity'
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
        <button
          class="btn-primary pulse-btn"
          data-sfx="click"
          @click="playAgain"
          @mouseenter="soundStore.handleHoverSound"
        >
          <Icon icon="pixel:refresh-solid" />
          Play Again
        </button>
      </div>
    </div>
    <LobbyChat v-if="isOnlinePlay" />
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import { useRouter } from "vue-router";
import { useChannelStore } from "@/stores/channel";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import { usePartyStore } from "@/stores/party";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import { useSoundStore } from "@/stores/sound";
import LobbyChat from "@/components/game-ui/LobbyChat.vue";
import { useGameStore } from "@/stores/game";
import { Icon } from "@iconify/vue";
import ShareIcons from "@/components/page-ui/ShareIcons.vue";
import { useSurvivalStore } from "@/stores/survival";
import { useConfigStore } from "@/stores/config";
import GameOverStats from "@/components/game-ui/GameOverStats.vue";
import GameOverTransition from "@/components/game-ui/GameOverTransition.vue";

const playerStore = usePlayerStore();
const survivalStore = useSurvivalStore();
const configStore = useConfigStore();
const channelStore = useChannelStore();
const partyStore = usePartyStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();
const showIntro = ref(true);

const isMe = (id) => id === channelStore.playerId;

const playersOnline = computed(() => channelStore.playersOnline);

const playersSortedByPoints = computed(() => {
  return [...playersOnline.value].sort((a, b) => b.points - a.points);
});

const waitingForFinalResults = computed(() =>
  playersOnline.value.some((player) => player.isOnline && !player.hasFinished),
);

const isOnlinePlay = computed(
  () => channelStore.playersOnline && channelStore.playersOnline.length > 1,
);

const isPartyMode = computed(
  () => partyStore.isGameOver || partyStore.players.length > 0,
);

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const getPartyOverMessage = computed(() => {
  if (partyPlayersSorted.value.length) {
    if (partyPlayersSorted.value[0].playerId === channelStore.playerId) {
      return "YOU WON THE PARTY!";
    }
    `${partyPlayersSorted.value[0].username.toUpperCase()} WON THE PARTY!`;
    return "GAME OVER";
  }
});

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
  if (partyStore && partyStore.reset) partyStore?.reset();
  if (onlineStore && onlineStore.reset) onlineStore?.reset();
  router.push("/");
};

gameStore.reset();

onMounted(() => {
  if (
    partyPlayersSorted.value.length &&
    partyPlayersSorted.value[0].playerId === channelStore.playerId
  ) {
    soundStore.playSound("winner");
  }
});
</script>

<style scoped>
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: var(--primary);
  color: #000;
  border: none;
  padding: 16px;
  border-radius: 4px;
  font-family: inherit;
  font-weight: bold;
  font-size: 1.2rem;
  text-transform: uppercase;
  cursor: pointer;
  animation: arcadeBlink 1.4s infinite;
  transition: all 0.3s;
  margin-top: 32px;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #b45309;
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

.party-results-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 48px;
}

.party-subtitle {
  font-size: 20px;
  font-weight: 700;
  margin-top: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--neon-pink);
}

.party-actions {
  display: flex;
  justify-content: center;
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
