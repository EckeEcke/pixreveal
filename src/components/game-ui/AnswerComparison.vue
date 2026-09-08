<template>
  <div class="answer-comparison">
    <div class="score-grid">
      <div
        v-for="(player, index) in participants"
        :key="player.username"
        class="player-card"
        :class="getPlayerStateClass(player.score)"
      >
        <TopPlayerDisplay
          :avatar-index="player.avatarIndex"
          :is-winner="!isDraw && player.score === highestScore"
          :role="index === 0 ? 'Player 1' : 'Player 2'"
          class="player"
        />
        <div class="player-name">{{ player.username }}</div>
      </div>

      <div
        v-for="(player, index) in participants"
        :key="`score-${player.username}`"
        class="score-display"
      >
        {{ player.score }}
        <Icon
          icon="pixel:star-solid"
          class="star-icon"
        />
      </div>
    </div>

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
import { computed } from "vue"
import { Icon } from "@iconify/vue"
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue"
import type { ChallengeParticipant } from "@/stores/challenge"
import type { Round } from "@/types/game";

const props = defineProps<{
  rounds: Round[]
  participants: ChallengeParticipant[]
}>()

const highestScore = computed(() => {
  if (!props.participants.length) return 0
  return Math.max(...props.participants.map((p) => p.score))
})

const isDraw = computed(() => {
  if (props.participants.length < 2) return false
  return props.participants[0]?.score === props.participants[1]?.score
})

const getPlayerStateClass = (score: number) => {
  if (props.participants.length < 2) return ""
  if (isDraw.value) return "status-draw"
  return score === highestScore.value ? "status-win" : "status-loss"
}
</script>

<style scoped>
.answer-comparison {
  display: grid;
  gap: 8px;
  text-align: center;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0 0 24px;
}

.score-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    background: rgba(255, 255, 255, 0.06);
    padding: 14px;
    .star-icon {
        color: var(--neon-yellow);
    }
}

.player {
    box-sizing: border-box;
}

.player-card {
  padding: 14px 8px 8px;
  border-radius: 8px;
}

.player-name {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 13px;
    @media (min-width: 450px) {
        font-size: 18px;
    }
}

:deep(.status-win) {
  background: rgba(0, 100, 50, 0.9)!important;
  border-top: 3px solid rgba(0, 255, 150, 0.7) !important;
  border-left: 3px solid rgba(0, 255, 150, 0.7) !important;
  border-bottom: 3px solid rgba(0, 100, 50, 0.9) !important;
  border-right: 3px solid rgba(0, 100, 50, 0.9) !important;
  box-shadow: 0 4px 16px rgba(0, 220, 120, 0.15);
}

:deep(.status-loss) {
  background: rgba(150, 20, 30, 0.9) !important;
  border-top: 3px solid rgba(255, 120, 130, 0.7) !important;
  border-left: 3px solid rgba(255, 120, 130, 0.7) !important;
  border-bottom: 3px solid rgba(150, 20, 30, 0.9) !important;
  border-right: 3px solid rgba(150, 20, 30, 0.9) !important;
}

:deep(.status-draw) {
  background: rgba(100, 110, 120, 0.15) !important;
  border-top: 3px solid rgba(150, 160, 170, 0.6) !important;
  border-left: 3px solid rgba(150, 160, 170, 0.6) !important;
  border-bottom: 3px solid rgba(40, 50, 60, 0.8) !important;
  border-right: 3px solid rgba(40, 50, 60, 0.8) !important;
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

/* Mobile Layout */
@media (max-width: 650px) {
  .score-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

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