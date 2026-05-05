<template>
  <div class="info-box">
    <span>{{ icon }}</span>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
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
  background: #2D1B4D;
  border: 1px solid #4D3182;
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
