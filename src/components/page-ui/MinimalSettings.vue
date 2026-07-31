<template>
  <div class="minimal-settings" :class="{ bottom: bottom }">
    <button
      v-if="!hideKeyboard"
      class="keyboard-btn"
      @click="handleToggleKeyHints"
      title="Toggle Keyboard Shortcuts"
    >
      <Icon
        class="status-icon"
        :icon="
          configStore.showKeyHints
            ? 'material-symbols:keyboard-alt-sharp'
            : 'material-symbols:keyboard-off-sharp'
        "
      />
    </button>

    <button @click="toggleSound">
      <Icon
        class="status-icon"
        :icon="
          soundStore.isAudioEnabled
            ? 'pixel:sound-on-solid'
            : 'pixel:sound-mute-solid'
        "
      />
    </button>

    <button @click="toggleFullscreen">
      <Icon
        class="status-icon"
        :icon="isFullscreen ? 'pixel:expand-solid' : 'pixel:expand'"
      />
    </button>
  </div>
</template>

<script setup>
import { useConfigStore } from "@/stores/config";
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";
import { ref } from "vue";

defineProps({
  bottom: Boolean,
  hideKeyboard: Boolean,
});

const soundStore = useSoundStore();
const configStore = useConfigStore();

const isFullscreen = ref(!!document.fullscreenElement);

const handleToggleKeyHints = () => {
  soundStore.playSound("click");
  configStore.toggleKeyHints();
};

const toggleSound = () => {
  soundStore.isAudioEnabled = !soundStore.isAudioEnabled;
  soundStore.playSound("click");
};

const toggleFullscreen = () => {
  const elem = document.documentElement;
  soundStore.playSound("click");
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    isFullscreen.value = false;
  }
};
</script>

<style scoped>
.minimal-settings {
  position: fixed;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition:
    opacity 0.2s ease,
    transform 0.1s ease;
}

button:hover {
  opacity: 1;
}

button:active {
  transform: scale(0.9);
}

.status-icon {
  font-size: 16px;
}

@media (pointer: coarse) {
  .keyboard-btn {
    display: none;
  }
}

.bottom {
  top: unset;
  bottom: 8px;
}
</style>
