<template>
  <button
    class="neon-btn"
    :class="{ shiny: isShiny }"
    :style="{ '--btn-color': btnColor }"
    @click="handleClick"
    @mouseenter="soundStore.handleHoverSound"
    :disabled="disabled || loading"
  >
    <Icon :icon="iconName || ''" class="background-icon" />
    <div class="glow-layer"></div>

    <span v-if="isNew" class="new-badge">NEW</span>

    <div class="btn-content">
      <Icon :icon="iconName || ''" class="btn-icon" />
      <div class="text-wrapper">
        <span class="btn-text">{{ btnText }}</span>
        <span class="sub-title">{{ subTitle }}</span>
      </div>
    </div>
    <span v-if="maxPlayers && maxPlayers > 1" class="player-info"
      ><Icon icon="pixel:users-solid" /> 2-10</span
    >
    <span v-if="maxPlayers && maxPlayers === 1" class="player-info"
      ><Icon icon="pixel:user-solid" /> 1</span
    >
    <span v-if="highScore" class="player-info"
      ><Icon icon="pixel:crown-solid" /> {{ highScore }}</span
    >
    <span v-if="cornerText" class="corner-info"><Icon icon="pixel:clock" /> {{ cornerText }}</span>
    <div v-if="loading" class="loading-overlay">
      <span class="spinner"></span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  iconName?: string;
  btnFunction?: (event: MouseEvent) => void;
  btnText?: string;
  subTitle?: string;
  btnColor?: string;
  disabled?: boolean;
  loading?: boolean;
  isShiny?: boolean;
  maxPlayers?: number;
  highScore?: number;
  isNew?: boolean;
  cornerText?: string;
}>();

const soundStore = useSoundStore();

const handleClick = (event: MouseEvent) => {
  props.btnFunction?.(event);
};
</script>

<style scoped>
.neon-btn {
  --left-block-width: 12px;
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  border: none;
  padding: 24px 16px;
  padding-left: calc(16px + var(--left-block-width));
  min-height: 136px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--left-block-width);
    background-color: var(--btn-color);
  }
}

.neon-btn.shiny::after,
.neon-btn:hover::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -60%;
  width: 30%;
  height: 300%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
  animation: shine 4s infinite;
}

.neon-btn:hover .background-icon {
  opacity: 0.1;
}

.neon-btn:disabled {
  opacity: 0.3;
  box-shadow: none;
  pointer-events: none;
  color: red;
}

.glow-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center,
    var(--btn-color) 0%,
    transparent 70%
  );
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
}

.btn-icon {
  background: linear-gradient(
    135deg,
    rgb(from var(--btn-color) r g b / 0.5) 0%,
    rgba(0, 40, 40, 0.1) 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
  box-shadow:
    inset 0 0 10px rgba(0, 255, 255, 0.2),
    0 0 15px rgb(from var(--btn-color) r g b / 0.5);
  flex: 0 0 auto;
  font-size: 32px;
  color: var(--btn-color);
  padding: 8px;
  border: 1px solid var(--btn-color);
  border-radius: 25%;
}

.text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.btn-text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
  @media (min-width: 576px) {
    font-size: 18px;
  }
}

.sub-title {
  color: #ffffff88;
  font-size: 14px;
  font-family: var(--font-display);
}

.neon-btn:hover {
  box-shadow: 0 0 20px var(--btn-color);
  animation: 1.5s floating infinite ease-in-out;
}

.neon-btn:hover .glow-layer {
  opacity: 0.3;
}

.neon-btn:active {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.background-icon {
  position: absolute;
  right: -15%;
  bottom: -15%;
  color: var(--btn-color);
  font-size: 120px;
  opacity: 0.05;
  transition: 0.3s all;
}

.player-info {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--color-secondary);
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  min-width: 36px;
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}

.new-badge {
  position: absolute;
  top: 10px;
  left: calc(var(--left-block-width) + 8px);
  z-index: 2;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #000;
  background: var(--neon-yellow);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 0 8px var(--yellow-glow);
  animation: new-pulse 1.6s ease-in-out infinite;
}

@keyframes new-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(255, 210, 63, 0.6);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 14px rgba(255, 210, 63, 0.9);
  }
}

.corner-info {
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
  min-width: 70px;
  text-align: left;
  color: var(--color-secondary);
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 12px;
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.4);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--btn-color);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>