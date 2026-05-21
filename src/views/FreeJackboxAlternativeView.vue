<template>
  <main class="page">
    <div class="setup-card card">
      <span class="pre-headline">FREE JACKBOX ALTERNATIVE</span>
      <h1>LOCAL PARTY MULTIPLAYER</h1>

      <p class="party-desc">
        PixReveal provides you with a free party game alternative to classic
        Jackbox games. Play right in your browser. No login or app needed. Host
        on the big screen, play via phones. Watch the pixel art unveil. Think
        you know it? Hit the buzz on your phone and answer. Correct answer gets
        you 1 point. Wrong answer costs you -2 points. Use powerups to sabotage
        your friends and win the party!
      </p>

      <div class="cta-container">
        <router-link to="/play-party?role=host" class="btn-cta host">
          HOST A FREE GAME
        </router-link>
        <router-link to="/play-party?role=join" class="btn-cta join">
          JOIN WITH ROOM ID
        </router-link>
      </div>
      <PartyHowTo />
    </div>
  </main>
</template>

<script setup lang="ts">
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
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
  animation: shine 4s infinite;
  pointer-events: none;
}

.pre-headline {
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
  @media (min-width: 576px) {
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
