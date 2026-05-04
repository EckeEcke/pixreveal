<template>
  <button
    class="neon-btn"
    :class="{'shiny': isShiny}"
    :style="{ '--btn-color': btnColor }"
    @click="btnFunction"
    :disabled="disabled"
  >
    <Icon :icon="iconName" class="background-icon" />
    <div class="glow-layer"></div>
    <div class="btn-content">
      <Icon :icon="iconName" class="btn-icon" />
      <div class="text-wrapper">
        <span class="btn-text">{{ btnText }}</span>
        <span class="sub-title">{{ subTitle }}</span>
      </div>
    </div>
  </button>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  iconName: String,
  btnFunction: Function,
  btnText: String,
  subTitle: String,
  btnColor: {
    type: String,
    default: "var(--primary)",
  },
  disabled: Boolean,
  isShiny: Boolean,
});
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
  padding: 16px;
  padding-left: calc(16px + var(--left-block-width));
  min-height: 120px;
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

.neon-btn.shiny::after {
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
}
</style>
