<template>
  <div class="app-background">
    <div class="grid-overlay"></div>
    <div class="grid-lines"></div>
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

const audio = ref("audio");

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
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.grid-lines {
  position: absolute;
  bottom: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background-image:
    linear-gradient(to right, rgba(255, 77, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 77, 0, 0.1) 1px, transparent 1px);
  background-size: 50px 40px;
  transform: perspective(500px) rotateX(45deg) rotateZ(-15deg);
  animation: grid-move 20s linear infinite;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 80% 80%, transparent 0%, #0a0a0a 70%);
  z-index: 1;
}

@keyframes grid-move {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 40px;
  }
}
</style>
