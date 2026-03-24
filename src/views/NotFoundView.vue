<template>
  <div class="setup-card error-card">
    <div class="pixel-icon">
      <Icon icon="pixel:exclamation-triangle" />
    </div>
    <h2>[ERROR_404]</h2>
    <p>Area not found. Sorry about that.</p>
    <router-link to="/" class="btn-primary"> RETURN TO GAME </router-link>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
</script>

<style scoped>
.setup-card {
  background: var(--card-bg);
  border: 2px solid #334155;
  padding: 32px;
  margin: 0 16px;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  max-height: 90vh;
  overflow: auto;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
}

.pixel-icon {
  font-size: 64px;
  color: var(--neon-social);
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px var(--neon-social));
}
h2 {
  color: var(--white);
  margin-bottom: 1rem;
}
p {
  margin-bottom: 2rem;
  opacity: 0.8;
}

.btn-primary {
  padding: 12px;
  background: var(--primary);
  border: none;
  color: black;
  font-size: 18px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 700;
}
</style>
