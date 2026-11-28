<template>
  <main :class="{ 'results-ready': resultsReady, 'has-highlight-data': highlights.length > 0, 'has-highlights': resultsReady && highlights.length > 0 }">
    <Transition name="fade" mode="out-in">
      <GameTransition v-if="showIntro" first="GAME" second="OVER" @done="handleIntroDone" />
    </Transition>

    <div class="results-card">
      <h1 class="logo">GAME <span>OVER</span></h1>
      <div v-if="waitingForFinalResults" class="waiting-results">
        <div class="waiting-summary" role="status">
          <h2><span>{{ finishedPlayersCount }}</span> of {{ activePlayers.length }} players finished</h2>
          <p>Results will appear when everyone has finished. Keep this window open.</p>
        </div>
        <LoadingAnimation />
        <section class="waiting-players" aria-labelledby="waiting-heading">
          <h2 id="waiting-heading" class="section-title">STILL PLAYING</h2>
          <PlayerDisplay
            v-for="player in pendingPlayers"
            :key="player.playerId"
            size="small"
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :avatar-sprite-sheet="player.avatarSpriteSheet"
            :name-effect="player.nameEffect"
            :avatar-effect="player.avatarEffect"
          />
        </section>
      </div>

      <div v-else class="results-layout">
        <section class="ranking-section" aria-labelledby="ranking-heading">
          <h2 id="ranking-heading" class="section-title">FINAL RANKING</h2>
          <TransitionGroup name="reveal-item" tag="div" class="players-list">
            <div v-for="{ player, index } in revealedPlayersDisplay" :key="player.playerId">
              <PlayerDisplay
                size="small"
                :position="player.hasFinished ? index + 1 : undefined"
                :name="player.username"
                :avatar-index="player.avatarIndex"
                :avatar-sprite-sheet="player.avatarSpriteSheet"
                :name-effect="player.nameEffect"
                :avatar-effect="player.avatarEffect"
                :points="animatedPoints[player.playerId] ?? 0"
                static-points-display
                :points-trend="countingUpIds.has(player.playerId) ? 'up' : null"
                :is-pending="!player.hasFinished"
                :correct-answers="player.correctAnswers"
                :show-you-indicator="isMe(player.playerId)"
                :is-own-player="isMe(player.playerId)"
                :answer-history="player.answerHistory"
              />
            </div>
          </TransitionGroup>
          <div class="details-reveal">
            <div class="details-content">
              <div v-if="resultsReady" class="gameover-actions">
                <ButtonPrimary class="pulse-btn" data-sfx="click" @mouseenter="soundStore.handleHoverSound" @clicked="playAgainOnline">
                  <Icon icon="pixel:refresh-solid" /> Play Again
                </ButtonPrimary>
                <ButtonSecondary data-sfx="back" @mouseenter="soundStore.handleHoverSound" @clicked="goBackOnline">
                  <Icon icon="pixel:arrow-left" /> Leave room
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </section>
        <section v-if="highlights.length > 0" class="highlights-section details-reveal" aria-labelledby="highlights-heading" :aria-hidden="!resultsReady">
          <div class="details-content">
            <template v-if="resultsReady">
              <h2 id="highlights-heading" class="section-title">HIGHLIGHTS</h2>
              <OnlineHighlights :highlights="highlights" />
            </template>
          </div>
        </section>
      </div>
      <details v-if="resultsReady && guessCount > 0" class="all-guesses" @toggle="galleryOpen = ($event.target as HTMLDetailsElement).open">
        <summary>All guesses <span>{{ guessCount }}</span></summary>
        <OnlineGuessesGallery v-if="galleryOpen" :players="playersOnline" :rounds="onlineStore.replayRounds" />
      </details>
    </div>

    <WinnerAnimation
      v-if="!waitingForFinalResults && winnerPlayer"
      :show="showWinnerAnimation"
      :winner-name="winnerPlayer.username"
      :avatar-index="winnerPlayer.avatarIndex"
      :avatar-sprite-sheet="winnerPlayer.avatarSpriteSheet"
      :name-effect="winnerPlayer.nameEffect"
      :avatar-effect="winnerPlayer.avatarEffect"
      :is-winner="isMe(winnerPlayer.playerId)"
      @done="handleWinnerDone"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import OnlineHighlights from "@/components/game-ui/OnlineHighlights.vue";
import OnlineGuessesGallery from "@/components/game-ui/OnlineGuessesGallery.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { workerSetTimeout, workerClearTimeout, workerSetInterval, workerClearInterval } from "@/services/workerTimers";
import { buildOnlineHighlights, getOnlineGuessSummaries } from "@/utils/onlineHighlights";
import { useChannelStore } from "@/stores/channel";
import { useOnlineStore } from "@/stores/online";
import { useGameStore } from "@/stores/game";
import { useSoundStore } from "@/stores/sound";
import { useAchievementsStore } from "@/stores/achievements";

