<template>
  <ModalWrapper @close="emit('close')">
    <button
      class="close-btn"
      type="button"
      aria-label="Close achievements"
      data-sfx="back"
      @click="emit('close')"
    >
      <Icon icon="pixel:window-close-solid" />
    </button>

    <div class="heading-row">
      <h2>Achievements</h2>
      <p>{{ achievementsStore.unlockedCount }}/{{ ACHIEVEMENTS.length }} collected</p>
    </div>

    <div class="achievement-list">
      <article
        v-for="achievement in ACHIEVEMENTS"
        :key="achievement.id"
        class="achievement-row"
        :class="{ unlocked: achievementsStore.isUnlocked(achievement.id) }"
      >
        <span
          v-if="achievementsStore.isUnlocked(achievement.id)"
          class="achievement-icon"
          aria-hidden="true"
        >
          {{ achievement.icon }}
        </span>
        <span
          v-else
          class="achievement-icon locked-icon"
          role="img"
          aria-label="Locked"
          title="Locked"
        >
          <Icon icon="mdi:lock" />
        </span>
        <div class="achievement-copy">
          <h3>{{ achievement.title }}</h3>
          <p>{{ achievement.description }}</p>
        </div>
      </article>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useAchievementsStore } from "@/stores/achievements";

const emit = defineEmits<{ close: [] }>();

const achievementsStore = useAchievementsStore();

onMounted(() => {
  void achievementsStore.loadAchievements();
});
</script>

<style scoped>
.heading-row {
  padding-right: 34px;
  margin-bottom: 18px;
}

.heading-row h2 {
  margin-bottom: 4px;
}

.heading-row p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.45;
}

.achievement-list {
  display: grid;
  gap: 8px;
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 4px;
}

.achievement-list::-webkit-scrollbar {
  width: 6px;
}

.achievement-list::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: var(--primary);
}

.achievement-row {
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.035);
  opacity: 0.55;
}

.achievement-row.unlocked {
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12), transparent 50%), linear-gradient(135deg, rgba(32, 16, 46, 0.95), rgba(18, 9, 28, 0.98));
  opacity: 1;
}

.achievement-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.22);
  font-size: 24px;
}

.achievement-copy {
  min-width: 0;
}

h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-display), sans-serif;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.achievement-copy p {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  line-height: 1.4;
}

.locked-icon {
  color: rgba(255, 255, 255, 0.35);
}

.locked-icon :deep(svg) {
  font-size: 20px;
}

@media (max-width: 420px) {
  .achievement-row {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 9px;
  }

  .achievement-icon {
    width: 36px;
    height: 36px;
    font-size: 21px;
  }

}
</style>