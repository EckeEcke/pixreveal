<template>
  <main class="page">
    <ContentPage>
      <h1 class="logo">
        FEATURED PARTNERS
      </h1>
      <div class="subline">RECOMMENDED GAMING PLATFORMS</div>

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
            <a 
              :href="partner.url" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="partner.image"
                :alt="`Preview of ${partner.name}`"
                class="partner-image"
                width="1280"
                height="720"
                loading="lazy"
              />
            </a>
            <h3>{{ partner.name }}</h3>
            <p>{{ partner.description }}</p>

            <ul v-if="partner.highlights" class="highlights-list">
              <li v-for="(highlight, index) in partner.highlights" :key="index">
                <strong>{{ highlight.title }}:</strong> {{ highlight.text }}
              </li>
            </ul>
            <a
              :href="partner.url"
              target="_blank"
              rel="noopener noreferrer"
              class="link-btn-primary"
            >
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
        <a
          href="https://discord.gg/NuYwabjXUj"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary"
          data-sfx="click"
        >
          <span>Ping me on Discord</span>
          <Icon icon="selfhst:discord-dark" alt="link to my discord" />
        </a>
      </section>

      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import { Icon } from "@iconify/vue";

const partners = [
  {
    name: "GameBuddies.io",
    url: "https://gamebuddies.io",
    image: "/gamebuddies-preview.webp",
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
  {
    name: "Pausen Games",
    url: "https://pausengames.com/",
    image: "/pausengames-preview.webp",
    description:
      "Free puzzle and arcade games that fit into a short break. No sign-up, no ads, no download. There's a new daily challenge every day, with high scores and streaks to chase. Games include Minesweeper, Waterpipe, Bimaru, Bubble Pop, and more.",
    highlights: [
      {
        title: "Free Browser Games",
        text: "Play a growing collection of casual games and puzzles directly in your browser, with no downloads or registration required.",
      },
      {
        title: "Daily Challenges & High Scores",
        text: "Test your skills with daily challenges, beat your best scores, and compete for a place on the leaderboards.",
      },
      {
        title: "Perfect for Short Breaks",
        text: "Enjoy quick games like Memory, Minesweeper, Snake, and Bubble Pop whenever you need a little break.",
      },
    ],
  },
  {
    name: "Schoolfight",
    url: "https://eckeecke.itch.io/school-fight",
    image: "/schoolfight-preview.webp",
    description:
      "A free turn-based browser game about school rivalry. Build a team of three characters, battle your way through the playground and become king of the school. Win mini games to earn money, upgrade your fighters and unlock new characters through achievements.",
    highlights: [
      {
        title: "Turn-Based Team Battles",
        text: "Lead a team of three characters, who all attack at once each turn.",
      },
      {
        title: "Upgrades & Items",
        text: "Spend your earnings on stronger characters and use items mid-fight.",
      },
      {
        title: "3 Mini Games",
        text: "Switch up the gameplay and earn extra money between battles.",
      },
    ],
  },
];
</script>

<style scoped>
.logo {
  font-family: inherit;
  text-align: start;
  margin-bottom: 4px;
  font-weight: 900;
  font-size: 32px;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6);
}

.subline {
  color: var(--primary);
  text-transform: uppercase;
}

.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
  max-width: 700px;
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
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  @media (min-width: 600px) {
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.15),
      0 8px 32px rgba(0, 0, 0, 0.4);
    background: rgba(15, 12, 29, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 24px;
  }
}

.partner-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 16px;
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

.more-partners {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  color: white;
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

/* Discord button: styles taken over from ButtonLinkPrimary */
.btn-primary {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--primary);
  padding: 12px 16px;
  border: none;
  text-transform: uppercase;
  text-decoration: none;
  color: white;
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
  svg {
    fill: white;
  }
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-4px) scale(1.05);
}
</style>