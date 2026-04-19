<template>
  <header v-show="!configStore.showManual">
    <div class="back-btn-wrapper">
      <button v-if="showBackBtn" class="back-btn" @click="$router.back()">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>

    <div>
      <h1 class="logo">Pix<span>Reveal</span></h1>
      <h2 class="hook">Guess the pixel art as it reveals.</h2>
    </div>
    <SettingsButton />
  </header>
</template>

<script setup lang="ts">
import { useConfigStore } from "@/stores/config";
import SettingsButton from "./SettingsButton.vue";
import { Icon } from "@iconify/vue";

defineProps<{
  showBackBtn: Boolean;
}>();

const configStore = useConfigStore();
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  width: 100%;
  max-width: 800px;
  box-sizing: border-box;
  margin-bottom: 16px;
}

.hook {
  font-family: "Chakra Petch", sans-serif;
  font-size: 14px;
}

h1 {
  margin: 0;
}

h2 {
  margin: 0;
}

.back-btn-wrapper {
  min-width: 32px;
}
</style>
