<template>
  <header v-show="!configStore.showManual">
    <div>
      <router-link to="/" class="logo-link">
        <h1 class="logo">
          Pix<span>Reveal</span>
          <span class="hook">Guess the pixel art</span>
        </h1>
      </router-link>
    </div>
    <div class="header-actions">
      <a
        v-if="twitchLive"
        class="live-badge"
        href="https://www.twitch.tv/eckeeckeecke"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Watch the live Twitch stream"
      >
        <span class="live-dot"></span>
        <Icon icon="pixel:twitch" class="twitch-icon" />
        <span class="live-text">LIVE</span>
      </a>
      <button
        class="avatar-btn"
        type="button"
        aria-label="Edit player"
        data-sfx="click"
        @click="showPlayerEditModal = true"
      >
        <span class="avatar-image" :style="avatarStyle"></span>
      </button>
      <SettingsButton />
    </div>
  </header>
  <div class="back-btn-wrapper">
    <button
      v-if="showBackBtn"
      class="back-btn"
      @click="$router.back()"
      data-sfx="back"
    >
      <Icon icon="pixel:angle-left-solid" />
    </button>
  </div>

  <PlayerEditModal
    v-if="showPlayerEditModal"
    title="EDIT PLAYER"
    btn-text="CONFIRM"
    @btn-click="showPlayerEditModal = false"
    @close="showPlayerEditModal = false"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useConfigStore } from "@/stores/config";
import { usePlayerStore } from "@/stores/player";
import SettingsButton from "@/components/page-ui/SettingsButton.vue";
import PlayerEditModal from "@/components/modals/PlayerEditModal.vue";
import { Icon } from "@iconify/vue";
import avatarSpriteSheet from "@/assets/avatars/avatars.webp";

defineProps<{
  showBackBtn?: Boolean;
  twitchLive?: boolean;
}>();

const configStore = useConfigStore();
const playerStore = usePlayerStore();
const showPlayerEditModal = ref(false);

const avatarStyle = computed(() => {
  const index = playerStore.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${col * 20}% ${row * 20}%`,
    backgroundSize: "600%",
  };
});
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  width: 100%;
  max-width: 700px;
  box-sizing: border-box;
  @media (min-width: 1024px) {
    max-width: 1000px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.7));
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  margin-right: 16px;
  border: 2px solid var(--neon-error);
  border-radius: 6px;
  color: #fff;
  background: rgba(255, 0, 60, 0.2);
  font-family: var(--font-display), sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-decoration: none;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.7));
  transition: transform 0.15s ease, background 0.15s ease, filter 0.15s ease;
}

@media (max-width: 499px) {
  .live-badge {
    display: none;
    margin-right: 8px;
  }
}

.live-badge:hover {
  transform: translateY(-2px);
  filter: drop-shadow(5px 5px 0 rgba(0, 0, 0, 0.7));
  background: rgba(255, 0, 60, 0.35);
}

.live-dot {
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
  background: var(--neon-error);
  box-shadow: 0 0 6px var(--neon-error);
  animation: live-pulse 1.2s ease-in-out infinite;
}

.twitch-icon {
  font-size: 14px;
  color: var(--neon-social);
  filter: drop-shadow(1px 0 0 #fff) 
          drop-shadow(-1px 0 0 #fff) 
          drop-shadow(0 1px 0 #fff) 
          drop-shadow(0 -1px 0 #fff);
}

.live-text {
  line-height: 1;
}

@keyframes live-pulse {
  50% {
    opacity: 0.35;
  }
}

.avatar-btn:hover {
  transform: translateY(-2px);
  filter: drop-shadow(5px 5px 0 rgba(0, 0, 0, 0.7));
}

.avatar-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.avatar-image {
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.15);
  @media (min-width: 1024px) {
    width: 44px;
    height: 44px;
  }
}

.hook {
  display: block;
  font-family: var(--font-display), sans-serif;
  font-size: 16px;
  letter-spacing: 3px;
  margin-top: 2px;
  color: var(--white);
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6);
  @media (max-width: 575px) {
    font-size: 13px;
  }
  @media (min-width: 1024px) {
    font-size: 20px;
  }
}

h1 {
  margin: 0;
  text-align: start;
  @media (max-width: 575px) {
    font-size: 18px;
  }
}

h2 {
  margin: 0;
}

.back-btn-wrapper {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  @media (min-width: 1024px) {
    max-width: 1000px;
  }
}

.logo-link {
  text-decoration: none;
}
</style>