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
                :btn-function="startClassic"
                data-sfx="click"
                icon-name="pixel:play-solid"
                btn-text="PLAY NOW"
                sub-title="Classic mode: guess what it is as the drawing is revealed"
                btn-color="var(--primary)"
                :max-players="1"
              />

              <SelectionTile
                data-sfx="click"
                :icon-name="
                  dailyStore.hasPlayedToday
                    ? 'pixel:numbered-list-solid'
                    : 'pixel:trophy-solid'
                "
                :max-players="!dailyStore.hasPlayedToday ? 1 : undefined"
                :btn-function="startDaily"
                btn-text="DAILY CHALLENGE"
                :sub-title="
                  dailyStore.hasPlayedToday
                    ? 'Check today\'s leaderboard'
                    : 'Play today\'s challenge, climb the leaderboard'
                "
                btn-color="var(--neon-social)"
                :loading="dailyStore.isLoading"
                :corner-text="timeLeft"
                :is-new="!dailyStore.hasPlayedToday"
              />

              <router-link to="/play-party" data-sfx="click" class="tile-link">
                <SelectionTile
                  icon-name="pixel:users-solid"
                  btn-text="PARTY MULTIPLAYER"
                  sub-title="Local party fun — Jackbox style, phone controls, powerups"
                  btn-color="var(--neon-yellow)"
                  :is-shiny="true"
                  :max-players="10"
                />
              </router-link>

              <router-link to="/play-online" data-sfx="click" class="tile-link">
                <SelectionTile
                  icon-name="pixel:globe-solid"
                  btn-text="ONLINE MULTIPLAYER"
                  sub-title="Play online together from anywhere"
                  btn-color="var(--neon-cyan)"
                  :max-players="10"
                />
              </router-link>
            </div>
            <DailyWinner v-if="dailyStore.isYesterdayWinner" />
            <YoutubeEmbed video-id="YQl5jOqm2n0" />
            <div class="classic-mode-buttons">
              <router-link
                to="/singleplayer"
                data-sfx="click"
                class="tile-link"
              >
                <SelectionTile
                  icon-name="pixel:user-solid"
                  btn-text="MORE MODES"
                  sub-title="Play Blur, Gravity, Inspect or Survival"
                  btn-color="var(--neon-blue)"
                  :max-players="1"
                />
              </router-link>
              <router-link to="/editor" data-sfx="click" class="tile-link">
                <SelectionTile
                  icon-name="pixel:image-solid"
                  btn-text="PIXEL ART EDITOR"
                  sub-title="Create your own drawing and submit it to PixReveal"
                  btn-color="var(--neon-pink)"
                />
              </router-link>
            </div>
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
import { usePlayerStore } from "@/stores/player";
import { getRandomUserName } from "@/utils/random";
import LoadingOverlay from "@/components/page-layout/LoadingOverlay.vue";
import GameManual from "@/components/modals/GameManual.vue";
import { useChannelStore } from "@/stores/channel";
import { useConfigStore } from "@/stores/config";
import { useGameStore } from "@/stores/game";
import FooterApp from "@/components/page-layout/FooterApp.vue";
import HeaderApp from "@/components/page-layout/HeaderApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
import TopPlayer from "@/components/game-ui/TopPlayer.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import DailyWinner from "@/components/game-ui/DailyWinner.vue";
import { useDailyStore } from "@/stores/daily";
import { useRouter } from "vue-router";
import { useDailyCountDown } from "@/composables/useDailyCountDown";

const channelStore = useChannelStore();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const dailyStore = useDailyStore();
const isFullscreen = ref(!!document.documentElement.fullscreenElement);
channelStore.playerId = playerStore.controllerId;
const { prepareGame } = useGameStore();
const { timeLeft } = useDailyCountDown();

const router = useRouter();

const startDaily = () => {
  prepareGame(10, dailyStore.dailyRounds);
  playerStore.gameMode = dailyStore.mode;
  if (dailyStore.hasPlayedToday) {
    router.push("/rankings-daily");
  } else {
    router.push("/daily");
  }
};

const startClassic = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  router.push("/classic");
};

const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

setUser();

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

.tile-link {
  text-decoration: none;
}

.tile-link button {
  width: 100%;
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
