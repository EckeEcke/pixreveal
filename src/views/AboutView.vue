<template>
  <div class="about-view">
    <div class="about-content">
      <div class="close-btn-wrapper">
        <button @click="$router.push('/')" data-sfx="click" class="close-btn">
          <Icon icon="pixel:window-close-solid" />
        </button>
      </div>
      <h1 class="logo">ABOUT PIX<span>REVEAL</span></h1>

      <section class="about-section">
        <p>
          PixReveal is an interactive guessing party game where the goal is as simple as
          it is challenging: Identify the pixel art masterpiece as it reveals itself piece
          by piece. Whether you are playing in the classic Solo Mode, the dynamic Gravity
          Mode, or competing in Online Multiplayer against friends — it's all about your
          eye for detail.
        </p>
      </section>

      <section class="about-section">
        <p>
          This project was built from the ground up by me as a solo developer. As a
          frontend specialist with a passion for <strong>Vue.js</strong>, my focus was to
          create a web-based gaming experience that feels snappy, modern, and visually
          cohesive.
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
        <button class="confirm-btn" data-sfx="click" @click="$router.push('/')">
          BACK TO HOME
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
</script>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  background: var(--card-bg);
  border: 2px solid #334155;
  padding: 32px;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.about-content {
  position: relative;
}

h1 {
  text-align: left;
}

a {
  font-size: 24px;
  margin-right: 8px;
}

.confirm-btn {
  background: var(--primary);
  padding: 8px 16px;
  border: none;
  font-family: inherit;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  top: -16px;
  right: -16px;
  z-index: 1;
}

.close-btn {
  padding: 0;
  background: var(--card-bg);
  border: none;
  color: var(--primary);
  font-size: 36px;
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
