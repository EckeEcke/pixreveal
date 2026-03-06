<script setup lang="ts">
import LoadingAnimation from "./LoadingAnimation.vue";

defineProps({
  show: Boolean,
  text: {
    type: String,
    default: "LOADING...",
  },
});
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="loading-content">
        <LoadingAnimation />
        <p v-if="text" class="loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-text {
  color: var(--neon-orange);
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
