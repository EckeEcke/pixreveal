<template>
  <router-link :to="link" class="btn-primary" data-sfx="click">
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
.btn-primary {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  padding: 12px 16px;
  border: none;
  text-transform: uppercase;
  text-decoration: none;
  color: black;
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow:
    rgba(45, 35, 66, 0.4) 0 2px 4px,
    rgba(45, 35, 66, 0.3) 0 7px 13px -3px,
    rgba(0, 0, 0, 0.3) 0 -3px 0 inset;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-4px) scale(1.05);
}
</style>
