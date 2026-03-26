<template>
  <div>
    <div class="lobby-card">
      <h1>Lobby</h1>
      <div>ROUNDS TO PLAY: {{ useConfigStore().maxRounds }}</div>
      <div>ROUND DURATION: {{ useConfigStore().revealTime }}</div>
      <div class="room-id">
        ROOM ID:
        <span @click="copyToClipboard">
          {{ onlineStore.currentRoomId }}
          <Icon icon="pixel:copy" />
        </span>
      </div>
      <div class="share-room-buttons">
        <button @click="copyLinkToClipboard" class="btn-outline">
          <Icon icon="pixel:link-solid" />
          COPY INVITE LINK
        </button>
        <button
          v-if="canNativeShare"
          class="btn-outline"
          @click="shareNative"
          title="More sharing options"
        >
          <Icon icon="pixel:share" />
          SHARE
        </button>
      </div>
      <div v-if="showClipboardInfo" class="clipboard-info">
        COPIED TO CLIPBOARD <Icon icon="pixel:check-box-solid" />
      </div>
    </div>

    <div class="players-grid">
      <PlayerDisplay
        v-for="player in players"
        :key="player.playerId"
        :name="player.username"
        :avatar-index="player.avatarIndex"
        :is-host="player.isHost"
        :show-you-indicator="isMe(player.playerId)"
      />
    </div>
    <button
      v-if="players && players.length > 1 && onlineStore.isHost"
      class="btn-outline pulse-btn"
      @click="startGame"
    >
      START GAME
    </button>
    <LoadingAnimation
      v-if="(onlineStore.isHost && players.length === 1) || !onlineStore.isHost"
      :text="onlineStore.isHost ? 'WAITING FOR PLAYERS' : 'WAITING FOR HOST'"
    />
    <LobbyChat />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useOnlineStore } from "@/stores/online";
import { useRouter } from "vue-router";
import { useGameStore } from "@/stores/game";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import { useSoundStore } from "@/stores/sound";
import LobbyChat from "@/components/LobbyChat.vue";
import { Icon } from "@iconify/vue";
import { usePlayerStore } from "@/stores/player";

const { rounds } = useGameStore();

const soundStore = useSoundStore();
const onlineStore = useOnlineStore();
const playerStore = usePlayerStore();
const router = useRouter();
const showClipboardInfo = ref(false);
const canNativeShare = ref(false);

const inviteLink = `${window.location.host}?id=${onlineStore.currentRoomId}`;

const players = computed(() => onlineStore.playersOnline);

const isMe = (id) => id === onlineStore.playerId;

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(onlineStore.currentRoomId);
    showClipboardInfo.value = true;
    setTimeout(() => {
      showClipboardInfo.value = false;
    }, 2000);
  } catch (err) {}
};

const copyLinkToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink);
    showClipboardInfo.value = true;
    setTimeout(() => {
      showClipboardInfo.value = false;
    }, 2000);
  } catch (err) {}
};

const startGame = () => {
  soundStore.playSound("click");
  onlineStore.triggerGameStart(rounds);
};

const shareNative = async () => {
  try {
    await navigator.share({
      title: "PixReveal",
      text: `${playerStore.playerName} invites you to play!`,
      url: inviteLink,
    });
  } catch (err) {
    console.log("Native share failed", err);
  }
};

onMounted(() => {
  if (players.value.length <= 0) router.push("/");
  canNativeShare.value = !!navigator.share;
});
</script>

<style scoped>
.lobby-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--card-bg);
  border: 2px solid #334155;
  padding: 2rem;
  margin-bottom: 32px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.room-id {
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 2px;
    color: var(--primary);
    font-weight: 700;
  }
}

.clipboard-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  svg {
    color: var(--neon-success);
  }
}

.share-room-buttons {
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 16px;
  .btn-outline {
    width: auto;
    flex-grow: 1;
  }
}

.players-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 32px;
}
</style>
