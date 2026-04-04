<!-- GetReady.vue -->
<template>
  <div class="get-ready">
    <Transition name="pop" mode="out-in">
      <span :key="current" class="count">{{ current }}</span>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSoundStore } from "@/stores/sound";

const emit = defineEmits(["done"]);

const steps = ["3", "2", "1", "GO!"];
const current = ref(steps[0]);

onMounted(() => {
  steps.forEach((step, i) => {
    setTimeout(() => {
      current.value = step;
      useSoundStore().playSound(step === "GO!" ? "buzz" : "timer");
    }, i * 800);
  });

  setTimeout(() => emit("done"), steps.length * 800);
});
</script>

<style scoped>
.get-ready {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  background: #0d001aaa;
  backdrop-filter: blur(4px);
}

.count {
  font-family: "8bit", sans-serif;
  font-size: 120px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow:
    0 0 20px #b44fff,
    0 0 60px #b44fff;
  display: block;
}

.pop-enter-active {
  animation: pop-in 0.3s ease-out;
}
.pop-leave-active {
  animation: pop-out 0.2s ease-in;
}

@keyframes pop-in {
  0% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}
</style>
