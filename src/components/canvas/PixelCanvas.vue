<template>
  <div class="canvas-wrapper" :class="{ crt: addCRT }" ref="wrapper">
    <canvas
      ref="canvasRef"
      :width="internalSize"
      :height="internalSize"
      @mousemove="$emit('mousemove', $event)"
      @touchstart.prevent="$emit('touchstart', $event)"
      @touchmove.prevent="$emit('touchmove', $event)"
    ></canvas>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from "vue"
import colorPalette from "../../data/colorPalette"
import { usePlayerStore } from "@/stores/player"
import { useSoundStore } from "@/stores/sound"
import { useConfigStore } from "@/stores/config"
import { useCanvasBase } from "@/composables/useCanvasBase"

const props = defineProps({
  pixelArray: Array,
  resolution: Number,
  isRevealing: Boolean,
  isStatusIcon: Boolean,
  timerDuration: Number,
  pauseReveal: Boolean,
  mousePos: Object,
  isMagnifierMode: Boolean,
  muteSound: Boolean,
})

defineEmits(["mousemove", "touchstart", "touchmove"])

const internalSize = 600
const {
  canvasRef,
  getContext,
  calculateGrid,
  createParticles,
  updateAndDrawParticles,
  setAnimationFrameId,
  getAnimationFrameId,
  stopAnimation,
} = useCanvasBase(internalSize)

const soundStore = useSoundStore()
const playerStore = usePlayerStore()

const addCRT = computed(() => useConfigStore().addCRTFilter)
const timerDuration = props.timerDuration || 15

let autoAngle = 0
const offset = 90
let intervalId = null

const flatPixelList = ref([])
const displayedPixels = ref([])

const SHINE_DURATION = 600
const shineState = ref(null)

const SHAKE_DURATION = 400
const SHAKE_MAGNITUDE = 4
const shakeState = ref(null)

const updateFlatPixelList = () => {
  const list = []
  if (!props.pixelArray) return
  props.pixelArray.forEach((row, y) => {
    if (Array.isArray(row)) {
      row.forEach((val, x) => {
        if (val !== 0) list.push({ x, y, val })
      })
    }
  })
  flatPixelList.value = list
}

const getAutoMousePos = () => {
  autoAngle += 0.035
  const centerX = internalSize / 2 + offset
  const centerY = internalSize / 2 + offset
  return {
    x: centerX + Math.sin(autoAngle) * 200,
    y: centerY + Math.cos(autoAngle * 0.5) * 200,
  }
}

const startReveal = () => {
  if (intervalId) clearInterval(intervalId)
  updateFlatPixelList()
  displayedPixels.value = []

  if (!props.pixelArray || !props.pixelArray[0]) return

  const allVisible = [...flatPixelList.value]
  if (!props.isRevealing) {
    displayedPixels.value = allVisible
    if (!getAnimationFrameId()) render()
    return
  }

  const totalDurationMs = props.isStatusIcon ? 500 : timerDuration * 1000
  const dynamicSpeed = allVisible.length > 0 ? totalDurationMs / allVisible.length : 0
  allVisible.sort(() => Math.random() - 0.5)

  const resolution = props.pixelArray.length
  const { cellSize } = calculateGrid(resolution)

  intervalId = setInterval(() => {
    if (props.pauseReveal) return
    if (allVisible.length > 0) {
      const next = allVisible.pop()
      displayedPixels.value.push({ ...next, createdAt: Date.now() })

      const color = colorPalette[next.val] || "#fff"
      createParticles(next.x * cellSize, next.y * cellSize, color, cellSize)

      if (!props.muteSound) soundStore.playSound("reveal")
    } else {
      clearInterval(intervalId)
      intervalId = null
    }
  }, dynamicSpeed)

  if (!getAnimationFrameId()) render()
}

const drawPixels = (ctx, pixels, baseSize, cellSize, gap, now) => {
  pixels.forEach((p) => {
    const color = colorPalette[p.val]
    let scale = 1
    if (props.isRevealing && p.createdAt) {
      scale = Math.min(1, (now - p.createdAt) / 100)
    }
    const currentSize = baseSize * scale
    const offsetPos = (baseSize - currentSize) / 2

    ctx.shadowColor = color
    ctx.shadowBlur = p.val === 1 ? 0 : 15 * scale
    ctx.fillStyle = color
    ctx.fillRect(
      p.x * cellSize + gap + offsetPos,
      p.y * cellSize + gap + offsetPos,
      currentSize,
      currentSize
    )

    if (p.val === 1) {
      ctx.strokeStyle = "rgba(175, 175, 175, 0.5)"
      ctx.lineWidth = 0.5
      ctx.strokeRect(p.x * cellSize + gap, p.y * cellSize + gap, baseSize, baseSize)
    }
  })
}

