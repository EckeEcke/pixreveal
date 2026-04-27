<template>
  <header v-show="!configStore.showManual">
    <div class="back-btn-wrapper">
      <button v-if="showBackBtn" class="back-btn" @click="$router.back()">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>

    <div>
      <h1 class="logo">
        Pix<span>Reveal</span>
        <span class="hook">Guess the pixel art as it reveals.</span>
      </h1>
    </div>
    <SettingsButton />
  </header>
</template>

<script setup lang="ts">
import { useConfigStore } from "@/stores/config";
import SettingsButton from "@/components/page-ui/SettingsButton.vue";
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
  max-width: 600px;
  box-sizing: border-box;
}

.hook {
  display: block;
  font-family: var(--font-display), sans-serif;
  font-size: 14px;
  letter-spacing: 1px;
  margin-top: 2px;
  color: var(--white);
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.6);
  @media (max-width: 575px) {
    display: none;
  }
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
