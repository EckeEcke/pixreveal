<template>
  <div class="buzzer-status">
    <Transition name="fade" mode="out-in">
      <div
        v-if="partyStore.buzzerState === 'open'"
        key="open"
        class="status-pill open"
      >
        BUZZ TO ANSWER!
      </div>
      <div
        v-else-if="partyStore.buzzerState === 'answering'"
        key="answering"
        class="status-pill answering"
      >
        {{ partyStore.activePlayer?.username }} IS ANSWERING
      </div>
      <div
        v-else-if="partyStore.roundResult"
        key="result"
        class="status-pill"
        :class="partyStore.roundResult"
      >
        {{ partyStore.roundResult === "correct" ? "✓ CORRECT" : "✗ WRONG" }}!
        <span>{{ gameStore.currentRound.answer }}</span> is the answer.
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { usePartyStore } from "@/stores/party";
import { useGameStore } from "@/stores/game";

const gameStore = useGameStore();
const partyStore = usePartyStore();
</script>

<style scoped>
.buzzer-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.status-pill {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 3px;
  text-transform: uppercase;
  span {
    color: white;
  }
}

.status-pill.open {
  border: 2px solid var(--neon-pink);
  color: var(--neon-pink);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.status-pill.answering {
  border: 2px solid var(--neon-blue);
  color: var(--neon-blue);
}

.status-pill.correct {
  border: 2px solid var(--neon-success);
  color: var(--neon-success);
}

.status-pill.incorrect {
  border: 2px solid var(--neon-error);
  color: var(--neon-error);
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
  }
}
</style>
