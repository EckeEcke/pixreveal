<template>
  <div class="home-content-wrapper">
    <HeaderApp :twitch-live="isTwitchLive" />
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
                size="lg"
                :btn-function="startClassic"
                data-sfx="click"
                icon-name="pixel:play-solid"
                btn-text="PLAY NOW"
                sub-title="Guess what it is as the drawing is revealed"
                btn-color="var(--primary)"
                :max-players="1"
                :feature-badges="['~1 min per round', '5 random drawings']"
              />
                          <router-link to="/play-party" data-sfx="click" class="tile-link">
                            <SelectionTile
                              size="lg"
                              icon-name="pixel:users-solid"
                              btn-text="PARTY MULTIPLAYER"
                              sub-title="Jackbox style party game for your group"
                              btn-color="var(--neon-yellow)"
                              :is-shiny="true"
                              :max-players="10"
                              :feature-badges="['No app needed', 'Phones as controllers']"
                            />
                          </router-link>
              
            </div>
            <div class="trailer-bento">
              <YoutubeEmbed video-id="YQl5jOqm2n0" thumbnail-url="/assets/images/trailer-preview.webp" />
              <div class="tiles-column">
                <SelectionTile
                    data-sfx="click"
                    :icon-name="
                      dailyStore.hasPlayedToday
                        ? 'pixel:numbered-list-solid'
                        : 'pixel:star-solid'
                    "
                    :max-players="!dailyStore.hasPlayedToday ? 1 : undefined"
                    :btn-function="startDaily"
                    btn-text="DAILY CHALLENGE"
                    :sub-title="
                      dailyStore.hasPlayedToday
                        ? 'Check today\'s leaderboard'
                        : 'Compete for the top position on the global leaderboard'
                    "
                    btn-color="var(--neon-orange)"
                    :loading="dailyStore.isLoading"
                    :corner-text="timeLeft"
                    :is-new="!dailyStore.hasPlayedToday"
                  />

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
            </div>
            <div class="trailer-bento">
              <div class="bento-card">
                <TopPlayer />
                <QuickLinks />
              </div>

              <div class="tiles-column">
                <router-link
                  to="/singleplayer"
                  data-sfx="click"
                  class="tile-link"
                >
                  <SelectionTile
                    icon-name="pixel:user-solid"
                    btn-text="MORE MODES"
                    sub-title="More ways to reveal. Gravity, Inspect, Classic & Survival"
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
            </div>
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
import StepsComponent from "@/components/page-ui/StepsComponent.vue";
import QuickLinks from "@/components/page-ui/QuickLinks.vue";
import { useDailyStore } from "@/stores/daily";
import { useRouter } from "vue-router";
import { useDailyCountDown } from "@/composables/useDailyCountDown";

const channelStore = useChannelStore();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const dailyStore = useDailyStore();
const isFullscreen = ref(!!document.documentElement.fullscreenElement);
channelStore.playerId = playerStore.controllerId;
const { prepareGame, createRounds, resetAndStartGame } = useGameStore();
const { timeLeft } = useDailyCountDown();
const isTwitchLive = ref(false);

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
  resetAndStartGame(createRounds(5));
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

onMounted(() => {
  document.addEventListener("fullscreenchange", updateFullscreenStatus);
  fetch("/api/twitch-live")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      isTwitchLive.value = data?.live === true;
    })
    .catch(() => {
      isTwitchLive.value = false;
    });
});

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
}

.setup-card {
  position: relative;
  width: 100%;
  max-width: 700px;
  h2 {
    color: var(--white);
  }
  box-sizing: border-box;
  @media (min-width: 1024px) {
    max-width: 1000px;
  }
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
  gap: 16px;
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

@media (min-width: 800px) {
  .classic-mode-buttons {
    grid-template-columns: 1fr 1fr;
  }
}

.trailer-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  .video-wrapper {
    order: 3;
  }
  @media (min-width: 1024px) {
    grid-template-columns: 600px 1fr;
    .video-wrapper {
      order: 0;
    }
  }
}

.bento-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  padding: 24px;
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.35);   
}

.tiles-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
   @media (min-width: 1024px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
}
</style>
