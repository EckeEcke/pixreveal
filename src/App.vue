<template>
  <Analytics
    :script-src="isProd ? '/_va/script.js' : undefined"
    :endpoint="isProd ? '/_va' : undefined"
    :mode="isProd ? 'production' : 'development'"
  />
  <div>
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
    <SettingsModal
      v-if="configStore.showSettings"
      @close="configStore.closeSettings"
    />
  </div>
</template>

<script setup>
import { watch, ref, onMounted, onBeforeUnmount } from "vue";
import { useSoundStore } from "./stores/sound";
import { usePlayerStore } from "./stores/player";
import { Analytics } from "@vercel/analytics/vue";
import { useRoute } from "vue-router";
import { useConfigStore } from "./stores/config";
import SettingsModal from "./components/modals/SettingsModal.vue";
import { useDailyStore } from "./stores/daily";

const route = useRoute();

const isProd = import.meta.env.PROD;

const playerStore = usePlayerStore();
const configStore = useConfigStore();
const soundStore = useSoundStore();
const dailyStore = useDailyStore();

const audio = ref(null);

const MUSIC_ROUTES = new Set([
  "classic",
  "inspect",
  "gravity",
  "buzzer",
  "party-host",
  "online",
  "survival",
  "daily",
]);

const ensureMusicSrc = () => {
  if (!audio.value) return;
  if (audio.value.src) return;
  const musicPath = new URL("./assets/audio/music.mp3", import.meta.url).href;
  audio.value.src = musicPath;
  audio.value.load?.();
};

const shouldPlayMusic = () => {
  const routeName = String(route.name ?? "");
  return (
    !!audio.value &&
    !playerStore.isCreatorMode &&
    soundStore.isAudioEnabled &&
    MUSIC_ROUTES.has(routeName)
  );
};

const syncMusicPlayback = async () => {
  if (!audio.value) return;

  if (!shouldPlayMusic()) {
    audio.value.pause();
    audio.value.currentTime = 0;
    return;
  }

  ensureMusicSrc();
  try {
    await audio.value.play();
  } catch {}
};

watch(
  [
    () => route.name,
    () => soundStore.isAudioEnabled,
    () => playerStore.isCreatorMode,
  ],
  () => syncMusicPlayback(),
  { immediate: true },
);

let wakeLock = null;

const requestWakeLock = async () => {
  if (!("wakeLock" in navigator)) return;
  if (wakeLock) return;

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      console.log("WakeLock released");
      if (document.visibilityState === "visible") {
        wakeLock = null;
        setTimeout(() => {
          requestWakeLock();
        }, 250);
      }
    });
  } catch (err) {
    console.warn(`WakeLock failed: ${err.name}`);
  }
};

const releaseWakeLock = async () => {
  if (!wakeLock) return;
  try {
    await wakeLock.release();
  } finally {
    wakeLock = null;
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
};

onMounted(() => {
  dailyStore.fetchDailyData();
  requestWakeLock();
  document.addEventListener("visibilitychange", handleVisibilityChange);
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("creator") === "true") {
    playerStore.isCreatorMode = true;
  }

  syncMusicPlayback();

  const startAudioOnFirstInteraction = async () => {
    if (!shouldPlayMusic()) return;

    await syncMusicPlayback();

    if (!audio.value?.paused) {
      document.removeEventListener("click", startAudioOnFirstInteraction);
      document.removeEventListener("pointerdown", startAudioOnFirstInteraction);
      document.removeEventListener("keydown", onKeydownUnlock);
    }
  };

  const onKeydownUnlock = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) startAudioOnFirstInteraction();
  };

  document.addEventListener("click", startAudioOnFirstInteraction);
  document.addEventListener("pointerdown", startAudioOnFirstInteraction);
  document.addEventListener("keydown", onKeydownUnlock);
});

watch(
  () => route.name,
  (name) => {
    if (document.visibilityState === "visible") requestWakeLock();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  releaseWakeLock();
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
