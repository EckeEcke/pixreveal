<template>
  <div class="container">
    <button class="back-btn" @click="$router.back()" data-sfx="back">
      <Icon icon="pixel:angle-left-solid" />
    </button>
    <h1 class="logo">USER <span>GALLERY</span></h1>
    <InfoBox>
      <div>
        Check pixel art submitted by PixReveal players. Activate user generated
        content to include user art in the game. Use the
        <router-link to="/editor">editor</router-link> to create and submit your
        own drawings.
      </div>
    </InfoBox>
    <label for="art">Choose user art</label>
    <select v-model="selectedDrawingIndex" id="art" class="drawing-select">
      <option
        v-for="(drawing, index) in userDrawings"
        :key="index"
        :value="index"
      >
        {{ drawing.name }}
      </option>
    </select>
    <PixelCanvas
      v-if="selectedDrawing"
      :pixel-array="selectedDrawing.data"
      :is-revealing="false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import { Icon } from "@iconify/vue";
import { useConfigStore } from "@/stores/config";
import InfoBox from "@/components/game-ui/InfoBox.vue";

const configStore = useConfigStore();

const userDrawings = computed(() => configStore.ugcDrawings);

const selectedDrawingIndex = ref(0);

const selectedDrawing = computed(() => {
  return userDrawings.value[selectedDrawingIndex.value];
});
</script>

<style scoped>
.container {
  width: 600px;
  max-width: 100%;
  padding-bottom: 64px;
}

label {
  display: block;
  margin-top: 32px;
}

select {
  width: 100%;
  background: #2a2d3e;
  border: 1px solid var(--border-color);
  color: var(--white);
  padding: 8px 12px;
  margin: 8px 0 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
}

select:hover {
  border-color: var(--primary);
}

select:focus {
  outline: none;
  border-color: var(--primary);
}

a {
  color: var(--primary);
  font-weight: 900;
}
</style>
