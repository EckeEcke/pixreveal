<template>
  <Analytics />
  <div class="pixelCon">
    <div
      v-for="n in 80"
      :key="n"
      class="pixel"
      :style="{ animationDelay: Math.random() * 5000 + 'ms' }"
    ></div>
  </div>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    <audio ref="audio" loop></audio>
  </div>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import { useSoundStore } from "./stores/sound";
import { usePlayerStore } from "./stores/player";
import { Analytics } from "@vercel/analytics/vue";

const playerStore = usePlayerStore();

const soundStore = useSoundStore();

const audio = ref(null);

const handleAudioState = async (isEnabled) => {
  if (!audio.value || playerStore.isCreatorMode) return;

  if (isEnabled) {
    if (!audio.value.src) {
      const musicPath = new URL("./assets/audio/music.mp3", import.meta.url)
        .href;
      audio.value.src = musicPath;
    }

    try {
      await audio.value.play();
    } catch (err) {
      console.warn("Autoplay blocked. Waiting for user interaction.");
    }
  } else {
    audio.value.pause();
  }
};
watch(
  () => soundStore.isAudioEnabled,
  (isEnabled) => {
    handleAudioState(isEnabled);
  },
);

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("creator") === "true") {
    playerStore.isCreatorMode = true;
  }
  handleAudioState(soundStore.isAudioEnabled);
});
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 32px);
  padding: 16px;
  position: relative;
  z-index: 1;
}

.pixelCon {
  position: fixed;
  width: 120%;
  height: 120%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  opacity: 0.9;
}

.pixel {
  background: var(--purple-glow);
  width: 10%;
  padding-top: 10%;
  float: left;
  opacity: 0;
  animation: blink 10s infinite;
  filter: blur(1px);
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.4;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
