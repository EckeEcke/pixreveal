<template>
  <div class="singleplayer-content-wrapper">
    <GameManual
      v-show="configStore.showManual"
      @close="configStore.closeManual"
    />
    <HeaderApp :show-back-btn="true" />
    <main v-show="!configStore.showManual" class="singleplayer-container">
      <section class="setup-card">
        <div class="content-wrapper">
          <div class="mode-section">
            <div class="mode-buttons">
              <SelectionTile
                icon-name="pixelarticons:blocks"
                :btn-function="startGravity"
                btn-text="GRAVITY"
                sub-title="Pixels dropping in from the top in Tetris style"
                btn-color="var(--neon-yellow)"
              />
              <SelectionTile
                icon-name="pixel:search"
                :btn-function="startInspect"
                btn-text="INSPECT"
                sub-title="Use your lens to spot the hidden art"
                btn-color="var(--neon-cyan)"
              />
              <SelectionTile
                icon-name="pixel:question"
                :btn-function="startBlur"
                btn-text="BLUR"
                sub-title="Guess the image as it unblurs"
                btn-color="var(--neon-pink)"
              />
              <SelectionTile
                icon-name="pixel:hockey-mask-solid"
                :btn-function="startSurvival"
                btn-text="SURVIVAL"
                sub-title="Answer correctly to gain more time"
                btn-color="var(--neon-error)"
                :high-score="survivalStore.highscore"
              />
            </div>
            <h2>Popular</h2>
            <div class="mode-buttons">
            <SelectionTile
                icon-name="pixel:sparkles"
                :btn-function="startClassic"
                btn-text="CLASSIC REVEAL"
                sub-title="Drawing gets revealed pixel by pixel"
                btn-color="var(--primary)"
              />
              <SelectionTile
                data-sfx="click"
                :icon-name="
                  dailyStore.hasPlayedToday
                    ? 'pixel:numbered-list-solid'
                    : 'pixel:trophy-solid'
                "
                :btn-function="startDaily"
                btn-text="DAILY CHALLENGE"
                :sub-title="
                  dailyStore.hasPlayedToday
                    ? 'Check today\'s results'
                    : 'Play today\'s challenge, climb the leaderboard'
                "
                btn-color="var(--neon-success)"
                :loading="dailyStore.isLoading"
                :is-shiny="
                  true && !dailyStore.isLoading && !dailyStore.hasPlayedToday
                "
                :corner-text="timeLeft"
                :is-new="!dailyStore.hasPlayedToday"
              />
            </div>
          </div>
        </div>
        <TopPlayer />
      </section>
    </main>
    <FooterApp />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { useDailyStore } from "@/stores/daily";
import { getRandomUserName } from "@/utils/random";
import FooterApp from "@/components/page-layout/FooterApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
import GameManual from "@/components/modals/GameManual.vue";
import HeaderApp from "@/components/page-layout/HeaderApp.vue";
import TopPlayer from "@/components/game-ui/TopPlayer.vue";
import { useSurvivalStore } from "@/stores/survival";
import { useDailyCountDown } from "@/composables/useDailyCountDown";

const router = useRouter();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const dailyStore = useDailyStore();
const survivalStore = useSurvivalStore();
const { prepareGame } = useGameStore();

const { timeLeft } = useDailyCountDown();


const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

setUser();

const startClassic = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  router.push("/classic");
};

const startGravity = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "gravity";
  router.push("/gravity");
};

const startBlur = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "blur";
  router.push("/blur");
};

const startInspect = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "inspect";
  router.push("/inspect");
};

const startSurvival = () => {
  playerStore.gameMode = "survival";
  router.push("/survival");
};

const startDaily = () => {
  prepareGame(10, dailyStore.dailyRounds);
  playerStore.gameMode = dailyStore.mode;
  if (dailyStore.hasPlayedToday) {
    router.push("/rankings-daily");
  } else {
    router.push("/daily");
  }
};

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
  margin: 32px auto 16px;
  text-transform: uppercase;
}

.singleplayer-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 95vh;
  width: 100%;
}

.singleplayer-container {
  display: flex;
  justify-content: center;
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
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: 1fr;
}

.mode-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px 0;
  h2 {
    color: var(--white);
    text-align: center;
    font-size: 20px;
  }
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  @media (min-width: 576px) {
    gap: 16px;
  }
}

@media (min-width: 575px) {
  .mode-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
