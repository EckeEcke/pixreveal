<template>
  <div class="answer-buttons">
    <div
      class="button-wrapper"
      v-for="(answer, index) in answers"
      :key="answer.title || answer.name"
    >
      <button
        class="answer-btn"
        :disabled="hasAnswered || inputDisabled"
        :style="{
          '--btn-color': buttonColors[index % buttonColors.length].color,
          '--btn-glow': buttonColors[index % buttonColors.length].glow,
        }"
        :class="{
          'is-wrong':
            hasAnswered &&
            selectedAnswer === answer &&
            (devilResult || !answer.isCorrect),
          'is-correct':
            hasAnswered &&
            answer.isCorrect &&
            !(devilResult && selectedAnswer === answer),
          'is-devil': devilMode && index === devilIndex,
        }"
        @mouseenter="!hasAnswered && soundStore.handleHoverSound()"
        @click="checkAnswer(answer, $event, index)"
      >
        {{
          devilMode && index === devilIndex
            ? "😈"
            : answer.title || answer.name
        }}
      </button>

      <span
        v-if="configStore.showKeyHints && !hasAnswered && !inputDisabled"
        class="key-hint"
        :style="{
          '--btn-color': buttonColors[index % buttonColors.length].color,
          '--btn-glow': buttonColors[index % buttonColors.length].glow,
        }"
      >
        {{ index + 1 }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useConfigStore } from "@/stores/config";
import { useSoundStore } from "@/stores/sound";
import { vibrateError, vibrateSuccess } from "@/utils/vibration";

