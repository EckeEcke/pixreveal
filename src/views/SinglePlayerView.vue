<template>
  <div class="singleplayer-content-wrapper">
    <GameManual
      v-show="configStore.showManual"
      @close="configStore.closeManual"
    />
    <HeaderApp :show-back-btn="true" sub-title="SINGLEPLAYER MODES" />
    <main v-show="!configStore.showManual" class="singleplayer-container">
      <section class="setup-card">
        <details class="settings-disclosure">
          <summary class="settings-summary">
            <Icon icon="pixel:cog" class="settings-icon" aria-hidden="true" />
            <span class="settings-values">
              <span>{{ drawingMixLabel }}</span>
              <span>{{ configStore.maxRounds }} rounds</span>
              <span>{{ configStore.revealTime }} sec</span>
              <span v-if="configStore.includeUgc">User art</span>
            </span>
            <span class="settings-action">Settings</span>
            <Icon icon="pixelarticons:chevron-down" class="settings-chevron" aria-hidden="true" />
          </summary>
          <div class="settings-options">
            <GameSettingsPanel />
          </div>
        </details>
        <div class="content-wrapper">
          <div class="mode-section">
            <div class="mode-buttons">
              <SelectionTile
                size="lg"
                icon-name="pixelarticons:blocks"
                :btn-function="startGravity"
                btn-text="GRAVITY"
                sub-title="Pixels dropping in from the top in Tetris style"
                btn-color="var(--neon-mint)"
                :feature-badges="['Bottom to Top', 'Left to Right']"
                :max-players="1"
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
              />
            </div>
          </div>
        </div>

        <div class="card-grid">
          <!-- SEO TEXT SECTION -->
          <article class="info-card seo-section">
            <h2>Free Browser Pixel Image Guessing Game</h2>
            <p>
              Welcome to the singleplayer modes of <strong>PixReveal</strong>, a free <strong>browser guess the pixel image game</strong>. Test your visual recognition skills under time pressure, earn stars based on your speed, and climb to the top rank — <strong>no download or registration required</strong>.
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
        </div>
      </section>
    </main>
    <FooterApp />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useConfigStore } from "@/stores/config";
import FooterApp from "@/components/page-layout/FooterApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
import GameManual from "@/components/modals/GameManual.vue";
import HeaderApp from "@/components/page-layout/HeaderApp.vue";
import GameSettingsPanel from "@/components/page-ui/GameSettingsPanel.vue";
import { useSurvivalStore } from "@/stores/survival";
import { useSingleplayerStart } from "@/composables/useSingleplayerStart";
import { Icon } from "@iconify/vue";

const configStore = useConfigStore();
const survivalStore = useSurvivalStore();
const { startSingleplayer } = useSingleplayerStart();
const drawingMixLabel = computed(() => ({
  general: "General",
  all: "Mixed",
  nerdy: "Nerdy",
}[configStore.activePreset] || "Custom"));

const startClassic = () => startSingleplayer("classic");
const startGravity = () => startSingleplayer("gravity");
const startInspect = () => startSingleplayer("inspect");
const startSurvival = () => startSingleplayer("survival");
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

.settings-disclosure {
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.settings-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 8px 16px;
  box-sizing: border-box;
  cursor: pointer;
  list-style: none;
  color: var(--color-secondary);
  font-size: 13px;
}

.settings-summary::-webkit-details-marker {
  display: none;
}

.settings-summary:hover {
  background: rgba(255, 255, 255, 0.04);
}

.settings-summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -3px;
}

.settings-icon {
  flex: 0 0 auto;
  font-size: 20px;
  color: var(--primary);
}

.settings-values {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  flex: 1;
}

.settings-values span {
  white-space: nowrap;
}

.settings-values span + span::before {
  content: "\00b7";
  margin-right: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.settings-action {
  font-weight: 600;
  color: var(--white);
}

.settings-chevron {
  flex: 0 0 auto;
  transition: transform 0.15s ease;
}

.settings-disclosure[open] .settings-chevron {
  transform: rotate(180deg);
}

.settings-options {
  padding: 20px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (min-width: 700px) {
  .settings-options :deep(.game-settings-panel) {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 380px) {
  .settings-summary {
    gap: 8px;
    padding-inline: 12px;
    font-size: 12px;
  }

  .settings-action {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
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
  padding-top: 16px;
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

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-card {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(168, 85, 247, 0.12),
    transparent 50%
  ),
  linear-gradient(
    135deg,
    rgba(32, 16, 46, 0.95),
    rgba(18, 9, 28, 0.98)
  );
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

.seo-section {
  h2 {
    color: var(--white);
    font-size: 18px;
    margin-bottom: 16px;
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
