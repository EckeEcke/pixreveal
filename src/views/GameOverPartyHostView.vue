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
    <div class="scale-wrapper" ref="wrapperRef" :style="{ transform: `scale(${scale})` }">
      <div class="party-wrapper" ref="contentRef">
        <div class="results-card party-results-card">
          <h1 class="logo">PARTY <span>OVER</span></h1>
          <PartyTitles :players="partyPlayersSorted" />
          <div class="final-rankings">
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
    </div>
    <WinnerAnimation
      v-if="winnerPlayer"
      :show="showWinnerAnimation"
      :winner-name="winnerPlayer.username"
      :avatar-index="winnerPlayer.avatarIndex"
      :is-winner="true"
      @done="showWinnerAnimation = false"
    />
    <EmojiOverlay :new-emoji="lastEmoji" />
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import PartyTitles from "@/components/game-ui/PartyTitles.vue";
import GameTransition from "@/components/game-ui/GameTransition.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import { workerSetTimeout, workerClearTimeout } from "@/services/workerTimers";
import { useChannelStore } from "@/stores/channel";
import { useGameStore } from "@/stores/game";
import { usePartyStore } from "@/stores/party";
import { useSoundStore } from "@/stores/sound";
import WinnerAnimation from "@/components/game-ui/WinnerAnimation.vue";
import EmojiOverlay from "@/components/game-ui/EmojiOverlay.vue";

const channelStore = useChannelStore();
const partyStore = usePartyStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const router = useRouter();

const showIntro = ref(true);
const partySoundPlayed = ref(false);
const showWinnerAnimation = ref(false);

const wrapperRef = ref(null);
const contentRef = ref(null);
const scale = ref(1);

const VIEWPORT_MARGIN = 24;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;
const SCALE_BREAKPOINT = 1000;

let resizeObserver = null;
let rafId = null;

const getViewportSize = () => {
  const vv = window.visualViewport;
  return {
    width: vv ? vv.width : window.innerWidth,
    height: vv ? vv.height : window.innerHeight,
  };
};

const recomputeScale = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    if (!contentRef.value) return;

    const { width: viewportWidth, height: viewportHeight } = getViewportSize();

    if (viewportWidth < SCALE_BREAKPOINT) {
      scale.value = 1;
      return;
    }

    const naturalWidth = contentRef.value.offsetWidth;
    const naturalHeight = contentRef.value.offsetHeight;
    if (!naturalWidth || !naturalHeight) return;

    const availableWidth = viewportWidth - VIEWPORT_MARGIN * 2;
    const availableHeight = viewportHeight - VIEWPORT_MARGIN * 2;

    const nextScale = Math.min(
      availableWidth / naturalWidth,
      availableHeight / naturalHeight,
    );

    scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
  });
};

onMounted(async () => {
  await nextTick();
  recomputeScale();
  resizeObserver = new ResizeObserver(recomputeScale);
  if (contentRef.value) resizeObserver.observe(contentRef.value);

  window.addEventListener("resize", recomputeScale);
  window.visualViewport?.addEventListener("resize", recomputeScale);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  window.removeEventListener("resize", recomputeScale);
  window.visualViewport?.removeEventListener("resize", recomputeScale);
});

let partySoundTimer = null;

const partyPlayersSorted = computed(() =>
  [...partyStore.players].sort((a, b) => b.points - a.points),
);

const winnerPlayer = computed(() => partyPlayersSorted.value[0] ?? null);

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
  if (channelStore.activeChannel && channelStore.playerId) {
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

watch(
  () => activeMembersCount.value,
  (count) => {
    if (!channelStore.activeChannel) return;
    if (count > 1) return;
    goBack();
  },
);

const lastEmoji = ref("");
const lastEmojiPlayerId = ref(null);

const handleIncomingEmoji = (emojiChar, playerId) => {
  lastEmoji.value = emojiChar;
  lastEmojiPlayerId.value = playerId ?? null;

  nextTick(() => {
    lastEmoji.value = "";
    lastEmojiPlayerId.value = null;
  });
};

const emojiListener = (event) => {
  handleIncomingEmoji(event.detail?.emoji, event.detail?.playerId);
};

onMounted(() => {
  window.addEventListener("emoji-received", emojiListener);
});

onUnmounted(() => {
  window.removeEventListener("emoji-received", emojiListener);
});
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  @media (min-width: 1000px) {
    width: calc(100dvw - 16px);
    height: calc(100dvh - 32px);
  }
  overflow: hidden;
  box-sizing: border-box;
}

.scale-wrapper {
  transform-origin: center center;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 100%;
}

.party-wrapper {
  @media (min-width: 800px) {
    width: 800px;
  }
  max-width: 100%;
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

.final-rankings {
  background: #22222244;
  padding: 0 16px 16px;
  border-radius: 8px;
  margin: 32px 0;
  /* Fällt nur noch als echtes Sicherheitsnetz für extrem viele Spieler an,
     nicht als Symptom eines falsch berechneten Scale-Faktors */
  max-height: 250px;
  overflow-y: auto;
}

.top-player {
  margin: 0px auto;
}
</style>