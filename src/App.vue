<template>
  <Analytics
    :script-src="isProd ? '/_va/script.js' : undefined"
    :endpoint="isProd ? '/_va' : undefined"
    :mode="isProd ? 'production' : 'development'"
  />
  <div>
    <div v-if="showBackground" class="pixelCon">
      <div
        v-for="n in 80"
        :key="n"
        class="pixel"
      ></div>
    </div>
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
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
import { watch, ref, onMounted, onBeforeUnmount } from "vue"
import { useSoundStore } from "./stores/sound"
import { usePlayerStore } from "./stores/player"
import { useGameStore } from "./stores/game"
import { Analytics } from "@vercel/analytics/vue"
import { useRoute } from "vue-router"
import { useConfigStore } from "./stores/config"
import SettingsModal from "./components/modals/SettingsModal.vue"
import { useDailyStore } from "./stores/daily"

const route = useRoute()

const isProd = import.meta.env.PROD

const playerStore = usePlayerStore()
const configStore = useConfigStore()
const soundStore = useSoundStore()
const dailyStore = useDailyStore()
const gameStore = useGameStore()

const audio = ref(null)
const showBackground = ref(false)

const MUSIC_ROUTES = new Set([
  "classic",
  "inspect",
  "gravity",
  "blur",
  "party-host",
  "online",
  "survival",
  "daily",
])

const tracklist = [
  "/assets/audio/music10.mp3",
  "/assets/audio/music11.mp3",
  "/assets/audio/music12.mp3",
  "/assets/audio/music13.mp3",
]

const randomIndex = Math.floor(Math.random() * tracklist.length)

const ensureMusicSrc = () => {
  if (!audio.value) return
  if (audio.value.src) return
  audio.value.src = tracklist[randomIndex]
  audio.value.load?.()
}

const shouldPlayMusic = () => {
  const routeName = String(route.name ?? "")
  return (
    !!audio.value &&
    !playerStore.isCreatorMode &&
    soundStore.isAudioEnabled &&
    MUSIC_ROUTES.has(routeName)
  )
}

const syncMusicPlayback = async () => {
  if (!audio.value) return

  if (!shouldPlayMusic()) {
    audio.value.pause()
    audio.value.currentTime = 0
    return
  }

  ensureMusicSrc()
  try {
    await audio.value.play()
  } catch {}
}

watch(
  [
    () => route.name,
    () => soundStore.isAudioEnabled,
    () => playerStore.isCreatorMode,
  ],
  () => syncMusicPlayback(),
  { immediate: true },
)

let wakeLock = null

const requestWakeLock = async () => {
  if (!("wakeLock" in navigator)) return
  if (wakeLock) return

  try {
    wakeLock = await navigator.wakeLock.request("screen")
    wakeLock.addEventListener("release", () => {
      console.log("WakeLock released")
      if (document.visibilityState === "visible") {
        wakeLock = null
        setTimeout(() => {
          requestWakeLock()
        }, 250)
      }
    })
  } catch (err) {
    console.warn(`WakeLock failed: ${err.name}`)
  }
}

const releaseWakeLock = async () => {
  if (!wakeLock) return
  try {
    await wakeLock.release()
  } finally {
    wakeLock = null
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    requestWakeLock()
  } else {
    releaseWakeLock()
  }
}

onMounted(() => {
  requestAnimationFrame(() => {
    showBackground.value = true
  })

  dailyStore.fetchDailyData()
  configStore.fetchUgcDrawings()
  gameStore.fetchScores()

  requestWakeLock()
  document.addEventListener("visibilitychange", handleVisibilityChange)
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("creator") === "true") {
    playerStore.isCreatorMode = true
  }

  syncMusicPlayback()

  const startAudioOnFirstInteraction = async () => {
    if (!shouldPlayMusic()) return

    await syncMusicPlayback()

    if (!audio.value?.paused) {
      document.removeEventListener("click", startAudioOnFirstInteraction)
      document.removeEventListener("pointerdown", startAudioOnFirstInteraction)
      document.removeEventListener("keydown", onKeydownUnlock)
    }
  }

  const onKeydownUnlock = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) startAudioOnFirstInteraction()
  }

  document.addEventListener("click", startAudioOnFirstInteraction)
  document.addEventListener("pointerdown", startAudioOnFirstInteraction)
  document.addEventListener("keydown", onKeydownUnlock)
})

watch(
  () => route.name,
  (name) => {
    if (document.visibilityState === "visible") requestWakeLock()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange)
  releaseWakeLock()
})
</script>

<style>
@keyframes new-blink {
  0%,
  50%,
  100% {
    opacity: 0;
  }
  25% {
    opacity: 0.4;
  }
}

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
  inset: -10%;
  width: 120%;
  height: 120%;
  overflow: hidden;
  opacity: 0.9;
  background: radial-gradient(circle, #4a1d63 0%, #0a0510 100%);
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  filter: blur(1px);
  pointer-events: none;
}

.pixel {
  background: var(--purple-glow);
  width: 10%;
  aspect-ratio: 1;
  opacity: 0;
  will-change: opacity;
  animation: new-blink 10s infinite;
}

@media (max-width: 768px) {
  .pixel {
    width: 12.5%;
  }
}

@media (max-width: 480px) {
  .pixel {
    width: 20%;
  }
}

.pixel:nth-child(2n) { animation-delay: 1.2s; }
.pixel:nth-child(3n) { animation-delay: 3.7s; }
.pixel:nth-child(4n) { animation-delay: 0.5s; }
.pixel:nth-child(5n) { animation-delay: 4.1s; }
.pixel:nth-child(7n) { animation-delay: 2.3s; }
.pixel:nth-child(11n) { animation-delay: 1.8s; }
.pixel:nth-child(13n) { animation-delay: 4.8s; }

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
</style>