<template>
  <div class="buzzer-status">
    <RobotModerator :is-talking="robotIsTalking" />
    <div>
      <Transition name="fade" mode="out-in">
        <div
          :key="currentActiveMessage.key"
          :class="currentActiveMessage.class"
        >
          <template v-if="currentActiveMessage.type === 'answering'">
            <BuzzerAnsweringPrompt
              :active-player-name="activePlayerName"
              :options="optionsForPrompt"
              :is-xlz-active="partyStore.isXlzActive"
            />
          </template>

          <template v-else-if="currentActiveMessage.type === 'result'">
            <template v-if="!partyStore.activePlayerId">
              Time up! Nobody answered.
              <span class="answer-highlight">{{
                gameStore.currentRound?.answer
              }}</span>
              was the answer.
            </template>

            <template v-else-if="partyStore.roundResult === 'correct'">
              ✓ CORRECT!
              <span class="answer-highlight">{{
                gameStore.currentRound?.answer
              }}</span>
              was the answer.
              <br />
              {{ pointsForCorrect }} point<span v-if="pointsForCorrect !== 1"
                >s</span
              >
              for
              <span class="player-highlight">{{ activePlayerNameUpper }}</span
              >.
            </template>

            <template v-else-if="partyStore.roundResult === 'incorrect'">
              ✗ WRONG! The correct answer was
              <span class="answer-highlight">{{
                gameStore.currentRound?.answer
              }}</span
              >.
              <span class="player-highlight">{{ activePlayerName }}</span> loses
              {{ pointsForWrong }} points.
            </template>
          </template>

          <template v-else-if="currentActiveMessage.type === 'lightsOut'">
            {{ lightsOutMessageBefore }}
            <span class="player-highlight">{{ lightsOutActorNameUpper }}</span>
            {{ lightsOutMessageAfter }}
          </template>

          <template v-else-if="currentActiveMessage.type === 'freeze'">
            {{ freezeMessageBefore }}
            <span class="player-highlight">{{ freezeActorNameUpper }}</span>
            {{ freezeMessageAfter }}
          </template>

          <template v-else-if="currentActiveMessage.type === 'leaderEvent'">
            {{ leaderMessageBefore }}
            <span class="player-highlight">{{ leaderNameUpper }}</span>
            {{ leaderMessageAfter }}
          </template>

          <template v-else-if="currentActiveMessage.type === 'openFinal'">
            FINAL ROUND!
            <br />
            <span class="green-text">Double the points</span>,
            <span class="red-text">double the loss</span>!
          </template>

          <template v-else-if="currentActiveMessage.type === 'openBonus'">
            BONUS ROUND!
            <br />
            <span class="green-text">Double the points</span>,
            <span class="red-text">double the loss</span>!
          </template>

          <template v-else-if="currentActiveMessage.type === 'openGap'">
            {{ leaderGapMessageBefore }}
            <span class="player-highlight">{{
              leaderUsername?.toUpperCase?.() || "PLAYER"
            }}</span>
            {{ leaderGapMessageAfter }}
          </template>

          <template v-else-if="currentActiveMessage.type === 'openRegular'">
            {{ openPrompt.line1 }}
            <br />
            {{ openPrompt.line2Before }}<span class="pink-text">BUZZ</span
            >{{ openPrompt.line2After }}
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { usePartyStore } from "@/stores/party";
import { useGameStore } from "@/stores/game";
import { useRobotModerator } from "@/composables/useRobotModerator";
import { useLeaderboardEvents } from "@/composables/useLeaderboardEvents";
import { usePowerupEvents } from "@/composables/usePowerupEvents";
import { hashToUint32, scrambleText } from "@/utils/textScrambler";
import RobotModerator from "./RobotModerator.vue";
import BuzzerAnsweringPrompt from "./BuzzerAnsweringPrompt.vue";
import type { BonusRoundType } from "@/types/bonusRound";

const props = defineProps<{
  isFinalRound?: boolean;
  bonusRoundType?: BonusRoundType | null;
}>();

const gameStore = useGameStore();
const partyStore = usePartyStore();

const { robotIsTalking, triggerRobotTalk, playPop } = useRobotModerator();
const {
  leaderNameUpper,
  leaderUsername,
  leaderMessageVisible,
  leaderMessageBefore,
  leaderMessageAfter,
  leaderGapActive,
  leaderGapMessageBefore,
  leaderGapMessageAfter,
} = useLeaderboardEvents(partyStore, gameStore);

const {
  isFreezeActive,
  freezeMessageBefore,
  freezeMessageAfter,
  freezeActorNameUpper,
  lightsOutMessageBefore,
  lightsOutMessageAfter,
  lightsOutActorNameUpper,
} = usePowerupEvents(partyStore);

const activePlayerName = computed(() => partyStore.activePlayer?.username || "Player");
const activePlayerNameUpper = computed(() => activePlayerName.value.toUpperCase());

const openPromptTemplates = [
  { line1: "Think you know the answer?", line2Before: "Hit the ", line2After: "!" },
  { line1: "Ready to make a guess?", line2Before: "Smash the ", line2After: "!" },
  { line1: "Got it figured out?", line2Before: "Press ", line2After: "!" },
  { line1: "Feeling confident?", line2Before: "Go for the ", line2After: "!" },
] as const;

const openPromptIndex = ref(0);
const openPrompt = computed(() => openPromptTemplates[openPromptIndex.value % openPromptTemplates.length] ?? openPromptTemplates[0]);

