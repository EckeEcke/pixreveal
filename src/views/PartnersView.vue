<template>
  <main class="page">
    <ContentPage>
      <h1 class="logo">
        FEATURED PARTNERS
      </h1>
      <div class="subline">RECOMMENDED GAMING PLATFORMS</div>

      <div class="partners-layout">
        <section class="partners-section">
          <p class="party-desc partners-intro">
            Gaming is always better together. As a solo developer, I love teaming up
            with other awesome indie multiplayer platforms, community hubs, and
            browser game creators to help you discover fresh party games and elevate
            your game nights.
          </p>
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

        <aside class="partners-sidebar" aria-label="Connect and visit our partners">
          <section class="more-partners">
            <h2>Partner Up & Connect</h2>
            <p class="party-desc">
              Building a browser game or gaming community? Let's connect,
              collaborate, and help players discover each other's projects.
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

          <nav class="partner-links" aria-label="Partner websites">
            <h2>Visit our partners</h2>
            <a
              v-for="partner in partners"
              :key="partner.url"
              :href="partner.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{ partner.name }}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </aside>
      </div>

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
    name: "Plungee",
    url: "https://plungee.netlify.app/",
    image: "/assets/images/image-plungee.webp",
    description:
      "A colorful gravity-driven browser platformer. Steer your character through obstacle-filled levels, tackle the campaign and weekly challenges, or jump into online multiplayer. Create your own levels and discover creations from the community.",
    highlights: [
      {
        title: "Simple Controls, Tricky Levels",
        text: "Move left and right while gravity carries you through levels filled with springs, lasers, and other obstacles.",
      },
      {
        title: "Campaign & Weekly Challenges",
        text: "Explore the campaign at different difficulty levels and test your skills in the weekly challenge.",
      },
      {
        title: "Multiplayer & Community Levels",
        text: "Play online, build your own levels, and try levels made by other players.",
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
  box-sizing: border-box;
}

.partners-layout {
  display: grid;
  gap: 32px;
  margin-top: 24px;
}

.partners-section,
.partners-sidebar {
  min-width: 0;
}

.partners-sidebar {
  display: grid;
  width: 100%;
  gap: 24px;
  align-content: start;
}

@media (min-width: 1024px) {
  .partners-layout {
    grid-template-columns: minmax(0, 1fr) 250px;
    gap: 32px;
    align-items: start;
  }
}

h2 {
  margin-top: 40px;
  margin-bottom: 16px;
}

.party-desc {
  margin: 16px 0;
  line-height: 1.6;
}

.partners-intro {
  max-width: 70ch;
  margin: 0 0 32px;
}

.partners-section {
  margin-top: 0;
}

.partners-section > h2 {
  margin-top: 0;
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
  margin: 0 0 16px;
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
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(15, 12, 29, 0.75);
}

.more-partners h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
}

.more-partners .party-desc {
  font-size: 14px;
}

.more-partners .btn-primary {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 10px;
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
}

.more-partners .btn-primary svg {
  flex-shrink: 0;
  font-size: 18px;
}

.partner-links h2 {
  margin: 0 0 12px;
  font-size: 14px;
}

.partner-links a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-secondary);
  font-size: 14px;
  text-decoration: none;
}

.partner-links a:hover,
.partner-links a:focus-visible {
  color: var(--primary);
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
