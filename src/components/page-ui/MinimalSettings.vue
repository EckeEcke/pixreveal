<template>
  <div class="minimal-settings" :class="{ bottom: bottom }">
    <button @click="soundStore.isAudioEnabled = !soundStore.isAudioEnabled">
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
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";
import { ref } from "vue";

defineProps({
  bottom: Boolean,
});

const soundStore = useSoundStore();

const isFullscreen = ref(!!document.fullscreenElement);

const toggleFullscreen = () => {
  const elem = document.documentElement;
  soundStore.playSound("click");
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};
</script>

<style scoped>
.minimal-settings {
  position: fixed;
  top: 8px;
  right: 8px;
}

button {
  color: white;
}

.bottom {
  top: unset;
  bottom: 8px;
}
</style>
