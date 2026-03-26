<template>
  <div class="home-content-wrapper">
    <LoadingOverlay :show="onlineStore.isLoading" :text="loadingText" />
    <transition name="fade" mode="default">
      <WelcomeOverlay
        v-if="showWelcomeModal"
        @close="showWelcomeModal = false"
      />
      <main v-else class="home-container">
        <section class="setup-card">
          <header>
            <h1 class="logo">Pix<span>Reveal</span></h1>
            <div class="config">
              <div class="player-info" @click="showAvatarModal = true">
                <div class="player-avatar" :style="avatarStyle"></div>
                <div class="player-name">
                  {{ playerStore.playerName || "UNKNOWN" }}
                </div>
              </div>
            </div>
          </header>
          <div class="content-wrapper">
            <div class="mode-section classic">
              <div class="section-header">
                <h2>CLASSIC</h2>
              </div>

              <div class="classic-mode-buttons">
                <button class="neon-btn classic" @click="startGame">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:user-solid" class="btn-icon" />
                    <span class="btn-text">SOLO PLAY</span>
                  </div>
                </button>

                <button class="neon-btn host" @click="hostGame">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:globe" class="btn-icon" />
                    <span class="btn-text">HOST GAME</span>
                  </div>
                </button>

                <button class="neon-btn join" @click="joinGame">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:login" class="btn-icon" />
                    <span class="btn-text">JOIN GAME</span>
                  </div>
                </button>

                <button
                  class="neon-btn settings"
                  @click="showSettingsModal = true"
                >
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon
                      icon="streamline-pixel:interface-essential-setting-cog"
                      class="btn-icon"
                    />
                    <span class="btn-text">SETTINGS</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="mode-section special">
              <div class="section-header">
                <h2>SPECIAL</h2>
              </div>
              <div class="classic-mode-buttons">
                <button class="neon-btn special" @click="startSurvival">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:hockey-mask-solid" class="btn-icon" />
                    <span class="btn-text">SURVIVAL</span>
                  </div>
                </button>

                <button class="neon-btn special" @click="startBuzzer">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:question" class="btn-icon" />
                    <span class="btn-text">BUZZER</span>
                  </div>
                </button>

                <button class="neon-btn special" @click="startInspect">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:search" class="btn-icon" />
                    <span class="btn-text">INSPECT</span>
                  </div>
                </button>

                <button class="neon-btn special editor" @click="openEditor">
                  <div class="glow-layer"></div>
                  <div class="btn-content">
                    <Icon icon="pixel:image-solid" class="btn-icon" />
                    <span class="btn-text">EDITOR</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </transition>
    <footer>
      <PlatformBar />
      <div>
        Music: Lo-Bit 13 by
        <a
          href="https://freemusicarchive.org/music/holiznapatreon/lo-bit-lofi-gamer-tracks"
          target="_blank"
          >HoliznaPATREON</a
        >
      </div>
      <div>
        © 2026 PixReveal | Code & Design by
        <a
          href="https://eckeecke.github.io"
          target="_blank"
          rel="noopener"
          class="website-link"
          >Christian Eckardt</a
        >
      </div>
    </footer>
    <PlayerEditModal v-if="showAvatarModal" @close="showAvatarModal = false" />
    <JoinModal v-if="showJoinModal" @close="showJoinModal = false" />
    <SettingsModal
      v-if="showSettingsModal"
      @close="showSettingsModal = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import { useGameStore } from "@/stores/game";
import { useSoundStore } from "@/stores/sound";
import { getRandomUserName } from "@/utils/random";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { Icon } from "@iconify/vue";
import PlayerEditModal from "@/components/PlayerEditModal.vue";
import JoinModal from "@/components/JoinModal.vue";
import SettingsModal from "@/components/SettingsModal.vue";
import WelcomeOverlay from "@/components/WelcomeOverlay.vue";
import PlatformBar from "@/components/PlatformBar.vue";
import { useConfigStore } from "@/stores/config";

const router = useRouter();
const route = useRoute();
const onlineStore = useOnlineStore();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const gameStore = useGameStore();
const soundStore = useSoundStore();
const isFullscreen = ref(!!document.documentElement.fullscreenElement);
const showWelcomeModal = ref(!playerStore.playerName);
const showAvatarModal = ref(false);
const showSettingsModal = ref(false);
const playerId = Math.random().toString(36).substring(2, 9);
onlineStore.playerId = playerId;
const { prepareGame } = useGameStore();

const loadingText = ref("LOADING...");

const hasRoomIdFromQuery = computed(() => !!route.query.id);
const roomIdFromQuery = route.query.id;
const showJoinModal = ref(hasRoomIdFromQuery.value);

const joinRoomId = ref(undefined);

if (hasRoomIdFromQuery.value) joinRoomId.value = roomIdFromQuery;

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

const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

const startGame = () => {
  setUser();
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  soundStore.playSound("click");
  router.push("/game");
};

const startBuzzer = () => {
  setUser();
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  soundStore.playSound("click");
  router.push("/buzzer");
};

const startInspect = () => {
  setUser();
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "inspect";
  soundStore.playSound("click");
  router.push("/inspect");
};

const startSurvival = () => {
  setUser();
  playerStore.gameMode = "survival";
  soundStore.playSound("click");
  router.push("/survival");
};

const openEditor = () => {
  soundStore.playSound("click");
  router.push("/editor");
};

