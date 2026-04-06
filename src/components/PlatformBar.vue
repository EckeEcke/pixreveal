<template>
  <div class="social-bar">
    <a
      href="https://www.facebook.com/profile.php?id=61580781216710"
      target="_blank"
      class="btn-outline"
      title="Follow on Facebook"
      data-sfx="click"
    >
      <Icon icon="streamline-pixel:logo-social-media-facebook-circle" />
    </a>

    <a
      href="https://www.youtube.com/@EckeEcke/shorts"
      target="_blank"
      class="btn-outline"
      title="Subscribe on YouTube"
      data-sfx="click"
    >
      <Icon icon="pixel:youtube" />
    </a>

    <a
      href="https://www.tiktok.com/@pixreveal.com"
      target="_blank"
      class="btn-outline"
      title="Follow on TikTok"
      data-sfx="click"
    >
      <Icon icon="pixel:tiktok" />
    </a>

    <a
      href="https://github.com/EckeEcke"
      target="_blank"
      class="btn-outline"
      title="View on GitHub"
      data-sfx="click"
    >
      <Icon icon="pixel:github" />
    </a>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
</script>

<style scoped>
.social-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.btn-outline {
  padding: 8px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: none;
  color: var(--white);
  filter: drop-shadow(0 0 8px var(--neon-social));
  opacity: 0.8;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-bar .btn-outline:hover {
  background: var(--neon-social);
  box-shadow: 0 0 20px var(--white);
  opacity: 1;
  transform: translateY(-2px);
}
</style>
