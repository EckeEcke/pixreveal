<template>
  <router-link :to="link" class="btn-secondary" data-sfx="click">
    <slot></slot>
  </router-link>
</template>

<script setup lang="ts">
defineProps({
  link: {
    type: String,
    required: true,
  },
});
defineEmits(["clicked"]);
</script>

<style scoped>
.btn-secondary {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border: none;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--primary);
  border: 1px solid var(--primary);
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.btn-secondary:hover {
  filter: brightness(1.1);
  transform: translateY(-4px) scale(1.05);
}
</style>
