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
    <div class="party-wrapper">
      <div class="results-card party-results-card">
        <h1 class="logo">PARTY <span>OVER</span></h1>
        <p class="party-subtitle rank-prophet">
          {{ getPartyOverMessage }}
        </p>
        <div class="party-actions">
          <ButtonPrimary
            class="btn-primary pulse-btn"
            data-sfx="click"
            @mouseenter="soundStore.handleHoverSound"
            @clicked="playAgain"
          >
            <Icon icon="pixel:refresh-solid" /> Play again</ButtonPrimary
          >
        </div>
      </div>
      <PartyTitles :players="partyPlayersSorted" />
      <div v-for="(player, index) in partyPlayersSorted" :key="player.playerId">
        <PlayerDisplay
          :position="index + 1"
          :name="player.username"
          :subline="getPartyTitleEmojis(player)"
          :avatar-index="player.avatarIndex"
          :points="player.points"
          :show-you-indicator="player.playerId === channelStore.playerId"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import PartyTitles from "@/components/game-ui/PartyTitles.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import { workerSetTimeout } from "@/services/workerTimers";
import { useChannelStore } from "@/stores/channel";
import { useGameStore } from "@/stores/game";
import { useOnlineStore } from "@/stores/online";
import { usePartyStore } from "@/stores/party";
import { useSoundStore } from "@/stores/sound";

const channelStore = useChannelStore();
const partyStore = usePartyStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();

const showIntro = ref(true);
const partySoundPlayed = ref(false);

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const maxPartyPowerupsUsed = computed(() =>
  Math.max(0, ...partyPlayersSorted.value.map((p) => p.powerupsUsed ?? 0)),
);
const maxPartyEmojisSent = computed(() =>
  Math.max(0, ...partyPlayersSorted.value.map((p) => p.emojisSent ?? 0)),
);
const minPartyQuickestAnswer = computed(() => {
  const values = partyPlayersSorted.value
    .map((p) => p.quickestAnswer)
    .filter((v) => typeof v === "number");
  if (!values.length) return null;
  return Math.min(...values);
});

const getPartyTitleEmojis = (player) => {
  if (!player) return undefined;

  const badges = [];

  if (player.isDecrypter) badges.push("🧠");

  const minQuick = minPartyQuickestAnswer.value;
  if (typeof minQuick === "number" && player.quickestAnswer === minQuick) {
    badges.push("⚡");
  }

  if ((player.correctAnswers ?? 0) > 0 && (player.wrongAnswers ?? 0) === 0) {
    badges.push("🎯");
  }

  const maxPowerups = maxPartyPowerupsUsed.value;
  if (maxPowerups > 0 && (player.powerupsUsed ?? 0) === maxPowerups) {
    badges.push("💣");
  }

  const maxEmojis = maxPartyEmojisSent.value;
  if (maxEmojis >= 10 && (player.emojisSent ?? 0) === maxEmojis) {
    badges.push("💬");
  }

  if ((player.emojisSent ?? 0) === 0) badges.push("🤫");

  if ((player.powerupsUsed ?? 0) === 0) badges.push("🕊️");

  if ((player.correctAnswers ?? 0) === 0 && (player.wrongAnswers ?? 0) > 0) {
    badges.push("🥚");
  }

  const unique = [...new Set(badges)];
  return unique.length ? unique.join("") : undefined;
};

const getPartyOverMessage = computed(() => {
  if (partyPlayersSorted.value.length) {
    if (partyPlayersSorted.value[0].playerId === channelStore.playerId) {
      return "YOU WON THE PARTY!";
    }
    return `${partyPlayersSorted.value[0].username.toUpperCase()} WON THE PARTY!`;
  }
  return "GAME OVER";
});

const playPartySoundOnce = () => {
  if (partySoundPlayed.value) return;
  if (!channelStore.isHost) return;
  partySoundPlayed.value = true;
  soundStore.playSound("party");
};

const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
  workerSetTimeout(() => playPartySoundOnce(), 2000);
};

onUnmounted(() => {
  soundStore.stopSound("party");
});

const playAgain = () => {
  if (partyStore && partyStore.reset) partyStore?.reset();
  if (onlineStore && onlineStore.reset) onlineStore?.reset();
  gameStore.reset?.();
  router.push("/");
};
</script>

<style scoped>
main {
  width: 800px;
  max-width: 100%;
}
.btn-primary {
  animation: arcadeBlink 1.4s infinite;
  margin: 32px auto 0;
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

.rank-prophet {
  color: #ffcc00;
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
  animation: floating 2s ease-in-out infinite;
  font-weight: bold;
  font-size: 24px;
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

.party-wrapper {
  width: 800px;
  max-width: 100%;
}
</style>
