<template>
  <ModalWrapper @close="emit('close')">
    <button
      class="close-btn"
      type="button"
      aria-label="Close player profile"
      data-sfx="back"
      @click="emit('close')"
    >
      <Icon icon="pixel:window-close-solid" />
    </button>

    <h2>PLAYER PROFILE</h2>

    <div class="profile-identity">
      <span class="avatar-image" :class="playerStore.playerAvatarEffect" :style="avatarStyle" aria-hidden="true" />
      <div class="player-copy">
        <span class="eyebrow">CURRENT PLAYER</span>
        <strong :class="nameEffectClass">{{ playerStore.playerName || "MYSTERY PLAYER" }}</strong>
      </div>
    </div>

    <div class="profile-actions">
      <button
        class="edit-action"
        type="button"
        data-sfx="click"
        @click="emit('edit')"
      >
        <Icon icon="pixel:edit-solid" class="edit-icon" />
        <span>EDIT PLAYER</span>
      </button>
      <button
        class="achievement-action"
        type="button"
        data-sfx="click"
        @click="emit('achievements')"
      >
        <Icon icon="pixel:trophy-solid" class="achievement-icon" />
        <span>ACHIEVEMENTS</span>
        <strong>{{ achievementsStore.unlockedCount }} / {{ ACHIEVEMENTS.length }}</strong>
      </button>
      <button
        class="unlockables-action"
        type="button"
        data-sfx="click"
        @click="emit('unlockables')"
      >
        <Icon icon="pixel:lock-alt-solid" class="unlockables-icon" />
        <span>UNLOCKABLES</span>
      </button>
      <button
        class="challenges-action"
        type="button"
        data-sfx="click"
        @click="emit('challenges')"
      >
        <Icon icon="at-icons:swords" class="challenges-icon" />
        <span>CHALLENGES</span>
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import { usePlayerStore } from "@/stores/player";
import { useAchievementsStore } from "@/stores/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getAvatarStyle } from "@/utils/avatar";

const emit = defineEmits<{
  close: [];
  edit: [];
  achievements: [];
  unlockables: [];
  challenges: [];
}>();

const playerStore = usePlayerStore();
const achievementsStore = useAchievementsStore();

const avatarStyle = computed(() =>
  getAvatarStyle(playerStore.avatarIndex, playerStore.avatarSpriteSheet),
);
const nameEffectClass = computed(() =>
  playerStore.playerNameEffect === "none"
    ? undefined
    : `name-effect-${playerStore.playerNameEffect}`,
);

onMounted(() => {
  void achievementsStore.loadAchievements();
});
</script>

<style scoped>
.profile-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
}

.avatar-image {
  display: block;
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background-color: #20232b;
  background-repeat: no-repeat;
  image-rendering: pixelated;
}

.player-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.eyebrow {
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
}

.player-copy strong {
  overflow-wrap: anywhere;
  color: #fff;
  font-family: var(--font-display), sans-serif;
  font-size: 20px;
  text-transform: uppercase;
}

.profile-actions {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.profile-actions button {
  display: flex;
  align-items: center;
  min-height: 48px;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.04);
  font-family: var(--font-display), sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  transition: 0.2s all;
  cursor: pointer;
}

.profile-actions button:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.09);
}

.edit-icon {
  color: var(--primary);
}

.achievement-icon {
  color: var(--neon-yellow, #ffe34d);
}

.unlockables-icon {
  color: var(--neon-cyan);
}

.achievement-action strong {
  margin-left: auto;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
</style>