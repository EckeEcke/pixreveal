<template>
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
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <audio ref="audio" :src="musicUrl" loop></audio>
  </div>
</template>

<script setup>
import { watch, ref } from "vue";
import musicUrl from "@/assets/audio/music.mp3";
import { useSoundStore } from "./stores/sound";

const soundStore = useSoundStore();

const audio = ref(null);

watch(
  () => soundStore.isAudioEnabled,
  (isEnabled) => {
    if (isEnabled) {
      audio.value.play();
    } else {
      audio.value.pause();
    }
  },
);
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.pixelCon {
  position: absolute;
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
