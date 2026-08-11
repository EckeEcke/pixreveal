<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">FUN FRIDAY ONLINE TEAM GAMES FOR FREE</span>
        <br />
        PIXREVEAL: SAFE FOR WORK PICTURE REVEAL QUIZ FOR YOUR TEAM
      </h1>
      <YoutubeEmbed video-id="YQl5jOqm2n0" />
      <p class="hero-desc">
        Looking for <strong>fun games in the office on fridays</strong> that require
        zero setup? PixReveal is a free, <strong>100% safe for work (SFW)</strong>
        image reveal quiz your whole team can jump into instantly.
      </p>
      <p class="hero-desc">
        No registration, no downloads, no login. Just invite your coworkers and see
        who guesses the picture first.
      </p>
      <div class="cta-container">
        <ButtonLinkPrimary link="/play-party?role=host">
          HOST A TEAM GAME
        </ButtonLinkPrimary>
      </div>
      <div class="feature-badges">
        <span class="badge">Up to 10 players</span> <span class="badge">100% SFW</span>
        <span class="badge">No download</span> <span class="badge">No login</span>
      </div>
      <PartyHowTo />
      <section class="seo-section">
        <h2>Why PixReveal for your team?</h2>
        <p class="party-desc">
          PixReveal features handcrafted, family-friendly pixel art that reveals
          itself piece by piece — anyone can understand the gameplay instantly, no
          explanation needed. It supports up to 10 players, covering the group size
          of an average agile team.
        </p>
        <p class="party-desc">
          PixReveal supports both local party play on a shared screen with phones as
          controllers, and online multiplayer for remote teams. Simply invite your
          coworkers to join, follow the progressive reveal of the drawing, and see
          who can guess the correct answer first!
        </p>
      </section>
      <FAQComponent :items="officeFridayFaqs" />
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue"
import ContentPage from "@/components/page-layout/ContentPage.vue"
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue"
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue"
import FAQComponent from "@/components/page-ui/FAQComponent.vue"

const officeFridayFaqs = [
  {
    question: "Is PixReveal safe for work (SFW)?",
    answer: "Yes, the game is completely safe for work. The quiz features family-friendly, handcrafted pixel art drawings that are suitable for any professional environment or team event."
  },
  {
    question: "How do you play PixReveal with a team?",
    answer: "PixReveal supports both local party play and online multiplayer. For local party games, you can host the room on a big screen and everyone connects using their smartphones as controllers. For online multiplayer, you simply invite your coworkers to join the room from their own devices to guess the drawings together."
  },
  {
    question: "Do team members need to create an account?",
    answer: "No. There is no registration, login, or account creation required for anyone. You can host rooms, join games, and play instantly directly in your browser."
  }
]
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