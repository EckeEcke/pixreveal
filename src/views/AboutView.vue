<template>
  <div class="about-view">
    <div class="about-content">
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
            <Icon icon="logos:vue" />
            <span>Vue 3</span>
          </div>
          <div class="tech-item">
            <Icon icon="devicon:typescript" />
            <span>TypeScript</span>
          </div>
          <div class="tech-item">
            <Icon icon="logos:pinia" />
            <span>Pinia</span>
          </div>

          <div class="tech-item">
            <Icon icon="devicon:vitejs" />
            <span>Vite</span>
          </div>
          <div class="tech-item">
            <Icon icon="logos:websocket" class="white-icon" />
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
          <Icon icon="devicon:github" class="white-icon" />
        </a>
        <a
          href="https://www.linkedin.com/in/christian-eckardt-hh/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon icon="devicon:linkedin" />
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
  max-width: 600px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

h1 {
  font-size: 24px;
}

a {
  font-size: 24px;
  margin-right: 8px;
}

.confirm-btn {
  background: var(--primary);
  width: 100%;
  padding: 8px 16px;
  border: none;
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
