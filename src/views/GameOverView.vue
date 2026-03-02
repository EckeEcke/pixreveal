<template>
  <main>
    <h1>Game Over</h1>
    <div class="player-wrapper">
      <div class="position">1.</div>
      <PlayerDisplay />
    </div>
  </main>
</template>

<script setup>
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { usePlayerStore } from "@/stores/player";
</script>

<style scoped>
.player-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
}

.position {
  color: var(--neon-orange);
  font-weight: 700;
  font-size: 32px;
}
</style>
