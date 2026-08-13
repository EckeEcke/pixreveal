<template>
  <div>
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.push('/')" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>
    <main class="page">
      <LoadingOverlay :show="channelStore.isLoading" />
      <div class="setup-card card">
      <span class="pre-headline">MODE</span>
            <h2>ONLINE GAME</h2>
        <div class="card-grid">
          <section class="panel panel-left" aria-label="Online game setup">
            

            <div class="role-toggle">
              <button
                :class="{ active: selectedRole === 'host' }"
                @click="setRole('host')"
                data-sfx="click"
              >
                HOST
              </button>
              <button
                :class="{ active: selectedRole === 'join' }"
                @click="setRole('join')"
                data-sfx="click"
              >
                JOIN
              </button>
            </div>

            <div v-if="selectedRole === 'host'" class="host-settings">
              <div class="rounds-selection">
                <label class="selection-label">HOW MANY ROUNDS</label>
                <div class="radio-group">
                  <label
                    v-for="amount in [5, 10, 15, 20]"
                    :key="amount"
                    class="radio-item"
                  >
                    <input
                      type="radio"
                      name="rounds"
                      :value="amount"
                      v-model="configStore.maxRounds"
                      :disabled="configStore.filteredDrawings.length < amount * 4"
                      @change="soundStore.playSound('click')"
                    />
                    <span class="radio-button">{{ amount }}</span>
                  </label>
                </div>
              </div>

              <div class="rounds-selection">
                <label class="selection-label">SET ROUND LENGTH</label>
                <div class="radio-group">
                  <label
                    v-for="duration in [5, 10, 15, 20]"
                    :key="duration"
                    class="radio-item"
                  >
                    <input
                      type="radio"
                      name="duration"
                      :value="duration"
                      v-model="configStore.revealTime"
                      @change="soundStore.playSound('click')"
                    />
                    <span class="radio-button">{{ duration }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="setup-section">
              <h3>SET YOUR NAME AND AVATAR</h3>
              <div class="player-info-wrapper">
                <div
                  class="player-avatar"
                  :style="avatarStyle"
                  @click="showAvatarModal = true"
                >
                  <Icon icon="pixel:pencil" class="edit-badge" />
                </div>
                <div class="player-name" @click="showAvatarModal = true">
                  <span>{{ playerStore.playerName || "SET PLAYER NAME" }}</span>
                  <span class="info-text">Tap to change</span>
                </div>
              </div>
            </div>

            <button
              v-if="selectedRole === 'host'"
              class="start-btn"
              data-sfx="click"
              @click="hostGame"
            >
              CREATE ROOM
            </button>

            <div v-else class="join-container">
              <h3>ENTER ROOM ID TO JOIN A GAME</h3>
              <div class="join-terminal">
                <input
                  v-model="joinRoomId"
                  placeholder="Enter ID"
                  :maxlength="ROOM_ID_LENGTH"
                  autocapitalize="on"
                  class="terminal-input"
                />
                <button
                  class="terminal-btn"
                  :disabled="!joinRoomId || joinRoomId.length !== ROOM_ID_LENGTH"
                  data-sfx="click"
                  @click="joinGame"
                >
                  JOIN ROOM
                </button>
              </div>
            </div>
          </section>
          <section>
            <OnlineModeInfo class="online-info" />
          </section>
        </div>
      </div>
      <PlayerEditModal
        v-if="showAvatarModal"
        @btn-click="showAvatarModal = false"
        @close="showAvatarModal = false"
      />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { useChannelStore } from "@/stores/channel";
import LoadingOverlay from "@/components/page-layout/LoadingOverlay.vue";
import avatarSpriteSheet from "@/assets/avatars/avatars.webp";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import { ROOM_ID_LENGTH } from "@/utils/crypto";
import { useRoute } from "vue-router";
import OnlineModeInfo from "@/components/page-ui/OnlineModeInfo.vue";

const showAvatarModal = ref(false);

const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const channelStore = useChannelStore();
const { prepareGame } = useGameStore();
const route = useRoute();

const joinRoomId = ref("");
const selectedRole = ref("host");

const setRole = (role) => {
  selectedRole.value = role;
  channelStore.isHost = role === "host";
};

onMounted(() => {
  channelStore.setMode("regular");
});

watch(
  () => route.query.id,
  (value) => {
    if (typeof value === "string") joinRoomId.value = value;
  },
  { immediate: true },
);

watch(
  () => route.query.role,
  (value) => {
    if (value === "host" || value === "join") setRole(value);
  },
  { immediate: true },
);

const avatarStyle = computed(() => {
  const index = playerStore.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${col * 20}% ${row * 20}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});

const hostGame = () => {
  channelStore.setMode("regular");
  soundStore.playSound("click");
  const playerId = playerStore.controllerId;
  channelStore.playerId = playerId;
  channelStore.isLoading = true;

  channelStore.loadingText = "CREATING ONLINE GAME...";
  prepareGame(configStore.revealTime);
  channelStore.hostSession({
    playerId,
    username: playerStore.playerName,
    avatarIndex: playerStore.avatarIndex,
    isHost: true,
    rounds: configStore.maxRounds,
    revealTime: configStore.revealTime,
  });
};

const joinGame = () => {
  if (!joinRoomId.value) return;
  channelStore.setMode("regular");
  soundStore.playSound("click");
  const playerId = playerStore.controllerId;
  channelStore.playerId = playerId;
  channelStore.isLoading = true;
  channelStore.loadingText = "JOINING...";
  channelStore.joinSession(
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
.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
}

.card {
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  background: var(--card-bg);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  padding: 32px;
  box-sizing: border-box;
}

.pre-headline {
  color: var(--primary);
}
h2 {
  margin-top: 0;
  margin-bottom: 32px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  row-gap: 64px;
}

.panel {
  min-width: 0;
}

@media (min-width: 1024px) {
  .card {
    max-width: 1000px;
  }
  .card-grid {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }
}

.join-terminal {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
}

.terminal-input {
  background: transparent;
  border: 2px solid var(--primary);
  border-radius: 4px;
  color: #fff;
  padding: 12px;
  font-family: inherit;
  font-size: 20px;
  outline: none;
}

.terminal-btn {
  background: var(--primary);
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 900;
  animation: pulse 3s infinite;
}

.terminal-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
  animation: none;
}

.terminal-btn:not(:disabled):hover {
  background: #fff;
  box-shadow: -5px 0 15px var(--primary);
}

.setup-section {
  margin: 48px 0;
}

.host-info {
  margin: 32px 0;
}

.host-settings {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.rounds-selection {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selection-label {
  font-size: 0.8rem;
  color: var(--primary);
  text-transform: uppercase;
  text-align: left;
}

.radio-group {
  display: flex;
  gap: 10px;
}

.radio-item {
  flex: 1;
  cursor: pointer;
}

.radio-item input {
  display: none;
}

.radio-button {
  display: block;
  text-align: center;
  padding: 10px 0;
  border: 2px solid var(--border-color);
  color: #fff;
  font-size: 12px;
  transition: all 0.2s ease;
}

.radio-item:hover .radio-button {
  border-color: #666;
}

.radio-item input:checked + .radio-button {
  background: var(--primary);
  border-color: var(--primary);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  transform: translateY(-2px);
}

.radio-item input:disabled + .radio-button {
  cursor: not-allowed;
  opacity: 0.2;
  filter: grayscale(1);
  border-style: dotted;
  transform: none;
  box-shadow: none;
}

.radio-item:has(input:disabled) {
  cursor: not-allowed;
}

.player-info-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
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
  font-size: 18px;
  color: white;
  animation: pulse 3s infinite;
}

.player-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: flex-start;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  .info-text {
    font-size: 14px;
    font-weight: 400;
    text-transform: none;
    opacity: 0.7;
  }
}

.role-toggle {
  display: flex;
  background: #111;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
  padding: 3px;
  gap: 3px;
}

.role-toggle button {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  background: transparent;
  border: none;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  font-family: inherit;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-toggle button:hover {
  color: rgba(255, 255, 255, 0.7);
}

.role-toggle button.active {
  background: var(--primary);
  color: #000;
  font-size: 16px;
  box-shadow: none;
  transform: none;
}

.back-btn-wrapper {
  width: 100%;
  max-width: 1000px;
}
</style>