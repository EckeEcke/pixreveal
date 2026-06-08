<template>
  <main class="page">
    <ContentPage>
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
        <ButtonLinkPrimary link="/play-party?role=host">
          HOST A FREE GAME
        </ButtonLinkPrimary>
        <ButtonLinkSecondary link="/play-party?role=join">
          JOIN WITH ROOM ID
        </ButtonLinkSecondary>
      </div>
      <FAQComponent :items="garticFaqs"></FAQComponent>
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
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