const drawShine = (ctx, size, progress) => {
  const bandWidth = size * 0.35
  const diagLen = size * Math.SQRT2
  const travel = diagLen + bandWidth * 2
  const pos = -bandWidth + progress * travel

  ctx.save()
  ctx.shadowBlur = 0
  ctx.shadowColor = "transparent"
  ctx.globalCompositeOperation = "source-atop"
  ctx.translate(size / 2, size / 2)
  ctx.rotate(-Math.PI / 4)
  ctx.translate(-diagLen / 2, -diagLen / 2)

  const gradient = ctx.createLinearGradient(pos, 0, pos + bandWidth, 0)
  gradient.addColorStop(0, "rgba(255,255,255,0)")
  gradient.addColorStop(0.5, "rgba(255,255,255,0.9)")
  gradient.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(pos, -diagLen, bandWidth, diagLen * 3)
  ctx.restore()
}

const render = () => {
  if (props.pauseReveal) {
    setAnimationFrameId(requestAnimationFrame(render))
    return
  }
  const ctx = getContext()
  if (!ctx) return

  const resolution = props.pixelArray?.length || 16
  const { cellSize, gap, baseSize } = calculateGrid(resolution)
  const now = Date.now()

  ctx.clearRect(0, 0, internalSize, internalSize)

  let shakeX = 0
  let shakeY = 0
  if (shakeState.value) {
    const elapsed = now - shakeState.value.startTime
    const progress = elapsed / SHAKE_DURATION
    if (progress >= 1) {
      shakeState.value = null
    } else {
      const decay = 1 - progress
      const magnitude = SHAKE_MAGNITUDE * decay
      shakeX = Math.sin(progress * Math.PI * 10) * magnitude
      shakeY = Math.cos(progress * Math.PI * 7) * magnitude
    }
  }

  ctx.save()
  ctx.translate(shakeX, shakeY)

  const pixelsToDraw = props.isRevealing || props.pauseReveal ? displayedPixels.value : flatPixelList.value

  if (props.isMagnifierMode && !props.isStatusIcon) {
    const activePos = playerStore.isCreatorMode ? getAutoMousePos() : props.mousePos
    const radius = 90
    const viewX = activePos.x - offset
    const viewY = activePos.y - offset

    ctx.save()
    ctx.beginPath()
    ctx.arc(viewX, viewY, radius, 0, Math.PI * 2)
    ctx.clip()
    drawPixels(ctx, pixelsToDraw, baseSize, cellSize, gap, now)
    ctx.restore()

    ctx.strokeStyle = "#ec4899"
    ctx.lineWidth = 20
    ctx.shadowColor = "#ec4899"
    ctx.shadowBlur = 10
    ctx.stroke()

    const angle = Math.atan2(activePos.y - viewY, activePos.x - viewX)
    ctx.beginPath()
    ctx.moveTo(viewX + Math.cos(angle) * radius, viewY + Math.sin(angle) * radius)
    ctx.lineTo(activePos.x, activePos.y)
    ctx.stroke()
  } else {
    drawPixels(ctx, pixelsToDraw, baseSize, cellSize, gap, now)
  }

  if (shineState.value) {
    const elapsed = now - shineState.value.startTime
    const progress = elapsed / SHINE_DURATION
    if (progress >= 1) {
      shineState.value = null
    } else {
      drawShine(ctx, internalSize, progress)
    }
  }

  ctx.restore()

  updateAndDrawParticles(ctx)
  setAnimationFrameId(requestAnimationFrame(render))
}

const playShine = () => {
  shineState.value = { startTime: Date.now() }
  if (!getAnimationFrameId()) render()
}

const playShake = () => {
  shakeState.value = { startTime: Date.now() }
  if (!getAnimationFrameId()) render()
}

defineExpose({
  getImageUrl: () => canvasRef.value?.toDataURL("image/png") || null,
  playShine,
  playShake,
})

watch([() => props.pixelArray, () => props.isRevealing], () => startReveal(), { deep: true })

onMounted(() => startReveal())
onUnmounted(() => {
  clearInterval(intervalId)
  stopAnimation()
})
</script>

<style scoped>
.canvas-wrapper {
  background-image: radial-gradient(
    circle at center,
    #1a1c26 0%,
    #0a0b10 60%,
    #000000 100%
  );
  border: 2px solid black;
  overflow: hidden;
  line-height: 0;
  touch-action: none;
}
canvas {
  max-width: 100%;
  height: auto;
  cursor: none;
}
</style>