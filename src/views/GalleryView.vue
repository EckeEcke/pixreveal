<template>
  <div class="gallery-container">
    <button class="back-btn" aria-label="Go back" @click="$router.back()" data-sfx="back">
      <Icon icon="pixel:angle-left-solid" />
    </button>
    <header class="gallery-header">
      <div>
        <h1 class="logo">USER <span>GALLERY</span></h1>
        <p class="intro">Pixel art made by PixReveal players.</p>
        <p class="gallery-hint">Enable user art in settings to play with these drawings.</p>
      </div>
      <ButtonLinkPrimary link="/editor">Create pixel art</ButtonLinkPrimary>
    </header>

    <div v-if="isLoading" class="hint" role="status">
      <LoadingAnimation text="Loading user art..." />
    </div>
    <p v-else-if="loadFailed" class="hint" role="alert">
      Could not load user art. <button class="retry-link" @click="loadDrawings">Try again</button>
    </p>
    <p v-else-if="!userDrawings.length" class="hint">No user drawings found.</p>

    <div v-if="userDrawings.length" class="gallery-grid">
      <figure v-for="(drawing, index) in userDrawings" :key="index" class="tile">
        <button
          class="art-button"
          :disabled="!imageUrls[index]"
          :aria-label="'View ' + drawing.name"
          @click="openDrawing(index)"
        >
          <img v-if="imageUrls[index]" class="preview" :src="imageUrls[index]" :alt="drawing.name" width="256" height="256" loading="lazy" />
          <div v-else class="preview placeholder">
            <LoadingAnimation v-if="isGenerating" size="small" aria-label="Loading preview" />
            <span v-else>Preview unavailable</span>
          </div>
        </button>
        <figcaption class="tile-caption">
          <span class="tile-title">{{ drawing.name }}</span>
          <span v-if="drawing.category" class="tile-category">{{ drawing.category }}</span>
        </figcaption>
      </figure>
    </div>

    <dialog ref="artDialog" class="art-dialog" aria-labelledby="art-title" @click="closeOnBackdrop" @close="selectedIndex = null" @keydown.left.prevent="navigateDrawing(-1)" @keydown.right.prevent="navigateDrawing(1)" @keydown.esc.stop.prevent="artDialog.close()">
      <template v-if="selectedDrawing">
        <header class="dialog-header">
          <div>
            <h2 id="art-title">{{ selectedDrawing.name }}</h2>
            <p class="tile-category">{{ selectedDrawing.category }}</p>
          </div>
          <button class="close-btn" type="button" aria-label="Close drawing" data-sfx="back" @click="artDialog.close()" autofocus>
            <Icon icon="pixel:window-close-solid" />
          </button>
        </header>
        <img class="preview enlarged-preview" :src="imageUrls[selectedIndex]" :alt="selectedDrawing.name" width="256" height="256" />
        <nav class="drawing-navigation" aria-label="Browse drawings">
          <ButtonSecondary :disabled="previousIndex === -1" data-sfx="click" @clicked="navigateDrawing(-1)">
            <Icon icon="pixel:angle-left-solid" /> Previous
          </ButtonSecondary>
          <span>{{ selectedIndex + 1 }} / {{ userDrawings.length }}</span>
          <ButtonSecondary :disabled="nextIndex === -1" data-sfx="click" @clicked="navigateDrawing(1)">
            Next <Icon icon="pixel:angle-right-solid" />
          </ButtonSecondary>
        </nav>
      </template>
    </dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useConfigStore } from "@/stores/config";
import { useDrawingImageUrls } from "@/composables/useDrawingImageUrls";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue";
import LoadingAnimation from "@/components/page-layout/LoadingAnimation.vue";

const configStore = useConfigStore();
const isLoading = ref(false);
const loadFailed = ref(false);
const artDialog = ref(null);
const selectedIndex = ref(null);
const userDrawings = computed(() =>
  Array.isArray(configStore.ugcDrawings) ? [...configStore.ugcDrawings].reverse() : [],
);
const { imageUrls, isGenerating } = useDrawingImageUrls(userDrawings);
const selectedDrawing = computed(() => selectedIndex.value === null ? null : userDrawings.value[selectedIndex.value]);

const loadDrawings = async () => {
  isLoading.value = true;
  loadFailed.value = false;
  try {
    await configStore.fetchUgcDrawings();
    loadFailed.value = !configStore.ugcLoaded;
  } catch {
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
};
onMounted(loadDrawings);

const findAdjacent = (direction) => {
  if (selectedIndex.value === null) return -1;
  for (let index = selectedIndex.value + direction; index >= 0 && index < userDrawings.value.length; index += direction) {
    if (imageUrls.value[index]) return index;
  }
  return -1;
};
const previousIndex = computed(() => findAdjacent(-1));
const nextIndex = computed(() => findAdjacent(1));
const navigateDrawing = (direction) => {
  const index = findAdjacent(direction);
  if (index !== -1) selectedIndex.value = index;
};
const openDrawing = async (index) => {
  if (!imageUrls.value[index]) return;
  selectedIndex.value = index;
  await nextTick();
  artDialog.value?.showModal();
};
const closeOnBackdrop = (event) => {
  if (event.target !== artDialog.value) return;
  const bounds = artDialog.value.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    artDialog.value.close();
  }
};
watch(userDrawings, () => {
  artDialog.value?.close();
  selectedIndex.value = null;
});
</script>

<style scoped>
.gallery-container {
  width: 100%;
  max-width: 1000px;
  margin-inline: auto;
  padding: 0 16px 64px;
  box-sizing: border-box;
}
.gallery-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
  margin: 16px 0 28px;
}
.logo { margin: 0 0 12px; }
.intro { margin: 0; line-height: 1.5; }
.gallery-hint { margin: 6px 0 0; color: var(--color-secondary); font-size: 13px; line-height: 1.5; }
.hint { margin-block: 24px; color: var(--color-secondary); }
.retry-link { color: var(--primary); font: inherit; text-decoration: underline; }
.gallery-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 28px 20px; }
.tile { margin: 0; min-width: 0; }
.art-button {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  overflow: hidden;
}
.art-button:disabled { cursor: default; }
.art-button:hover:not(:disabled) { outline: 1px solid var(--primary); outline-offset: 3px; }
.art-button:focus-visible, .art-dialog button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
.preview {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border-radius: 6px;
}
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #120f1f;
  color: var(--color-secondary);
  font: 13px var(--font-display);
}
.tile-caption { display: flex; flex-direction: column; gap: 5px; padding-top: 12px; }
.tile-title { font-size: 16px; font-weight: 700; text-transform: uppercase; color: var(--white); overflow-wrap: anywhere; }
.tile-category { margin: 0; font-size: 12px; color: var(--color-secondary); line-height: 1.5; }
.art-dialog {
  width: min(560px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: #120f1f;
  color: var(--white);
}
.art-dialog::backdrop { background: rgba(0, 0, 0, 0.8); }
.dialog-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.dialog-header { padding-right: 32px; }
.dialog-header h2 { margin: 0 0 4px; font-size: 20px; overflow-wrap: anywhere; }
.enlarged-preview { max-height: calc(100dvh - 210px); object-fit: contain; }
.drawing-navigation { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 16px; font-size: 12px; }
.drawing-navigation :deep(.btn-secondary:disabled) {
  opacity: 0.3;
  cursor: default;
  transform: none;
}
@media (max-width: 400px) {
  .drawing-navigation { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drawing-navigation > span { grid-column: 1 / -1; grid-row: 1; text-align: center; }
}
@media (min-width: 576px) { .gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 900px) { .gallery-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
</style>
