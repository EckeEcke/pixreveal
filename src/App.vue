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
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}

.grid-lines {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;

  background-image:
    linear-gradient(to right, rgba(255, 77, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 77, 0, 0.1) 1px, transparent 1px);
  background-size: 45px 45px;

  -webkit-mask-image:
    linear-gradient(to right, transparent 0%, black 100%),
    linear-gradient(to bottom, transparent 0%, black 100%);

  -webkit-mask-composite: source-in;
  mask-composite: intersect;

  animation:
    grid-move 20s linear infinite,
    grid-breathe 8s ease-in-out infinite;
}

@keyframes grid-move {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 45px 45px;
  }
}

@keyframes grid-breathe {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
