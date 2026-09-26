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

        <OnlineHighlights :players="playersOnline" />

        <TransitionGroup name="reveal-item" tag="div" class="players-list">
          <div
            v-for="{ player, index } in revealedPlayersDisplay"
            :key="player.playerId"
          >
            <PlayerDisplay
              size="small"
              :position="player.hasFinished ? index + 1 : undefined"
              :name="player.username"
              :avatar-index="player.avatarIndex"
              :points="animatedPoints[player.playerId] ?? player.points"
              static-points-display
              :points-trend="countingUpIds.has(player.playerId) ? 'up' : null"
              :is-pending="!player.hasFinished"
              :correct-answers="player.correctAnswers"
              :show-you-indicator="isMe(player.playerId)"
              :answer-history="player.answerHistory"
            />
          </div>
        </TransitionGroup>

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

    <LobbyChat v-if="false" />
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
import OnlineHighlights from "@/components/game-ui/OnlineHighlights.vue";
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

// --- Ranking reveal + points count-up ---
const revealedIds = ref<Set<string>>(new Set());
const animatedPoints = ref<Record<string, number>>({});
const countingUpIds = ref<Set<string>>(new Set());
let revealTimer: ReturnType<typeof setTimeout> | null = null;
let countUpFrames: Record<string, number> = {};

const REVEAL_DELAY_MS = 700;
const COUNT_UP_DURATION_MS = 1500;
const COUNT_UP_UPDATE_INTERVAL_MS = 60; // ~16 Updates/Sek. reicht für 0–100 völlig aus

const isMe = (id: string) => id === channelStore.playerId;

const playersOnline = computed(() => channelStore.playersOnline);
const playersSortedByPoints = computed(() => {
  return [...playersOnline.value].sort((a, b) => b.points - a.points);
});
const winnerPlayer = computed(() => playersSortedByPoints.value[0] ?? null);

const waitingForFinalResults = computed(() =>
  playersOnline.value.some((player) => player.isOnline && !player.hasFinished),
);

// Schlechtester Platz zuerst, Sieger zuletzt
const revealOrder = computed(() => [...playersSortedByPoints.value].reverse());

const isRevealed = (playerId: string) => revealedIds.value.has(playerId);

const revealedPlayersDisplay = computed(() =>
  playersSortedByPoints.value
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => isRevealed(player.playerId)),
);

const animatePointsFor = (player: { playerId: string; points: number }) => {
  const start = performance.now();
  const target = player.points;
  animatedPoints.value[player.playerId] = 0;
  countingUpIds.value = new Set(countingUpIds.value).add(player.playerId);

  let lastUpdate = start;
  let lastValue = 0;

  const step = (now: number) => {
    const progress = Math.min((now - start) / COUNT_UP_DURATION_MS, 1);
    const eased = 1 - Math.pow(1 - progress, 2); // ease-out quad
    const isDue = now - lastUpdate >= COUNT_UP_UPDATE_INTERVAL_MS || progress === 1;

    if (isDue) {
      const nextValue = Math.round(target * eased);
      if (nextValue !== lastValue) {
        animatedPoints.value[player.playerId] = nextValue;
        lastValue = nextValue;
      }
      lastUpdate = now;
    }

    if (progress < 1) {
      countUpFrames[player.playerId] = requestAnimationFrame(step);
    } else {
      delete countUpFrames[player.playerId];
      const next = new Set(countingUpIds.value);
      next.delete(player.playerId);
      countingUpIds.value = next;
    }
  };
  countUpFrames[player.playerId] = requestAnimationFrame(step);
};

const revealNext = () => {
  const order = revealOrder.value;
  const nextIndex = revealedIds.value.size;

  if (nextIndex >= order.length) {
    if (!winnerAnimationShown.value && winnerPlayer.value) {
      winnerAnimationShown.value = true;
      showWinnerAnimation.value = true;
    }
    return;
  }

  const player = order[nextIndex];
  if (player) {
    revealedIds.value = new Set(revealedIds.value).add(player.playerId);
    soundStore.playSound("click");
    animatePointsFor(player);
  }

  revealTimer = setTimeout(revealNext, REVEAL_DELAY_MS);
};

const startReveal = () => {
  revealedIds.value = new Set();
  animatedPoints.value = {};
  countingUpIds.value = new Set();
  if (revealTimer) clearTimeout(revealTimer);
  revealTimer = setTimeout(revealNext, REVEAL_DELAY_MS);
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
  partySoundTimer = workerSetTimeout(() => {
    partySoundTimer = null;
    playPartySoundOnce();
  }, 2000);
};

watch(
  [() => showIntro.value, () => waitingForFinalResults.value],
  ([intro, waiting]) => {
    if (intro || waiting) return;
    startReveal();
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
    router.replace("/gameover-party-player");
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
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  Object.values(countUpFrames).forEach((id) => cancelAnimationFrame(id));
  countUpFrames = {};
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
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), transparent 50%), linear-gradient(135deg, rgba(32, 16, 46, 0.95), rgba(18, 9, 28, 0.98));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 32px;
  text-align: center;
  margin-bottom: 32px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  @media (max-width: 400px) {
    padding: 32px 16px;
  }
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

.reveal-item-enter-active {
  transition: all 0.4s ease-out;
}
.reveal-item-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.reveal-item-move {
  transition: transform 0.4s ease-out;
}
</style>