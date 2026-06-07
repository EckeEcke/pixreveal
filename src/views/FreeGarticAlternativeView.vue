<template>
  <main class="page">
    <div class="setup-card card">
      <h1>
        <span class="pre-headline">GAMES LIKE SKRIBBL.IO & GARTIC PHONE</span>
        <br />
        FREE MULTIPLAYER PIXEL GUESSING QUIZ
      </h1>

      <YoutubeEmbed video-id="YQl5jOqm2n0" />

      <p class="party-desc">
        Love multiplayer drawing games but tired of terrible mouse doodles?
        PixReveal is the ultimate free alternative to Skribbl.io and Gartic
        Phone, designed for players who want to focus purely on the hype of
        guessing. If you are looking for a fast-paced
        <strong>multiplayer pixel quiz</strong>
        where zero drawing skills are required, you can play right in your
        browser with no login or app needed.
      </p>

      <p class="party-desc">
        Instead of forcing your friends to sketch with a clunky touchscreen or
        mouse, PixReveal features beautiful, pre-made pixel art that reveals
        itself piece by piece. It brings back the nostalgic thrill of a classic
        <strong>pixel guessing game</strong>. Host the game on a big screen, use
        your phones as controllers, hit the buzzer, and guess! Sabotage your
        friends with chaotic power-ups to take the win.
      </p>

      <div class="cta-container">
        <router-link to="/play-party?role=host" class="btn-cta host">
          HOST A FREE GAME
        </router-link>
        <router-link to="/play-party?role=join" class="btn-cta join">
          JOIN WITH ROOM ID
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from '@/components/page-ui/YoutubeEmbed.vue';
</script>

<style scoped>
h1 {
  font-family: inherit;
  text-align: left;
}

.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
}

.card {
  width: 100%;
  max-width: 600px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  background: var(--card-bg);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  padding: 32px;
  box-sizing: border-box;
}

.card::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -60%;
  width: 30%;
  height: 300%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
  animation: shine 4s forwards;
  pointer-events: none;
}

.pre-headline {
  font-size: 16px;
  color: var(--primary);
}

h2 {
  margin-top: 0;
  margin-bottom: 32px;
}

.cta-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}

@media (min-width: 576px) {
  .cta-container {
    grid-template-columns: 1fr 1fr;
  }
}

.btn-cta {
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  transition: transform 0.1s;
}

.btn-cta:active {
  transform: scale(0.98);
}

.btn-cta.host {
  background: var(--primary);
  color: #fff;
}

.btn-cta.join {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.party-desc {
  margin: 32px 0;
  line-height: 1.5;
}
</style>
