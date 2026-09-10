<template>
  <div class="header-settings">
    <button @click="toggleSound" title="Toggle Sound">
      <Icon
        class="status-icon"
        :icon="
          soundStore.isAudioEnabled
            ? 'pixel:sound-on-solid'
            : 'pixel:sound-mute-solid'
        "
      />
    </button>

    <button @click="toggleFullscreen" title="Toggle Fullscreen">
      <Icon
        class="status-icon"
        :icon="isFullscreen ? 'pixel:expand-solid' : 'pixel:expand'"
      />
    </button>
  </div>
</template>

<script setup>
import { useSoundStore } from "@/stores/sound"
import { Icon } from "@iconify/vue"
import { ref, onMounted, onUnmounted } from "vue"

const soundStore = useSoundStore()

const isFullscreen = ref(!!document.fullscreenElement)

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange)
})

const toggleSound = () => {
  soundStore.isAudioEnabled = !soundStore.isAudioEnabled
  soundStore.playSound("click")
}

const toggleFullscreen = () => {
  const elem = document.documentElement
  soundStore.playSound("click")
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}
</script>

<style scoped>
.header-settings {
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 375px) {
    gap: 0;
  }
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition:
    opacity 0.2s ease,
    transform 0.1s ease;
}

button:hover {
  opacity: 1;
}

.status-icon {
  font-size: 20px;
}

button:active {
  transform: scale(0.9);
}

</style>