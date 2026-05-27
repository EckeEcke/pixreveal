<template>
  <div
    class="moderator-wrapper"
    :class="isTalking ? 'cyan-bg' : 'primary-bg'"
  >
    <img
      v-show="isTalking"
      src="@/assets/avatars/robot-run.gif"
      alt="robot moderator"
      class="talking"
    />
    <img v-show="!isTalking" src="@/assets/avatars/robot-idle.gif" alt="robot moderator" />
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
  transition: all 0.3s ease-in-out;
  height: 60px;
  width: 60px;
  overflow: hidden;
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
}

.cyan-bg {
  background: var(--neon-cyan);
}

.primary-bg {
  background: var(--primary);
}
</style>
