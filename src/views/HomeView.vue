<template>
  <div class="home-content-wrapper">
    <LoadingOverlay :show="onlineStore.isLoading" :text="loadingText" />
    <main class="home-container">
      <section class="setup-card">
        <h1 class="logo">Pix<span>Reveal</span></h1>
        <div class="content-wrapper">
          <div class="avatar-selection">
            <div class="headline-wrapper">
              <h2>Choose your Avatar</h2>
            </div>
            <div class="mobile-scroll-container">
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
                @input="soundStore.playSound('click')"
              />
            </div>

            <div v-if="!hasRoomIdFromQuery" class="rounds-selection">
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
                    v-model="gameStore.maxRounds"
                    @change="soundStore.playSound('click')"
                  />
                  <span class="radio-button">{{ amount }}</span>
                </label>
              </div>
            </div>

            <button
              v-if="!hasRoomIdFromQuery"
              class="btn-outline"
              @click="startGame"
            >
              <Icon icon="pixel:user-solid" />
              PLAY GAME
            </button>

            <button
              v-if="!hasRoomIdFromQuery"
              class="btn-outline"
              @click="hostGame"
            >
              <Icon icon="pixel:globe" />
              HOST ONLINE GAME
            </button>

            <div class="join-input-wrapper">
              <button
                class="btn-outline"
                :disabled="!joinRoomId"
                @click="joinGame"
              >
                <Icon icon="pixel:login" />
                JOIN GAME
              </button>
              <input
                type="text"
                v-model="joinRoomId"
                placeholder="Room ID..."
                @input="soundStore.playSound('click')"
              />
            </div>
            <router-link v-if="hasRoomIdFromQuery" to="/" class="link"
              >Back to main game</router-link
            >
            <div class="config-buttons">
              <div class="config-element">
                <label class="config-label">
                  <input
                    type="checkbox"
                    v-model="soundStore.isAudioEnabled"
                    @change="soundStore.playSound('confirm')"
                  />
                  <div class="pixel-box">
                    <Icon
                      class="status-icon"
                      :icon="
                        soundStore.isAudioEnabled
                          ? 'pixel:sound-on-solid'
                          : 'pixel:sound-mute-solid'
                      "
                    />
                    <span class="status-text">SOUND</span>
                  </div>
                </label>
              </div>
              <div class="config-element">
                <label class="config-label">
                  <input
                    type="checkbox"
                    v-model="isFullscreen"
                    @change="toggleFullscreen"
                  />
                  <div class="pixel-box">
                    <Icon
                      class="status-icon"
                      :icon="
                        isFullscreen ? 'pixel:expand-solid' : 'pixel:expand'
                      "
                    />
                    <span class="status-text">FULLSCREEN</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <ShareIcons />
      <router-link to="/editor" class="link">Open Editor</router-link>
      <div>
        Music: Lo-Bit 13 by
        <a
          href="https://freemusicarchive.org/music/holiznapatreon/lo-bit-lofi-gamer-tracks"
          target="_blank"
          >HoliznaPATREON</a
        >
      </div>
      <div>© 2026 PixReveal | Code & Design by Christian Eckardt</div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import { useGameStore } from "@/stores/game";
import { useSoundStore } from "@/stores/sound";
import { getRandomUserName } from "@/utils/random";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { Icon } from "@iconify/vue";
import ShareIcons from "@/components/ShareIcons.vue";

const router = useRouter();
const route = useRoute();
const onlineStore = useOnlineStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const isFullscreen = ref(false);
const username = ref("");
const joinRoomId = ref("");
const selectedAvatarIndex = ref(0);
const playerId = Math.random().toString(36).substring(2, 9);
onlineStore.playerId = playerId;
const { prepareGame } = useGameStore();

const loadingText = ref("LOADING...");

const avatars = Array.from({ length: 36 }, (_, i) => ({ id: i }));

const hasRoomIdFromQuery = computed(() => !!route.query.id);
const roomIdFromQuery = route.query.id;

if (hasRoomIdFromQuery.value) joinRoomId.value = roomIdFromQuery;

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
    username: username.value || getRandomUserName(),
    avatar: selectedAvatarIndex.value,
  });

const startGame = () => {
  setUser();
  prepareGame();
  router.push("/game");
  soundStore.playSound("click");
};

const hostGame = () => {
  soundStore.playSound("click");
  setUser();
  prepareGame();
  onlineStore.isLoading = true;
  loadingText.value = "CREATING ONLINE GAME...";
  onlineStore.hostSession({
    playerId,
    username: playerStore.playerName,
    avatarIndex: selectedAvatarIndex.value,
    isHost: true,
  });
};

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
      avatarIndex: selectedAvatarIndex.value,
      isHost: false,
    },
    joinRoomId.value.toUpperCase().trim(),
  );
};

const toggleFullscreen = () => {
  const elem = document.documentElement;

  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

if (document.fullscreenElement) isFullscreen.value = true;

onlineStore.reset();
</script>

<style scoped>
h2 {
  margin: 0;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  width: 100%;
}

.home-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 20px;
}

.setup-card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 77, 0, 0.3);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(255, 77, 0, 0.3);
}

.btn-outline {
  margin: 0 auto 16px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 16px;
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

.link {
  display: block;
  color: white;
  opacity: 0.8;
}

.join-input-wrapper {
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 8px;
  .btn-outline {
    margin: 0;
  }
}

.config-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.config-element {
  display: flex;
  justify-content: center;
  margin: 32px 0 0;
  width: 100%;
}

.config-label {
  cursor: pointer;
  user-select: none;
  width: 100%;
}

.config-label input {
  display: none;
}

.pixel-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  border: 4px solid #444;
  background: #222;
  transition: all 0.1s;
  width: 100%;
  box-sizing: border-box;
}

.config-label input:checked + .pixel-box {
  border-color: var(--neon-orange);
  box-shadow: 0 0 15px rgba(255, 102, 0, 0.3);
}

.status-text {
  font-size: 12px;
  color: #888;
}

.config-label input:checked + .pixel-box .status-text {
  color: var(--neon-orange);
}

.rounds-selection {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selection-label {
  font-size: 0.8rem;
  color: var(--neon-orange);
  text-transform: uppercase;
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
  background: #1a1a1a;
  border: 2px solid #333;
  color: #fff;
  font-size: 12px;
  transition: all 0.2s ease;
}

.radio-item:hover .radio-button {
  border-color: #666;
  background: #222;
}

.radio-item input:checked + .radio-button {
  background: var(--neon-orange);
  border-color: var(--neon-orange);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 0 10px var(--neon-orange);
  transform: translateY(-2px);
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

footer {
  display: grid;
  gap: 32px;
  text-align: center;
  margin: 32px auto 0;
  a {
    color: inherit;
  }
}

@media (max-width: 575px) {
  .avatar-grid {
    margin: 0;
  }

  .mobile-scroll-container {
    height: 128px;
    overflow-y: scroll;
    overflow-x: visible;
    margin: 8px -20px 32px;
    padding: 20px 20px;
  }
}
</style>
