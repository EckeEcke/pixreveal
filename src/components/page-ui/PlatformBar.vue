<template>
  <div class="social-bar">
    <a
      v-for="link in socialLinks"
      :key="link.href"
      :href="link.href"
      :title="link.title"
      :aria-label="link.title"
      target="_blank"
      rel="noopener noreferrer"
      class="social-btn"
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

  @media (min-width: 600px) {
    justify-content: flex-start;
  }
}

.social-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 22px;
  color: var(--white);
  text-decoration: none;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 8px;
  opacity: 0.85;
  transition: all 0.2s ease;
}

.social-btn:hover {
  background: var(--neon-social);
  border-color: transparent;
  box-shadow: 0 0 20px var(--white);
  opacity: 1;
  transform: translateY(-2px);
}

.twitch-live-dot {
  position: absolute;
  top: -4px;
  right: -4px;
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
</style>