<template>
  <div class="singleplayer-content-wrapper">
    <GameManual
      v-show="configStore.showManual"
      @close="configStore.closeManual"
    />
    <HeaderApp :show-back-btn="true" sub-title="SINGLEPLAYER MODES" />
    <main v-show="!configStore.showManual" class="singleplayer-container">
      <section class="setup-card">
        <div class="content-wrapper">
          <div class="mode-section">
            <div class="mode-buttons">
              <SelectionTile
                size="lg"
                icon-name="pixelarticons:blocks"
                :btn-function="startGravity"
                btn-text="GRAVITY"
                sub-title="Pixels dropping in from the top in Tetris style"
                btn-color="var(--neon-yellow)"
                :feature-badges="['Bottom to Top', 'Left to Right']"
                :max-players="1"
                :challengeable="true"
                :challenge-tooltip="'Challenge a friend to beat your score'"
              />
              <SelectionTile
                size="lg"
                icon-name="pixel:search"
                :btn-function="startInspect"
                btn-text="INSPECT"
                sub-title="Use your lens to spot the art in the dark"
                btn-color="var(--neon-cyan)"
                :max-players="1"
                :feature-badges="['Control the Lens', 'Touch or Mouse']"
                :challengeable="true"
                :challenge-tooltip="'Challenge a friend to beat your score'"
              />
              <SelectionTile
                size="lg"
                icon-name="pixel:hockey-mask-solid"
                :btn-function="startSurvival"
                btn-text="SURVIVAL"
                sub-title="Answer correctly to gain more time"
                btn-color="var(--neon-error)"
                :max-players="1"
                :high-score="survivalStore.highscore"
                :highscore-possible="true"
                :feature-badges="['Local Highscore', 'Time based']"
              />
              <SelectionTile
                size="lg"
                icon-name="pixel:sparkles"
                :btn-function="startClassic"
                btn-text="CLASSIC REVEAL"
                sub-title="Drawing gets revealed pixel by pixel"
                btn-color="var(--primary)"
                :feature-badges="['Random reveal', 'Default mode']"
                :max-players="1"
                :challengeable="true"
                :challenge-tooltip="'Challenge a friend to beat your score'"
              />
            </div>
          </div>
        </div>

        <!-- CHALLENGE MODE PROMO CARD -->
        <article class="info-card challenge-promo">
          <div class="card-header">
            <Icon icon="at-icons:swords" class="promo-icon" />
            <div>
              <h2>Challenge a Friend</h2>
              <p class="subtitle">1v1 Asynchronous Pixel Art Quiz Duel</p>
            </div>
          </div>
          <p class="promo-description">
            Prove who has the fastest eyes! Finish a round in <strong>Classic</strong>, <strong>Gravity</strong>, or <strong>Inspect</strong> mode and generate a unique challenge link on the game-over screen. Send it to a friend—they will guess the <em>exact same drawings</em> under identical conditions.
          </p>
          <div class="challenge-steps">
            <div class="step">
              <span class="step-num">1</span>
              <span>Play a singleplayer mode</span>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <span>Create and share your challenge link</span>
            </div>
            <div class="step">
              <span class="step-num">3</span>
              <span>Compare scores & declare the winner</span>
            </div>
          </div>
          <div class="badge-list">
            <span class="badge"><Icon icon="pixel:check" /> No registration required</span>
            <span class="badge"><Icon icon="pixel:clock" /> Link valid for 7 days</span>
          </div>
        </article>

        <!-- SEO TEXT SECTION -->
        <article class="info-card seo-section">
          <h2>Free Browser Pixel Image Guessing Game</h2>
          <p>
            Welcome to the singleplayer arena of <strong>PixReveal</strong>, a free <strong>browser guess the pixel image game</strong>. Test your visual recognition skills under time pressure, earn stars based on your speed, and climb to the top rank — <strong>no download or registration required</strong>.
          </p>
          <p>
            Choose from four unique singleplayer modes tailored to your playstyle:
          </p>
          <ul>
            <li><strong>Classic Reveal:</strong> Guess the drawing as it uncovers pixel by pixel.</li>
            <li><strong>Gravity:</strong> Identify the pixel art as blocks fall Tetris-style from top to bottom.</li>
            <li><strong>Inspect:</strong> Use a magnifying lens to explore the hidden image in the dark.</li>
            <li><strong>Survival:</strong> Answer fast to gain extra time and push for a new highscore.</li>
          </ul>
        </article>
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
import { useSurvivalStore } from "@/stores/survival";
import { useChallengeStore } from "@/stores/challenge";
import { Icon } from "@iconify/vue";

const router = useRouter();
const playerStore = usePlayerStore();
const configStore = useConfigStore();
const survivalStore = useSurvivalStore();
const challengeStore = useChallengeStore();
const { prepareGame } = useGameStore();

const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

setUser();

const startClassic = () => {
  challengeStore.clearSession();
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "classic";
  router.push("/classic");
};

const startGravity = () => {
  challengeStore.clearSession();
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "gravity";
  router.push("/gravity");
};

const startInspect = () => {
  challengeStore.clearSession();
  prepareGame(configStore.revealTime);
  playerStore.gameMode = "inspect";
  router.push("/inspect");
};

const startSurvival = () => {
  challengeStore.clearSession();
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

h2 {
  margin: 0;
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
  @media (min-width: 1024px) {
    max-width: 1000px;
  }
  box-sizing: border-box;
}

.content-wrapper {
  margin: 0;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr;
}

.mode-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px 0;
}

.mode-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  @media (min-width: 576px) {
    gap: 16px;
    grid-template-columns: 1fr 1fr;
  }
}

.info-card {
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  color: #cccccc;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;

  h2 {
    color: var(--white);
    font-size: 20px;
  }

  .subtitle {
    color: var(--primary);
    font-size: 14px;
    margin: 2px 0 0 0;
    font-weight: bold;
  }
}

.promo-icon {
  font-size: 32px;
  color: var(--primary);
}

.promo-description {
  line-height: 1.5;
  margin-bottom: 20px;

  strong {
    color: var(--white);
  }
}

.challenge-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (min-width: 650px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.step-num {
  background: var(--primary);
  color: #000000;
  font-weight: bold;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
}

.badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 13px;
  line-height: 1;
  color: #ffffffaa;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;

  svg {
    color: var(--primary);
  }
}

.seo-section {
  h2 {
    color: var(--white);
    font-size: 18px;
    margin-bottom: 8px;
  }

  p {
    line-height: 1.6;
    font-size: 14px;
    margin: 0;
  }
}

ul {
  padding-inline-start: 20px;
}
</style>