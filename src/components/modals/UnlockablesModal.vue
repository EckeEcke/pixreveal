<template>
  <ModalWrapper @close="emit('close')">
    <button
      class="close-btn"
      type="button"
      aria-label="Close unlockables"
      data-sfx="back"
      @click="emit('close')"
    >
      <Icon icon="pixel:window-close-solid" />
    </button>

    <h2>Unlockables</h2>
    <div class="unlockable-list">
      <section class="unlockable-section" :class="{ locked: !achievementsStore.hasBonusAvatars }">
        <div class="section-heading">
          <div>
            <h3>Bonus Avatars</h3>
            <p>Unlock new avatars by collecting 3 achievements.</p>
          </div>
          <span class="section-progress">
            {{ achievementsStore.hasBonusAvatars ? "UNLOCKED" : `${Math.min(achievementsStore.unlockedCount, AVATAR_UNLOCK_THRESHOLD)}/${AVATAR_UNLOCK_THRESHOLD}` }}
          </span>
        </div>
        <div class="avatar-preview-grid">
          <span
            v-for="avatar in bonusAvatarPreviews"
            :key="avatar"
            class="avatar-preview"
            :style="getAvatarStyle(avatar, 'unlockables')"
          />
        </div>
      </section>

      <section class="unlockable-section" :class="{ locked: !achievementsStore.hasNameEffects }">
        <div class="section-heading">
          <div>
            <h3>Name Effects</h3>
            <p>Unlock all 3 effects by collecting 6/9/12 achievements.</p>
          </div>
          <span class="section-progress">
            {{ achievementsStore.hasNameEffects ? "UNLOCKED" : `${achievementsStore.unlockedCount}/${ACHIEVEMENTS.length}` }}
          </span>
        </div>
        <div class="effect-preview-list">
          <div v-for="effect in NAME_EFFECTS" :key="effect.id" class="effect-preview">
              <strong :class="`name-effect-${effect.id}`">PLAYER</strong>
            <span>{{ effect.title }}</span>
          </div>
        </div>
      </section>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import { ACHIEVEMENTS } from "@/data/achievements";
import {
  BONUS_AVATAR_ACHIEVEMENT_THRESHOLD,
  NAME_EFFECTS,
} from "@/data/unlockables";
import { useAchievementsStore } from "@/stores/achievements";
import { getAvatarStyle } from "@/utils/avatar";

const emit = defineEmits<{ close: [] }>();

const achievementsStore = useAchievementsStore();
const AVATAR_UNLOCK_THRESHOLD = BONUS_AVATAR_ACHIEVEMENT_THRESHOLD;
const bonusAvatarPreviews = Array.from({ length: 6 }, (_, index) => index);

onMounted(() => {
  void achievementsStore.loadAchievements();
});
</script>

<style scoped>
h2 {
  padding-right: 34px;
  margin-bottom: 16px;
}

.unlockable-list {
  display: grid;
  gap: 10px;
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 4px;
}

.unlockable-section {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
}

.unlockable-section.locked {
  opacity: 0.68;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-display), sans-serif;
  font-size: 14px;
}

.section-heading p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  line-height: 1.4;
}

.section-progress {
  flex: 0 0 auto;
  color: var(--primary);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.avatar-preview-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}

.avatar-preview {
  display: block;
  aspect-ratio: 1;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.3);
  background-repeat: no-repeat;
  image-rendering: pixelated;
}

.effect-preview-list {
  display: grid;
  gap: 6px;
}

.effect-preview {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 7px 9px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.22);
}

.effect-preview strong {
  overflow: hidden;
  color: #fff;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.effect-preview span {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
}

@media (max-width: 420px) {
  .unlockable-section {
    padding: 10px;
  }

  .section-heading {
    gap: 8px;
  }

  .avatar-preview-grid {
    gap: 4px;
  }
}
</style>
