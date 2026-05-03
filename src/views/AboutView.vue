<template>
  <ContentPage>
    <h2 class="logo">ABOUT PIX<span>REVEAL</span></h2>

    <section class="about-section">
      <p>
        PixReveal is an interactive guessing party game where the goal is as simple as it
        is challenging: Identify the pixel art masterpiece as it reveals itself piece by
        piece. Whether you are playing in the classic Solo Mode, the dynamic Gravity Mode,
        or competing in Online Multiplayer against friends — it's all about your eye for
        detail.
      </p>
    </section>

    <section class="about-section">
      <p>
        This project was built from the ground up by me as a solo developer. As a frontend
        specialist with a passion for <strong>Vue.js</strong>, my focus was to create a
        web-based gaming experience that feels snappy, modern, and visually cohesive.
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
        Looking for a collab or want to give me feedback? You can reach out to me via
        Github or LinkedIn
      </p>
      <a href="https://github.com/eckeecke" target="_blank" rel="noopener noreferrer">
        <Icon icon="devicon:github" class="white-icon" alt="link to my github" />
      </a>
      <a
        href="https://www.linkedin.com/in/christian-eckardt-hh/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon icon="devicon:linkedin" alt="link to my linkedin" />
      </a>
    </section>

    <footer class="about-footer">
      <button class="confirm-btn" data-sfx="click" @click="$router.back()">
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK
      </button>
    </footer>
  </ContentPage>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
</script>

<style scoped>
a {
  font-size: 24px;
  margin-right: 8px;
}

.confirm-btn {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  padding: 12px 16px;
  border: none;
  color: black;
  font-size: 16px;
  font-family: inherit;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
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
