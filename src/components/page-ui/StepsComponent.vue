<template>
  <section class="how-it-works">
    <h2 class="section-title">How It Works</h2>

    <div class="steps-grid">
      <!-- Step 1 -->
      <div class="step-card">
        <div class="video-container">
          <video autoplay loop muted playsinline>
            <source src="/assets/videos/classic-demo.webm" type="video/webm" />
            <source src="/assets/videos/classic-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <h3>1. Check the art</h3>
        <p>
          Observe the pixel artwork as it gradually uncovers block by block.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="step-card">
        <div class="video-container">
          <video autoplay loop muted playsinline>
            <source src="/assets/videos/answer-demo.webm" type="video/webm" />
            <source src="/assets/videos/answer-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <h3>2. Make your guess</h3>
        <p>
          Hit the buzzer and select the correct answer before time runs out!
        </p>
      </div>

      <!-- Step 3 -->
      <div class="step-card">
        <div class="video-container">
          <video autoplay loop muted playsinline>
            <source src="/assets/videos/gameover-demo.webm" type="video/webm" />
            <source src="/assets/videos/gameover-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <h3>3. Gain points</h3>
        <p>Earn stars, top the leaderboard, and outsmart your friends.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-it-works {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: stretch;
}

@media (min-width: 768px) {
  .steps-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step-card {
  background: rgba(15, 12, 29, 0.75);
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
}

.step-card:hover {
  transform: translateY(-4px);
  border-color: var(--neon-pink);
}

.video-container {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1 / 1;
  background: #000000;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto 16px auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.step-card h3 {
  display: block;
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  margin: 0 auto 8px;
  line-height: 1.3;
  width: 100%;
  max-width: 280px;
}

.step-card p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
  margin: 0 auto;
  max-width: 280px;
}
</style>
