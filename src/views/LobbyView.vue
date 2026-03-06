<template>
  <div>
    <h1>Lobby</h1>
    <div class="room-id">
      ROOM ID:
      <span @click="copyToClipboard">{{ onlineStore.currentRoomId }}</span>
    </div>
    <div v-if="showClipboardInfo" class="clipboard-info">
      COPIED ID TO CLIPBOARD ✅
    </div>
    <div class="players-grid">
      <PlayerDisplay
        v-for="player in players"
        :key="player.playerId"
        :name="player.username"
        :avatar-index="player.avatarIndex"
        :is-host="player.isHost"
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

const { rounds } = useGameStore();

const soundStore = useSoundStore();
const onlineStore = useOnlineStore();
const router = useRouter();
const showClipboardInfo = ref(false);

const players = computed(() => onlineStore.playersOnline);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(onlineStore.currentRoomId);
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

onMounted(() => {
  if (players.value.length <= 0) router.push("/");
});
</script>

<style scoped>
.room-id {
  margin: 32px 0;
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
  margin-bottom: 16px;
}

.btn-outline {
  margin-top: 32px;
}

.players-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
</style>
