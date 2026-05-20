<template>
  <div class="settings-wrapper">
    <div class="settings-btn-wrapper">
      <button @click="openSettings">
        <Icon icon="pixel:cog-solid" class="settings-btn" data-sfx="click" />
      </button>
      <span
        v-if="!soundStore.isAudioEnabled && !hasOpenedSettings"
        class="notification-badge"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { useSoundStore } from "@/stores/sound";
import { ref } from "vue";
import { useConfigStore } from "@/stores/config";

const hasOpenedSettings = ref(false);

const soundStore = useSoundStore();
const configStore = useConfigStore();

const openSettings = () => {
  hasOpenedSettings.value = true;
  configStore.openSettings();
};
</script>

<style scoped>
.settings-btn-wrapper {
  min-width: 32px;
  position: relative;
  button {
    padding: 0;
  }
}

button {
  display: flex;
}

.settings-btn {
  flex: 0 0 auto;
  font-size: 32px;
  color: var(--white);
  transition: all 0.3s;
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.7));
  padding-right: 0;
}

.settings-btn:hover {
  color: #aaaaaa;
  transform: translateY(-2px) rotate(45deg);
  filter: drop-shadow(5px 5px 0 rgba(0, 0, 0, 0.7));
}
.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: var(--primary);
  border-radius: 50%;
}

.notification-badge::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--primary);
  border-radius: 50%;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
