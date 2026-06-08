<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">THE ULTIMATE PIXEL GUESSR</span>
        <br />
        FAST-PACED MULTIPLAYER PIXEL ART QUIZ
      </h1>

      <YoutubeEmbed video-id="YQl5jOqm2n0" />

      <p class="party-desc">
        Welcome to PixReveal, the ultimate
        <strong>multiplayer pixel guesser</strong>
        game designed for quick-witted players. If you love a fast-paced
        <strong>pixel art quiz</strong> where an image unveils pixel by pixel,
        you are in the right place. Challenge your friends or coworkers in a
        competitive <strong>pixel guessing game</strong> directly in your
        browser — no login or app required.
      </p>

      <p class="party-desc">
        How fast can you spot the hidden picture? As the blocks appear, the rush
        is on! Hit the buzzer on your phone to lock in your answer. Score points
        for a correct guess, but watch out: wrong answers will cost you.
        Outsmart your rivals by dropping chaotic power-ups to block their screen
        and secure your title as the ultimate
        <strong>Pixel Guessr</strong> Champion.
      </p>

      <div class="cta-container">
        <ButtonLinkPrimary link="/play-party?role=host">
          HOST A FREE GAME
        </ButtonLinkPrimary>
        <ButtonLinkSecondary link="/play-party?role=join">
          JOIN WITH ROOM ID
        </ButtonLinkSecondary>
      </div>
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
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

.link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--color-secondary);
}
</style>
