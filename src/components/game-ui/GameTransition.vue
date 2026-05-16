<!-- GameOver.vue -->
<template>
  <div class="game-over">
    <div class="line">
      <Transition name="slide-left">
        <span v-if="showFirst" class="word">{{ first }}</span>
      </Transition>
    </div>
    <div class="line">
      <Transition name="slide-right">
        <span v-if="showSecond" class="word accent">{{ second }}</span>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { useSoundStore } from "@/stores/sound";
import { ref, onMounted } from "vue";

defineProps({
  first: String,
  second: String,
})

const emit = defineEmits(["done"]);

const showFirst = ref(false);
const showSecond = ref(false);

onMounted(() => {
  setTimeout(
    () => ((showFirst.value = true), useSoundStore().playSound("punch")),
    200,
  );
  setTimeout(
    () => ((showSecond.value = true), useSoundStore().playSound("punch")),
    700,
  );
  setTimeout(() => emit("done"), 1200);
});
</script>

<style scoped>
.game-over {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 99999;
  background: #0d001aaa;
  backdrop-filter: blur(4px);
}

.line {
  overflow: hidden;
  height: 130px;
  display: flex;
  align-items: center;
}

.word {
  display: block;
  font-family: inherit;
  font-size: 100px;
  font-weight: 900;
  letter-spacing: 12px;
  color: #fff;
  text-shadow:
    0 0 20px #b44fff,
    0 0 60px #b44fff;
}

.word.accent {
  color: #ff2d78;
  text-shadow:
    0 0 20px #ff2d78,
    0 0 60px #ff2d78;
}

.slide-left-enter-active,
.slide-right-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-left-enter-from {
  transform: translateX(-120px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(120px);
  opacity: 0;
}
</style>
