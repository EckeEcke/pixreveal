<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">THE ULTIMATE PIXEL GUESSING GAME</span> <br />
        FAST-PACED MULTIPLAYER PIXEL ART QUIZ
      </h1>
      <div class="hero">
        <img class="party-image" src="/assets/images/image-partymode.webp" alt="group of people playing PixReveal">

        <div>
          <p class="hero-desc">
            PixReveal is the ultimate free <strong>pixel guess</strong> game for
            quick-witted players who love a fast-paced <strong>pixel art quiz</strong>.
          </p>
          <p class="hero-desc">
            Hit the buzzer on your phone to answer and drop chaotic powerups to sabotage your friends.
          </p>
          <div class="cta-container">
            <ButtonLinkPrimary link="/play-party?role=host">
              HOST A FREE GAME
            </ButtonLinkPrimary>
            <ButtonLinkSecondary link="/">
              DISCOVER MORE
            </ButtonLinkSecondary>
          </div>
          <div class="feature-badges">
            <span class="badge">2–10 players</span> <span class="badge">No download</span>
            <span class="badge">No login</span> <span class="badge">Phone controllers</span>
          </div>
        </div>
      </div>

      <YoutubeEmbed video-id="YQl5jOqm2n0" thumbnail-url="/assets/images/trailer-preview.webp" />

      <div class="two-columns">
        <PartyHowTo />
        <PowerUpInfo class="powerups" />
      </div>

      <div class="two-columns">
        <section class="seo-section">
          <h2>How does this Pixel Guess Game work?</h2>
          <p class="party-desc">
            How fast can you spot the hidden picture? As the blocks appear pixel by
            pixel, the rush is on. Challenge your friends or coworkers in a competitive
            <strong>pixel guessing game</strong> directly in your browser — no login or
            app required.
          </p>
          <p class="party-desc">
            Score points for a correct guess, but watch out: wrong answers will cost
            you. Outsmart your rivals and secure your title as the ultimate
            <strong>Pixel Guess</strong> Champion.
          </p>
        </section>
        <FAQComponent :items="pixelGuessFaqs" />
      </div>

      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import PowerUpInfo from "@/components/game-ui/PowerUpInfo.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const pixelGuessFaqs = [
  {
    question: "How does the pixel reveal mechanic work?",
    answer:
      "Drawings reveal themselves pixel by pixel depending on the mode you play. In Classic mode, the pixels pop up randomly across the canvas. In Gravity mode, they drop down from the top in a Tetris-style animation.",
  },
  {
    question: "What is the main objective and how do you score?",
    answer:
      "The goal is to recognize the drawing as quickly as possible and guess the correct answer before the timer runs out. Your score depends entirely on your speed—the faster you submit the correct answer, the more points you get.",
  },
  {
    question: "Can I play this pixel guess game solo or with friends?",
    answer:
      "You can play solo in singleplayer mode to chase high scores, or play with friends. There is no random matchmaking with strangers. For multiplayer, you can either host a local party game Jackbox-style using smartphones as controllers, or invite friends to a private online lobby where everyone plays on their own screen.",
  },
  {
    question: "Is there a registration or account system for the leaderboard?",
    answer:
      "No, a registration system does not exist. You can jump straight into the game, play all modes, and submit your final scores to the global leaderboard instantly without ever needing an account.",
  },
];
</script>

<style scoped>
h1 {
  font-family: inherit;
  text-align: left;
  line-height: 1.1;
}
.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
}
.pre-headline {
  font-size: 14px;
  color: var(--primary);
  letter-spacing: 0.08em;
}
.hero-desc {
  margin: 0 0 16px;
  line-height: 1.5;
  font-size: 1.02rem;
}
h2 {
  margin-bottom: 20px;
}
.cta-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 24px 0 16px;
  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr;
  }
}
.feature-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 24px 0 32px;
}
.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.85rem;
  color: var(--white);
}
.party-desc {
  margin: 16px 0;
  line-height: 1.6;
}
.link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--color-secondary);
}

.party-image {
  width: 100%;
  border-radius: 8px;
}

.hero, .two-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.two-columns {
    margin: 32px 0;
}
</style>