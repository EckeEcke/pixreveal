<template>
  <div class="home-content-wrapper">
    <LoadingOverlay :show="channelStore.isLoading" />
    <GameManual
      v-show="configStore.showManual"
      @close="configStore.closeManual"
    />
    <main v-show="!configStore.showManual" class="home-container">
      <section class="setup-card">
        <SettingsButton />
        <div class="content-wrapper">
          <div class="mode-section classic">
            <h1 class="logo">Pix<span>Reveal</span></h1>
            <h2 class="hook">Guess the pixel art as it reveals.</h2>
            <div class="classic-mode-buttons">
              <button class="neon-btn classic" @click="openSingleplayer">
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:user-solid" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">SINGLEPLAYER</span>
                    <span class="sub-title"
                      >Choose your mode and start playing</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn party"
                @click="openMultiplayerModal('party')"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:users" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">LOCAL PARTY MULTIPLAYER</span>
                    <span class="sub-title"
                      >Local Multiplayer in Jackbox style</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn online"
                @click="openMultiplayerModal('online')"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:globe" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">ONLINE MULTIPLAYER</span>
                    <span class="sub-title">
                      Host/join a game with your friends
                    </span>
                  </div>
                </div>
              </button>

              <button class="neon-btn special editor" @click="openEditor">
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:image-solid" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">SUBMIT ART</span>
                    <span class="sub-title"
                      >Create and submit your own pixel art</span
                    >
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <PlatformBar />
      <div>
        <button class="how-to-play-link" data-sfx="click" @click="openManual">
          HOW TO PLAY
        </button>
        <button
          class="how-to-play-link"
          data-sfx="click"
          @click="router.push('/about')"
        >
          ABOUT
        </button>
      </div>

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
    <JoinModal
      v-if="showJoinModal"
      @close="closeMultiplayerModal"
      :mode="multiplayerMode"
      :initial-role="multiplayerRole"
      :room-id="joinRoomId"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { getRandomUserName } from "@/utils/random";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { Icon } from "@iconify/vue";
import PlayerEditModal from "@/components/PlayerEditModal.vue";
import JoinModal from "@/components/JoinModal.vue";
import SettingsModal from "@/components/SettingsModal.vue";
import PlatformBar from "@/components/PlatformBar.vue";
import GameManual from "@/components/GameManual.vue";
import { useChannelStore } from "@/stores/channel";
import { useConfigStore } from "@/stores/config";
import SettingsButton from "@/components/SettingsButton.vue";

const router = useRouter();
const route = useRoute();
const channelStore = useChannelStore();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const isFullscreen = ref(!!document.documentElement.fullscreenElement);
const showAvatarModal = ref(false);
const playerId = Math.random().toString(36).substring(2, 9);
channelStore.playerId = playerId;
const showJoinModal = ref(false);
const joinRoomId = ref(route.query.id ?? "");
const multiplayerMode = ref("online");
const multiplayerRole = ref("join");

const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

setUser();

const openSingleplayer = () => {
  soundStore.playSound("click");
  router.push("/singleplayer");
};

const openEditor = () => {
  soundStore.playSound("click");
  router.push("/editor");
};

const openMultiplayerModal = (mode) => {
  soundStore.playSound("click");
  multiplayerMode.value = mode;
  channelStore.setMode(mode === "party" ? "party" : "regular");
  multiplayerRole.value = "join";
  showJoinModal.value = true;
  updateQuery({
    mode,
    role: "join",
    id: joinRoomId.value || undefined,
  });
};

const closeMultiplayerModal = () => {
  showJoinModal.value = false;
  updateQuery({
    mode: undefined,
    role: undefined,
    id: undefined,
  });
};

const updateQuery = (patch) => {
  const nextQuery = { ...route.query, ...patch };
  Object.keys(nextQuery).forEach((key) => {
    if (nextQuery[key] === undefined || nextQuery[key] === null) {
      delete nextQuery[key];
    }
  });
  router.replace({ query: nextQuery });
};

watch(
  () => route.query.mode,
  (value) => {
    if (value === "online" || value === "party") {
      multiplayerMode.value = value;
      multiplayerRole.value = route.query.role === "host" ? "host" : "join";
      showJoinModal.value = true;
      channelStore.setMode(value === "party" ? "party" : "regular");
    }
  },
  { immediate: true },
);

watch(
  () => route.query.id,
  (value) => {
    joinRoomId.value = value ?? "";
  },
);

const openManual = () => {
  configStore.openManual();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

if (document.fullscreenElement) isFullscreen.value = true;

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
  padding: 0 32px 32px;
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

.content-wrapper {
  margin: 0 -32px -32px;
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
    border-bottom-right-radius: 8px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
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
  padding-top: 32px;
}

.setup-card {
  background: radial-gradient(
    circle at center,
    rgba(168, 85, 247, 0.12) 0%,
    rgba(40, 10, 60, 0.5) 60%,
    rgba(15, 5, 25, 0.9) 100%
  );
  background-color: var(--card-bg);
  h2 {
    color: var(--white);
  }
}

.classic-mode-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.hook {
  font-family: "Chakra Petch", sans-serif;
  font-size: 18px;
  margin-bottom: 16px;
}

@media (min-width: 575px) {
  .classic-mode-buttons {
    grid-template-columns: 1fr 1fr;
  }
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
  --btn-color: var(--neon-cyan);
  border: 2px solid var(--btn-color);
  border-radius: 8px;
  padding: 20px;
  min-height: 120px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

.neon-btn.classic {
  --btn-color: var(--neon-cyan);
}
.neon-btn.survival {
  --btn-color: var(--neon-cyan);
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
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  width: 100%;
}

.btn-icon {
  flex: 0 0 auto;
  font-size: 40px;
  color: var(--btn-color);
  filter: drop-shadow(0 0 2px var(--btn-color));
}

.text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.btn-text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.sub-title {
  color: #ffffffcc;
  font-size: 14px;
  font-family: var(--font-display);
}

.neon-btn:hover {
  box-shadow: 0 0 20px var(--btn-color);
  animation: 1.5s floating infinite ease-in-out;
}

.neon-btn:hover .glow-layer {
  opacity: 0.3;
}

.neon-btn:active {
  transform: translateY(-2px);
  filter: brightness(1.2);
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
  --btn-color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.neon-btn.online {
  --btn-color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.neon-btn.party {
  --btn-color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.how-to-play-link {
  background: none;
  color: var(--white);
  border: none;
  text-decoration: underline;
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