const props = defineProps({
  answers: Array,
  hasAnswered: Boolean,
  inputDisabled: Boolean,
  devilMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["answered", "devil-clicked"]);

const buttonColors = [
  { color: "var(--neon-pink)", glow: "var(--pink-glow)" },
  { color: "var(--neon-mint)", glow: "var(--mint-glow)" },
  { color: "var(--neon-yellow)", glow: "var(--yellow-glow)" },
  { color: "var(--neon-cyan)", glow: "var(--cyan-glow)" },
];

const configStore = useConfigStore();
const soundStore = useSoundStore();
const selectedAnswer = ref(undefined);

// --- Devil Mode state ---
const devilIndex = ref(0);
const devilResult = ref(false);
let devilInterval = null;

const startDevilRotation = () => {
  stopDevilRotation();
  devilIndex.value = 0;
  if (!props.answers || props.answers.length === 0) return;
  devilInterval = setInterval(() => {
    devilIndex.value = (devilIndex.value + 1) % props.answers.length;
    soundStore.playSound("click");
  }, 500);
};

const stopDevilRotation = () => {
  if (devilInterval) {
    clearInterval(devilInterval);
    devilInterval = null;
  }
};

watch(
  () => props.devilMode,
  (isOn) => {
    if (isOn && !props.hasAnswered && !props.inputDisabled) {
      startDevilRotation();
    } else {
      stopDevilRotation();
    }
  },
  { immediate: true }
);

watch(
  () => props.hasAnswered,
  (answered) => {
    if (answered) stopDevilRotation();
  }
);

// New round with a fresh answers array -> restart rotation if devil mode is on
watch(
  () => props.answers,
  () => {
    if (props.devilMode && !props.hasAnswered && !props.inputDisabled) {
      startDevilRotation();
    }
  }
);
// --- end Devil Mode state ---

const checkAnswer = (answer, event, index) => {
  if (props.hasAnswered || props.inputDisabled) return;
  if (event && event.currentTarget) event.currentTarget.blur();

  const isDevilHit = props.devilMode && index === devilIndex.value;

  selectedAnswer.value = answer;
  devilResult.value = isDevilHit;

  if (props.devilMode) stopDevilRotation();

  if (isDevilHit) {
    console.log(
      "[DevilMode] Devil button clicked - forcing incorrect answer",
      answer
    );
    vibrateError();
    emit("devil-clicked", { answer, index });
    emit("answered", { ...answer, isCorrect: false });
    return;
  }

  if (answer.isCorrect) {
    soundStore.playSound("correct");
    vibrateSuccess();
  } else {
    soundStore.playSound("incorrect");
    vibrateError();
  }
  emit("answered", selectedAnswer.value);
};

const handleKeydown = (event) => {
  // If any full-screen transition/overlay is visible, ignore keyboard input.
  if (typeof document !== "undefined") {
    if (
      document.querySelector(".game-transition") ||
      document.querySelector(".get-ready")
    )
      return;
  }

  if (props.hasAnswered || props.inputDisabled) return;

  const key = event.key;
  if (["1", "2", "3", "4"].includes(key)) {
    const index = parseInt(key, 10) - 1;
    if (props.answers[index]) {
      checkAnswer(props.answers[index], null, index);
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  if (props.devilMode) soundStore.playSound("devil");
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  stopDevilRotation();
});
</script>

<style scoped>
.answer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

@media (min-width: 1024px) {
  .answer-buttons {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 32px;
  }
}

.button-wrapper {
  position: relative;
  width: 100%;
  display: flex;
}

.key-hint {
  position: absolute;
  top: -8px;
  left: -8px;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0c1d;
  border: 2px solid var(--btn-color);
  color: var(--btn-color);
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 8px var(--btn-glow);
}

@media (pointer: coarse) {
  .key-hint {
    display: none;
  }
}

.answer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(20, 16, 38, 0.85);
  backdrop-filter: blur(12px);
  padding: 16px;
  height: 100%;
  text-transform: uppercase;
  font-family: inherit;
  letter-spacing: 2px;
  font-weight: 900;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  position: relative;
  overflow: hidden;
  width: 100%;
  
  /* 2px Rahmen für saubere Kanten */
  border: 4px solid var(--btn-color);
  color: var(--btn-color);
  
  /* Nutzt deine bestehenden --btn-glow und --btn-color Variablen */
  box-shadow: 
    0 0 12px var(--btn-glow),
    inset 0 0 8px rgba(0, 0, 0, 0.7);
  
  text-shadow: 0 0 8px var(--btn-glow);
  z-index: 1;
}

@media (hover: hover) {
  .answer-btn:not(:disabled):hover {
    background: var(--btn-color);
    color: #0d0c1d;
    text-shadow: none;
    box-shadow: 
      0 0 20px var(--btn-color),
      0 0 35px var(--btn-glow);
    transform: translateY(-2px);
  }

  .answer-btn:not(:disabled):hover ~ .key-hint {
    background: var(--btn-color);
    color: #0d0c1d;
    border-color: #0d0c1d;
  }
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
    rgba(255, 255, 255, 0) 90%
  );
  transform: skewX(-45deg);
  pointer-events: none;
  z-index: 2;
  opacity: 0;
}

.answer-btn.is-correct::after {
  animation: shine-sweep 0.5s steps(8) forwards;
}

.answer-btn.is-correct {
  background-color: var(--neon-success);
  color: white;
  box-shadow: 0 0 30px var(--neon-success);
  border-color: var(--neon-success);
  animation: success-shake 1.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.answer-btn.is-wrong {
  background-color: var(--neon-error);
  color: white;
  animation: shake-fail 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  box-shadow: 0 0 30px var(--neon-error);
  border-color: var(--neon-error);
}

.answer-btn.is-devil {
  border-color: #ff0000;
  color: #ffffff;
  background: #ff0000 !important;
  box-shadow: 0 0 15px #ff0000, 0 0 30px #ff0000;
}

.answer-btn:disabled:not(.is-correct):not(.is-wrong) {
  opacity: 0.2;
  filter: grayscale(0.7);
}

@media (min-width: 769px) {
  .answer-btn {
    padding: 18px;
    font-size: 19px;
  }
}
</style>