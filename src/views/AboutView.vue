<template>
  <div class="about-view">
    <div class="about-content">
      <h1 class="logo">ABOUT PIX<span>REVEAL</span></h1>

      <section class="about-section">
        <p>
          PixReveal is an interactive guessing game where the goal is as simple as it is
          challenging: Identify the pixel art masterpiece as it reveals itself piece by
          piece. Whether you are playing in the classic Solo Mode, the dynamic Gravity
          Mode, or competing in Online Multiplayer against friends — it's all about your
          eye for detail.
        </p>
      </section>

      <section class="about-section">
        <p>
          This project was built from the ground up by me as a solo developer. As a
          frontend specialist with a passion for <strong>Vue.js</strong> and
          <strong>TypeScript</strong>, my focus was to create a web-based gaming
          experience that feels snappy, modern, and visually cohesive.
        </p>

        <div class="tech-stack">
          <span>Vue 3</span>
          <span>TypeScript</span>
          <span>Pinia</span>
          <span>Vite</span>
          <span>Apinator.io</span>
        </div>
      </section>

      <footer class="about-footer">
        <button class="confirm-btn" data-sfx="click" @click="$router.push('/')">
          BACK TO HOME
        </button>
      </footer>
    </div>
  </div>
</template>

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
}

h1 {
  font-size: 24px;
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
  gap: 12px;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.tech-stack span {
  font-weight: bold;
}

.about-footer {
  margin-top: 2rem;
}
</style>
