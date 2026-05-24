<template>
  <div class="container">
    <button class="back-btn" @click="$router.back()" data-sfx="back">
      <Icon icon="pixel:angle-left-solid" />
    </button>
    <h1 class="logo">USER <span>GALLERY</span></h1>
    <LoadingOverlay :show="isGenerating" />
    <InfoBox>
      <div>
        Check pixel art submitted by PixReveal players. Activate user generated
        content to include user art in the game. Use the
        <router-link to="/editor">editor</router-link> to create and submit your
        own drawings.
      </div>
    </InfoBox>

    <div v-if="isGenerating" class="hint">Generating previews...</div>

    <div v-if="userDrawings.length" class="grid">
      <div v-for="(drawing, index) in userDrawings" :key="index" class="tile">
        <img
          v-if="imageUrls[index]"
          class="preview"
          :src="imageUrls[index]"
          :alt="drawing.name"
          loading="lazy"
        />
        <div v-else class="preview placeholder"></div>
        <div class="tile-title">{{ drawing.name }}</div>
      </div>
    </div>

    <div v-else class="hint">No user drawings found.</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useConfigStore } from "@/stores/config";
import InfoBox from "@/components/game-ui/InfoBox.vue";
import LoadingOverlay from "@/components/page-layout/LoadingOverlay.vue";
import { useDrawingImageUrls } from "@/composables/useDrawingImageUrls";

const configStore = useConfigStore();

const userDrawings = computed(() =>
  Array.isArray(configStore.ugcDrawings)
    ? [...configStore.ugcDrawings].reverse()
    : [],
);

const { imageUrls, isGenerating } = useDrawingImageUrls(userDrawings);
</script>

<style scoped>
.container {
  width: 600px;
  max-width: 100%;
  padding-bottom: 64px;
}

.hint {
  margin-top: 24px;
  opacity: 0.9;
}

.grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
  gap: 12px;
}

.tile {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 10px;
  backdrop-filter: blur(4px);
}

.preview {
  width: 100%;
  height: auto;
  border-radius: 6px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
  background: #0a0b10;
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.placeholder {
  aspect-ratio: 1 / 1;
}

.tile-title {
  margin-top: 8px;
  font-size: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--white);
  opacity: 0.95;
}

a {
  color: var(--primary);
  font-weight: 900;
}
</style>
