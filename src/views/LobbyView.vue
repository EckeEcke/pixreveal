<template>
  <div>
    <div class="lobby-card">
      <h1>{{ mode === "party" ? "Party Lobby" : "Lobby" }}</h1>
      <template v-if="mode === 'regular'">
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
        :name="player.username"
        :avatar-index="player.avatarIndex"
        :is-host="player.isHost"
        :show-you-indicator="isMe(player.playerId)"
      />
    </div>

    <template v-if="channelStore.isHost && players.length > 1">
      <button class="btn-outline pulse-btn" @click="startGame" data-sfx="click">
        {{ mode === "party" ? "START PARTY" : "START GAME" }}
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
import { computed, onMounted, ref } from "vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useOnlineStore } from "@/stores/online";
import { useConfigStore } from "@/stores/config";
import { useChannelStore } from "@/stores/channel";
import { usePartyStore } from "@/stores/party";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useRouter, useRoute } from "vue-router";
import LoadingAnimation from "@/components/LoadingAnimation.vue";
import LobbyChat from "@/components/LobbyChat.vue";
import { Icon } from "@iconify/vue";

const route = useRoute();
const router = useRouter();
const isParty = route.meta.mode === "party";

const channelStore = useChannelStore();
const onlineStore = useOnlineStore();
const configStore = useConfigStore();
const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const partyStore = usePartyStore();

const showClipboardInfo = ref(false);
const canNativeShare = ref(false);
const shareModeParam = computed(() => (isParty ? "party" : "online"));
const inviteLink = computed(
  () =>
    `${window.location.origin}?id=${channelStore.currentRoomId}&mode=${shareModeParam.value}`,
);

const players = computed(() => channelStore.playersOnline);
const isMe = (id) => id === channelStore.playerId;

const startGame = () => {
  soundStore.playSound("click");
  if (isParty) {
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
  if (players.value.length <= 0) router.push("/");
  canNativeShare.value = !!navigator.share;
  if (isParty) partyStore.setupEvents();
  else onlineStore.setupEvents();
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
