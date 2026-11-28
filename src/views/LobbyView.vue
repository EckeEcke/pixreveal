<template>
<div class="lobby-page">
  <div ref="lobbyWrapperRef" class="lobby-wrapper">
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>   
   <div class="lobby-card" :class="{ 'party-lobby': isParty }">
      <h1>{{ isParty ? "PARTY LOBBY" : "ONLINE LOBBY" }}</h1>
      <span class="pre-headline">{{ configStore.maxRounds }} Rounds · {{ configStore.revealTime }}s per round</span>
      <div class="lobby-layout">
        <section class="lobby-left-column lobby-invite" aria-labelledby="lobby-invite-heading">
          <h2 id="lobby-invite-heading">INVITE PLAYERS</h2>
          <div class="lobby-room-id">
            <span>ROOM ID</span>
            <button
              type="button"
              class="lobby-room-code"
              :aria-label="`Copy room ID ${channelStore.currentRoomId}`"
              data-sfx="click"
              @click="copyToClipboard"
            >
              {{ channelStore.currentRoomId }}
              <Icon icon="pixel:copy" />
            </button>
          </div>
          <div class="share-room-buttons">
            <button class="btn-outline" data-sfx="click" @click="copyLinkToClipboard">
              <Icon icon="pixel:link-solid" />
              COPY INVITE LINK
            </button>
            <button v-if="canNativeShare" class="btn-outline" data-sfx="click" @click="shareNative">
              <Icon icon="pixel:share" />
              SHARE
            </button>
          </div>
          <details class="lobby-qr" :class="{ 'party-qr': isParty }" :open="isParty || isDesktopLobby">
            <summary>
              QR CODE
              <Icon icon="pixel:angle-down-solid" />
            </summary>
            <div class="qr-code">
              <qrcode-vue :value="inviteLink" :size="150" render-as="svg" />
            </div>
          </details>
        </section>

        <!-- Players and start action -->
        <div class="lobby-right-column">
          <h2>PLAYERS IN LOBBY ({{ players.length }})</h2>
          <div class="players-grid">
            <PlayerDisplay
              v-for="player in players"
              size="small"
              :key="player.playerId"
              :name="player.username"
              :avatar-index="player.avatarIndex"
              :avatar-sprite-sheet="player.avatarSpriteSheet"
              :name-effect="player.nameEffect"
              :avatar-effect="player.avatarEffect"
              :class="{ 'editable-player': isMe(player.playerId) }"
              :is-host="player.isHost"
              :show-you-indicator="isMe(player.playerId)"
              :is-own-player="isMe(player.playerId)"
              @click="isMe(player.playerId) && (showPlayerEditModal = true)"
            />
          </div>
          <div class="lobby-start-area" :aria-busy="isStarting">
            <p v-if="!isStarting" class="lobby-status" :class="{ ready: channelStore.isHost && canStart }" role="status">
              {{ lobbyStatus }}
            </p>
            <p v-if="channelStore.isHost && !canStart && !isStarting" class="invite-hint">
              Share the invite link or let players scan the QR code.
            </p>
            <ButtonPrimary
              v-if="channelStore.isHost"
              class="start-btn"
              :class="{ 'pulse-btn': canStart && !isStarting }"
              :disabled="!canStart || isStarting"
              data-sfx="click"
              @clicked="startGame"
            >
              {{ isParty ? "START PARTY" : "START GAME" }}
            </ButtonPrimary>
            <LoadingAnimation v-if="isStarting" text="STARTING GAME" class="loading-animation" />
          </div>
          <LobbyChat v-if="false" />
        </div>
      </div>
    </div>
    <PlayerEditModal
      v-if="showPlayerEditModal"
      @btn-click="confirmPlayerEdit"
      @close="showPlayerEditModal = false"
    />
  </div>
</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import { useOnlineStore } from "@/stores/online";
import { useConfigStore } from "@/stores/config";
import { useChannelStore } from "@/stores/channel";
import { usePartyStore } from "@/stores/party";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import LobbyChat from "@/components/game-ui/LobbyChat.vue";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import { Icon } from "@iconify/vue";
import { toast } from "vue3-toastify";
import QrcodeVue from "qrcode.vue";

