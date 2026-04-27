<!-- OnlineModal.vue -->
<template>
  <ModalWrapper>
    <button @click="$emit('close')" data-sfx="click" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <span class="pre-headline">MODE</span>
    <h2>
      {{ mode === "party" ? "LOCAL PARTY" : "ONLINE GAME" }}
    </h2>

    <div class="role-toggle">
      <button
        :class="{ active: selectedRole === 'join' }"
        @click="setRole('join')"
        data-sfx="click"
      >
        JOIN
      </button>
      <button
        :class="{ active: selectedRole === 'host' }"
        @click="setRole('host')"
        data-sfx="click"
      >
        HOST
      </button>
    </div>

    <div
      v-if="!(selectedRole === 'host' && mode === 'party')"
      class="setup-section"
    >
      <h3>YOUR AVATAR</h3>
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
    <div v-if="selectedRole === 'host'" class="host-info">
      <template v-if="mode === 'party'">
        <h3>Hosting a Party Game</h3>
        <p>
          The party mode is displayed on the host device. PC/Laptop recommended
          for hosting. Players can join via smartphone to buzz and answer.
        </p>
      </template>
      <template v-else>
        <p>
          Host an online game and invite friends via link or room id to play.
        </p>
      </template>
    </div>

    <button
      v-if="selectedRole === 'host'"
      class="start-btn"
      data-sfx="click"
      @click="hostGame"
    >
      {{ mode === "party" ? "HOST PARTY" : "HOST GAME" }}
    </button>

    <div v-else class="join-container">
      <p>Enter a room id to join a game</p>
      <div class="join-terminal">
        <input
          v-model="joinRoomId"
          placeholder="Enter room ID"
          class="terminal-input"
        />
        <button
          class="terminal-btn"
          :disabled="!joinRoomId"
          data-sfx="click"
          @click="joinGame"
        >
          JOIN
        </button>
      </div>
    </div>

    <PlayerEditModal v-if="showAvatarModal" @close="showAvatarModal = false" />
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { useChannelStore } from "@/stores/channel";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import avatarSpriteSheet from "@/assets/avatars/avatars.webp";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";

const props = defineProps({
  mode: { type: String, default: "online" },
  initialRole: { type: String, default: "join" },
  roomId: { type: String, default: "" },
});

defineEmits(["close"]);

const showAvatarModal = ref(false);
const playerId = Math.random().toString(36).substring(2, 9);

const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const channelStore = useChannelStore();
const { prepareGame } = useGameStore();

const joinRoomId = ref(props.roomId ?? "");
const selectedRole = ref(props.initialRole === "host" ? "host" : "join");

const setRole = (role) => {
  selectedRole.value = role;
  channelStore.isHost = role === "host";
};

setRole(selectedRole.value);

watch(
  () => props.initialRole,
  (value) => {
    setRole(value === "host" ? "host" : "join");
  },
);

watch(
  () => props.roomId,
  (value) => {
    joinRoomId.value = value ?? "";
  },
);

const mode = computed(() => (props.mode === "party" ? "party" : "online"));

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
  channelStore.setMode(props.mode === "party" ? "party" : "regular");
  soundStore.playSound("click");
  channelStore.playerId = playerId;
  channelStore.isLoading = true;

  if (props.mode === "party") {
    prepareGame(configStore.revealTime);
    channelStore.loadingText = "CREATING PARTY...";
    channelStore.hostSession({
      playerId,
      username: playerStore.playerName,
      avatarIndex: playerStore.avatarIndex,
      isHost: true,
    });
  } else {
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
  }
};

const joinGame = () => {
  if (!joinRoomId.value) return;
  channelStore.setMode(props.mode === "party" ? "party" : "regular");
  soundStore.playSound("click");
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
.pre-headline {
  color: var(--primary);
}
h2 {
  margin-top: 0;
  margin-bottom: 32px;
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
  max-width: calc(100% - 90px);
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
  margin: 32px 0;
}

.section-label {
  font-size: 14px;
  margin-bottom: 16px;
}

.host-info {
  margin: 32px 0 16px;
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
  font-size: 16px;
  color: white;
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
</style>
