<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">PIXEL GUESSING PARTY GAME</span> <br />
        FREE BROWSER MULTIPLAYER FOR 2–10 PLAYERS
      </h1>
      <YoutubeEmbed video-id="YQl5jOqm2n0" />
      <p class="hero-desc">
        PixReveal is a <strong>free Jackbox-style browser party game</strong> for game
        nights, team events, and chaotic fun with friends.
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
        <h2>What is PixReveal?</h2>
        <p class="party-desc">
          PixReveal is a <strong>Jackbox-style browser party game</strong> where players
          guess pixel art as it is revealed piece by piece. One player hosts the game on a
          TV, laptop, or tablet, while everyone else joins instantly using a phone, QR
          code, room ID, or invite link.
        </p>
        <p class="party-desc">
          The game combines
          <strong
            >buzzing, bonus rounds, hidden powerups, local party mode, online multiplayer,
            and daily challenges</strong
          >. Because everything runs directly in the browser, there is no app to install
          and no registration required.
        </p>
        <p class="party-desc">
          If you are looking for a <strong>free Jackbox alternative</strong>, a
          <strong>browser party game</strong>, a
          <strong>phone controller party game</strong>, or a
          <strong>multiplayer pixel quiz</strong>, PixReveal is designed to be playable
          within seconds and 100% SFW (safe for work).
        </p>
      </section>
      <FAQComponent :items="jackboxFaqs" />
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>
<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";
const jackboxFaqs = [
  {
    question: 'What does "Jackbox style" mean for PixReveal?',
    answer:
      "It means you only need one central screen to host the game—like a PC, tablet, or TV. Everyone else connects instantly using their own smartphones as controllers to hit the buzzer and select their answers.",
  },
  {
    question: "How do friends connect and join the room?",
    answer:
      "PixReveal is built exclusively for playing with friends. Joining is instant and seamless: players can either type in the room ID on their devices, click a shared invite link, or simply scan a QR code from the host screen to jump straight into the action.",
  },
  {
    question: "What is the goal of the game and how do you score?",
    answer:
      "The goal is to recognize the drawing before your friends do as the pixels pop up randomly across the canvas. When you think you know it, hit the buzzer and choose from 4 answer options on your phone. Getting a correct answer awards 1 point, but guessing incorrectly penalizes you with -2 points.",
  },
  {
    question: "What are bonus rounds?",
    answer:
      "Every 5 rounds, a bonus round with special effects triggers. In these bonus rounds, as well as in the final round of the game, the stakes are doubled: you get double points for a correct guess, but you also lose double the points for a wrong answer.",
  },
  {
    question: "Do players need an app or registration?",
    answer:
      "No, players can just join the game directly via browser. You can set an avatar image and a player name. Or just use a default random name.",
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
