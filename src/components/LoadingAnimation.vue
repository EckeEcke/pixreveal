<template>
  <div class="loading-wrapper" :class="{ small: size === 'small' }">
    <div v-if="text && !size" class="loading-text">{{ text }}</div>
    <div class="loader"></div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  text: String | undefined,
  size: "small" | undefined,
});
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 64px 0;
}

.loading-wrapper.small {
  gap: 0;
}

.loader {
  width: 60px;
  aspect-ratio: 2;
  --_g: no-repeat
    radial-gradient(circle closest-side, var(--neon-orange) 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: l3 1s infinite linear;
}

.loading-wrapper.small .loader {
  width: 40px;
}

@keyframes l3 {
  20% {
    background-position:
      0% 0%,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0% 100%,
      50% 0%,
      100% 50%;
  }
  60% {
    background-position:
      0% 50%,
      50% 100%,
      100% 0%;
  }
  80% {
    background-position:
      0% 50%,
      50% 50%,
      100% 100%;
  }
}
</style>
