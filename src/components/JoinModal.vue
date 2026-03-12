<template>
  <div class="modal-wrapper" @click.self="$emit('close')">
    <div class="join-modal">
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
          <button
            class="terminal-btn"
            :disabled="!joinRoomId"
            @click="joinGame"
          >
            JOIN
            <Icon icon="pixel:login" class="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";

const joinRoomId = ref("");

const playerStore = usePlayerStore();
const soundStore = useSoundStore();

const joinGame = () => {
  if (!joinRoomId.value) return;
  soundStore.playSound("click");
  setUser();
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
.modal-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  z-index: 99;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.join-modal {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--primary);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  height: auto;
  overflow: auto;
  max-width: 400px;
  box-sizing: border-box;
}

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
