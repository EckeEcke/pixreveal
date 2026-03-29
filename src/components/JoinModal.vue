<template>
  <ModalWrapper>
    <button @click="$emit('close')" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <h2>{{ isHost ? "HOST GAME" : "JOIN GAME" }}</h2>
    <div class="setup-section">
      <div class="player-info-wrapper" @click="showAvatarModal = true">
        <div class="player-avatar" :style="avatarStyle">
          <Icon icon="pixel:pencil" class="edit-badge" />
        </div>
        <div class="player-name">
          {{ playerStore.playerName || "SET PLAYER NAME" }}
        </div>
      </div>
    </div>
    <button v-if="isHost" class="start-btn" @click="hostGame">HOST GAME</button>
    <div v-else class="join-container">
      <div class="join-terminal">
        <input
          v-model="joinRoomId"
          placeholder="ENTER ROOM ID"
          class="terminal-input"
        />
        <button class="terminal-btn" :disabled="!joinRoomId" @click="joinGame">
          JOIN
          <Icon icon="pixel:login" class="btn-icon" />
        </button>
      </div>
    </div>
    <PlayerEditModal v-if="showAvatarModal" @close="showAvatarModal = false" />
  </ModalWrapper>
</template>

<script setup>
import { computed, ref } from "vue";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useGameStore } from "@/stores/game";
import { Icon } from "@iconify/vue";
import ModalWrapper from "./ModalWrapper.vue";
import { useRoute } from "vue-router";
import { useOnlineStore } from "@/stores/online";
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import PlayerEditModal from "@/components/PlayerEditModal.vue";
import { useConfigStore } from "@/stores/config";

const route = useRoute();
const joinRoomId = ref(route.query.id ?? "");
const loadingText = ref("LOADING...");
const playerId = Math.random().toString(36).substring(2, 9);
const showAvatarModal = ref(false);

const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const onlineStore = useOnlineStore();
const { prepareGame } = useGameStore();

const isHost = onlineStore.isHost;

const avatarStyle = computed(() => {
  const index = playerStore.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});

const hostGame = () => {
  soundStore.playSound("click");
  prepareGame(configStore.revealTime);
  onlineStore.isLoading = true;
  onlineStore.loadingText = "CREATING ONLINE GAME...";
  onlineStore.hostSession({
    playerId,
    username: playerStore.playerName,
    avatarIndex: playerStore.avatarIndex,
    isHost: true,
    rounds: configStore.maxRounds,
    revealTime: configStore.revealTime,
  });
};

const joinGame = () => {
  if (!joinRoomId) return;
  soundStore.playSound("click");
  onlineStore.isLoading = true;
  loadingText.value = "JOINING GAME...";
  onlineStore.joinSession(
    {
      playerId,
      username: playerStore.playerName,
      avatarIndex: playerStore.avatarIndex,
      isHost: false,
    },
    joinRoomId.value.toUpperCase().trim(),
  );
};
</script>

<style scoped>
h2 {
  font-family: "8bit";
  margin-bottom: 32px;
}

.close-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  padding: 0;
  background: none;
  border: none;
  color: var(--primary);
  font-size: 36px;
}

.join-terminal {
  display: flex;
  border: 2px solid var(--primary);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(255, 77, 0, 0.1);
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  padding: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
}

.terminal-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: #000;
  border: none;
  padding: 0 20px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 900;
}

.terminal-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.terminal-btn:not(:disabled):hover {
  background: #fff;
  box-shadow: -5px 0 15px var(--primary);
}

.setup-section {
  margin: 48px 0;
}

.section-label {
  font-size: 14px;
  margin-bottom: 16px;
}

.player-info-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.player-avatar {
  position: relative;
  width: 72px;
  height: 72px;
  background-color: #2d3748;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.player-info-wrapper:hover .player-avatar {
  transform: scale(1.05);
  border-color: var(--primary);
}

.edit-badge {
  position: absolute;
  right: -8px;
  bottom: -8px;
  background: var(--primary);
  border-radius: 50%;
  padding: 4px;
  font-size: 16px;
  color: white;
}

.player-name {
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.start-btn {
  width: 100%;
  background: var(--primary);
  color: #000;
  border: none;
  padding: 16px;
  border-radius: 4px;
  font-family: "8bit", sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  animation: arcadeBlink 1.4s infinite;
  transition: all 0.3s;
}

.start-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.start-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #b45309;
}
</style>
