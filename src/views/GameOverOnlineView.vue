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
      <div v-if="!waitingForFinalResults" class="results-card">
        <h1 class="logo">GAME <span>OVER</span></h1>
        <h2 class="rank-prophet" v-if="winnerPlayer">
          {{
            isMe(winnerPlayer.playerId)
              ? "YOU WIN!"
              : `${winnerPlayer.username.toUpperCase()} WINS!`
          }}
        </h2>

        <div class="gameover-actions">
          <ButtonPrimary
            class="btn-primary pulse-btn"
            data-sfx="click"
            @mouseenter="soundStore.handleHoverSound"
            @clicked="playAgainOnline"
          >
            <Icon icon="pixel:refresh-solid" />
            Play Again
          </ButtonPrimary>
          <ButtonSecondary
            class="btn-secondary"
            data-sfx="back"
            @mouseenter="soundStore.handleHoverSound"
            @clicked="goBackOnline"
          >
            <Icon icon="pixel:arrow-left" />
            Go back
          </ButtonSecondary>
        </div>
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
      </div>

      <div v-if="waitingForFinalResults">
        <LoadingAnimation text="WAITING FOR REMAINING PLAYERS" />
      </div>
    </div>

    <LobbyChat />
    <WinnerAnimation
      v-if="!waitingForFinalResults && winnerPlayer"
      :show="showWinnerAnimation"
      :winner-name="winnerPlayer.username"
      :avatar-index="winnerPlayer.avatarIndex"
      @done="showWinnerAnimation = false"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import LobbyChat from "@/components/game-ui/LobbyChat.vue";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";

import { useChannelStore } from "@/stores/channel";
import { useOnlineStore } from "@/stores/online";
import { useGameStore } from "@/stores/game";
import { useSoundStore } from "@/stores/sound";

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
  playersOnline.value.some((player) => player.isOnline && !player.hasFinished),
);

const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
};

watch(
  [() => showIntro.value, () => waitingForFinalResults.value, () => winnerPlayer.value],
  ([intro, waiting, winner]) => {
    if (intro) return;
    if (waiting) return;
    if (!winner) return;
    if (winnerAnimationShown.value) return;
    winnerAnimationShown.value = true;
    showWinnerAnimation.value = true;
  },
  { immediate: true },
);

const playAgainOnline = () => {
  onlineStore.stopGame?.();
  gameStore.reset?.();
  router.push("/lobby");
};

const goBackOnline = () => {
  if (
    channelStore.isHost &&
    channelStore.activeChannel &&
    channelStore.playerId
  ) {
    channelStore.activeChannel.trigger("client-host-inactive", {
      playerId: channelStore.playerId,
    });
  }
  onlineStore.stopGame?.();
  channelStore.reset?.();
  router.push("/");
};

const activeMembersCount = computed(
  () => channelStore.playersOnline.filter((p) => p.isOnline).length,
);

watch(
  () => activeMembersCount.value,
  (count) => {
    if (!channelStore.isHost) return;
    if (!channelStore.activeChannel) return;
    if (count > 1) return;
    goBackOnline();
  },
);

gameStore.reset();

onMounted(() => {
  if (channelStore.mode === "party" && channelStore.onlineGameRunning) {
    router.replace("/gameover-party");
    return;
  }
  const winnerId = playersSortedByPoints.value[0]?.playerId;
  if (winnerId && winnerId === channelStore.playerId)
    soundStore.playSound("winner");
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
</style>

