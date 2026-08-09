<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">RECOMMENDED PLATFORMS</span>
        <br />
        FEATURED GAMING PARTNERS
      </h1>

      <p class="party-desc">
        Gaming is always better together. As a solo developer, I love teaming up
        with other awesome indie multiplayer platforms, community hubs, and
        browser game creators to help you discover fresh party games and elevate
        your game nights.
      </p>

      <section class="partners-section">
        <h2>My Featured Partners</h2>
        <div class="partners-grid">
          <div
            v-for="partner in partners"
            :key="partner.name"
            class="partner-card"
          >
            <h3>{{ partner.name }}</h3>
            <p>{{ partner.description }}</p>

            <ul v-if="partner.highlights" class="highlights-list">
              <li v-for="(highlight, index) in partner.highlights" :key="index">
                <strong>{{ highlight.title }}:</strong> {{ highlight.text }}
              </li>
            </ul>
            <a :href="partner.url" target="_blank" class="link-btn-primary">
              VISIT {{ partner.name.toUpperCase() }} &rarr;
            </a>
          </div>
        </div>
      </section>

      <section class="more-partners">
        <h2>Partner Up & Connect</h2>
        <p class="party-desc">
          Are you building an indie game, a party game platform, or a gaming
          community? As a solo dev, I am always open to connecting with fellow
          creators, collaborating, or exchanging recommendations. Feel free to
          reach out if you'd like to partner up!
        </p>
        <ButtonLinkPrimary link="https://discord.gg/NuYwabjXUj">
          <span>Ping me on Discord</span>
          <Icon icon="selfhst:discord-dark" alt="link to my discord" />
        </ButtonLinkPrimary>
      </section>

      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import { Icon } from "@iconify/vue";

const partners = [
  {
    name: "GameBuddies.io",
    url: "https://gamebuddies.io",
    description:
      "A fantastic free Jackbox alternative built by an independent solo developer. GameBuddies offers a collection of 17 multiplayer browser games—including drawing, trivia, social deduction, bingo, and word games—with built-in video chat for seamless party sessions with friends.",
    highlights: [
      {
        title: "17 Games in One Platform",
        text: "Enjoy drawing (like Canvas Chaos), trivia, word, and deduction games.",
      },
      {
        title: "Built-In Video Chat",
        text: "See and talk to your friends directly in the browser while playing.",
      },
      {
        title: "No App Needed",
        text: "Completely free browser party games to jump right into the action.",
      },
    ],
  },
];
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
  margin-top: 40px;
  margin-bottom: 16px;
}

.party-desc {
  margin: 16px 0;
  line-height: 1.6;
}

.partners-section {
  margin-top: 32px;
}

.partners-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 20px;
}

.partner-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.partner-card h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.4rem;
}

.partner-card p {
  margin-bottom: 16px;
  line-height: 1.5;
}

.highlights-list {
  margin: 0 0 24px 0;
  padding-left: 20px;
  line-height: 1.5;
}

.highlights-list li {
  margin-bottom: 6px;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  transition: transform 0.1s;
  text-align: center;
  margin-top: auto;
  align-self: flex-start;
}

.btn-cta:active {
  transform: scale(0.98);
}

.btn-cta.host {
  background: var(--primary);
  color: #fff;
}

.more-partners {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.link-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  a {
    margin-top: 4px;
  }
}

.link {
  display: block;
  text-align: center;
  margin-top: 32px;
  color: var(--color-secondary);
}

.link-btn-primary {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  padding: 12px 16px;
  border: none;
  text-transform: uppercase;
  text-decoration: none;
  color: black;
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow:
    rgba(45, 35, 66, 0.4) 0 2px 4px,
    rgba(45, 35, 66, 0.3) 0 7px 13px -3px,
    rgba(0, 0, 0, 0.3) 0 -3px 0 inset;
}

.link-btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-4px) scale(1.05);
}
</style>
