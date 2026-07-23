<template>
  <ContentPage>
    <h1 class="logo">ABOUT PIX<span>REVEAL</span></h1>

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
          <Icon icon="logos:vue" alt="Built with Vue" />
          <span>Vue 3</span>
        </div>
        <div class="tech-item">
          <Icon icon="devicon:typescript" alt="Using Typescript" />
          <span>TypeScript</span>
        </div>
        <div class="tech-item">
          <Icon icon="logos:pinia" alt="Pinia for state management" />
          <span>Pinia</span>
        </div>

        <div class="tech-item">
          <Icon icon="devicon:vitejs" alt="Vite as bundler" />
          <span>Vite</span>
        </div>
        <div class="tech-item">
          <Icon
            icon="logos:websocket"
            class="white-icon"
            alt="apinator.io for websocket multiplayer"
          />
          <span>Apinator.io</span>
        </div>
      </div>
    </section>

    <section class="about-section">
      <p>
        Looking for a collab or want to give me feedback? You can reach out to
        me via Github, LinkedIn or Discord
      </p>
      <a
        href="https://github.com/eckeecke"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon
          icon="devicon:github"
          class="white-icon"
          alt="link to my github"
        />
      </a>
      <a
        href="https://www.linkedin.com/in/christian-eckardt-hh/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon icon="devicon:linkedin" alt="link to my linkedin" />
      </a>
      <a
        href="https://discord.gg/XMTAw7FXd"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon icon="logos:discord-icon" alt="link to my discord" />
      </a>
    </section>

    <section class="about-section">
      <p>
        I build and maintain PixReveal in my free time. If you’d like to support
        server costs and future feature updates, consider buying me a coffee.
      </p>
      <a href="https://ko-fi.com/V4R823QKXZ" target="_blank"
        ><img
          height="36"
          style="border: 0px; height: 36px"
          src="https://storage.ko-fi.com/cdn/kofi4.png?v=6"
          border="0"
          alt="Buy Me a Coffee at ko-fi.com"
      /></a>
    </section>

    <footer class="about-footer">
      <ButtonPrimary data-sfx="click" @clicked="$router.back()">
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK
      </ButtonPrimary>
    </footer>
  </ContentPage>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
</script>

<style scoped>
.logo {
  font-family: inherit;
  text-align: start;
}

a {
  font-size: 24px;
  margin-right: 8px;
}

.about-section {
  margin-bottom: 2rem;
}

.tech-stack {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 1rem;
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

.about-footer {
  margin-top: 2rem;
}

.white-icon {
  filter: invert(1);
}
</style>
