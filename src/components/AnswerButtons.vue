<template>
  <div class="answer-buttons">
    <button
      class="answer-btn"
      v-for="(answer, index) in answers"
      :key="answer.name"
      :disabled="hasAnswered"
      :class="[
        buttonColors[index % buttonColors.length],
        {
          'is-wrong': hasAnswered && selectedAnswer === answer && !answer.isCorrect,
          'is-correct': hasAnswered && answer.isCorrect,
        },
      ]"
      @click="checkAnswer(answer, $event)"
    >
      {{ answer.name }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSoundStore } from "@/stores/sound";

const props = defineProps({
  answers: Array,
  hasAnswered: Boolean,
});

const emit = defineEmits(["answered"]);

const buttonColors = ["btn-pink", "btn-blue", "btn-purple", "btn-yellow"];
const soundStore = useSoundStore();
const selectedAnswer = ref(undefined);

const checkAnswer = (answer, event) => {
  if (event) event.currentTarget.blur();
  selectedAnswer.value = answer;

  if (answer.isCorrect) {
    soundStore.playSound("correct");
  } else {
    soundStore.playSound("incorrect");
  }
  emit("answered", selectedAnswer.value);
};
</script>

<style scoped>
.answer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (min-width: 1024px) {
  .answer-buttons {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 32px;
  }
}

.answer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #222222aa;
  backdrop-filter: blur(20px);
  padding: 14px;
  text-transform: uppercase;
  font-family: inherit;
  letter-spacing: 2px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  border: none;
  z-index: 1;
}

.answer-btn::after {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0) 10%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 90% /* Ende verwaschen */
  );

  transform: skewX(-45deg);
  pointer-events: none;
  z-index: 2;
  opacity: 0;
}

.answer-btn.is-correct::after {
  animation: shine-sweep 0.5s steps(8) forwards;
}

@keyframes shine-sweep {
  0% {
    left: -150%;
    opacity: 1;
  }
  100% {
    left: 150%;
    opacity: 1;
  }
}

.btn-pink {
  color: var(--neon-pink);
  border: 2px solid var(--neon-pink) !important;
  box-shadow: 0 0 10px var(--pink-glow);
}
.btn-yellow {
  color: var(--neon-yellow);
  border: 2px solid var(--neon-yellow) !important;
  box-shadow: 0 0 10px var(--yellow-glow);
}
.btn-blue {
  color: var(--neon-blue);
  border: 2px solid var(--neon-blue) !important;
  box-shadow: 0 0 10px var(--blue-glow);
}
.btn-purple {
  color: var(--neon-purple);
  border: 2px solid var(--neon-purple) !important;
  box-shadow: 0 0 10px var(--purple-glow);
}

.answer-btn.is-correct {
  background-color: var(--neon-success) !important;
  color: white !important;
  box-shadow: 0 0 30px var(--neon-success);
  border: none !important;
}

.answer-btn.is-wrong {
  background-color: var(--neon-error) !important;
  color: white !important;
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  border: none !important;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-12px);
  }
  75% {
    transform: translateX(12px);
  }
}

.answer-btn:disabled:not(.is-correct):not(.is-wrong) {
  opacity: 0.2;
}

@media (min-width: 769px) {
  .answer-btn {
    padding: 18px;
    font-size: 20px;
  }
}
</style>
