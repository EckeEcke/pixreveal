<template>
<div ref="wrapperRef" class="scale-wrapper">
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
        @done="start"
      />
    </transition>

    <section class="canvas-section">
      <MinimalSettings />
      <GameHeader
        :max="survivalStore.maxTime"
        :count="survivalStore.timeLeft"
        :total-score="survivalStore.solvedCount"
        :is-survival="true"
        :highscore="survivalStore.highscore"
      />
      <PixelCanvas
        v-if="survivalStore.currentDrawing"
        :key="canvasKey"
        ref="pixelCanvasRef"
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="isRevealing"
        :is-status-icon="survivalStore.hasAnswered"
        :timer-duration="configStore.revealTime"
      />
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="survivalStore.hasAnswered"
        :answers="survivalStore.currentDrawing?.options || []"
        :inputDisabled="gameStore.gameState !== 'revealing'"
        :devil-mode="survivalStore.solvedCount > 10"
        @answered="handleAnswer"
      />
    </section>
  </main>
</div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSurvivalStore } from "@/stores/survival"
import { useGameStore } from "@/stores/game"
import { useConfigStore } from "@/stores/config"
import { useSoundStore } from "@/stores/sound"
import { usePlayerStore } from "@/stores/player"
import PixelCanvas from "@/components/canvas/PixelCanvas.vue"
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue"
import GameHeader from "@/components/game-ui/GameHeader.vue"
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue"
import { workerClearTimeout, workerSetTimeout } from "@/services/workerTimers"
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue"

const wrapperRef = ref(null)

const resizeGame = () => {
  if (!wrapperRef.value) return
  const baseWidth = 1200
  const baseHeight = 800

  if (window.innerWidth < baseWidth || window.innerHeight < baseHeight) {
    wrapperRef.value.style.transform = "none"
    return
  }

  const scaleX = window.innerWidth / baseWidth
  const scaleY = window.innerHeight / baseHeight
  const scale = Math.min(scaleX, scaleY)

  wrapperRef.value.style.transform = `scale(${scale})`
}

const router = useRouter()
const survivalStore = useSurvivalStore()
const gameStore = useGameStore()
const configStore = useConfigStore()
const soundStore = useSoundStore()

survivalStore.reset()
gameStore.reset()
usePlayerStore().gameMode = "survival"
let disposed = false
let starting = false

const pixelCanvasRef = ref(null)
const resolution = ref(16)
const pixelData = ref([])
const isRevealing = ref(true)
const canvasKey = ref(0)

let feedbackTimeoutId = null
let nextRoundTimeoutId = null

const clearAllLocalTimers = () => {
  workerClearTimeout(feedbackTimeoutId)
  workerClearTimeout(nextRoundTimeoutId)
  feedbackTimeoutId = null
  nextRoundTimeoutId = null
}

const setupDrawing = () => {
  if (!survivalStore.currentDrawing) return

  clearAllLocalTimers()
  survivalStore.hasAnswered = false
  isRevealing.value = true
  pixelData.value = survivalStore.currentDrawing.data
  resolution.value = pixelData.value.length
  canvasKey.value++
}

const handleAnswer = (answer) => {
  if (
    gameStore.gameState !== "revealing" ||
    survivalStore.hasAnswered ||
    survivalStore.timeLeft <= 0
  )
    return

  survivalStore.hasAnswered = true
  gameStore.setGameState("feedback")
  clearAllLocalTimers()

  const isCorrect = !!answer?.isCorrect

  if (isCorrect) {
    survivalStore.handleCorrectAnswer()
    pixelCanvasRef.value?.triggerCorrectAnswer()
    if (survivalStore.solvedCount === 11) soundStore.playSound("devil")
  } else {
    survivalStore.handleWrongAnswer()
    pixelCanvasRef.value?.triggerIncorrectAnswer()
  }

  feedbackTimeoutId = workerSetTimeout(() => {
    if (survivalStore.isGameOver) return

    if (isCorrect) {
      isRevealing.value = false
    }

    gameStore.setGameState("revealed")

    nextRoundTimeoutId = workerSetTimeout(() => {
      if (survivalStore.isGameOver) return

      survivalStore.setNextDrawing()
      if (survivalStore.isGameOver) return
      setupDrawing()
      gameStore.setGameState("revealing")
    }, isCorrect ? 400 : 200)
  }, 600)
}

const start = async () => {
  if (starting || disposed) return
  starting = true
  const ready = await configStore.ensureUgcReady()
  if (disposed) return
  if (!ready) {
    router.push("/singleplayer")
    return
  }
  survivalStore.startSurvival()
  if (survivalStore.isGameOver) return
  setupDrawing()
}

watch(
  () => survivalStore.isGameOver,
  (over) => {
    if (over) {
      gameStore.setGameState("gameover")
      router.push("/gameover")
    }
  }
)

onMounted(() => {
  window.addEventListener("resize", resizeGame)
  resizeGame()
})

onUnmounted(() => {
  disposed = true
  clearAllLocalTimers()
  survivalStore.stop()
  window.removeEventListener("resize", resizeGame)
})
</script>

<style scoped>
.scale-wrapper {
  transform-origin: center center;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: flex;
  justify-content: center;
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  max-width: 500px;
  width: 100%;
}

@media (min-width: 1024px) {
  .game-layout {
    position: relative;
    grid-template-columns: 1fr 400px;
    gap: 64px;
    max-width: calc(950px + 2rem);
    align-items: center;
  }
}

.answer-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 16px 0 32px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
