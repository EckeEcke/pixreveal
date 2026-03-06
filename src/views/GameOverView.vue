<template>
  <main>
    <header>
      <h1 class="logo">GAME <span>OVER</span></h1>
    </header>
    <div>
      <div v-if="isOnlinePlay">
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
            :is-winner="!waitingForFinalResults && index === 0"
            :show-you-indicator="isMe(player.playerId)"
          />
        </div>
        <div v-if="waitingForFinalResults">
          <LoadingAnimation text="WAITING FOR REMAINING PLAYERS" />
        </div>
      </div>
      <div v-else>
        <div class="rank-text">
          <div>YOUR RANK IS</div>
          <div :class="getRankData(playerStore.points).class">
            {{ getRankData(playerStore.points).title }}
          </div>
          <div class="rank-desc">
            {{ getRankData(playerStore.points).description }}
          </div>
        </div>
        <PlayerDisplay
          :name="playerStore.playerName"
          :avatar-index="playerStore.avatarIndex"
          :points="playerStore.points"
          :correct-answers="playerStore.correctAnswers"
        />
      </div>
    </div>
    <button
      v-if="!waitingForFinalResults"
      class="btn-outline"
      @click="playAgain"
    >
      Play Again
    </button>
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

const playerStore = usePlayerStore();
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
  const adjustedScore = score / gameStore.maxRounds * 10
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

const playAgain = () => {
  soundStore.playSound("click");
  onlineStore.reset();
  router.push("/");
};

gameStore.reset()
</script>

<style scoped>
.logo {
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  margin-bottom: 2rem;
}

.logo span {
  color: var(--neon-orange);
}

.player-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
}

.position {
  color: var(--neon-orange);
  font-weight: 700;
  font-size: 32px;
  width: 40px;
}

.btn-outline {
  margin-top: 32px;
}

.rank-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  margin-bottom: 16px;
  font-weight: 700;
}

.rank-desc {
  margin: 32px;
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
</style>
