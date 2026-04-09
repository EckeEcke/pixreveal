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
        <h1 class="logo">PARTY <span>OVER</span></h1>
        <div class="results-card party-results-card">
          <p class="party-subtitle">
            {{ partyPlayersSorted.length ? `${partyPlayersSorted[0].username.toUpperCase()} WON THE PARTY!` : "GAME OVER" }}
          </p>
          <div
            v-for="(player, index) in partyPlayersSorted"
            :key="player.playerId"
            class="player-wrapper"
          >
            <PlayerDisplay
              :name="player.username"
              :avatar-index="player.avatarIndex"
              :points="player.points"
              :has-finished="true"
              :show-you-indicator="player.playerId === channelStore.playerId"
            />
            <div class="position">{{ index + 1 }}</div>
          </div>
          <div class="party-actions">
            <button class="btn-outline pulse-btn" data-sfx="click" @click="playAgain">
              <Icon icon="pixel:refresh-solid" />
              Play again
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="isOnlinePlay">
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
          />
          <button class="btn-outline" data-sfx="click" @click="playAgain">
            <Icon icon="pixel:refresh-solid" />
            Play Again
          </button>
        </div>
        <div
          v-for="(player, index) in playersSortedByPoints"
          :key="player.playerId"
          class="player-wrapper"
        >
          <PlayerDisplay
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :points="player.points"
            :has-finished="player.hasFinished"
            :correct-answers="player.correctAnswers"
            :show-you-indicator="isMe(player.playerId)"
          />
          <div v-if="player.hasFinished" class="position">{{ index + 1 }}</div>
          <LoadingAnimation size="small" v-else />
        </div>
        <div v-if="waitingForFinalResults">
          <LoadingAnimation text="WAITING FOR REMAINING PLAYERS" />
        </div>
      </div>
      <div v-else class="results-card">
        <h1 class="logo">GAME <span>OVER</span></h1>
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
          v-if="playerStore.gameMode === 'survival' && survivalStore.newHighscore"
          class="rank-prophet highscore-message"
        >
          NEW HIGHSCORE!
        </div>

        <div class="share-section">
          <h2>Challenge your friends!</h2>
          <ShareIcons :msg="getShareMessage(playerStore.points)" />
        </div>
        <button class="btn-outline pulse-btn" data-sfx="click" @click="playAgain">
          <Icon icon="pixel:refresh-solid" />
          Play Again
        </button>
      </div>
    </div>
    <LobbyChat v-if="isOnlinePlay" />
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useRouter } from "vue-router";
import { useChannelStore } from "@/stores/channel";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import { usePartyStore } from "@/stores/party";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { useSoundStore } from "@/stores/sound";
import LobbyChat from "@/components/LobbyChat.vue";
import { useGameStore } from "@/stores/game";
import { Icon } from "@iconify/vue";
import ShareIcons from "@/components/ShareIcons.vue";
import { useSurvivalStore } from "@/stores/survival";
import { useConfigStore } from "@/stores/config";
import GameOverStats from "@/components/GameOverStats.vue";
import GameOverTransition from "@/components/GameOverTransition.vue";

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
  playersOnline.value.some((player) => player.isOnline && !player.hasFinished)
);

const isOnlinePlay = computed(
  () => channelStore.playersOnline && channelStore.playersOnline.length > 1
);

const isPartyMode = computed(
  () => partyStore.isGameOver || partyStore.players.length > 0,
);

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

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
</script>

<style scoped>
.player-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.position {
  position: absolute;
  top: -12px;
  left: -12px;
  background: var(--bg-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary);
  font-weight: 700;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--primary);
  box-shadow: 2px 2px 4px #00000088;
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

.party-results-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 48px;
}

.party-subtitle {
  font-size: 20px;
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
