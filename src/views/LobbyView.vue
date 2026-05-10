<template>
  <div>
    <div class="lobby-card">
      <h1>{{ isParty ? "Party Lobby" : "Lobby" }}</h1>
      <template v-if="!isParty">
        <div>ROUNDS TO PLAY: {{ configStore.maxRounds }}</div>
        <div>ROUND DURATION: {{ configStore.revealTime }}</div>
      </template>
      <div class="room-id">
        ROOM ID:
        <span @click="copyToClipboard" data-sfx="click">
          {{ channelStore.currentRoomId }}
          <Icon icon="pixel:copy" />
        </span>
      </div>
      <div class="share-room-buttons">
        <button @click="copyLinkToClipboard" class="btn-outline" data-sfx="click">
          <Icon icon="pixel:link-solid" />
          COPY INVITE LINK
        </button>
        <button v-if="canNativeShare" class="btn-outline" @click="shareNative" data-sfx="click">
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
        :name="isParty && player.isHost ? 'HOST' : player.username"
        :avatar-index="(isParty && player.isHost) ? undefined : player.avatarIndex"
        :is-host="player.isHost"
        :show-you-indicator="isMe(player.playerId)"
      />
      {{ mode}}
    </div>

    <template v-if="channelStore.isHost && players.length > 1">
      <button class="start-btn pulse-btn" @click="startGame" data-sfx="click">
        {{ isParty ? "START PARTY" : "START GAME" }}
      </button>
    </template>

    <LoadingAnimation
      v-if="
        (channelStore.isHost && players.length === 1) || !channelStore.isHost
      "
      :text="channelStore.isHost ? 'WAITING FOR PLAYERS' : 'WAITING FOR HOST'"
    />

    <LobbyChat />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import { useOnlineStore } from "@/stores/online";
import { useConfigStore } from "@/stores/config";
import { useChannelStore } from "@/stores/channel";
import { usePartyStore } from "@/stores/party";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";
import LobbyChat from "@/components/game-ui/LobbyChat.vue";
import { Icon } from "@iconify/vue";

const channelStore = useChannelStore();
const onlineStore = useOnlineStore();
const configStore = useConfigStore();
const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const partyStore = usePartyStore();

const isParty = computed(() => channelStore.mode === "party");
watch(
  () => channelStore.activeChannel,
  (channel) => {
    if (!channel || channelStore.mode !== "regular") return;
    onlineStore.setupEvents();
  },
  { immediate: true },
);

const showClipboardInfo = ref(false);
const canNativeShare = ref(false);
const shareModeParam = computed(() => (isParty.value ? "party" : "online"));
const inviteLink = computed(
  () =>
    `${window.location.origin}?id=${channelStore.currentRoomId}&mode=${shareModeParam.value}`,
);

const players = computed(() => channelStore.playersOnline.filter((p) => p.isOnline));
const isMe = (id) => id === channelStore.playerId;

const startGame = () => {
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
    showClipboardInfo.value = true;
    setTimeout(() => (showClipboardInfo.value = false), 2000);
  } catch {}
};

const copyLinkToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    showClipboardInfo.value = true;
    setTimeout(() => (showClipboardInfo.value = false), 2000);
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

onMounted(() => {
  canNativeShare.value = !!navigator.share;
});
</script>

<style scoped>
.lobby-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
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
  margin-bottom: 32px;
}
</style>
