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
        <TopPlayerDisplay
          :avatar-index="ownPlayer.avatarIndex"
          :name="ownPlayer.username"
          :score="ownPlayer.points"
          class="top-player"
        />
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
      :is-winner="isWinner"
      @done="showWinnerAnimation = false"
    />
    <EmojiButtons
      :emoji-cooldown="emojiCooldown"
      :is-frozen="partyStore.isFrozen"
      :connection-stale="partyStore.connectionStale"
      reduced
      @clicked="sendEmoji"
    />
  </main>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { workerClearTimeout } from "@/services/workerTimers";
import { useChannelStore } from "@/stores/channel";
import { useGameStore } from "@/stores/game";
import { usePartyStore } from "@/stores/party";
import { useSoundStore } from "@/stores/sound";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";
import EmojiButtons from "@/components/game-ui/EmojiButtons.vue";

const channelStore = useChannelStore();
const partyStore = usePartyStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();

const showIntro = ref(true);
const showWinnerAnimation = ref(false);

let partySoundTimer = null;

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const winnerPlayer = computed(() => partyPlayersSorted.value[0] ?? null);

const isWinner = computed(
  () => winnerPlayer.value?.playerId === channelStore.playerId,
);

const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
  if (winnerPlayer.value) showWinnerAnimation.value = true;
};

onUnmounted(() => {
  if (partySoundTimer) {
    workerClearTimeout(partySoundTimer);
    partySoundTimer = null;
  }
  soundStore.stopSound("party");
});

const playAgain = () => {
  partyStore?.reset?.({ keepEvents: true });
  gameStore.reset?.();
  router.push("/party-lobby");
};

const goBack = () => {
  partyStore?.reset?.();
  channelStore.reset?.();
  router.push("/");
};

const ownPlayer = computed(() => {
  return (
    partyStore.players.find((p) => p.playerId === channelStore.playerId) || {
      username: "Unknown",
      avatarIndex: 0,
      points: 0,
    }
  );
});

const emojiCooldown = ref(false);
const EMOJI_COOLDOWN_MS = 1000;

const sendEmoji = (emoji) => {
  if (emojiCooldown.value) return;
  if (partyStore.isFrozen) return;
  partyStore.sendEmoji(emoji);
  emojiCooldown.value = true;
  setTimeout(() => (emojiCooldown.value = false), EMOJI_COOLDOWN_MS);
};
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
max-width: 600px;
  overflow: hidden;
  box-sizing: border-box;
}

.party-wrapper {
    width: 100%;
    margin: 0 auto;
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
  .rank-prophet {
    margin: 0 auto 16px;
  }
}

.party-results-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 8px 8px 16px;
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

.logo {
  margin-bottom: 16px;
}

.top-player {
  margin: 0px auto;
}
</style>