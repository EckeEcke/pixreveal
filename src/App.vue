<template>
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
body {
  margin: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: "Inter", sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
}
</style>
