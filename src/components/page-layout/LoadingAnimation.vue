<template>
  <div class="loading-wrapper" :class="{ small: size === 'small' }">
    <div v-if="text && !size" class="loading-text">{{ text }}</div>
    <div class="loader"></div>
  </div>
</template>

<script setup>
defineProps({
  text: String | undefined,
  size: "small" | undefined,
});
</script>

<style scoped>
.loading-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 0;
}

.loading-wrapper.small {
  gap: 0;
}

.loading-text {
  text-align: center;
  max-width: 350px;
}

.loader {
  width: 60px;
  aspect-ratio: 2;
  --_g: no-repeat
    radial-gradient(circle closest-side, var(--primary) 90%, #0000);
  background:
    var(--_g) 0% 50%,
    var(--_g) 50% 50%,
    var(--_g) 100% 50%;
  background-size: calc(100% / 3) 50%;
  animation: loading 1s infinite linear;
}

.loading-wrapper.small .loader {
  width: 40px;
}
</style>
