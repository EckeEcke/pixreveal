<template>
  <header v-show="!configStore.showManual">
    <div>
      <h1 class="logo">
        Pix<span>Reveal</span>
        <span class="hook">Guess the pixel art</span>
      </h1>
    </div>
    <div class="header-actions">
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
  transition: transform 0.15s ease, filter 0.15s ease;
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
}
</style>
