<template>
  <section class="guesses-gallery" aria-label="All guesses">
    <div class="gallery-navigation">
      <button type="button" aria-label="Previous round" :disabled="activeIndex <= 0" @click="activeRound = roundIndices[activeIndex - 1]!">
        <Icon icon="pixel:angle-left-solid" />
      </button>
      <label>
        <span class="sr-only">Choose round</span>
        <select v-model.number="activeRound">
          <option v-for="index in roundIndices" :key="index" :value="index">Round {{ index + 1 }}</option>
        </select>
      </label>
      <button type="button" aria-label="Next round" :disabled="activeIndex >= roundIndices.length - 1" @click="activeRound = roundIndices[activeIndex + 1]!">
        <Icon icon="pixel:angle-right-solid" />
      </button>
    </div>
    <p class="round-summary">{{ correctCount }} / {{ guesses.length }} correct<span v-if="rounds[activeRound]"> &middot; {{ rounds[activeRound]!.answer }}</span></p>
    <div class="guesses-grid">
      <article v-for="guess in guesses" :key="guess.key" class="guess-card">
        <svg v-if="guess.highlight.pixels.length" class="guess-image" :viewBox="`0 0 ${guess.highlight.pixels[0]?.length || 16} ${guess.highlight.pixels.length}`" role="img" :aria-label="`Pixels visible for ${guess.username}'s guess`" shape-rendering="crispEdges">
          <template v-for="(row, y) in guess.highlight.pixels" :key="y">
            <template v-for="(value, x) in row" :key="x">
              <rect v-if="value !== 0" :x="x" :y="y" width="1" height="1" :fill="colorPalette[value]" />
            </template>
          </template>
        </svg>
        <div v-else class="guess-image unavailable">Preview unavailable</div>
        <div class="guess-copy">
          <div class="guess-player">
            <span class="guess-avatar" :class="guess.avatarEffect" :style="getAvatarStyle(guess.avatarIndex, guess.avatarSpriteSheet)" aria-hidden="true" />
            <span :class="guess.nameEffect ? 'name-effect-' + guess.nameEffect : undefined">{{ guess.username }}</span>
          </div>
          <p class="guess-answer" :class="guess.highlight.isCorrect ? 'correct' : 'wrong'">
            <Icon :icon="guess.highlight.isCorrect ? 'pixel:check' : 'pixel:window-close-solid'" aria-hidden="true" />
            {{ guess.highlight.givenAnswer || 'No answer' }}
            <span class="sr-only">{{ guess.highlight.isCorrect ? 'Correct' : 'Incorrect' }}</span>
          </p>
          <p class="guess-facts">{{ formatTime(guess.highlight.elapsedMs) }} s &middot; {{ guess.highlight.visiblePixelCount }} pixels</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import type { Player } from "@/types/player";
import type { Round } from "@/types/game";
import colorPalette from "@/data/colorPalette";
import { getAvatarStyle } from "@/utils/avatar";
import { buildOnlineGuesses, getOnlineGuessSummaries } from "@/utils/onlineHighlights";

const props = defineProps<{ players: Player[]; rounds: Round[] }>();
const roundIndices = computed(() => [...new Set(getOnlineGuessSummaries(props.players).map(entry => entry.answer.roundIndex))].sort((a, b) => a - b));
const activeRound = ref(roundIndices.value[0] ?? 0);
const activeIndex = computed(() => roundIndices.value.indexOf(activeRound.value));
const guesses = computed(() => buildOnlineGuesses(props.players, props.rounds, activeRound.value));
const correctCount = computed(() => guesses.value.filter(guess => guess.highlight.isCorrect).length);
const formatTime = (ms: number) => (ms / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 });
watch(roundIndices, indices => {
  if (!indices.includes(activeRound.value)) activeRound.value = indices[0] ?? 0;
});
</script>

<style scoped>
.guesses-gallery { margin-top: 16px; }
.gallery-navigation { display: flex; justify-content: center; align-items: center; gap: 16px; }
.gallery-navigation button { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; color: #fff; font-size: 18px; flex-shrink: 0; }
.gallery-navigation button:disabled { opacity: 0.3; cursor: default; }
select { color: #fff; background: #1b1028; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; min-height: 44px; padding: 8px 12px; font: inherit; font-size: 14px; max-width: 100%; }
.round-summary { margin: 16px 0; text-align: center; font-size: 13px; color: rgba(255, 255, 255, 0.7); overflow-wrap: anywhere; }
.guesses-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 12px; }
.guess-card { display: grid; grid-template-columns: minmax(64px, 28%) minmax(0, 1fr); align-items: start; gap: 12px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; background: rgba(10, 4, 20, 0.7); }
.guess-image { display: block; width: 100%; aspect-ratio: 1; background: rgba(255, 255, 255, 0.03); }
.unavailable { display: grid; place-items: center; text-align: center; font-size: 10px; color: rgba(255, 255, 255, 0.5); }
.guess-copy { min-width: 0; }
.guess-player { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; }
.guess-player > span:last-child { min-width: 0; overflow-wrap: anywhere; }
.guess-avatar { width: 22px; height: 22px; border-radius: 4px; flex-shrink: 0; }
.guess-answer { display: flex; align-items: start; gap: 4px; margin: 10px 0 0; font-size: 13px; font-weight: 700; overflow-wrap: anywhere; }
.guess-answer svg { flex-shrink: 0; }
.correct { color: var(--neon-success); }
.wrong { color: var(--neon-error); }
.guess-facts { margin: 8px 0 0; font-size: 11px; line-height: 1.5; color: rgba(255, 255, 255, 0.65); }
button:focus-visible, select:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
