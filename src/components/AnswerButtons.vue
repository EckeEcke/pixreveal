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
          'is-wrong':
            hasAnswered && selectedAnswer === answer.name && !answer.isCorrect,
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
const buttonColors = ["btn-pink", "btn-blue", "btn-purple", "btn-yellow"];
const soundStore = useSoundStore();
const selectedAnswer = ref(undefined)

const emit = defineEmits(["answered"]);

const checkAnswer = (answer, event) => {
  if (event) event.currentTarget.blur();
  selectedAnswer.value = answer.name;
  const isCorrect = answer.isCorrect;

  if (isCorrect) {
    soundStore.playSound("correct");
  } else {
    soundStore.playSound("incorrect");
  }

  emit("answered", isCorrect);
};
</script>

<style scoped>
.answer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 32px;
  }
}

.answer-btn {
  font-weight: 900;
  @media (min-width: 769px) {
    padding: 16px;
    font-size: 18px;
  }
}

.btn-pink {
  color: var(--neon-pink);
  border: 2px solid var(--neon-pink);
  background: var(--pink-bg);
  box-shadow:
    0 0 10px var(--pink-glow),
    inset 0 0 5px var(--pink-glow);
  text-shadow: 0 0 5px var(--pink-glow);
}

.btn-yellow {
  color: var(--neon-yellow);
  border: 2px solid var(--neon-yellow);
  background: var(--yellow-bg);
  box-shadow:
    0 0 10px var(--yellow-glow),
    inset 0 0 5px var(--yellow-glow);
  text-shadow: 0 0 5px var(--yellow-glow);
}

.btn-blue {
  color: var(--neon-blue);
  border: 2px solid var(--neon-blue);
  background: var(--blue-bg);
  box-shadow:
    0 0 10px var(--blue-glow),
    inset 0 0 5px var(--blue-bg);
  text-shadow: 0 0 5px var(--blue-glow);
}

.btn-purple {
  color: var(--neon-purple);
  border: 2px solid var(--neon-purple);
  background: var(--purple-bg);
  box-shadow:
    0 0 10px var(--purple-glow),
    inset 0 0 5px var(--purple-glow);
  text-shadow: 0 0 5px var(--purple-bg);
}

.answer-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.answer-btn.is-correct {
  background-color: var(--neon-success);
  opacity: 1;
  color: var(--text-main);
  border: none;
  color: var(--white);
  box-shadow:
    0 0 20px var(--neon-success),
    0 0 40px var(--neon-success);
  animation:
    sharp-pulse 1s infinite,
    floating 1s infinite;
}

.answer-btn.is-wrong {
  background-color: var(--neon-error);
  opacity: 1;
  color: var(--text-main);
  border: none;
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  box-shadow:
    0 0 20px var(--neon-error),
    0 0 40px var(--neon-error);
}

.answer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background: #222222aa;
  backdrop-filter: blur(20px);
  padding: 10px;
  text-transform: uppercase;
  font-family: inherit;
  letter-spacing: 2px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
}

@media (hover: hover) {
  .btn-pink:not(:disabled):hover {
    background: var(--pink-bg);
    box-shadow: 0 0 20px var(--neon-pink);
    transform: translateY(-2px);
  }
  .btn-purple:not(:disabled):hover {
    background: var(--purple-bg);
    box-shadow: 0 0 20px var(--neon-purple);
    transform: translateY(-2px);
  }

  .btn-blue:not(:disabled):hover {
    background: var(--blue-bg);
    box-shadow: 0 0 20px var(--neon-blue);
    transform: translateY(-2px);
  }

  .btn-yellow:not(:disabled):hover {
    background: var(--yellow-bg);
    box-shadow: 0 0 20px var(--neon-yellow);
    transform: translateY(-2px);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-10px);
  }
  40% {
    transform: translateX(10px);
  }
  60% {
    transform: translateX(-10px);
  }
  80% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
