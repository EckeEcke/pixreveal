<template>
  <div class="social-bar">
    <a
      v-for="link in socialLinks"
      :key="link.href"
      :href="link.href"
      :title="link.title"
      target="_blank"
      class="btn-outline"
      data-sfx="click"
    >
      <Icon :icon="link.icon" />
    </a>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const socialLinks = [
  {
    href: "https://www.facebook.com/profile.php?id=61580781216710",
    icon: "streamline-pixel:logo-social-media-facebook-circle",
    title: "Follow on Facebook",
  },
  {
    href: "https://www.youtube.com/@EckeEcke/shorts",
    icon: "pixel:youtube",
    title: "Subscribe on YouTube",
  },
  {
    href: "https://www.tiktok.com/@pixreveal.com",
    icon: "pixel:tiktok",
    title: "Follow on TikTok",
  },
  {
    href: "https://github.com/EckeEcke",
    icon: "pixel:github",
    title: "View on GitHub",
  },
];
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
