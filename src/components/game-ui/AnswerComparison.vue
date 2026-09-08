<template>
  <div class="answer-comparison">
    <div
      v-for="(round, index) in rounds"
      :key="`${round.answer}-${index}`"
      class="answer-row"
    >
      <!-- Player 1 (Links) -->
      <span
        v-if="participants[0]"
        class="answer-result p1-result"
        :class="participants[0].answerHistory[index] ? 'is-correct' : 'is-wrong'"
      >
        {{ participants[0].answerHistory[index] ? "✅" : "❌" }}
      </span>

      <!-- Begriff (Zentriert) -->
      <span class="correct-answer">{{ round.answer }}</span>

      <!-- Player 2 (Rechts) -->
      <span
        v-if="participants[1]"
        class="answer-result p2-result"
        :class="participants[1].answerHistory[index] ? 'is-correct' : 'is-wrong'"
      >
        {{ participants[1].answerHistory[index] ? "✅" : "❌" }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChallengeParticipant } from "@/stores/challenge"
import type { Round } from "@/types/game";

defineProps<{
  rounds: Round[]
  participants: ChallengeParticipant[]
}>()
</script>

<style scoped>
.answer-comparison {
  display: grid;
  gap: 8px;
  text-align: center;
}

/* Desktop: P1 (links) | Begriff (Zentriert) | P2 (rechts) */
.answer-row {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  grid-template-areas: "p1 word p2";
  gap: 12px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
}

.correct-answer {
  grid-area: word;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.answer-result {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 800;
}

.p1-result {
  grid-area: p1;
}

.p2-result {
  grid-area: p2;
}

.is-correct {
  color: var(--neon-success);
  background: rgba(0, 220, 120, 0.14);
}

.is-wrong {
  color: var(--neon-error);
  background: rgba(255, 70, 90, 0.14);
}

/* Mobile Layout: 
   Zeile 1: Begriff (zentriert)
   Zeile 2: P1 (links) & P2 (rechts) 
*/
@media (max-width: 650px) {
  .answer-row {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "word word"
      "p1   p2";
    gap: 8px;
    padding: 10px 12px;
  }

  .correct-answer {
    text-align: center;
  }
}
</style>