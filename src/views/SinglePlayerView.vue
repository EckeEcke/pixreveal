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
              <button class="neon-btn" type="button" @click="startGame">
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:sparkles" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">CLASSIC REVEAL</span>
                    <span class="sub-title"
                      >Drawing gets revealed pixel by pixel</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn gravity"
                type="button"
                @click="startGravity"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixelarticons:blocks" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">GRAVITY</span>
                    <span class="sub-title"
                      >Pixels dropping in from the top in Tetris style</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn inspect"
                type="button"
                @click="startInspect"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:search" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">INSPECT</span>
                    <span class="sub-title"
                      >Use your lens to spot the hidden art</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn survival"
                type="button"
                @click="startSurvival"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:hockey-mask-solid" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">SURVIVAL</span>
                    <span class="sub-title"
                      >Answer correctly to gain more time</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn buzzer"
                type="button"
                @click="startBuzzer"
              >
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:question" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">BUZZER</span>
                    <span class="sub-title"
                      >Hit the buzzer to see answer options</span
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
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { usePlayerStore } from "@/stores/player";
import { useGameStore } from "@/stores/game";
import { useConfigStore } from "@/stores/config";
import { getRandomUserName } from "@/utils/random";
import SettingsButton from "@/components/SettingsButton.vue";
import FooterApp from "@/components/FooterApp.vue";
import GameManual from "@/components/GameManual.vue";
import HeaderApp from "@/components/HeaderApp.vue";

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

const goHome = () => router.push("/");
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

.neon-btn {
  --btn-color: var(--primary);
  &.gravity {
    --btn-color: var(--neon-success);
  }
  &.buzzer {
    --btn-color: var(--neon-pink);
  }
  &.inspect {
    --btn-color: var(--neon-cyan);
  }
  &.survival {
    --btn-color: var(--neon-error);
  }
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 16px;
  min-height: 100px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
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
  padding: 8px;
  border: 1px solid var(--btn-color);
  border-radius: 25%;
  flex: 0 0 auto;
  font-size: 28px;
  color: var(--btn-color);
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

@media (max-width: 480px) {
  .btn-icon {
    font-size: 32px;
  }
}
</style>
