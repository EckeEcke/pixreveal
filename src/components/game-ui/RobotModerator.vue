<template>
  <div
    class="moderator-wrapper"
    :class="{ 'is-talking': isTalking }"
    :style="{ '--accent-color': accentColor }"
  >
    <div 
      class="avatar-crop"
      :class="{ 'talk-bounce': isTalking }"
    >
      <img
        v-show="isTalking"
        src="@/assets/avatars/robot-run.gif"
        alt="robot moderator"
        class="talking"
      />
      <img
        v-show="!isTalking"
        src="@/assets/avatars/robot-idle.gif"
        alt="robot moderator"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isTalking?: boolean
    accentColor?: string
  }>(),
  {
    accentColor: "var(--primary)",
  }
)
</script>

<style scoped>
.moderator-wrapper {
  position: relative;
  transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  height: 60px;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--accent-color);
}

.moderator-wrapper.is-talking {
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.25);
}

@media (min-width: 576px) {
  .moderator-wrapper {
    height: 80px;
  }
}

.avatar-crop {
  position: relative;
  height: 60px;
  width: 60px;
  overflow: hidden;
  will-change: transform;
}

@media (min-width: 576px) {
  .avatar-crop {
    height: 80px;
    width: 80px;
  }
}

/* 3x kurzes Reinzoomen/Pulsieren beim Sprechen */
.talk-bounce {
  animation: talk-zoom 0.5s ease-in-out forwards;
}

@keyframes talk-zoom {
  0% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.08);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.08);
  }
  60% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

img {
  position: absolute;
  transition: all 0.3s ease-in-out;
  top: -5px;
  left: -10px;
  height: 80px;
  width: auto;
  max-width: none;
}

@media (min-width: 576px) {
  img {
    top: -20px;
    left: -20px;
    height: 120px;
  }
}

.talking {
  top: -10px;
}

@media (min-width: 576px) {
  .talking {
    top: -25px;
  }
}
</style>
