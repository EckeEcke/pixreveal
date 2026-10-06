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
  /* 2px Rand + 10px/14px Padding = gleiche Außenmaße wie Primary (12px/16px ohne Rand) */
  padding: 10px 14px;
  background: #29282d;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  /* gleiche Schatten wie Primary, Sockel innen */
  box-shadow:
    rgba(45, 35, 66, 0.4) 0 2px 4px,
    rgba(45, 35, 66, 0.3) 0 7px 13px -3px,
    rgba(0, 0, 0, 0.3) 0 -3px 0 inset;
}

.btn-secondary:hover {
  color: #fff;
  border-color: var(--primary);
  transform: translateY(-4px) scale(1.05);
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>