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
            <p>Unlock new avatars by collecting {{ AVATAR_UNLOCK_THRESHOLD }} achievements.</p>
          </div>
          <span class="section-progress" :class="{ 'section-progress--unlocked': achievementsStore.hasBonusAvatars }">
            {{ achievementsStore.hasBonusAvatars ? "UNLOCKED" : `${Math.min(achievementsStore.cosmeticProgress, AVATAR_UNLOCK_THRESHOLD)}/${AVATAR_UNLOCK_THRESHOLD}` }}
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

      <section class="unlockable-section">
        <div class="section-heading">
          <div>
            <h3>Avatar Effects</h3>
            <p>Collect achievements to unlock {{ AVATAR_EFFECTS.length }} avatar effects.</p>
          </div>
          <span class="section-progress">
            {{ Math.min(achievementsStore.cosmeticProgress, avatarEffectsTarget) }}/{{ avatarEffectsTarget }}
          </span>
        </div>
        <div class="effect-preview-list">
          <div v-for="effect in AVATAR_EFFECTS" :key="effect.id" class="effect-preview" :class="{ 'effect-preview--unlocked': achievementsStore.cosmeticProgress >= effect.unlockAt }" :title="effect.description">
            <span class="avatar-preview preview-sample" :class="effect.id" :style="getAvatarStyle(0, 'unlockables')" aria-hidden="true" />
            <div class="effect-copy">
              <span>{{ effect.title }}</span>
              <small>{{ achievementsStore.cosmeticProgress >= effect.unlockAt ? 'UNLOCKED' : `${effect.unlockAt} achievements` }}</small>
            </div>
          </div>
        </div>
      </section>

      <section class="unlockable-section">
        <div class="section-heading">
          <div>
            <h3>Name Effects</h3>
            <p>Collect achievements to unlock {{ NAME_EFFECTS.length }} name effects.</p>
          </div>
          <span class="section-progress">
            {{ Math.min(achievementsStore.cosmeticProgress, nameEffectsTarget) }}/{{ nameEffectsTarget }}
          </span>
        </div>
        <div class="effect-preview-list">
          <div v-for="effect in NAME_EFFECTS" :key="effect.id" class="effect-preview" :class="{ 'effect-preview--unlocked': achievementsStore.cosmeticProgress >= effect.unlockAt }" :title="effect.description">
            <strong :class="`name-effect-${effect.id}`">PLAYER</strong>
            <div class="effect-copy">
              <span>{{ effect.title }}</span>
              <small>{{ achievementsStore.cosmeticProgress >= effect.unlockAt ? 'UNLOCKED' : `${effect.unlockAt} achievements` }}</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { Icon } from "@iconify/vue"
import ModalWrapper from "@/components/modals/ModalWrapper.vue"
import {
  BONUS_AVATAR_ACHIEVEMENT_THRESHOLD,
  AVATAR_EFFECTS,
  NAME_EFFECTS,
} from "@/data/unlockables"
import { useAchievementsStore } from "@/stores/achievements"
import { getAvatarStyle } from "@/utils/avatar"

const emit = defineEmits<{ close: [] }>()

const achievementsStore = useAchievementsStore()
const AVATAR_UNLOCK_THRESHOLD = BONUS_AVATAR_ACHIEVEMENT_THRESHOLD
const bonusAvatarPreviews = Array.from({ length: 6 }, (_, index) => index)

const avatarEffectsTarget = Math.max(...AVATAR_EFFECTS.map(effect => effect.unlockAt))
const nameEffectsTarget = Math.max(...NAME_EFFECTS.map(effect => effect.unlockAt))

onMounted(() => {
  void achievementsStore.loadAchievements()
})
</script>

<style scoped>
h2 {
  padding-right: 34px;
  margin-bottom: 16px;
}

.unlockable-list {
  display: grid;
  gap: 10px;
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

.preview-sample {
  width: 36px;
  height: 36px;
}

.effect-preview-list {
  display: grid;
  gap: 6px;
}

.effect-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.22);
}

.effect-preview strong {
  overflow: hidden;
  color: #fff;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.effect-preview span {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
}

.effect-copy {
  display: grid;
  gap: 3px;
  text-align: right;
}

.effect-copy small {
  color: var(--primary);
  font-size: 10px;
}

.effect-preview--unlocked {
  border-color: rgba(0, 255, 179, 0.18);
}

.section-progress--unlocked,
.effect-preview--unlocked small {
  color: var(--neon-mint);
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
