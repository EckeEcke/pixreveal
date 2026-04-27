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
            <div class="section-header">
              <h2>Choose a game mode</h2>
            </div>

            <div class="mode-buttons">
            <SelectionTile
                icon-name="pixel:sparkles"
                :btn-function="startGame"
                btn-text="CLASSIC REVEAL"
                sub-title="Drawing gets revealed pixel by pixel"
                btn-color="var(--primary)"
              />
              <SelectionTile
                icon-name="pixelarticons:blocks"
                :btn-function="startGravity"
                btn-text="GRAVITY"
                sub-title="Pixels dropping in from the top in Tetris style"
                btn-color="var(--neon-success)"
              />
              <SelectionTile
                icon-name="pixel:search"
                :btn-function="startInspect"
                btn-text="INSPECT"
                sub-title="Use your lens to spot the hidden art"
                btn-color="var(--neon-cyan)"
              />
              <SelectionTile
                icon-name="pixel:hockey-mask-solid"
                :btn-function="startSurvival"
                btn-text="SURVIVAL"
                sub-title="Answer correctly to gain more time"
                btn-color="var(--neon-error)"
              />
              <SelectionTile
                icon-name="pixel:question"
                :btn-function="startBuzzer"
                btn-text="BUZZER"
                sub-title="Hit the buzzer to see answer options"
                btn-color="var(--neon-pink)"
              />
            </div>
          </div>
        </div>
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
import { getRandomUserName } from "@/utils/random";
import FooterApp from "@/components/page-layout/FooterApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
import GameManual from "@/components/modals/GameManual.vue";
import HeaderApp from "@/components/page-layout/HeaderApp.vue";

const router = useRouter();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const { prepareGame } = useGameStore();

const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

setUser();

const startGame = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  router.push("/game");
};

const startGravity = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "gravity";
  router.push("/gravity");
};

const startBuzzer = () => {
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  router.push("/buzzer");
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

</script>

<style scoped>
h1 {
  margin-bottom: 0;
  font-size: 24px;
  @media (max-width: 360px) {
    font-size: 18px;
  }
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

.mode-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px 0;
  @media (min-width: 575px) {
    padding: 32px;
  }
  h2 {
    color: var(--white);
    text-align: center;
    font-size: 24px;
    margin-top: 0;
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
