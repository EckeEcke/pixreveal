<template>
  <div class="moderator-wrapper">
    <img
      v-if="isTalking"
      src="@/assets/avatars/robot-run.gif"
      alt="robot moderator"
      class="talking"
    />
    <img v-else src="@/assets/avatars/robot-idle.gif" alt="robot moderator" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isTalking?: boolean;
}>();
</script>

<style scoped>
.moderator-wrapper {
  position: relative;
  height: 60px;
  width: 60px;
  overflow: hidden;
  background: var(--primary);
  border-radius: 8px;
  @media (min-width: 576px) {
    height: 80px;
    width: 80px;
  }
}

img {
  position: absolute;
  transition: all 0.3s ease-in-out;
  top: -5px;
  left: -10px;
  height: 80px;
  width: auto;
  @media (min-width: 576px) {
    top: -20px;
    left: -20px;
    height: 120px;
  }
}

.talking {
  top: -10px;
  background: var(--neon-cyan);
}
</style>
