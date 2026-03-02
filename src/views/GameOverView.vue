<template>
  <main>
    <header>
      <h1 class="logo">GAME <span>OVER</span></h1>
    </header>
    <div class="player-wrapper">
      <div class="position">1.</div>
      <PlayerDisplay />
    </div>
    <button class="btn-outline" @click="playAgain">Play Again</button>
  </main>
</template>

<script setup>
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import router from "@/router";

const playAgain = () => router.push("/");
</script>

<style scoped>
.logo {
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  margin-bottom: 2rem;
}

.logo span {
  color: var(--neon-orange);
}

.player-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
}

.position {
  color: var(--neon-orange);
  font-weight: 700;
  font-size: 32px;
}
</style>
