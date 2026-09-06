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
      <span
        v-if="link.isTwitch && twitchLive"
        class="twitch-live-dot"
        aria-label="Twitch is live"
      ></span>
    </a>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

defineProps({
  twitchLive: {
    type: Boolean,
    default: false,
  },
});

const socialLinks = [
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
    href: "https://www.twitch.tv/eckeeckeecke",
    icon: "pixel:twitch",
    title: "Watch on Twitch",
    isTwitch: true,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61580781216710",
    icon: "streamline-pixel:logo-social-media-facebook-circle",
    title: "Follow on Facebook",
  },
];
</script>

<style scoped>
.social-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.btn-outline {
  position: relative;
  padding: 8px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: none;
  color: var(--white);
  opacity: 0.8;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.twitch-live-dot {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 9px;
  height: 9px;
  border: 2px solid var(--bg-dark);
  border-radius: 50%;
  background: var(--neon-error);
  box-shadow: 0 0 8px var(--neon-error);
  animation: twitch-live-pulse 1.2s ease-in-out infinite;
}

@keyframes twitch-live-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.8);
  }
}

.social-bar .btn-outline:hover {
  background: var(--neon-social);
  box-shadow: 0 0 20px var(--white);
  opacity: 1;
  transform: translateY(-2px);
}
</style>