const channelStore = useChannelStore();
const onlineStore = useOnlineStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const achievementsStore = useAchievementsStore();
const router = useRouter();

const showIntro = ref(true);
const showWinnerAnimation = ref(false);
const winnerAnimationShown = ref(false);
const resultsReady = ref(false);
const galleryOpen = ref(false);
const winnerSoundPlayed = ref(false);
const partySoundPlayed = ref(false);
let partySoundTimer: number | null = null;
const revealedIds = ref<Set<string>>(new Set());
const animatedPoints = ref<Record<string, number>>({});
const countingUpIds = ref<Set<string>>(new Set());
let revealTimer: number | null = null;
let countUpTimer: number | null = null;

const SCORE_STEP_MS = 50;
const getRevealDelay = (playerCount: number) => {
  if (playerCount <= 4) return 900;
  if (playerCount >= 12) return 400;
  return Math.round(900 - ((playerCount - 4) / 8) * 500);
};
const isMe = (id: string) => id === channelStore.playerId;
const playersOnline = computed(() => channelStore.playersOnline);
const activePlayers = computed(() => playersOnline.value.filter(player => player.isOnline));
const pendingPlayers = computed(() => activePlayers.value.filter(player => !player.hasFinished));
const finishedPlayersCount = computed(() => activePlayers.value.filter(player => player.hasFinished).length);
const waitingForFinalResults = computed(() => pendingPlayers.value.length > 0);
const highlights = computed(() => buildOnlineHighlights(playersOnline.value, onlineStore.replayRounds));
const guessCount = computed(() => getOnlineGuessSummaries(playersOnline.value).length);
const playersSortedByPoints = computed(() => [...playersOnline.value].sort((a, b) => b.points - a.points));
const winnerPlayer = computed(() => playersSortedByPoints.value[0] ?? null);
const revealOrder = computed(() => [...playersSortedByPoints.value].reverse());
const revealedPlayersDisplay = computed(() => playersSortedByPoints.value
  .map((player, index) => ({ player, index }))
  .filter(({ player }) => revealedIds.value.has(player.playerId)),
);

const stopCounting = () => {
  workerClearInterval(countUpTimer);
  countUpTimer = null;
  soundStore.stopSound("counting");
};
const checkAndTriggerWinnerAnimation = () => {
  const allRevealed = revealOrder.value.every(player => revealedIds.value.has(player.playerId));
  if (!allRevealed || countingUpIds.value.size > 0 || winnerAnimationShown.value || !winnerPlayer.value || waitingForFinalResults.value) return;
  winnerAnimationShown.value = true;
  stopCounting();
  if (isMe(winnerPlayer.value.playerId)) void achievementsStore.unlock("win-online");
  showWinnerAnimation.value = true;
  winnerSoundPlayed.value = true;
  soundStore.playSound("winner");
};
const handleWinnerDone = () => {
  if (!showWinnerAnimation.value) return;
  showWinnerAnimation.value = false;
  resultsReady.value = !waitingForFinalResults.value;
};

const tickPoints = () => {
  const stillCounting = new Set<string>();
  for (const player of revealedPlayersDisplay.value.map(entry => entry.player)) {
    const current = animatedPoints.value[player.playerId] ?? 0;
    const next = Math.min(player.points, current + 1);
    animatedPoints.value[player.playerId] = next;
    if (next < player.points) stillCounting.add(player.playerId);
  }
  countingUpIds.value = stillCounting;
  if (stillCounting.size === 0) {
    stopCounting();
    checkAndTriggerWinnerAnimation();
  }
};
const animatePointsFor = (player: { playerId: string; points: number }) => {
  animatedPoints.value[player.playerId] = 0;
  if (player.points <= 0) return;
  countingUpIds.value = new Set(countingUpIds.value).add(player.playerId);
  if (countUpTimer === null) {
    soundStore.playSound("counting");
    countUpTimer = workerSetInterval(tickPoints, SCORE_STEP_MS);
  }
};
const revealNext = () => {
  revealTimer = null;
  const player = revealOrder.value.find(candidate => !revealedIds.value.has(candidate.playerId));
  if (!player) {
    checkAndTriggerWinnerAnimation();
    return;
  }
  revealedIds.value = new Set(revealedIds.value).add(player.playerId);
  soundStore.playSound("pop");
  animatePointsFor(player);
  if (revealedIds.value.size < revealOrder.value.length) {
    revealTimer = workerSetTimeout(revealNext, getRevealDelay(revealOrder.value.length));
  }
  checkAndTriggerWinnerAnimation();
};
const startReveal = () => {
  resultsReady.value = false;
  workerClearTimeout(revealTimer);
  stopCounting();
  revealedIds.value = new Set();
  animatedPoints.value = {};
  countingUpIds.value = new Set();
  revealTimer = workerSetTimeout(revealNext, getRevealDelay(revealOrder.value.length));
};
const handleIntroDone = () => {
  showIntro.value = false;
  soundStore.playSound("complete");
  partySoundTimer = workerSetTimeout(() => {
    partySoundTimer = null;
    if (partySoundPlayed.value || !channelStore.isHost) return;
    partySoundPlayed.value = true;
    soundStore.playSound("party");
  }, 2000);
};
watch([() => showIntro.value, () => waitingForFinalResults.value], ([intro, waiting]) => {
  if (intro) return;
  if (waiting) {
    resultsReady.value = false;
    workerClearTimeout(revealTimer);
    revealTimer = null;
    stopCounting();
    return;
  }
  startReveal();
}, { immediate: true });

