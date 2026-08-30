<template>
<div ref="wrapperRef" class="scale-wrapper">
  <main class="game-layout">
    <transition name="fade" mode="out-in">
      <CountdownTransition
        v-if="gameStore.gameState === 'starting'"
        message="GET READY"
        @done="gameStore.setGameState('revealing')"
      />
      <GameTransition
        v-else-if="showFinalRoundTransition"
        first="FINAL"
        second="ROUND"
        @done="handleFinalRoundDone"
      />
      <GameTransition
        v-else-if="showBonusRoundTransition"
        first="BONUS"
        second="ROUND"
        @done="handleBonusRoundDone"
      />
    </transition>

    <section class="canvas-section">
      <MinimalSettings />
      <GameHeader
        :max="timerDuration"
        :count="timer"
        :is-correct="hasAnsweredCorrectly"
        :is-incorrect="hasAnswered && !hasAnsweredCorrectly"
        :is-bonus="!!bonusRoundType || isFinalRound"
        :total-score="playerStore.points"
        :currentRound="gameStore.currentRoundIndex + 1"
        :max-rounds="maxRounds"
        :is-survival="false"
      />

      <div class="canvas-effects">
        <PixelCanvasGravity
          ref="pixelCanvasRef"
          :pixel-array="pixelData"
          :is-revealing="true"
          :pauseReveal="showFinalRoundTransition || showBonusRoundTransition"
        />
      </div>
    </section>

    <section class="answer-section">
      <AnswerButtons
        :hasAnswered="hasAnswered && !playerStore.isCreatorMode"
        :answers="currentRound?.options || []"
        :inputDisabled="
          showFinalRoundTransition ||
          showBonusRoundTransition ||
          gameStore.gameState !== 'revealing'
        "
        @answered="handleAnswer"
      />
    </section>
  </main>
</div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, watch, unref, onMounted } from "vue"
import { useRouter } from "vue-router"
import PixelCanvasGravity from "@/components/canvas/PixelCanvasGravity.vue"
import CountdownTransition from "@/components/page-layout/CountdownTransition.vue"
import GameHeader from "@/components/game-ui/GameHeader.vue"
import MinimalSettings from "@/components/page-ui/MinimalSettings.vue"
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue"
import { useGameStore } from "@/stores/game"
import { usePlayerStore } from "@/stores/player"
import { useConfigStore } from "@/stores/config"
import { useSoundStore } from "@/stores/sound"
import { useOnlineStore } from "@/stores/online"
import GameTransition from "@/components/game-ui/GameTransition.vue"
import { useBonusRounds } from "@/composables/useBonusRounds"
import {
  workerClearInterval,
  workerClearTimeout,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers"

const wrapperRef = ref<HTMLElement | null>(null)

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

const pixelCanvasRef = ref<{
  playShine: () => void
  playShake: () => void
  triggerCorrectAnswer: () => void
  triggerIncorrectAnswer: () => void
} | null>(null)

const pixelData = ref<number[][]>([])
const hasAnswered = ref(false)
const hasAnsweredCorrectly = ref(false)
const timerDuration = computed(() => unref(configStore.revealTime) || 15)
const timer = ref(timerDuration.value)

let timerIntervalId: number | null = null
let feedbackTimeoutId: number | null = null

const currentRound = computed(() => gameStore.currentRound)
const maxRounds = computed(() => configStore.maxRounds)

const baseRevealing = computed(() => gameStore.gameState === "revealing")

const {
  bonusRoundType,
  isFinalRound,
  showFinalRoundTransition,
  showBonusRoundTransition,
  handleFinalRoundDone: markFinalRoundTransitionDone,
  handleBonusRoundDone: markBonusRoundTransitionDone,
  shouldShowTransitionOnRevealing,
} = useBonusRounds({
  currentRoundIndex: computed(() => gameStore.currentRoundIndex),
  maxRounds,
  gameState: computed(() => gameStore.gameState),
  timer,
  timerDuration,
  baseRevealing,
})

const suppressFilterTransition = ref(false)

const handleFinalRoundDone = () => {
  markFinalRoundTransitionDone()
  setupDrawing()
}

const handleBonusRoundDone = () => {
  markBonusRoundTransitionDone()
  setupDrawing()
}

const clearAllLocalTimers = () => {
  workerClearInterval(timerIntervalId)
  workerClearTimeout(feedbackTimeoutId)
  timerIntervalId = null
  feedbackTimeoutId = null
}

const startTimer = () => {
  workerClearInterval(timerIntervalId)
  timer.value = timerDuration.value

  timerIntervalId = workerSetInterval(() => {
    timer.value--
    if (timer.value <= 3 && timer.value > 0) {
      soundStore.playSound("timer")
      pixelCanvasRef.value?.playShake()
    }

    if (timer.value <= 0) {
      workerClearInterval(timerIntervalId)
      handleAnswer(null)
    }
  }, 1000)
}

const setupDrawing = () => {
  if (!currentRound.value) return

  clearAllLocalTimers()
  hasAnswered.value = false
  hasAnsweredCorrectly.value = false

  suppressFilterTransition.value = true

  pixelData.value = currentRound.value.data

  startTimer()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressFilterTransition.value = false
    })
  })
}

const goToNextRound = () => {
  gameStore.nextRound()

  if (gameStore.isGameOver) {
    onlineStore.broadcastScore()
    const isOnlineRoute =
      router.currentRoute.value.name === "online" ||
      router.currentRoute.value.path === "/online"
    router.push(isOnlineRoute ? "/gameover-online" : "/gameover")
  }
}

const handleAnswer = (selectedAnswer: any) => {
  if (gameStore.gameState !== "revealing" || hasAnswered.value) return

  hasAnswered.value = true
  gameStore.setGameState("feedback")
  clearAllLocalTimers()

  if (selectedAnswer?.isCorrect) {
    hasAnsweredCorrectly.value = true
    pixelCanvasRef.value?.triggerCorrectAnswer()

    const multiplier = isFinalRound.value || !!bonusRoundType.value ? 2 : 1
    playerStore.addPoints(timer.value * multiplier)
    soundStore.playSound("correct")

    feedbackTimeoutId = workerSetTimeout(() => {
      goToNextRound()
    }, 1500)
  } else {
    hasAnsweredCorrectly.value = false
    pixelCanvasRef.value?.triggerIncorrectAnswer()
    soundStore.playSound("incorrect")

    feedbackTimeoutId = workerSetTimeout(() => {
      goToNextRound()
    }, 1800)
  }

  playerStore.pushToAnswerHistory(selectedAnswer?.isCorrect ?? false)
}

watch(
  () => gameStore.gameState,
  (newState) => {
    if (newState === "revealing") {
      const transition = shouldShowTransitionOnRevealing()
      if (transition === "final") {
        hasAnswered.value = false
        hasAnsweredCorrectly.value = false
        clearAllLocalTimers()
        showFinalRoundTransition.value = true
        return
      }

      if (transition === "bonus") {
        hasAnswered.value = false
        hasAnsweredCorrectly.value = false
        clearAllLocalTimers()
        showBonusRoundTransition.value = true
        return
      }
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
  margin: 0 auto;
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

.canvas-effects {
  position: relative;
  width: 100%;
  transition: filter 800ms ease-out;
  will-change: filter;
}
</style>