<template>
  <div class="home-content-wrapper">
    <main class="home-container">
      <section class="setup-card">
        <h1 class="logo">Pix<span>Reveal</span></h1>
        <div class="content-wrapper">
          <div class="avatar-selection">
            <div class="headline-wrapper">
              <h2>Choose your Avatar</h2>
            </div>
            <div class="avatar-grid">
              <div
                v-for="avatar in avatars"
                :key="avatar.id"
                class="avatar-slot"
                :class="{ active: selectedAvatarIndex === avatar.id }"
                @click="selectAvatar(avatar.id)"
              >
                <div
                  class="avatar-image"
                  :style="getAvatarStyle(avatar.id)"
                ></div>
              </div>
            </div>
          </div>
          <div>
            <div class="input-group" @keyup.enter="handleEnter">
              <label for="username">Player Name</label>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Enter Name..."
                maxlength="15"
              />
            </div>

            <button
              class="btn-outline"
              :disabled="!username || selectedAvatarIndex === null"
              @click="startGame"
            >
              PLAY GAME
            </button>

            <button
              class="btn-outline"
              :disabled="!username || selectedAvatarIndex === null"
              @click="hostGame"
            >
              HOST ONLINE GAME
            </button>

            <div class="join-input-wrapper">
              <button
                class="btn-outline"
                :disabled="
                  !username || selectedAvatarIndex === null || !joinRoomId
                "
                @click="joinGame"
              >
                JOIN GAME
              </button>
              <input
                type="text"
                v-model="joinRoomId"
                placeholder="Room ID..."
              />
            </div>
            <div class="sound-control-zone">
              <label class="sound-toggle-label">
                <input
                  type="checkbox"
                  v-model="soundStore.isAudioEnabled"
                  @change="soundStore.playSound('confirm')"
                />
                <div class="pixel-box">
                  <span class="status-icon">{{
                    soundStore.isAudioEnabled ? "🔊" : "🔇"
                  }}</span>
                  <span class="status-text"
                    >SOUND {{ soundStore.isAudioEnabled ? "ON" : "OFF" }}</span
                  >
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>
      <router-link to="/editor" class="editor-link">Open Editor</router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import { useGameStore } from "@/stores/game";
import { useSoundStore } from "@/stores/sound";

const router = useRouter();
const onlineStore = useOnlineStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();

const username = ref("");
const joinRoomId = ref("");
const selectedAvatarIndex = ref(null);
const playerId = Math.random().toString(36).substring(2, 9);
onlineStore.playerId = playerId;
const { prepareGame } = useGameStore();

const avatars = Array.from({ length: 36 }, (_, i) => ({ id: i }));

const getAvatarStyle = (index) => {
  const columns = 6;
  const x = index % columns;
  const y = Math.floor(index / columns);
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${x * 20}% ${y * 20}%`,
    backgroundSize: "600%",
  };
};

const selectAvatar = (id) => {
  selectedAvatarIndex.value = id;
  soundStore.playSound("click");
};
const setUser = () =>
  playerStore.setUser({
    username: username.value,
    avatar: selectedAvatarIndex.value,
  });

const startGame = () => {
  if (username.value && selectedAvatarIndex.value !== null) {
    setUser();
    prepareGame();
    router.push("/game");
    soundStore.playSound("click");
  }
};

const hostGame = () => {
  if (!username.value || selectedAvatarIndex.value === null) return;
  soundStore.playSound("click");
  setUser();
  prepareGame();
  onlineStore.hostSession({
    playerId,
    username: username.value,
    avatarIndex: selectedAvatarIndex.value,
    isHost: true,
  });
};

const joinGame = () => {
  if (
    !username.value ||
    selectedAvatarIndex.value === null ||
    !joinRoomId.value
  )
    return;
  soundStore.playSound("click");
  setUser();
  onlineStore.joinSession(
    {
      playerId,
      username: username.value,
      avatarIndex: selectedAvatarIndex.value,
      isHost: false,
    },
    joinRoomId.value.toUpperCase().trim(),
  );
};

const playersOnline = computed(() =>
  onlineStore.playersOnline ? onlineStore.playersOnline.length : 0,
);
</script>

<style scoped>
h1 {
  margin-top: 0;
}

h2 {
  margin-bottom: 0;
}

.headline-wrapper {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  align-items: center;
  input {
    accent-color: var(--neon-orange);
  }
  @media (min-width: 575px) {
    flex-direction: row;
  }
}

.home-content-wrapper {
  width: 100%;
}
.logo {
  text-align: center;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  margin-bottom: 16px;
}

.logo span {
  color: var(--neon-orange);
}

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 20px;
}

.setup-card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 77, 0, 0.3);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.btn-outline {
  margin: 0 auto 16px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 1rem 0 2rem;
  padding-right: 5px;
}

.avatar-grid::-webkit-scrollbar {
  width: 4px;
}
.avatar-grid::-webkit-scrollbar-thumb {
  background: var(--neon-orange);
  border-radius: 2px;
}

.avatar-slot {
  aspect-ratio: 1;
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  overflow: hidden;
  opacity: 0.5;
}

.avatar-image {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.avatar-slot:hover {
  border-color: rgba(255, 77, 0, 0.5);
  transform: scale(1.25);
  z-index: 1;
  opacity: 1;
}

.avatar-slot.active {
  border-color: var(--neon-orange);
  background-color: rgba(255, 77, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.5);
  transform: scale(1.5);
  opacity: 1;
  filter: contrast(2);
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--neon-orange);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

input[type="text"] {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-bottom: 2px solid rgba(255, 77, 0, 0.5);
  padding: 10px;
  color: #fff;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input[type="text"]:focus {
  border-color: var(--neon-orange);
}

.editor-link {
  color: white;
  margin-top: 32px;
}

.join-input-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  .btn-outline {
    margin: 0;
  }
}

.sound-control-zone {
  display: flex;
  justify-content: center;
  margin: 32px 0 0;
  width: 100%;
}

.sound-toggle-label {
  cursor: pointer;
  user-select: none;
}

.sound-toggle-label input {
  display: none;
}

.pixel-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 20px;
  border: 4px solid #444;
  background: #222;
  transition: all 0.1s;
  min-width: 180px;
}

.sound-toggle-label input:checked + .pixel-box {
  border-color: #ff6600;
  box-shadow: 0 0 15px rgba(255, 102, 0, 0.3);
}

.status-text {
  font-size: 12px;
  color: #888;
}

.sound-toggle-label input:checked + .pixel-box .status-text {
  color: #ff6600;
}

@media (max-width: 480px) {
  .pixel-box {
    flex-direction: column;
    gap: 5px;
    padding: 8px;
    min-width: 100px;
  }

  .status-text {
    font-size: 9px;
  }
}

@media (min-width: 1024px) {
  .setup-card {
    max-width: 800px;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
}
</style>
