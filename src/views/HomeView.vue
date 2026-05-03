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
              <SelectionTile
                icon-name="pixel:user-solid"
                :btn-function="openSingleplayer"
                btn-text="SINGLEPLAYER"
                sub-title="Choose your mode and start playing"
                btn-color="var(--primary)"
              />
              <SelectionTile
                icon-name="pixel:users"
                :btn-function="() => openMultiplayerModal('party')"
                btn-text="LOCAL PARTY"
                sub-title="Local Party Multiplayer in Jackbox style"
                btn-color="var(--neon-cyan)"
              />
              <SelectionTile
                class="order-1"
                icon-name="pixel:globe"
                :btn-function="() => openMultiplayerModal('online')"
                btn-text="ONLINE MULTIPLAYER"
                sub-title="Host/join a game with your friends"
                btn-color="var(--neon-cyan)"
              />
              <SelectionTile
                icon-name="pixel:image-solid"
                :btn-function="openEditor"
                btn-text="SUBMIT ART"
                sub-title="Create and submit your own pixel art"
                btn-color="var(--neon-success)"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
    <FooterApp />
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
import LoadingOverlay from "@/components/page-layout/LoadingOverlay.vue";
import JoinModal from "@/components/modals/JoinModal.vue";
import GameManual from "@/components/modals/GameManual.vue";
import { useChannelStore } from "@/stores/channel";
import { useConfigStore } from "@/stores/config";
import FooterApp from "@/components/page-layout/FooterApp.vue";
import HeaderApp from "@/components/page-layout/HeaderApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";

const router = useRouter();
const route = useRoute();
const channelStore = useChannelStore();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const isFullscreen = ref(!!document.documentElement.fullscreenElement);
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

.order-1 {
  @media (min-width: 576px) {
    order: 1;
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
</style>
