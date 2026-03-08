<template>
  <div>
    <h1>Lobby</h1>
    <div class="room-id">
      ROOM ID:
      <span @click="copyToClipboard">{{ onlineStore.currentRoomId }}</span>
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
    </div>
    <div v-if="showClipboardInfo" class="clipboard-info">
      COPIED TO CLIPBOARD <Icon icon="pixel:check-box-solid" />
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
      class="btn-outline"
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
      url: window.location.href,
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
.room-id {
  margin: 32px 0;
  text-align: center;
  span {
    border: 1px solid var(--neon-orange);
    padding: 8px;
    border-radius: 8px;
    margin-left: 8px;
    color: var(--neon-orange);
    font-weight: 700;
  }
}

.clipboard-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
  svg {
    color: var(--neon-success);
  }
}

.btn-outline {
  margin-top: 32px;
}

.share-room-buttons {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.players-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
</style>
