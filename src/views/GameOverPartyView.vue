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
                <TopPlayerDisplay v-if="!channelStore.isHost" :avatar-index="ownPlayer.avatarIndex" :name="ownPlayer.username" :score="ownPlayer.points" class="top-player" />
        <PartyTitles v-if="channelStore.isHost" :players="partyPlayersSorted" />
        <div v-if="channelStore.isHost" class="final-rankings">
          <h2>Final Rankings</h2>
          <div v-for="(player, index) in partyPlayersSorted" :key="player.playerId">
            <PlayerDisplay
              :position="index + 1"
              :name="player.username"
              :subline="getPartyTitleEmojis(player, index)"
              :avatar-index="player.avatarIndex"
              :points="player.points"
            />
          </div>
        </div>
        <div class="party-actions">
          <ButtonPrimary
            class="btn-primary pulse-btn"
            data-sfx="click"
            @mouseenter="soundStore.handleHoverSound"
            @clicked="playAgain"
          >
            <Icon icon="pixel:refresh-solid" /> Play again</ButtonPrimary
          >
          <ButtonSecondary
            class="btn-secondary"
            data-sfx="back"
            @mouseenter="soundStore.handleHoverSound"
            @clicked="goBack"
          >
            <Icon icon="pixel:arrow-left" /> Go back
          </ButtonSecondary>
        </div>
      </div>
      
    </div>
    <WinnerAnimation
      v-if="winnerPlayer"
      :show="showWinnerAnimation"
      :winner-name="winnerPlayer.username"
      :avatar-index="winnerPlayer.avatarIndex"
      :is-winner="isWinner || channelStore.isHost"
      @done="showWinnerAnimation = false"
    />
  </main>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue";
import PartyTitles from "@/components/game-ui/PartyTitles.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { workerSetTimeout } from "@/services/workerTimers";
import { useChannelStore } from "@/stores/channel";
import { useGameStore } from "@/stores/game";
import { usePartyStore } from "@/stores/party";
import { useSoundStore } from "@/stores/sound";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";

const channelStore = useChannelStore();
const partyStore = usePartyStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();

const showIntro = ref(true);
const partySoundPlayed = ref(false);
const showWinnerAnimation = ref(false);

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const winnerPlayer = computed(() => partyPlayersSorted.value[0] ?? null);

const isWinner = computed(
  () => winnerPlayer.value?.playerId === channelStore.playerId,
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

const getPartyTitleEmojis = (player, index) => {
  if (!player) return undefined;

  const badges = [];

  if (player.isDecrypter) badges.push("🧠");

  if (player.devilVictim) badges.push("😈");
  if (player.devilSurvivor) badges.push("👼");

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

  if (partyStore.isSuddenDeath && index === 0) {
    badges.push("☠️");
  }

  const unique = [...new Set(badges)];
  return unique.length ? unique.join("") : undefined;
};

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
  if (winnerPlayer.value) showWinnerAnimation.value = true;
};

onUnmounted(() => {
  soundStore.stopSound("party");
});

const playAgain = () => {
  // Keep the same roomId and stay subscribed; go back to the party lobby.
  // Host stays host, players stay joined (or can rejoin with the same room id).
  partyStore?.reset?.({ keepEvents: true });
  gameStore.reset?.();
  router.push("/party-lobby");
};

const goBack = () => {
  // Leave the room and go back home. If host leaves, notify all players so they disconnect too.
  if (
    channelStore.isHost &&
    channelStore.activeChannel &&
    channelStore.playerId
  ) {
    channelStore.activeChannel.trigger("client-host-inactive", {
      playerId: channelStore.playerId,
    });
  }
  partyStore?.reset?.();
  channelStore.reset?.();
  router.push("/");
};

const activeMembersCount = computed(
  () => channelStore.playersOnline.filter((p) => p.isOnline).length,
);

const ownPlayer = computed(() => {
  return (
    partyStore.players.find((p) => p.playerId === channelStore.playerId) || {
      username: "Unknown",
      avatarIndex: 0,
      points: 0,
    }
  );
});

watch(
  () => activeMembersCount.value,
  (count) => {
    // If host is alone in the room, auto-leave and close the room.
    if (!channelStore.isHost) return;
    if (!channelStore.activeChannel) return;
    if (count > 1) return;
    goBack();
  },
);
</script>

<style scoped>
main {
  width: 800px;
  max-width: 100%;
}
.btn-primary {
  animation: arcadeBlink 1.4s infinite;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  @media (min-width: 500px) {
    width: calc(50% - 8px);
  }
}

.results-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
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
  gap: 16px;
  flex-wrap: wrap;
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

.logo {
  margin-bottom: 16px;
}

.final-rankings {
  background: #22222244;
  padding: 0 16px 16px;
  border-radius: 8px;
  margin: 32px 0;
}

.top-player {
  margin: 16px auto;
}
</style>
