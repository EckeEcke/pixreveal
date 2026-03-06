<template>
  <div
    class="player-hud"
    :class="{ winner: isWinner, pending: hasFinished === false }"
  >
    <div class="hud-avatar" :style="avatarStyle"></div>
    <div class="hud-info">
      <span class="hud-username">{{ name }}</span>
      <span v-if="showYouIndicator"> (YOU)</span>
      <div class="hud-stats">
        <span v-if="points || points === 0" class="hud-points"
          >🪙 {{ points }}</span
        >
        <div v-if="roundIndex || roundIndex === 0">
          🏁 {{ roundIndex }}/{{ maxRounds }}
        </div>
        <div v-if="correctAnswers || correctAnswers === 0">
          ✅ {{ correctAnswers || 0 }}
        </div>
      </div>
    </div>

    <div v-if="isHost" class="host-info">HOST</div>
    <img v-if="isWinner" src="@/assets/trophy.gif" class="trophy" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import avatarSheet from "@/assets/avatars/avatars.jpg";

const props = defineProps({
  name: String,
  avatarIndex: Number,
  points: Number | undefined,
  hasFinished: Boolean | undefined,
  isWinner: Boolean,
  isHost: Boolean,
  correctAnswers: Number | undefined,
  roundIndex: Number | undefined,
  maxRounds: Number | undefined,
  showYouIndicator: Boolean,
});

const avatarStyle = computed(() => {
  const index = props.avatarIndex || 0;
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
  min-width: 240px;
}

.player-hud.winner {
  position: relative;
  overflow: hidden;
}

.player-hud.winner::before {
  content: "";
  position: absolute;
  inset: -2px;

  background: linear-gradient(120deg, #ffae00, #ffe600, #ffae00, #ff5e00);

  background-size: 300% 300%;
  animation: winnerGlow 3s linear infinite;

  z-index: -1;
  filter: blur(8px);
  opacity: 0.8;
}

@keyframes winnerGlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 300% 50%;
  }
}

.hud-avatar {
  width: 42px;
  height: 42px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.hud-stats {
  display: flex;
  gap: 16px;
  align-items: baseline;
}

.hud-username {
  font-family: "Orbitron", sans-serif;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.trophy {
  margin-left: auto;
  height: 40px;
}

.host-info {
  margin-left: auto;
  background: lightgray;
  padding: 8px;
  border-radius: 8px;
  color: black;
  font-size: 12px;
}

.pending {
  opacity: 0.4;
}
</style>
