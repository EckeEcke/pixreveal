<template>
  <div
    class="room-id-input"
    :class="{ disabled }"
    :style="{ '--len': length }"
  >
    <input
      ref="inputRef"
      :value="modelValue"
      :disabled="disabled"
      class="hidden-input"
      type="text"
      enterkeyhint="go"
      autocapitalize="characters"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      aria-label="Room ID"
      @input="onInput"
      @focus="focused = true"
      @blur="focused = false"
      @keydown.enter="emit('submit')"
    />
    <div class="boxes" aria-hidden="true">
      <span
        v-for="i in length"
        :key="i"
        class="box"
        :class="{
          filled: !!modelValue[i - 1],
          active: focused && !disabled && i - 1 === activeIndex,
          error,
        }"
      >
        {{ modelValue[i - 1] ?? "" }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { normalizeRoomId } from "@/utils/crypto";

const props = defineProps({
  modelValue: { type: String, default: "" },
  length: { type: Number, required: true },
  autofocus: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const inputRef = ref(null);
const focused = ref(false);

const activeIndex = computed(() =>
  Math.min(props.modelValue.length, props.length - 1),
);

const onInput = (event) => {
  const cleaned = normalizeRoomId(event.target.value, props.length);
  event.target.value = cleaned;
  emit("update:modelValue", cleaned);
};

onMounted(() => {
  if (props.autofocus) inputRef.value?.focus();
});

defineExpose({
  focus: () => inputRef.value?.focus(),
});
</script>

<style scoped>
.room-id-input {
  position: relative;
}

.hidden-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: 0;
  padding: 0;
  font-size: 16px; /* verhindert Auto-Zoom auf iOS */
  cursor: text;
  z-index: 1;
}

.boxes {
  display: grid;
  grid-template-columns: repeat(var(--len), minmax(0, 1fr));
  gap: 8px;
}

.box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  font-size: 24px;
  font-weight: 900;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.box.filled {
  border-color: var(--primary);
}

.box.active {
  border-color: var(--primary);
  box-shadow: 0 0 10px var(--primary);
}

/* blinkender Cursor in der leeren aktiven Box */
.box.active:not(.filled)::after {
  content: "";
  position: absolute;
  bottom: 12px;
  width: 14px;
  height: 3px;
  background: var(--primary);
  animation: caret-blink 1s steps(1) infinite;
}

.box.error {
  border-color: var(--neon-pink);
  box-shadow: none;
}

.room-id-input.disabled {
  opacity: 0.5;
}

.room-id-input.disabled .hidden-input {
  cursor: not-allowed;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 380px) {
  .boxes {
    gap: 6px;
  }

  .box {
    height: 48px;
    font-size: 20px;
  }
}
</style>