const hostGame = () => {
  soundStore.playSound("click");
  setUser();
  prepareGame(configStore.revealTime);
  onlineStore.isLoading = true;
  loadingText.value = "CREATING ONLINE GAME...";
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
  soundStore.playSound("click");
  if (!hasRoomIdFromQuery.value) {
    showJoinModal.value = true;
    return;
  }
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

if (document.fullscreenElement) isFullscreen.value = true;

onlineStore.reset();

const updateFullscreenStatus = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() =>
  document.addEventListener("fullscreenchange", updateFullscreenStatus),
);

onUnmounted(() =>
  document.removeEventListener("fullscreenchange", updateFullscreenStatus),
);
</script>

<style scoped>
h1 {
  margin-bottom: 0;
  font-size: 24px;
  @media (max-width: 360px) {
    font-size: 18px;
  }
}

h2 {
  font-family: "8bit";
  margin: 0;
  margin-bottom: 32px;
  text-align: center;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.headline-wrapper {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  align-items: center;
  input {
    accent-color: var(--primary);
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
  padding: 0 16px;
}

.setup-card {
  position: relative;
  background: var(--card-bg);
  border: 2px solid #334155;
  padding: 16px 32px 32px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.link {
  display: block;
  color: var(--white);
  opacity: 0.8;
}

.config {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-direction: row-reverse;
  justify-content: center;
}

.content-wrapper {
  margin: 16px -32px -32px;
  display: grid;
  grid-template-columns: 1fr;
  border-top: 2px solid #33415522;
}

.website-link {
  text-decoration: none;
  cursor: pointer;
}

@media (min-width: 1024px) {
  h1 {
    margin: 0;
  }
  .setup-card {
    max-width: 800px;
  }

  .mode-section.classic {
    border-bottom-left-radius: 8px;
  }

  .mode-section.special {
    border-bottom-left-radius: 0;
  }

  .content-wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

footer {
  display: grid;
  gap: 32px;
  text-align: center;
  margin: 16px auto 0;
  a {
    color: inherit;
  }
}

.player-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  @media (min-width: 575px) {
    background: rgba(15, 23, 42, 0.6);
    padding-right: 16px;
    border-radius: 12px;
    border: 2px solid rgba(236, 72, 153, 0.3);
  }
}

.player-info:hover {
  background: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.2);
}

.player-avatar {
  width: 44px;
  height: 44px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  @media (min-width: 575px) {
    width: 56px;
    height: 56px;
  }
}

.player-name {
  text-transform: uppercase;
  font-weight: 900;
  display: none;
  @media (min-width: 575px) {
    display: block;
  }
}

.mode-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 32px;
  padding-top: 48px;
}

.mode-section.classic {
  background: radial-gradient(
    circle at center,
    rgba(168, 85, 247, 0.12) 0%,
    rgba(40, 10, 60, 0.5) 60%,
    rgba(15, 5, 25, 0.9) 100%
  );
  background-color: #ff356222;
  h2 {
    color: var(--white);
  }
}

.mode-section.special {
  background: radial-gradient(
    circle at center,
    rgba(6, 182, 212, 0.1) 0%,
    rgba(10, 40, 60, 0.5) 60%,
    rgba(5, 15, 25, 0.9) 100%
  );
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  h2 {
    color: var(--white);
  }
}

.classic-mode-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.neon-btn {
  position: relative;
  background: #1a1a1e;
  border: 2px solid var(--neon-purple);
  border-radius: 8px;
  padding: 20px;
  min-height: 140px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.neon-btn.classic {
  --btn-color: var(--neon-purple);
}
.neon-btn.survival {
  --btn-color: var(--neon-purple);
  border-color: var(--neon-purple);
}

.neon-btn:disabled {
  opacity: 0.3;
  box-shadow: none;
  pointer-events: none;
}

.neon-btn:disabled:after {
  content: "COMING SOON";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);

  font-family: "8bit", sans-serif;
  font-size: 14px;
  color: #fbbf24;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 8px 16px;
  border: 2px solid #fbbf24;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
}

.glow-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center,
    var(--btn-color) 0%,
    transparent 70%
  );
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.btn-icon {
  font-size: 40px;
  color: var(--btn-color);
  filter: drop-shadow(0 0 2px var(--btn-color));
}

.btn-text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.neon-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 20px var(--btn-color);
}

.neon-btn:hover .glow-layer {
  opacity: 0.3;
}

.neon-btn:active {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.neon-btn.settings,
.neon-btn.editor {
  --btn-color: #94a3b8;
  border-color: #94a3b8;
  box-shadow: 0 0 15px #94a3b822;
}

.neon-btn.host {
  --btn-color: var(--neon-purple);
  border-color: var(--neon-purple);
  box-shadow: 0 0 15px var(--purple-glow);
}
.neon-btn.host .btn-icon {
  color: var(--neon-purple);
  filter: drop-shadow(0 0 2px var(--neon-purple));
}

.neon-btn.join {
  --btn-color: var(--neon-purple);
  border-color: var(--neon-purple);
  box-shadow: 0 0 15px var(--purple-glow);
}
.neon-btn.join .btn-icon {
  color: var(--neon-purple);
  filter: drop-shadow(0 0 2px var(--neon-purple));
}

.neon-btn.special {
  --btn-color: #00f2ff;
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}
.neon-btn.special .btn-icon {
  color: #00f2ff;
  filter: drop-shadow(0 0 2px #00f2ff);
}

.neon-btn.daily {
  --btn-color: var(--neon-yellow);
  border-color: var(--neon-yellow);
  box-shadow: 0 0 15px var(--yellow-glow);
}
.neon-btn.daily .btn-icon {
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 2px var(--neon-yellow));
}

@media (max-width: 480px) {
  .btn-icon {
    font-size: 32px;
  }
  .btn-text {
    font-size: 0.7rem;
  }
}
</style>