watch(
  () => partyStore.buzzerState,
  (next, prev) => {
    if (next === "open" && prev !== "open") {
      openPromptIndex.value = (openPromptIndex.value + 1) % openPromptTemplates.length;
    }
  },
);

const isFinalRound = computed(() => Boolean(props.isFinalRound));
const isBonusRound = computed(() => Boolean(props.bonusRoundType));
const isDoublePointsRound = computed(() => isFinalRound.value || isBonusRound.value);
const pointsForCorrect = computed(() => (isDoublePointsRound.value ? 2 : 1));
const pointsForWrong = computed(() => (isDoublePointsRound.value ? 4 : 2));

const resultClass = computed(() => partyStore.activePlayerId ? (partyStore.roundResult || "") : "timeout");

const optionsForPrompt = computed(() => {
  const options: any[] = (gameStore.currentRound?.options || []).slice(0, 4);
  return options.map((opt) => {
    const label = String(opt?.title || opt?.name || "");
    if (!partyStore.isXlzActive) return label;
    const seed = hashToUint32(`${gameStore.currentRoundIndex}|${label}`);
    return scrambleText(label, seed);
  });
});

const currentActiveMessage = computed(() => {
  if (partyStore.buzzerState === "answering") {
    return { type: "answering", key: "answering", class: "status-pill answering" };
  }
  if (partyStore.roundResult && gameStore.gameState !== "revealing") {
    return { type: "result", key: "result", class: `status-pill result ${resultClass.value}` };
  }
  if (partyStore.isLightsOut) {
    return { type: "lightsOut", key: "lightsOut", class: "powerup-text" };
  }
  if (isFreezeActive.value) {
    return { type: "freeze", key: "freeze", class: "powerup-text" };
  }
  if (leaderMessageVisible.value) {
    return { type: "leaderEvent", key: "leader", class: "leader-text" };
  }
  if (partyStore.buzzerState === "open") {
    if (isFinalRound.value) return { type: "openFinal", key: "final", class: "status-pill open" };
    if (isBonusRound.value) return { type: "openBonus", key: "bonus", class: "status-pill open" };
    if (leaderGapActive.value) return { type: "openGap", key: "gap", class: "status-pill open" };
    return { type: "openRegular", key: "regular", class: "status-pill open" };
  }
  return { type: "none", key: "none", class: "" };
});

watch(
  () => currentActiveMessage.value.key,
  (nextKey, prevKey) => {
    if (nextKey === "none" || nextKey === prevKey) return;
    triggerRobotTalk();
    playPop();
  }
);
</script>

<style scoped>
.buzzer-status {
  display: grid;
  grid-template-columns: 6% auto;
  align-items: start;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  margin-top: 16px;
}

@media (min-width: 576px) {
  .buzzer-status {
    grid-template-columns: 80px auto;
  }
}

/* Basis-Sprechblase mit meilenweit besserem Kontrast */
.status-pill,
.powerup-text,
.leader-text {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 24px;
  letter-spacing: 0.5px;
  line-height: 1.5;
  text-align: left;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.status-pill {
  background: #1e293b;
  text-shadow: 
    -1px -1px 0 #000000,
     1px -1px 0 #000000,
    -1px  1px 0 #000000,
     1px  1px 0 #000000,
     0px  2px 4px rgba(0, 0, 0, 0.8);
}

.status-pill.result {
  text-transform: none;
}

.status-pill.open {
  background: var(--primary);
  color: #ffffff;
}

.status-pill.answering {
  background: var(--neon-blue);
  color: #ffffff;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.status-pill.correct {
  background: #10b981;
  color: #ffffff;
}

.status-pill.incorrect {
  background: #ef4444;
  color: #ffffff;
}

.status-pill.timeout {
  background: #3b82f6;
  color: #ffffff;
}

.powerup-text {
  background: #0284c7;
  color: #ffffff;
  text-transform: uppercase;
  text-shadow: 
    -1px -1px 0 #000000,
     1px -1px 0 #000000,
    -1px  1px 0 #000000,
     1px  1px 0 #000000,
     0px  2px 4px rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.leader-text {
  background: #d97706;
  color: #ffffff;
  text-transform: uppercase;
}

.pink-text {
  color: #38bdf8;
}

.green-text {
  color: #dcfce7;

}

.red-text {
  color: #fee2e2;
}

.waiting-player {
  color: #ffffff;
  opacity: 0.95;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
}

.prompt-option {
  color: var(--opt-color);
  text-shadow: 0 0 10px var(--opt-glow);
  white-space: normal;
}

.answer-highlight,
.player-highlight {
  color: #fef08a;
  font-weight: 900;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  padding: 0 2px;
}

.white-text {
  color: #ffffff;
}

.buzzer-status > div:last-child {
  position: relative;
}

.status-pill::before,
.powerup-text::before,
.leader-text::before {
  content: "";
  position: absolute;
  top: 16px;
  left: -12px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px 12px 8px 0;
  border-color: transparent #1e293b transparent transparent;
  z-index: 10;
}

.status-pill.open::before {
  border-right-color: var(--primary);
}

.status-pill.answering::before {
  border-right-color: var(--neon-blue);
}

.status-pill.correct::before {
  border-right-color: #10b981;
}

.status-pill.incorrect::before {
  border-right-color: #ef4444;
}

.status-pill.timeout::before {
  border-right-color: #3b82f6;
}

.powerup-text::before {
  border-right-color: #0284c7;
}

.leader-text::before {
  border-right-color: #d97706;
}
</style>