<template>
  <button class="btn-secondary" @click="$emit('clicked')">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineEmits(["clicked"]);
</script>

<style scoped>
.btn-secondary {
  --edge: 4px; /* Sockelhöhe, an den Primary-Button angleichen */

  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: var(--edge); /* reserviert Platz für den Sockel */
  padding: 14px 18px;
  background: #29282d;
  color: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  box-shadow: 0 var(--edge) 0 rgba(0, 0, 0, 0.45);
  text-transform: uppercase;
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.btn-secondary:hover {
  color: #fff;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 calc(var(--edge) + 2px) 0 rgba(0, 0, 0, 0.45);
}

.btn-secondary:active {
  transform: translateY(calc(var(--edge) - 2px));
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.45);
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>