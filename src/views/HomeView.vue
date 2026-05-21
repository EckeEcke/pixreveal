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
                :max-players="1"
              />
              <SelectionTile
                icon-name="pixel:users-solid"
                :btn-function="() => goToMultiplayer('party')"
                btn-text="LOCAL PARTY MULTIPLAYER"
                sub-title="Jackbox style: control via phone"
                btn-color="var(--neon-yellow)"
                :is-shiny="true"
                :max-players="8"
              />
              <SelectionTile
                icon-name="pixel:globe-solid"
                :btn-function="() => goToMultiplayer('online')"
                btn-text="ONLINE MULTIPLAYER"
                sub-title="Play online together from anywhere"
                btn-color="var(--neon-cyan)"
                :max-players="8"
              />
              <SelectionTile
                icon-name="pixel:image-solid"
                :btn-function="openEditor"
                btn-text="SUBMIT ART"
                sub-title="Create and submit your own pixel art"
                btn-color="var(--neon-success)"
              />
            </div>
            <YoutubeEmbed video-id="YQl5jOqm2n0" />
            <TopPlayer />
          </div>
        </div>
      </section>
    </main>
    <FooterApp />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { getRandomUserName } from "@/utils/random";
import LoadingOverlay from "@/components/page-layout/LoadingOverlay.vue";
import GameManual from "@/components/modals/GameManual.vue";
import { useChannelStore } from "@/stores/channel";
import { useConfigStore } from "@/stores/config";
import FooterApp from "@/components/page-layout/FooterApp.vue";
import HeaderApp from "@/components/page-layout/HeaderApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
import TopPlayer from "@/components/game-ui/TopPlayer.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";

const router = useRouter();
const channelStore = useChannelStore();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const isFullscreen = ref(!!document.documentElement.fullscreenElement);
channelStore.playerId = playerStore.controllerId;


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

const goToMultiplayer = (mode) => {
  soundStore.playSound("click");
  router.push(mode === "party" ? "/play-party" : "/play-online");
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
  max-width: 700px;
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
  gap: 32px;
  padding: 16px 0;
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
