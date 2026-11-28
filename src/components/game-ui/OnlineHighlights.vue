<template>
  <section v-if="currentHighlight" class="online-highlights" aria-label="Game highlights" @mouseenter="isHovered = true" @mouseleave="isHovered = false" @focusin="hasFocus = true" @focusout="handleFocusOut">
    <article class="highlight-card">
      <Transition name="highlight-fade" mode="out-in">
        <div :key="currentHighlight.key" class="highlight-content">
          <div class="highlight-image">
            <PixelCanvas
              :pixel-array="currentHighlight.highlight.pixels"
              :resolution="currentHighlight.highlight.pixels.length"
              :is-revealing="false"
              :is-status-icon="false"
              :mute-sound="true"
            />
          </div>
          <div class="highlight-copy">
            <h3>{{ currentHighlight.title }}</h3>
            <p class="answer-line" :class="currentHighlight.highlight.isCorrect ? 'answer-correct' : 'answer-wrong'">
              <Icon :icon="currentHighlight.highlight.isCorrect ? 'pixel:check' : 'pixel:window-close-solid'" aria-hidden="true" />
              <span>{{ currentHighlight.highlight.givenAnswer }}</span>
              <span class="sr-only">{{ currentHighlight.highlight.isCorrect ? 'Correct' : 'Incorrect' }}</span>
            </p>
            <p class="message">{{ currentHighlight.message }}</p>
          </div>
          <p class="highlight-facts">
            Round {{ currentHighlight.highlight.roundIndex + 1 }}
            <template v-if="currentHighlight.roundResult">
              <span aria-hidden="true">&middot;</span>
              {{ currentHighlight.roundResult.correct }} / {{ currentHighlight.roundResult.total }} correct
            </template>
            <span aria-hidden="true">&middot;</span>
            {{ formatTime(currentHighlight.highlight.elapsedMs) }} s
            <span aria-hidden="true">&middot;</span>
            {{ currentHighlight.highlight.visiblePixelCount }} pixels shown
          </p>
          <div class="player-pill">
            <div class="mini-avatar" :class="currentHighlight.avatarEffect" :style="getAvatarStyle(currentHighlight.avatarIndex, currentHighlight.avatarSpriteSheet)" aria-hidden="true" />
            <span :class="currentHighlight.nameEffect ? 'name-effect-' + currentHighlight.nameEffect : undefined">{{ currentHighlight.username }}</span>
          </div>
        </div>
      </Transition>
      <nav v-if="highlights.length > 1" class="highlight-navigation" aria-label="Highlight navigation">
        <button type="button" class="highlight-arrow" aria-label="Previous highlight" @click="select(activeIndex - 1)">
          <Icon icon="pixel:angle-left-solid" />
        </button>
        <span class="highlight-count">{{ activeIndex + 1 }} / {{ highlights.length }}</span>
        <button type="button" class="highlight-arrow" aria-label="Next highlight" @click="select(activeIndex + 1)">
          <Icon icon="pixel:angle-right-solid" />
        </button>
      </nav>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import type { OnlineHighlightSlide } from "@/utils/onlineHighlights";
import { workerClearInterval, workerSetInterval } from "@/services/workerTimers";
import { getAvatarStyle } from "@/utils/avatar";

const props = defineProps<{ highlights: OnlineHighlightSlide[] }>();
const activeIndex = ref(0);
const isHovered = ref(false);
const hasFocus = ref(false);
const isPaused = computed(() => isHovered.value || hasFocus.value);
let intervalId: number | null = null;
const currentHighlight = computed(() => props.highlights[activeIndex.value] ?? null);
const formatTime = (ms: number) => (ms / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 });
const restartRotation = () => {
  workerClearInterval(intervalId);
  intervalId = props.highlights.length > 1 ? workerSetInterval(() => {
    if (!isPaused.value && props.highlights.length > 1) activeIndex.value = (activeIndex.value + 1) % props.highlights.length;
  }, 10000) : null;
};
const select = (index: number) => {
  if (props.highlights.length === 0) return;
  activeIndex.value = (index + props.highlights.length) % props.highlights.length;
  restartRotation();
};
const handleFocusOut = (event: FocusEvent) => {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) hasFocus.value = false;
};
watch(() => props.highlights.length, (length) => {
  if (activeIndex.value >= length) activeIndex.value = 0;
  restartRotation();
});
onMounted(restartRotation);
onBeforeUnmount(() => workerClearInterval(intervalId));
</script>

<style scoped>
.online-highlights { width: 100%; min-width: 0; }
.highlight-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(10, 4, 20, 0.7);
  text-align: left;
}
.highlight-content { display: grid; grid-template-columns: minmax(72px, 28%) minmax(0, 1fr); gap: 16px; }
.highlight-image { min-width: 0; align-self: start; aspect-ratio: 1; }
.highlight-image :deep(.canvas-wrapper), .highlight-image :deep(canvas) { display: block; width: 100%; height: 100%; }
.highlight-copy { min-width: 0; }
h3 { margin: 0 0 12px; color: #fff; font-size: 16px; line-height: 1.35; overflow-wrap: anywhere; }
.answer-line { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 14px; font-weight: 700; text-transform: uppercase; }
.answer-line svg { flex-shrink: 0; }
.answer-line span { overflow-wrap: anywhere; }
.answer-correct { color: var(--neon-success); }
.answer-wrong { color: var(--neon-error); }
.message { margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: rgba(255, 255, 255, 0.75); }
.highlight-facts { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 0; color: rgba(255, 255, 255, 0.65); font-size: 12px; line-height: 1.5; }
.player-pill { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; }
.player-pill span { min-width: 0; overflow-wrap: anywhere; }
.mini-avatar { width: 26px; height: 26px; flex-shrink: 0; border-radius: 4px; }
.highlight-navigation { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 16px; }
.highlight-arrow { display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 4px; color: #fff; font-size: 18px; }
.highlight-count { font-size: 11px; color: rgba(255, 255, 255, 0.65); }
.highlight-arrow:hover { border-color: var(--primary); color: var(--primary); }
button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.highlight-fade-enter-active, .highlight-fade-leave-active { transition: opacity 150ms ease; }
.highlight-fade-enter-from, .highlight-fade-leave-to { opacity: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (min-width: 1024px) {
  .highlight-card { padding: 24px; }
  .highlight-content { grid-template-columns: minmax(140px, 40%) minmax(0, 1fr); gap: 24px; }
  .highlight-navigation { margin-top: 24px; }
  h3 { font-size: 18px; }
  .answer-line { font-size: 16px; }
  .message { font-size: 14px; }
}
@media (max-width: 359px) {
  .highlight-card { padding: 12px; }
  .highlight-content { gap: 12px; }
  .highlight-navigation { margin-top: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .highlight-fade-enter-active, .highlight-fade-leave-active { transition: none; }
}
</style>
