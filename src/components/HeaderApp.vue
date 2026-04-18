<template>
  <header v-show="!configStore.showManual">
    <div class="back-btn-wrapper">
      <button v-if="showBackBtn" class="back-btn" @click="$router.back()">
        <Icon icon="pixel:arrow-circle-left-solid" />
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
  width: 40px;
}

.back-btn {
  display: flex;
  align-items: center;
  border: none;
  background: none;
  color: var(--white);
  cursor: pointer;
  padding: 0;
  font-family: var(--font-display);
  font-size: 24px;
  opacity: 0.7;
  transition: all 0.2s ease;
  @media (min-width: 576px) {
    font-size: 32px;
  }
}

.back-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}
</style>
