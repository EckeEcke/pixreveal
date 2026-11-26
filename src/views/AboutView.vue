<template>
  <ContentPage>
    <h1 class="logo">ABOUT</h1>
    <div class="subline">PIXREVEAL</div>

    <main class="about-layout">
      <div class="about-copy">
        <section class="about-section">
          <p>
            PixReveal is a web-based guessing game built for local party nights. It
            works as a free Jackbox alternative: you host the game on a big screen
            and everyone uses their smartphones as controllers to smash the buzzer.
            The goal is simple: be the fastest to identify the pixel art masterpiece
            as it reveals itself piece by piece. Use powerups to sabotage your
            friends and gain the upper hand.
          </p>
        </section>

        <section class="about-section">
          <p>
            When you are not playing with friends in multiplayer, you can dive into
            Solo Mode, try one of five game modes, or compete in the daily
            challenges. Use the editor to create and submit your own art for the
            world to play. I built this entire project from scratch as a solo
            developer. As a frontend specialist with a passion for Vue.js, my focus
            was to create a multiplayer experience that feels snappy, modern, and
            visually clean—bringing party game vibes straight to your browser.
          </p>

          <div class="tech-stack">
            <div class="tech-item">
              <Icon icon="logos:vue" aria-hidden="true" />
              <span>Vue 3</span>
            </div>
            <div class="tech-item">
              <Icon icon="devicon:typescript" aria-hidden="true" />
              <span>TypeScript</span>
            </div>
            <div class="tech-item">
              <Icon icon="logos:pinia" aria-hidden="true" />
              <span>Pinia</span>
            </div>
            <div class="tech-item">
              <Icon icon="devicon:vitejs" aria-hidden="true" />
              <span>Vite</span>
            </div>
            <div class="tech-item">
              <Icon icon="logos:websocket" class="white-icon" aria-hidden="true" />
              <span>Apinator.io</span>
            </div>
          </div>
        </section>
      </div>

      <aside class="contact-box" aria-label="Contact and support">
        <section class="contact-section">
          <h2>Get in touch</h2>
          <p>
            Looking for a collab or want to give me feedback? You can reach out to
            me via GitHub, LinkedIn or Discord.
          </p>
          <nav class="contact-links" aria-label="Contact links">
            <a
              href="https://github.com/eckeecke"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <Icon icon="devicon:github" class="white-icon" aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/christian-eckardt-hh/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Icon icon="devicon:linkedin" aria-hidden="true" />
            </a>
            <a
              href="https://discord.gg/NuYwabjXUj"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              title="Discord"
            >
              <Icon icon="logos:discord-icon" aria-hidden="true" />
            </a>
          </nav>
        </section>

        <section class="support-section">
          <h2>Support PixReveal</h2>
          <p>
            I build and maintain PixReveal in my free time. If you’d like to support
            server costs and future feature updates, consider buying me a coffee.
          </p>
          <a
            href="https://ko-fi.com/V4R823QKXZ"
            target="_blank"
            rel="noopener noreferrer"
            class="kofi-link"
          >
            <img
              src="/assets/images/kofi.webp"
              width="278"
              height="70"
              alt="Buy me a coffee on Ko-fi"
            />
          </a>
          <div class="igdb-link">
            <span>Or leave a rating on</span>
            <a
              href="https://www.igdb.com/games/pixreveal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rate PixReveal on IGDB"
            >
              <Icon icon="thesvg:igdb" aria-hidden="true" />
            </a>
          </div>
        </section>
      </aside>
    </main>
  </ContentPage>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
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
  margin-bottom: 32px;
}

.about-layout {
  display: grid;
  align-items: start;
  gap: 32px;
}

.about-copy {
  display: grid;
  gap: 32px;
  min-width: 0;
}

.about-section p {
  margin: 0;
}

.tech-stack {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tech-stack span {
  font-weight: bold;
}

.white-icon {
  filter: invert(1);
}

.igdb-link {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 20px;
  font-size: 14px;
}

.igdb-link a {
  display: inline-flex;
  font-size: 32px;
  color: white;
}

.contact-box {
  min-width: 0;
}

.contact-box h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
}

.contact-box p {
  margin: 16px 0;
  font-size: 14px;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.contact-links a {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 24px;
}

.contact-links a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.contact-box a:focus-visible,
.igdb-link a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.support-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.kofi-link {
  display: inline-flex;
  max-width: 100%;
  border-radius: 8px;
}

.kofi-link img {
  display: block;
  width: auto;
  height: 36px;
  max-width: 100%;
  object-fit: contain;
}

@media (min-width: 1024px) {
  .about-layout {
    grid-template-columns: minmax(0, 1fr) 250px;
  }

  .contact-box {
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(15, 12, 29, 0.75);
  }
}
</style>
