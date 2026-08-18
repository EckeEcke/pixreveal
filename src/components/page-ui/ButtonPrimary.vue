<template>
  <button
    class="btn-primary"
    :disabled="disabled"
    @click="$emit('clicked')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
}>();

defineEmits(["clicked"]);
</script>

<style scoped>
.btn-primary {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  padding: 14px 18px;
  border: 2px solid black;
  text-transform: uppercase;
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
    rgba(0,0,0,0.3) 0 -3px 0 inset;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-4px) scale(1.05);
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.3;
  filter: grayscale(0.1);
}

.btn-primary:disabled:hover {
  filter: none;
  transform: none;
}
</style>