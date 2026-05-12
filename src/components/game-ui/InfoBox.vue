<template>
  <div class="info-box">
    <span>{{ icon }}</span>
    <p v-if="message">{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
  },
  icon: {
    type: String,
    default: "💡",
  },
});
</script>

<style scoped>
.info-box {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: #2d1b4d;
  border: 1px solid #4d3182;
  border-radius: 4px;
  padding: 12px;
  padding: 8px;
  p {
    margin: 0;
    font-size: 12px;
  }
  span {
    font-size: 24px;
  }
}
</style>
