<template>
  <div class="singleplayer-content-wrapper">
    <main class="singleplayer-container">
      <section class="setup-card">
        <SettingsButton />
        <div class="content-wrapper">
          <div class="mode-section">
            <div class="section-header">
              <h1 class="logo">Pix<span>Reveal</span></h1>
              <h2 class="hook">Choose a game mode</h2>
            </div>

            <div class="mode-buttons">
              <button class="neon-btn special" type="button" @click="startGame">
                <div class="glow-layer"></div>
                <div class="btn-content">
                  <Icon icon="pixel:user-solid" class="btn-icon" />
                  <div class="text-wrapper">
                    <span class="btn-text">CLASSIC</span>
                    <span class="sub-title"
                      >Drawing gets revealed pixel by pixel</span
                    >
                  </div>
                </div>
              </button>

              <button
                class="neon-btn special"
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
                class="neon-btn special"
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
                class="neon-btn special"
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
                class="neon-btn special"
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

const router = useRouter();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const { prepareGame } = useGameStore();

// Mirror HomeView behavior so singleplayer starts with a valid user.
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
  margin: 0;
  font-size: 24px;
  @media (max-width: 360px) {
    font-size: 18px;
  }
}

.singleplayer-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  width: 100%;
}

.singleplayer-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0 16px;
}

.setup-card {
  position: relative;
  background: radial-gradient(
    circle at center,
    rgba(168, 85, 247, 0.12) 0%,
    rgba(40, 10, 60, 0.5) 60%,
    rgba(15, 5, 25, 0.9) 100%
  );
  background-color: var(--card-bg);
  border: 2px solid #334155;
  padding: 0 32px 32px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.content-wrapper {
  margin: 0 -32px -32px;
  display: grid;
  grid-template-columns: 1fr;
  border-top: 2px solid #33415522;
}

@media (min-width: 1024px) {
  .setup-card {
    max-width: 800px;
  }
}

.mode-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 32px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  h2 {
    color: var(--white);
    text-align: center;
    font-size: 18px;
  }
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 575px) {
  .mode-buttons {
    grid-template-columns: 1fr 1fr;
  }
}

.neon-btn {
  position: relative;
  background: #1a1a1e;
  --btn-color: var(--neon-cyan);
  border: 2px solid var(--btn-color);
  border-radius: 8px;
  padding: 20px;
  min-height: 100px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

.neon-btn.special {
  --btn-color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
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

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  color: var(--white);
  cursor: pointer;
  padding: 0;
  font-family: var(--font-display);
  font-size: 12px;
  opacity: 0.85;
  transition: all 0.2s ease;
}

.back-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
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
