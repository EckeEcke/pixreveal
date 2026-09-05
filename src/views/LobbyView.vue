<template>
<div>
  <div ref="lobbyWrapperRef" class="lobby-wrapper">
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>   
   <div class="lobby-card">
      <h1>{{ isParty ? "PARTY LOBBY" : "ONLINE LOBBY" }}</h1>
      <span class="pre-headline">{{ configStore.maxRounds }} Rounds · {{ configStore.revealTime }}s per round</span>
      <h1></h1>
      <div class="lobby-layout">
        <!-- Linke Spalte: Hosting & Beitritt -->
        <div class="lobby-left-column">
          <h2>INVITE PLAYERS</h2>
          <div class="qr-code">
            <qrcode-vue :value="inviteLink" :size="150" render-as="svg" />
          </div>
          <div class="share-room-buttons">
            <button
              @click="copyLinkToClipboard"
              class="btn-outline"
              data-sfx="click"
            >
              <Icon icon="pixel:link-solid" />
              COPY INVITE LINK
            </button>
            <button
              v-if="canNativeShare"
              class="btn-outline"
              @click="shareNative"
              data-sfx="click"
            >
              <Icon icon="pixel:share" />
              SHARE
            </button>
          </div>
          <div class="room-id">
            ROOM ID:
            <span @click="copyToClipboard" data-sfx="click">
              {{ channelStore.currentRoomId }}
              <Icon icon="pixel:copy" />
            </span>
          </div>
          <ButtonPrimary
            v-if="channelStore.isHost"
            data-sfx="click"
            class="start-btn"
            :class="players.length > (isParty ? 2 : 1) ? 'pulse-btn' : ''"
            @clicked="startGame"
            :disabled="channelStore.isHost && players.length < (isParty ? 3 : 2) && !isStarting"
          >
          {{ isParty ? "START PARTY" : "START GAME" }}
          </ButtonPrimary>
          <LoadingAnimation
            v-if="
              ((channelStore.isHost && players.length <= 2) || !channelStore.isHost) || isStarting
            "
            :text="isStarting ? 'STARTING GAME' : (channelStore.isHost ? 'WAITING FOR MORE PLAYERS' : 'WAITING FOR HOST')"
            class="loading-animation"
          />
        </div>

        <!-- Rechte Spalte: Spielerliste & Chat -->
        <div class="lobby-right-column">
          <h2 v-if="isParty">PLAYERS IN LOBBY ({{ players.length - 1 }})</h2>
          <h2 v-else>PLAYERS IN LOBBY ({{ players.length }})</h2>
          <div class="players-grid">
            <PlayerDisplay
              v-for="player in players"
              size="small"
              :key="player.playerId"
              :name="isParty && player.isHost ? 'HOST' : player.username"
              :avatar-index="
                isParty && player.isHost ? undefined : player.avatarIndex
              "
              :class="[
                isParty && player.isHost ? 'hidden' : '',
                { 'editable-player': isMe(player.playerId) },
              ]"
              :is-host="player.isHost"
              :show-you-indicator="isMe(player.playerId)"
              @click="isMe(player.playerId) && (showPlayerEditModal = true)"
            />
            <div v-if="(isParty && players.length < 3) || (!isParty && players.length < 2)" class="not-enough-players">Minimum of 2 players required. Invite more players to start</div>
          </div>
          <LobbyChat />
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
  channelStore.playersOnline.filter((p) => p.isOnline),
);
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

  const baseWidth = 750;
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
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeGame);
});

const startGame = () => {
  if (isStarting.value) return;
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
  background: rgba(15, 12, 29, 0.75);
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
</style>