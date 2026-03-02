<template>
  <div class="timer-wrapper">
    <div class="timer-bar-container">
      <div class="timer-glow"></div>
      
      <div 
        class="timer-bar-fill" 
        :class="{ 'is-empty': count <= 0, 'is-warning': count < 5 }"
        :style="{ width: progressWidth + '%' }"
      ></div>
    </div>
    
    <div class="timer-text" :class="{ 'text-danger': count <= 0 }">
      {{ formattedTime }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    default: 15
  }
})

const progressWidth = computed(() => {
  return Math.max(0, Math.min(100, (props.count / props.max) * 100))
})

const formattedTime = computed(() => {
  return props.count > 0 ? props.count + 's' : 'TIME UP'
})
</script>

<style scoped>
.timer-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.timer-bar-container {
  position: relative;
  height: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(255, 77, 0, 0.2);
}

.timer-bar-fill {
  height: 100%;
  background: var(--neon-orange);
  box-shadow: 0 0 15px var(--neon-orange);
  transition: width 0.1s linear, background-color 0.3s ease;
}

.is-warning {
  background-color: #ffcc00;
  box-shadow: 0 0 15px #ffcc00;
}

.is-empty {
  background-color: #ff0044 !important;
  box-shadow: 0 0 20px #ff0044 !important;
  width: 0% !important;
}

.timer-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  letter-spacing: 2px;
}

.text-danger {
  color: #ff0044;
  text-shadow: 0 0 15px #ff0044;
  animation: blink 0.5s infinite alternate;
}

@keyframes blink {
  from { opacity: 1 }
  to { opacity: 0.5 }
}
</style>