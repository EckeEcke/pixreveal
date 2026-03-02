<template>
  <div class="player-hud">
    <div class="hud-avatar" :style="avatarStyle"></div>

    <div class="hud-info">
      <span class="hud-username">{{ playerStore.playerName }}</span>
      <span class="hud-points">Points: {{ playerStore.points }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePlayerStore } from "@/stores/player";
import avatarSheet from "@/assets/avatars/avatars.jpg";

const playerStore = usePlayerStore();

const avatarStyle = computed(() => {
  const index = playerStore.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);

  const x = col * 20;
  const y = row * 20;

  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});
</script>

<style scoped>
.player-hud {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--neon-orange);
  border-left: 8px solid var(--neon-orange);
  border-radius: 4px;
  backdrop-filter: blur(5px);
}

.hud-avatar {
  width: 42px;
  height: 42px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.hud-info {
  display: flex;
  flex-direction: column;
}

.hud-username {
  font-family: "Orbitron", sans-serif;
  color: #fff;
  font-size: 1rem;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}
</style>
