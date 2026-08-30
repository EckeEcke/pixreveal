<template>
<div ref="wrapperRef" class="scale-wrapper">
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        @done="gameStore.setGameState('revealing')"
      />
    </transition>

    <section class="canvas-section">
      <MinimalSettings />
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="hasAnsweredCorrectly"
        :is-incorrect="hasAnswered && !hasAnsweredCorrectly"
        :total-score="playerStore.points"
        :currentRound="gameStore.currentRoundIndex + 1"
        :max-rounds="maxRounds"
        :is-survival="false"
      />

      <PixelCanvas
        ref="pixelCanvasRef"
        :pixel-array="pixelData"
        :resolution="resolution"
        :is-revealing="false"
        :is-status-icon="hasAnswered"
        :timer-duration="timerDuration"
        :is-magnifier-mode="gameStore.gameState === 'revealing'"
        :mouse-pos="mousePos"
        @mousemove="updateMousePos"
        @touchstart="updateTouchPos"
        @touchmove="updateTouchPos"
      />
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="hasAnswered && !playerStore.isCreatorMode"
        :answers="currentRound?.options || []"
        :inputDisabled="gameStore.gameState !== 'revealing'"
        @answered="handleAnswer"
      />
    </section>
  </main>
</div>
</template>

<script setup>
import { computed, ref, onUnmounted, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import PixelCanvas from "@/components/canvas/PixelCanvas.vue"
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue"
import GameHeader from "@/components/game-ui/GameHeader.vue"
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue"
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue"
import { useGameStore } from "@/stores/game"
import { usePlayerStore } from "@/stores/player"
import { useConfigStore } from "@/stores/config"
import { useOnlineStore } from "@/stores/online"
import { useSoundStore } from "@/stores/sound"
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers"

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
const playerStore = usePlayerStore()
const onlineStore = useOnlineStore()
const configStore = useConfigStore()
const gameStore = useGameStore()
const soundStore = useSoundStore()

const pixelCanvasRef = ref(null)
const resolution = ref(16)
const pixelData = ref(Array(256).fill(0))
const hasAnswered = ref(false)
const hasAnsweredCorrectly = ref(false)
const timer = ref(configStore.revealTime)
const timerDuration = configStore.revealTime
const mousePos = ref({ x: 300, y: 300 })

let timerId = null
let feedbackTimeoutId = null
let solutionTimeoutId = null

const currentRound = computed(() => gameStore.currentRound)
const maxRounds = computed(() => configStore.maxRounds)

const clearAllLocalTimers = () => {
  workerClearInterval(timerId)
  workerClearTimeout(feedbackTimeoutId)
  workerClearTimeout(solutionTimeoutId)
  timerId = null
  feedbackTimeoutId = null
  solutionTimeoutId = null
}

const startTimer = () => {
  workerClearInterval(timerId)
  timer.value = timerDuration

  timerId = workerSetInterval(() => {
    timer.value--
    if (timer.value <= 3 && timer.value > 0) {
      soundStore.playSound("timer")
      pixelCanvasRef.value?.playShake()
    }

    if (timer.value <= 0) {
      workerClearInterval(timerId)
      handleAnswer(null)
    }
  }, 1000)
}

const setupDrawing = () => {
  if (!currentRound.value) return

  clearAllLocalTimers()
  hasAnswered.value = false
  hasAnsweredCorrectly.value = false

  pixelData.value = currentRound.value.data
  resolution.value = Math.sqrt(pixelData.value.length)

  startTimer()
}

const handleAnswer = (selectedOption) => {
  if (gameStore.gameState !== "revealing" || hasAnswered.value) return

  hasAnswered.value = true
  gameStore.setGameState("feedback")
  clearAllLocalTimers()

  if (playerStore.isCreatorMode) {
    // Creator mode
  } else if (selectedOption?.isCorrect) {
    hasAnsweredCorrectly.value = true
    playerStore.addPoints(timer.value)
    soundStore.playSound("correct")
    pixelCanvasRef.value?.triggerCorrectAnswer()
  } else {
    hasAnsweredCorrectly.value = false
    soundStore.playSound("incorrect")
    pixelCanvasRef.value?.triggerIncorrectAnswer()
  }

  feedbackTimeoutId = workerSetTimeout(() => {
    gameStore.setGameState("revealed")

    solutionTimeoutId = workerSetTimeout(() => {
      gameStore.nextRound()

      if (gameStore.isGameOver) {
        onlineStore.broadcastScore()
        const isOnlineRoute =
          router.currentRoute.value.name === "online" ||
          router.currentRoute.value.path === "/online"
        router.push(isOnlineRoute ? "/gameover-online" : "/gameover")
      }
    }, 600)
  }, 1000)
}

const updateMousePos = (event) => {
  if (gameStore.gameState !== "revealing") return
  const rect = event.target.getBoundingClientRect()
  const scaleX = 600 / rect.width
  const scaleY = 600 / rect.height
  mousePos.value = {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

const updateTouchPos = (event) => {
  if (gameStore.gameState !== "revealing") return
  if (event.cancelable) event.preventDefault()
  const touch = event.touches[0]
  const canvasElement =
    event.currentTarget.$el?.querySelector("canvas") || event.target
  const rect = canvasElement.getBoundingClientRect()
  const scaleX = 600 / rect.width
  const scaleY = 600 / rect.height
  mousePos.value = {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  }
}

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      setupDrawing()
    }
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener("resize", resizeGame)
  resizeGame()
})

onUnmounted(() => {
  clearAllLocalTimers()
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