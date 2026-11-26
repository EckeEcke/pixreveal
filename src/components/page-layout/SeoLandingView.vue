<template>
  <SeoLandingPage
    :page="page"
    :is-starting="isStarting"
    :start-error="startError"
    @play="playClassic"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import SeoLandingPage from "./SeoLandingPage.vue";
import { useSingleplayerStart } from "@/composables/useSingleplayerStart";
import type { SeoLandingContent } from "@/data/seoLandingPages";

defineProps<{ page: SeoLandingContent }>();
const { startSingleplayer, isStarting } = useSingleplayerStart();
const startError = ref("");

const playClassic = async () => {
  if (isStarting.value) return;
  startError.value = "";
  try {
    if (await startSingleplayer("classic")) return;
  } catch {
    // Keep the landing page usable if game data cannot be loaded.
  }
  startError.value = "The game couldn't load. Please try again.";
};
</script>
