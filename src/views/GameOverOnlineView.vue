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

        <div
        v-for="(player, index) in playersSortedByPoints"
        :key="player.playerId"
      >
        <PlayerDisplay
          size="small"
          :position="player.hasFinished ? index + 1 : undefined"
          :name="player.username"
          :avatar-index="player.avatarIndex"
          :points="player.points"
          :is-pending="!player.hasFinished"
          :correct-answers="player.correctAnswers"
          :show-you-indicator="isMe(player.playerId)"
          :answer-history="player.answerHistory"
        />
      </div>
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
    </div>

    <div v-if="waitingForFinalResults" class="results-card">
    <h1 class="logo">GAME <span>OVER</span></h1>
      <LoadingAnimation text="PLEASE KEEP THIS WINDOW OPEN WHILE WAITING FOR REMAINING PLAYERS" />
      <div v-if="joke" class="random-joke-box">
        <h2>Random joke</h2>
        <p>{{ joke }}</p>
      </div>
    </div>

    <LobbyChat />
    <WinnerAnimation
      v-if="!waitingForFinalResults && winnerPlayer"
      :show="showWinnerAnimation"
      :winner-name="winnerPlayer.username"
      :avatar-index="winnerPlayer.avatarIndex"
      :is-winner="isMe(winnerPlayer.playerId)"
      @done="showWinnerAnimation = false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import LobbyChat from "@/components/game-ui/LobbyChat.vue";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { workerSetTimeout, workerClearTimeout } from "@/services/workerTimers";

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
const winnerSoundPlayed = ref(false);
const partySoundPlayed = ref(false);

// Handle for the recursive joke-polling timeout, so we can cancel it on unmount
let jokeTimer: ReturnType<typeof setTimeout> | null = null;
// Handle for the delayed party-sound timer, so we can cancel it on unmount
let partySoundTimer: ReturnType<typeof workerSetTimeout> | null = null;
let isMounted = true;

const isMe = (id: string) => id === channelStore.playerId;

const playersOnline = computed(() => channelStore.playersOnline);
const playersSortedByPoints = computed(() => {
  return [...playersOnline.value].sort((a, b) => b.points - a.points);
});
const winnerPlayer = computed(() => playersSortedByPoints.value[0] ?? null);

const waitingForFinalResults = computed(() =>
  playersOnline.value.some((player) => player.isOnline && !player.hasFinished),
);

const playPartySoundOnce = () => {
  if (partySoundPlayed.value) return;
  if (!channelStore.isHost) return;
  partySoundPlayed.value = true;
  soundStore.playSound("party");
};

const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
  partySoundTimer = workerSetTimeout(() => {
    partySoundTimer = null;
    playPartySoundOnce();
  }, 2000);
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

const joke = ref(undefined)

const fetchJoke = async () => {
  try {
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: { 'Accept': 'application/json' }
    })
    if (!response.ok) throw new Error('Network failed')

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected content-type: ${contentType}`)
    }

    const data = await response.json()
    if (isMounted) joke.value = data.joke
  } catch (error) {
    console.error('Error fetching joke:', error)
  }
  if (!isMounted) return;
  jokeTimer = setTimeout(() => {
    jokeTimer = null;
    if (waitingForFinalResults.value) fetchJoke()
  }, 10000)
}

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
  fetchJoke();
  if (channelStore.mode === "party" && channelStore.onlineGameRunning) {
    router.replace("/gameover-party");
    return;
  }
  const winnerId = playersSortedByPoints.value[0]?.playerId;
  if (winnerId && winnerId === channelStore.playerId) {
    winnerSoundPlayed.value = true;
    soundStore.playSound("winner");
  }
});

onUnmounted(() => {
  isMounted = false;
  if (jokeTimer) {
    clearTimeout(jokeTimer);
    jokeTimer = null;
  }
  if (partySoundTimer) {
    workerClearTimeout(partySoundTimer);
    partySoundTimer = null;
  }
  if (winnerSoundPlayed.value) {
    soundStore.stopSound("winner");
  }
  if (partySoundPlayed.value) {
    soundStore.stopSound("party");
  }
});
</script>

<style scoped>
main {
  width: 600px;
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

.random-joke-box {
  margin-top: 32px;
  background: #111;
  padding: 16px;
  border-radius: 8px;
  h2 {
    margin-top: 0;
    margin-bottom: 4px;
  }
  p {
    margin-bottom: 8px;
    opacity: 0.8;
  }
}
</style>