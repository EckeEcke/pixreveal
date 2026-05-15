<template>
  <div class="moderator-wrapper">
    <img src="@/assets/avatars/robot-idle.gif" alt="Lights Out Effect" />
  </div>
</template>

<style scoped>
.moderator-wrapper {
  position: relative;
  height: 80px;
  width: 80px;
  overflow: hidden;
  background: var(--primary);
  border-radius: 8px;
}

img {
  position: absolute;
  top: -20px;
  left: -20px;
  height: 120px;
  width: auto;
}
</style>
