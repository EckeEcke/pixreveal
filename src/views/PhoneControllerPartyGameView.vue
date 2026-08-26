<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">PHONE CONTROLLER PARTY GAME</span>
        <br />
        PLAY ON A TV, USE YOUR PHONES AS CONTROLLERS
      </h1>

      <img class="party-image" src="/assets/images/image-partymode.webp" alt="group of people playing PixReveal">

      <p class="hero-desc">
        PixReveal is a <strong>free browser party game with phone controllers</strong>
        designed for game nights, parties, and team events.
      </p>

      <p class="hero-desc">
        One player hosts on a TV or laptop, everyone joins with a smartphone,
        and the chaos begins.
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
        <span class="badge">2–10 players</span>
        <span class="badge">Phone controllers</span>
        <span class="badge">No app required</span>
        <span class="badge">Free in browser</span>
      </div>

      <PartyHowTo />

      <YoutubeEmbed video-id="YQl5jOqm2n0" thumbnail-url="/assets/images/trailer-preview.webp" />

      <PowerUpInfo class="powerups" />
      
      <section class="seo-section">
        <h2>What is a phone controller party game?</h2>

        <p class="party-desc">
          A <strong>phone controller party game</strong> is a game where the
          main screen is shown on a TV, laptop, or tablet while every player uses
          their own smartphone as a controller. This creates a local multiplayer
          experience without needing extra gamepads, consoles, or downloads.
        </p>

        <p class="party-desc">
          PixReveal is built around this format. The host starts a room, players
          join instantly using a QR code, invite link, or room ID, and then use
          their phones to buzz, choose answers, react with emojis, and activate
          powerups.
        </p>

        <p class="party-desc">
          If you are looking for a <strong>phone controller game for TV</strong>,
          a <strong>smartphone party game</strong>, a
          <strong>browser game with phone controllers</strong>, or a
          <strong>free local multiplayer game for friends</strong>, PixReveal
          is designed to be playable within seconds.
        </p>
      </section>

      <section class="seo-section">
        <h2>Why use phones as controllers?</h2>

        <ul class="benefit-list">
          <li>No extra controllers needed</li>
          <li>Everyone already has a smartphone</li>
          <li>Easy to join with QR code or link</li>
          <li>Works on TV, laptop, or projector</li>
          <li>Perfect for parties and team building</li>
          <li>Supports up to 10 players</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>How PixReveal works</h2>

        <ol class="step-list">
          <li>Host the game on a big screen.</li>
          <li>Friends join with their phones.</li>
          <li>Watch pixel art reveal piece by piece.</li>
          <li>Buzz when you think you know the answer.</li>
          <li>Choose from four options on your phone.</li>
          <li>Use chaotic powerups to sabotage your friends.</li>
        </ol>
      </section>

      <FAQComponent :items="phoneControllerFaqs" />

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

const phoneControllerFaqs = [
  {
    question: "Do I need to install an app on my phone?",
    answer:
      "No. PixReveal runs entirely in the browser. Players can join instantly by scanning a QR code, opening a link, or entering a room ID.",
  },
  {
    question: "Can I play on a TV with phones as controllers?",
    answer:
      "Yes. The host opens PixReveal on a TV, laptop, or projector, while every player uses their own smartphone as a controller.",
  },
  {
    question: "How many players can join?",
    answer:
      "PixReveal supports up to 10 players in local party mode, making it ideal for game nights, family gatherings, and office events.",
  },
  {
    question: "What do players do on their phones?",
    answer:
      "Players use their phones to buzz, select answers, send emoji reactions, and activate powerups such as Devil, Scramble, Freeze, Lights Out, Upside Down, and Fart.",
  },
  {
    question: "Is PixReveal similar to Jackbox?",
    answer:
      "Yes. PixReveal uses the same big-screen-plus-phone-controller concept, but focuses on pixel-art guessing, buzzing, bonus rounds, and chaotic powerups.",
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

  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr;
  }
}

.feature-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
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

.benefit-list,
.step-list {
  margin: 16px 0;
  padding-left: 20px;
  line-height: 1.8;
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
  margin-top: 16px;
}
</style>