const channelStore = useChannelStore();
const onlineStore = useOnlineStore();
const configStore = useConfigStore();
const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const partyStore = usePartyStore();

const isParty = computed(() => channelStore.mode === "party");

const canNativeShare = ref(false);
const shareModeParam = computed(() => (isParty.value ? "party" : "online"));
const inviteLink = computed(
  () =>
    `${window.location.origin}?id=${channelStore.currentRoomId}&mode=${shareModeParam.value}`,
);

const players = computed(() =>
  channelStore.playersOnline.filter((p) => p.isOnline && (!isParty.value || !p.isHost)),
);
const canStart = computed(() => players.value.length >= 2);
const lobbyStatus = computed(() => {
  if (!channelStore.isHost) return "WAITING FOR HOST";
  if (canStart.value) return "READY TO START";
  return players.value.length === 1
    ? "INVITE ONE MORE PLAYER TO START"
    : "INVITE AT LEAST 2 PLAYERS TO START";
});
const lobbyBreakpoint = window.matchMedia("(min-width: 769px)");
const isDesktopLobby = ref(lobbyBreakpoint.matches);
const updateLobbyBreakpoint = () => { isDesktopLobby.value = lobbyBreakpoint.matches; };
const isMe = (id) => id === channelStore.playerId;
const showPlayerEditModal = ref(false);

const confirmPlayerEdit = () => {
  channelStore.updatePlayerProfile();
  showPlayerEditModal.value = false;
};

const isStarting = ref(false);
const lobbyWrapperRef = ref(null);

const resizeGame = () => {
  if (!lobbyWrapperRef.value) return;

  // Nur im Party-Modus skalieren
  if (!isParty.value) {
    lobbyWrapperRef.value.style.transform = 'none';
    return;
  }

  const baseWidth = 900;
  const baseHeight = 900;

  // Nicht skalieren, wenn der Screen kleiner ist als die Basis
  if (window.innerWidth < baseWidth || window.innerHeight < baseHeight) {
    lobbyWrapperRef.value.style.transform = 'none';
    return;
  }

  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);

  lobbyWrapperRef.value.style.transform = `scale(${scale})`;
};

// Bei Modus-Wechsel oder Resize neu berechnen
watch(isParty, () => {
  resizeGame();
});

onMounted(() => {
  canNativeShare.value = !!navigator.share;
  resizeGame();
  window.addEventListener('resize', resizeGame);
  lobbyBreakpoint.addEventListener('change', updateLobbyBreakpoint);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeGame);
  lobbyBreakpoint.removeEventListener('change', updateLobbyBreakpoint);
});

const startGame = () => {
  if (isStarting.value || !channelStore.isHost || !canStart.value) return;
  isStarting.value = true;
  soundStore.playSound("click");
  if (isParty.value) {
    partyStore.startGame();
  } else {
    onlineStore.triggerGameStart();
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(channelStore.currentRoomId);
    toast.success("Room ID copied to clipboard");
  } catch {}
};

const copyLinkToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    toast.success("Invite link copied to clipboard");
  } catch {}
};

const shareNative = async () => {
  try {
    await navigator.share({
      title: "PixReveal",
      text: `${playerStore.playerName} invites you to play!`,
      url: inviteLink.value,
    });
  } catch {}
};
</script>

<style scoped>
.lobby-wrapper {
  transform-origin: center center;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.editable-player {
  cursor: pointer;
}

.editable-player:hover {
  filter: brightness(1.15);
}

.lobby-card {
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), transparent 50%), linear-gradient(135deg, rgba(32, 16, 46, 0.95), rgba(18, 9, 28, 0.98));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 850px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  margin: 0 auto;
}

.lobby-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  width: 100%;
}

.lobby-left-column {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  flex-shrink: 0;
}

.lobby-right-column {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
  width: 100%;
}

