<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">GAMES LIKE SKRIBBL.IO & GARTIC PHONE</span>
        <br />
        FREE MULTIPLAYER PIXEL GUESSING QUIZ
      </h1>
      <YoutubeEmbed video-id="YQl5jOqm2n0" />
      <p class="hero-desc">
        PixReveal is the <strong>free alternative to Skribbl.io and Gartic Phone</strong>
        for players who want to focus purely on guessing, not drawing.
      </p>
      <p class="hero-desc">
        Host on a TV, join with your phones, buzz to answer, and sabotage your friends
        with ridiculous powerups.
      </p>
      <div class="cta-container">
        <ButtonLinkPrimary link="/play-party?role=host">
          HOST A FREE GAME
        </ButtonLinkPrimary>
        <ButtonLinkSecondary link="/play-party?role=join">
          JOIN WITH ROOM ID
        </ButtonLinkSecondary>
      </div>
      <div class="feature-badges">
        <span class="badge">2–10 players</span> <span class="badge">No download</span>
        <span class="badge">No login</span> <span class="badge">Phone controllers</span>
      </div>
      <PartyHowTo />
      <section class="seo-section">
        <h2>How is PixReveal different from Skribbl & Gartic?</h2>
        <p class="party-desc">
          Instead of forcing your friends to sketch with a clunky touchscreen or mouse,
          PixReveal features beautiful, pre-made pixel art that reveals itself piece by
          piece. It brings back the nostalgic thrill of a classic
          <strong>pixel guessing game</strong> without requiring any drawing skills at
          all.
        </p>
        <p class="party-desc">
          If you are looking for a fast-paced
          <strong>multiplayer pixel quiz</strong>, a
          <strong>Skribbl.io alternative</strong>, or a
          <strong>Gartic Phone alternative</strong>, PixReveal is playable right in your
          browser with no login or app needed.
        </p>
      </section>
      <FAQComponent :items="garticFaqs"></FAQComponent>
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const garticFaqs = [
  {
    question:
      "How does PixReveal differ from traditional drawing games like Gartic or Skribbl?",
    answer:
      "Instead of players drawing in real-time, the images reveal themselves pixel by pixel on your screen based on the chosen mode. In Classic mode, pixels pop up randomly, while in Gravity mode, they drop down Tetris-style. Your job is to recognize the drawing as it unfolds.",
  },
  {
    question: "What is the goal of the game and how are points calculated?",
    answer:
      "The goal is to guess the correct answer before the timer runs out. The faster you recognize the drawing and type in your guess, the more points you earn for that round.",
  },
  {
    question: "Can I play alone or with friends?",
    answer:
      "You can play solo in singleplayer mode to chase high scores, or play with friends. For multiplayer, there is no random matchmaking: you either play local party games Jackbox-style with a host screen and smartphone controllers, or invite your friends to an online lobby where everyone plays on their own device.",
  },
  {
    question:
      "Do players need to create an account to join or view the leaderboard?",
    answer:
      "No, registration does not exist. You can host rooms, play solo, join games, and submit your final scores to the global leaderboard instantly without any account system.",
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