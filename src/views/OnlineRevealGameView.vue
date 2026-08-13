<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">ONLINE PICTURE REVEAL GAME</span>
        <br />
        FAST-PACED PROGRESSIVE IMAGE REVEAL QUIZ
      </h1>
      <YoutubeEmbed video-id="YQl5jOqm2n0" />
      <p class="hero-desc">
        PixReveal is a free <strong>picture reveal game</strong> where images
        progressively unfold pixel by pixel, testing your reflexes and brainpower.
      </p>
      <p class="hero-desc">
        Play a quick solo round or host a game night with up to 10 friends — no
        registration, no downloads, no login needed.
      </p>
      <div class="cta-container">
        <ButtonLinkPrimary link="/singleplayer">
          Play Singleplayer
        </ButtonLinkPrimary>
        <ButtonLinkSecondary link="/play-party?role=host">
          HOST A PARTY
        </ButtonLinkSecondary>
      </div>
      <div class="feature-badges">
        <span class="badge">Solo or up to 10 players</span>
        <span class="badge">6 game modes</span>
        <span class="badge">No download</span> <span class="badge">No login</span>
      </div>
      <PartyHowTo />
      <PowerUpInfo class="powerups" />
      <section class="seo-section">
        <h2>What can you do with the image reveal quiz?</h2>
        <p class="party-desc">
          Enjoy handcrafted pixel art across multiple game modes. Watch the pixels
          pop up randomly in Classic mode, or have pixels drop in Tetris style in
          Gravity mode. Make it into the Hall of Fame by submitting the highest
          score in Daily Challenge.
        </p>
        <p class="party-desc">
          Play the local party multiplayer in Jackbox style: simply host the game
          on a big screen, connect instantly using your smartphones as
          controllers, hit the buzzer, and guess the picture before anyone else!
        </p>
      </section>
      <FAQComponent :items="pictureRevealFaqs" />
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import PowerUpInfo from "@/components/game-ui/PowerUpInfo.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const pictureRevealFaqs = [
  {
    question: "How are images revealed?",
    answer:
      "Images reveal themselves pixel by pixel based on the selected game mode. In Classic mode, the pixels pop up randomly across the canvas. In Gravity mode, the pixels drop down in a Tetris style.",
  },
  {
    question: "What is the goal of the game?",
    answer:
      "The goal is to recognize the drawing as it unfolds and guess the correct answer before the timer runs out. The faster you answer, the more points you get.",
  },
  {
    question: "How does multiplayer work?",
    answer:
      "PixReveal is built for playing with friends, not random matchmaking. It supports both local party and online multiplayer. For local party games, you can host the room on a big screen and use smartphones as controllers. For online multiplayer, you simply invite your friends to join from their own devices.",
  },
  {
    question: "Do I need to register to play?",
    answer:
      "No, you do not need to register or create an account. You can host, join, or even submit your score to the leaderboard instantly without signing up.",
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
  margin: 18px 0;
  line-height: 1.5;
  font-size: 1.02rem;
}

.seo-section {
  margin-top: 40px;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.cta-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 24px 0 16px;
}

@media (min-width: 576px) {
  .cta-container {
    grid-template-columns: 1fr 1fr;
  }
}

.feature-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  margin: 18px 0;
  line-height: 1.6;
}

.link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--color-secondary);
}
</style>