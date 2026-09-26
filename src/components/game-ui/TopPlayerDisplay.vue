<template>
  <div
    class="top-player-display"
    :class="{
      pending: isPending,
      active: isActive,
      'is-you': showYouIndicator,
    }"
  >
    <div class="avatar-container">
      <div
        v-if="avatarIndex !== undefined"
        class="hud-avatar"
        :style="avatarStyle"
      ></div>
      <div class="avatar-shine"></div>
    </div>

    <div class="player-pill" v-if="name">
      <span class="player-name">
        {{ name }}
      </span>
      <template v-if="score !== undefined || highscore !== undefined">
        <div class="score-divider"></div>
        <div class="player-score">
          <Icon icon="pixel:star-solid" class="star-icon" />
          <span>{{ score ?? highscore }}</span>
        </div>
      </template>
    </div>
    <div v-if="subline">{{ subline }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CSSProperties } from "vue";
import { Icon } from "@iconify/vue";
import avatarSheet from "@/assets/avatars/avatars.webp";

const props = defineProps<{
  name?: string;
  avatarIndex?: number;
  score?: number;
  highscore?: number;
  showYouIndicator?: boolean;
  isPending?: boolean;
  isActive?: boolean;
  subline?: string;
}>();

const avatarStyle = computed<CSSProperties>(() => {
  const index = props.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;

  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated" as CSSProperties["imageRendering"],
  };
});
</script>

<style scoped>
.top-player-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 14px;
}

.avatar-container {
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.hud-avatar {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: #2d3748;
}

.avatar-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.avatar-shine::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -150%;
  width: 60%;
  height: 200%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  animation: shine-sweep 4s infinite ease-in-out;
}

.player-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 18px;
  background: #0d0a14;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 90%;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.top-player-display.is-you .avatar-container {
  border: 2px solid var(--neon-cyan, #00f3ff);
  box-shadow: 0 0 16px rgba(0, 243, 255, 0.4);
}

.top-player-display.is-you .player-pill {
  background: rgba(30, 20, 60, 0.95);
  border-color: var(--neon-cyan, #00f3ff);
  box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.2), 0 0 12px rgba(0, 243, 255, 0.3);
}

.player-name {
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
}

.score-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.25);
}

.player-score {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--neon-yellow, #ffe600);
  font-size: 18px;
  font-weight: 900;
  text-shadow: 0 0 8px rgba(255, 230, 0, 0.4);
}

.star-icon {
  font-size: 16px;
  filter: drop-shadow(0 0 4px var(--neon-yellow, #ffe600));
}

.pending {
  opacity: 0.4;
}

.active {
  animation: floating 2s ease-in-out infinite;
}

@keyframes shine-sweep {
  0% { left: -150%; }
  25% { left: 150%; }
  100% { left: 150%; }
}

@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0px); }
}
</style>