<template>
  <ModalWrapper>
    <button @click="$emit('close')" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <h2>JOIN GAME</h2>
    <div class="join-container">
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
  </ModalWrapper>
</template>

<script setup>
import { ref } from "vue";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";
import ModalWrapper from "./ModalWrapper.vue";
import { useRoute } from "vue-router";
import { useOnlineStore } from "@/stores/online";

const route = useRoute();
const joinRoomId = ref(route.query.id ?? "");
const loadingText = ref("LOADING...");
const playerId = Math.random().toString(36).substring(2, 9);

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const onlineStore = useOnlineStore();

const joinGame = () => {
  if (!joinRoomId.value) return;
  soundStore.playSound("click");
  playerStore.setUser();
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
</style>
