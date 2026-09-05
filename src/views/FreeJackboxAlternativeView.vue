<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">FREE JACKBOX ALTERNATIVE</span> <br />
        PHONE CONTROLLER PARTY GAME FOR TV & FRIENDS
      </h1>
      <div class="hero">
        <img class="party-image" src="/assets/images/image-partymode.webp" alt="group of people playing PixReveal" />

        <div>
          <p class="hero-desc">
            Looking for a free game like Jackbox? PixReveal turns your smartphones into controllers and your TV or laptop into a shared party screen.
          </p>
          <p class="hero-desc">
            No paid Party Packs, no app downloads, and no signup.
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
            <span class="badge">2–10 players</span>
            <span class="badge">No download</span>
            <span class="badge">No login</span>
            <span class="badge">Phone controllers</span>
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
          <h2>Why PixReveal is the Perfect Free Jackbox Alternative</h2>
          <p class="party-desc">
            If you love games like Jackbox Games or Kahoot but don't want to buy expensive game packs or force everyone to register, PixReveal is built for you. It brings the iconic couch co-op experience directly into your web browser. One main display shows the evolving pixel art, while players use their mobile devices to buzz in and select the correct answer.
          </p>
          <p class="party-desc">
            Unlike drawing party games where players struggle to sketch with a mouse or touchscreen, PixReveal serves high-quality pixel art that builds up automatically piece by piece. The game features local party mode, live online multiplayer, chaotic powerups to sabotage opponents, and special double-point bonus rounds.
          </p>
          <p class="party-desc">
            Whether you are organizing a Friday afterwork team event, hosting a house party, or looking for a fast-paced game night with family, PixReveal is 100% SFW (safe for work), browser-based, and playable within seconds.
          </p>
        </section>
        <FAQComponent :items="jackboxFaqs" />
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

const jackboxFaqs = [
  {
    question: "Why is PixReveal a great free alternative to Jackbox Games?",
    answer:
      "Unlike Jackbox, PixReveal is completely free and requires zero downloads or purchases. You don't need a Steam account or console—just open your web browser on a TV or PC, let everyone join with their phones, and start playing immediately.",
  },
  {
    question: "How do smartphones work as controllers?",
    answer:
      "The host screen displays a QR code and a room ID. Players scan the QR code with their mobile cameras, which instantly opens a custom phone controller in their browser. From there, players can buzz in, use powerups, and pick answers directly from their phone screens.",
  },
  {
    question: "Is PixReveal safe for work and family team events?",
    answer:
      "Yes, 100%. All drawings and prompts in PixReveal are curated to be completely safe for work (SFW). It is ideal for office team-building, remote afterwork sessions, and family game nights.",
  },
  {
    question: "How many players can join a party game?",
    answer:
      "PixReveal supports local and online party lobbies for 2 to 10 players. Everyone can join using their own smartphone or tablet without needing to register an account.",
  },
  {
    question: "Do players need to be on the same Wi-Fi network?",
    answer:
      "No! While it works amazingly as a local couch game on a shared TV, players can also join remotely via video call (Zoom, Teams, Discord) or from anywhere using their mobile network.",
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