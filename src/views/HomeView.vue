<template>
  <div class="home-content-wrapper">
    <HeaderApp />
    <LoadingOverlay :show="channelStore.isLoading" />
    <GameManual
      v-show="configStore.showManual"
      @close="configStore.closeManual"
    />
    <main v-show="!configStore.showManual" class="home-container">
      <section class="setup-card">
        <div class="content-wrapper">
          <div class="mode-section">
            <div class="classic-mode-buttons">
              <button class="neon-btn" @click="openSingleplayer">
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
                class="neon-btn online"
                @click="openMultiplayerModal('party')"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:users" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">LOCAL PARTY</span>
                    <span class="sub-title"
                      >Local Party Multiplayer in Jackbox style</span
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

              <button class="neon-btn editor" @click="openEditor">
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
    <FooterApp />
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
import GameManual from "@/components/GameManual.vue";
import { useChannelStore } from "@/stores/channel";
import { useConfigStore } from "@/stores/config";
import FooterApp from "@/components/FooterApp.vue";
import HeaderApp from "@/components/HeaderApp.vue";

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

.home-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 95vh;
  width: 100%;
}

.home-container {
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  padding: 0 16px;
  @media (min-width: 575px) {
    margin-top: 16px;
  }
}

.setup-card {
  position: relative;
  width: 100%;
  max-width: 650px;
  h2 {
    color: var(--white);
  }
  box-sizing: border-box;
}

.link {
  display: block;
  color: var(--white);
  opacity: 0.8;
}

.content-wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}

.mode-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px 0;
  @media (min-width: 575px) {
    padding: 32px;
  }
}

.classic-mode-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  @media (min-width: 576px) {
    gap: 16px;
  }
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
  --btn-color: var(--primary);
  &.online {
    --btn-color: var(--neon-cyan);
    @media (min-width: 576px) {
      order: 1;
    }
  }
  &.editor {
    --btn-color: var(--neon-success);
  }
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 16px;
  min-height: 120px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
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
  gap: 16px;
  width: 100%;
}

.btn-icon {
  background: linear-gradient(
    135deg,
    rgb(from var(--btn-color) r g b / 0.5) 0%,
    rgba(0, 40, 40, 0.1) 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
  box-shadow:
    inset 0 0 10px rgba(0, 255, 255, 0.2),
    0 0 15px rgb(from var(--btn-color) r g b / 0.5);
  flex: 0 0 auto;
  font-size: 32px;
  color: var(--btn-color);
  padding: 8px;
  border: 1px solid var(--btn-color);
  border-radius: 25%;
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
  @media(min-width: 576px) {
    font-size: 18px;
  }
}

.sub-title {
  color: #ffffff88;
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

</style>
