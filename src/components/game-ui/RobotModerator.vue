<template>
  <div class="moderator-wrapper">
    <img src="@/assets/avatars/robot-idle.gif" alt="Lights Out Effect" />
  </div>
</template>

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
  top: -5px;
  left: -10px;
  height: 80px;
  width: auto;
  @media(min-width: 576px) {
      top: -20px;
  left: -20px;
    height: 120px;
  }
}
</style>