.room-id {
  font-size: 20px;
  text-align: center;
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 2px;
    color: var(--primary);
    font-weight: 700;
    cursor: pointer;
  }
}

.share-room-buttons {
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 16px;
  width: 100%;
  .btn-outline {
    width: auto;
    flex-grow: 1;
  }
}

.players-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
  margin-top: 16px;
}

.qr-code {
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  margin: 16px 0;
  padding: 16px;
  border-radius: 8px;
  background: rgba(15, 12, 29, 0.75);  
  backdrop-filter: blur(12px);
}

.loading-animation {
  margin-top: 16px;
  width: 100%;
}

.start-btn {
  margin-top: 16px;
  height: 64px;
  font-size: 20px;
}

h1 {
  margin-bottom: 32px;
}

h2 {
  margin: 0 0 4px;
  text-align: left;
}

.not-enough-players {
  margin-top: 8px;
  text-align: left;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .lobby-layout {
    grid-template-columns: 1fr;
  }
  
  .lobby-left-column {
    max-width: 100%;
  }
}

.back-btn-wrapper {
  width: 100%;
  max-width: 850px;
  margin: 0 auto 16px;
}

.pre-headline {
  display: block;
  color: var(--primary);
  margin-bottom: 64px;
  text-align: left;
  @media (min-width: 768px) {
    text-align: center;
  }
}

.lobby-card h1 {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 32px;
  margin-bottom: 4px;
  text-align: left;
  @media (min-width: 768px) {
    text-align: center;
  }
}

.hidden {
  display: none;
}

.lobby-page {
  width: 850px;
  max-width: 100%;
}

.lobby-card .pre-headline {
  margin-bottom: 32px;
}

.lobby-card .lobby-layout {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  align-items: start;
}

.lobby-card :is(.lobby-left-column, .lobby-right-column) {
  min-width: 0;
}

.lobby-card h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
}

.lobby-card .players-grid {
  margin-top: 0;
}

.lobby-card :deep(.player-hud.is-you) {
  background: rgba(10, 4, 20, 0.92);
  box-shadow: inset 0 0 0 1px var(--primary);
}

.lobby-room-id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 12px;
  width: 100%;
}

.lobby-room-id > span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  letter-spacing: 1px;
}

.lobby-room-code {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0;
  color: var(--primary);
  font: inherit;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
}

.lobby-room-code svg {
  font-size: 18px;
}

.lobby-invite .share-room-buttons {
  order: 3;
}

.lobby-card .share-room-buttons .btn-outline {
  min-height: 44px;
  font-size: 12px;
  letter-spacing: 1px;
}

.lobby-qr {
  width: 100%;
}

.lobby-qr summary {
  display: none;
}

.lobby-qr .qr-code {
  margin: 0;
}

.lobby-start-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
}

.lobby-status {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 1px;
  text-align: center;
}

.lobby-status.ready {
  color: var(--neon-success);
}

.invite-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.lobby-card .start-btn {
  margin-top: 0;
  height: 56px;
  font-size: 18px;
}

.lobby-card .loading-animation {
  margin-top: 0;
}

.lobby-card :is(button, summary):focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

@media (max-width: 768px) {
  .lobby-card {
    padding: 24px;
  }

  .lobby-card h1 {
    font-size: 26px;
  }

  .lobby-card .lobby-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  .lobby-card .lobby-right-column {
    grid-row: 1;
  }

  .lobby-invite {
    grid-row: 2;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 24px;
  }

  .lobby-card:not(.party-lobby) .lobby-invite .share-room-buttons {
    order: 0;
  }

  .lobby-qr:not(.party-qr) summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    letter-spacing: 1px;
    list-style: none;
    cursor: pointer;
  }

  .lobby-qr summary::-webkit-details-marker {
    display: none;
  }

  .lobby-qr[open] summary svg {
    transform: rotate(180deg);
  }

  .lobby-qr:not(.party-qr) .qr-code {
    margin-top: 8px;
  }
}
</style>