const playAgainOnline = () => {
  onlineStore.stopGame?.();
  gameStore.reset?.();
  router.push("/lobby");
};
const goBackOnline = () => {
  if (channelStore.isHost && channelStore.activeChannel && channelStore.playerId) {
    channelStore.activeChannel.trigger("client-host-inactive", { playerId: channelStore.playerId });
  }
  onlineStore.stopGame?.();
  channelStore.reset?.();
  router.push("/");
};
watch(() => activePlayers.value.length, (count) => {
  if (channelStore.isHost && channelStore.activeChannel && count <= 1) goBackOnline();
});

if (!onlineStore.replayRounds.length) onlineStore.replayRounds = [...gameStore.rounds];
gameStore.reset();
onMounted(() => {
  if (channelStore.mode === "party" && channelStore.onlineGameRunning) {
    router.replace("/gameover-party-player");
    return;
  }
  void achievementsStore.unlock("play-online");
});
onUnmounted(() => {
  workerClearTimeout(partySoundTimer);
  workerClearTimeout(revealTimer);
  stopCounting();
  if (winnerSoundPlayed.value) soundStore.stopSound("winner");
  if (partySoundPlayed.value) soundStore.stopSound("party");
});
</script>

<style scoped>
main { width: 600px; max-width: 100%; transition: width 400ms ease; }
.results-card {
  border-radius: 8px;
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), transparent 50%), linear-gradient(135deg, rgba(32, 16, 46, 0.95), rgba(18, 9, 28, 0.98));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  padding: 32px;
  box-sizing: border-box;
  text-align: center;
  margin-bottom: 32px;
}
.results-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; transition: grid-template-columns 400ms ease, gap 400ms ease; }
.has-highlights .results-layout { gap: 32px; }
.ranking-section, .highlights-section { min-width: 0; }
.details-reveal { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 400ms ease, opacity 250ms ease; }
.details-content { min-width: 0; min-height: 0; overflow: hidden; }
.results-ready .details-reveal { grid-template-rows: 1fr; opacity: 1; }
.section-title { margin: 0 0 16px; font-size: 14px; line-height: 1.5; text-align: left; }
.players-list { display: grid; }
.all-guesses { margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; text-align: left; }
.all-guesses summary { cursor: pointer; color: var(--primary); font-size: 14px; padding: 8px 0; }
.all-guesses summary span { color: rgba(255, 255, 255, 0.6); margin-left: 8px; font-size: 12px; }
.all-guesses summary:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
.results-card :deep(.player-hud) { min-width: 0; }
.results-card :deep(.player-hud.is-you) { background: rgba(10, 4, 20, 0.92); box-shadow: inset 0 0 0 1px var(--primary); }
.gameover-actions { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-top: 32px; }
.gameover-actions :is(.btn-primary, .btn-secondary) { width: 100%; min-width: 0; min-height: 56px; padding: 14px 12px; box-sizing: border-box; font-size: 16px; }
.waiting-results { display: flex; flex-direction: column; gap: 24px; }
.waiting-summary h2 { margin: 0 0 12px; font-size: 20px; line-height: 1.4; }
.waiting-summary h2 span { color: var(--primary); }
.waiting-summary p { margin: 0; line-height: 1.5; color: rgba(255, 255, 255, 0.7); font-size: 14px; }
.waiting-players { display: grid; gap: 12px; text-align: left; }
.waiting-players h2 { margin-bottom: 4px; }
.reveal-item-enter-active { transition: opacity 0.4s ease-out, transform 0.4s ease-out; }
.reveal-item-enter-from { opacity: 0; transform: translateY(12px); }
.reveal-item-move { transition: transform 0.4s ease-out; }
@media (min-width: 500px) { .gameover-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) {
  .has-highlight-data .results-layout { grid-template-columns: minmax(0, 1fr) minmax(0, 0fr); }
  main.has-highlights { width: 1100px; }
  .has-highlights .results-layout { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .highlights-section { overflow: hidden; }
  .results-ready .highlights-section { transition-delay: 0ms, 150ms; }
}
@media (max-width: 400px) { .results-card { padding: 24px 16px; } }
@media (prefers-reduced-motion: reduce) {
  main, .results-layout, .details-reveal, .reveal-item-enter-active, .reveal-item-move { transition: none; }
}
</style>
