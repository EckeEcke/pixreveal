<template>
  <section class="how-it-works" :class="{ 'how-it-works--compact': compact }" aria-label="Three steps to play">
    <div class="steps-grid">
      <!-- Step 1 -->
      <div class="step-card">
        <div class="video-container">
          <video autoplay loop muted playsinline aria-label="Pixel art being revealed">
            <source src="/assets/videos/classic-demo.webm" type="video/webm" />
            <source src="/assets/videos/classic-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <h3 class="step"><span class="step-num">1</span> Check the art</h3>
        <p>
          Observe the pixel artwork as it gradually uncovers block by block.
        </p>
      </div>

      <div class="step-divider" aria-hidden="true">
        <Icon icon="pixel:arrow-down-solid" class="arrow-down" />
        <Icon icon="pixel:arrow-right-solid" class="arrow-right" />
      </div>

      <!-- Step 2 -->
      <div class="step-card">
        <div class="video-container">
          <video autoplay loop muted playsinline aria-label="Choosing an answer">
            <source src="/assets/videos/answer-demo.webm" type="video/webm" />
            <source src="/assets/videos/answer-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <h3 class="step"><span class="step-num">2</span> Make a guess</h3>
        <p>
          Select an answer before time runs out. In Party Mode, buzz in first.
        </p>
      </div>

      <div class="step-divider" aria-hidden="true">
        <Icon icon="pixel:arrow-down-solid" class="arrow-down" />
        <Icon icon="pixel:arrow-right-solid" class="arrow-right" />
      </div>

      <!-- Step 3 -->
      <div class="step-card">
        <div class="video-container">
          <video autoplay loop muted playsinline aria-label="End of game scores">
            <source src="/assets/videos/gameover-demo.webm" type="video/webm" />
            <source src="/assets/videos/gameover-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <h3 class="step"><span class="step-num">3</span> Gain points</h3>
        <p>Earn stars, top the leaderboard, and outsmart your friends.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

defineProps<{ compact?: boolean }>()
</script>

<style scoped>
.how-it-works {
  width: 100%;
  max-width: 1100px;
  text-align: center;
}

.section-title {
  font-size: 32px;
  font-weight: 900;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 32px;
  letter-spacing: 1px;
}

.steps-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

@media (min-width: 768px) {
  .steps-grid {
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
  }
}

.step-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
}

.step-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.95);
  font-size: 24px;
  margin: 4px 0;
}

.arrow-down {
  display: block;
}

.arrow-right {
  display: none;
}

@media (min-width: 768px) {
  .step-divider {
    margin: 0 4px;
  }
  
  .arrow-down {
    display: none;
  }

  .arrow-right {
    display: block;
  }
}

.video-container {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1 / 1;
  background: #000000;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.step-card p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
  margin: 0 auto;
  max-width: 280px;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  line-height: 1;
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
  font-size: 16px;
  line-height: 1;
}

.how-it-works--compact .steps-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.how-it-works--compact .step-divider {
  display: none;
}

.how-it-works--compact .step-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 6px 12px;
  max-width: none;
  padding: 12px;
  box-shadow: none;
}

.how-it-works--compact .video-container {
  grid-row: span 2;
  max-width: none;
  border-radius: 4px;
}

.how-it-works--compact .step {
  margin: 0;
  gap: 6px;
  font-size: 14px;
  line-height: 1.3;
}

.how-it-works--compact .step-num {
  width: 18px;
  height: 18px;
  font-size: 12px;
}

.how-it-works--compact .step-card p {
  margin: 0;
  max-width: none;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 359px) {
  .how-it-works--compact .step-card {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 6px 10px;
    padding: 10px;
  }
}

@media (min-width: 1024px) {
  .how-it-works--compact .steps-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 16px;
  }

  .how-it-works--compact .step-card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto 1fr;
    align-content: start;
    align-items: start;
    gap: 12px;
    padding: 16px;
  }

  .how-it-works--compact .video-container {
    grid-row: auto;
    max-width: 140px;
  }
}
</style>
