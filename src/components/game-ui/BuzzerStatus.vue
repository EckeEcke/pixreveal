<template>
  <div class="buzzer-status">
    <!-- Sprechblasen-Container oben -->
    <div class="message-container">
      <Transition name="message" mode="out-in">
        <div
          :key="currentActiveMessage.key"
          :class="currentActiveMessage.class"
        >
          <template v-if="currentActiveMessage.type === 'devilActive'">
            <BuzzerAnsweringPrompt
              :active-player-name="activePlayerName"
              :options="optionsForPrompt"
              :is-xlz-active="partyStore.isXlzActive"
              :is-devil-active="true"
            />
          </template>

          <template v-else-if="currentActiveMessage.type === 'answering'">
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
              <span class="player-highlight">
                <InlineAvatar
                  v-if="activeAvatarIndex !== null"
                  :avatarIndex="activeAvatarIndex"
                />{{ activePlayerNameUpper }} </span
              >.
            </template>

            <template v-else-if="partyStore.roundResult === 'incorrect'">
              ✗ WRONG! The correct answer was
              <span class="answer-highlight">{{
                gameStore.currentRound?.answer
              }}</span
              >.
              <span class="player-highlight">
                <InlineAvatar
                  v-if="activeAvatarIndex !== null"
                  :avatarIndex="activeAvatarIndex"
                />{{ activePlayerName }}
              </span>
              loses {{ pointsForWrong }} points.
            </template>
          </template>

          <template v-else-if="currentActiveMessage.type === 'fart'">
            <span class="player-highlight">
              <InlineAvatar
                v-if="activeAvatarIndex !== null"
                :avatarIndex="activeAvatarIndex"
              />{{ activePlayerNameUpper }}
            </span>
            FARTED! 😯
          </template>

          <template v-else-if="currentActiveMessage.type === 'lightsOut'">
            {{ lightsOutMessageBefore }}
            <span class="player-highlight">
              <InlineAvatar
                v-if="lightsOutAvatarIndex !== null"
                :avatarIndex="lightsOutAvatarIndex"
              />{{ lightsOutActorNameUpper }}
            </span>
            {{ lightsOutMessageAfter }}
          </template>

          <template v-else-if="currentActiveMessage.type === 'freeze'">
            {{ freezeMessageBefore }}
            <span class="player-highlight">
              <InlineAvatar
                v-if="freezeAvatarIndex !== null"
                :avatarIndex="freezeAvatarIndex"
              />{{ freezeActorNameUpper }}
            </span>
            {{ freezeMessageAfter }}
          </template>

          <template v-else-if="currentActiveMessage.type === 'leaderEvent'">
            {{ leaderMessageBefore }}
            <span class="player-highlight">
              <InlineAvatar
                v-if="leaderAvatarIndex !== null"
                :avatarIndex="leaderAvatarIndex"
              />{{ leaderNameUpper }}
            </span>
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
            <span class="player-highlight">
              <InlineAvatar
                v-if="leaderAvatarIndex !== null"
                :avatarIndex="leaderAvatarIndex"
              />{{ leaderUsername?.toUpperCase?.() || "PLAYER" }}
            </span>
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

    <!-- Robot Moderator unten auf 100% Breite -->
    <RobotModerator
      :is-talking="robotIsTalking"
      :active-message="currentActiveMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import InlineAvatar from "./InlineAvatar.vue"
import { usePartyStore } from "@/stores/party"
import { useGameStore } from "@/stores/game"
import { useRobotModerator } from "@/composables/useRobotModerator"
import { useLeaderboardEvents } from "@/composables/useLeaderboardEvents"
import { usePowerupEvents } from "@/composables/usePowerupEvents"
import { hashToUint32, scrambleText } from "@/utils/textScrambler"
import RobotModerator from "./RobotModerator.vue"
import BuzzerAnsweringPrompt from "./BuzzerAnsweringPrompt.vue"
import type { BonusRoundType } from "@/types/bonusRound"

const props = defineProps<{
  isFinalRound?: boolean
  bonusRoundType?: BonusRoundType | null
}>()

const gameStore = useGameStore()
const partyStore = usePartyStore()

const { robotIsTalking, triggerRobotTalk, playPop } = useRobotModerator()

const {
  leaderNameUpper,
  leaderUsername,
  leaderMessageVisible,
  leaderMessageBefore,
  leaderMessageAfter,
  leaderGapActive,
  leaderGapMessageBefore,
  leaderGapMessageAfter,
} = useLeaderboardEvents(partyStore, gameStore)

const {
  isFreezeActive,
  freezeMessageBefore,
  freezeMessageAfter,
  freezeActorNameUpper,
  lightsOutMessageBefore,
  lightsOutMessageAfter,
  lightsOutActorNameUpper,
} = usePowerupEvents(partyStore)

const activePlayerName = computed(() => partyStore.activePlayer?.username || "Player")

const activePlayerNameUpper = computed(() => activePlayerName.value.toUpperCase())

const activeAvatarIndex = computed(() => {
  const id = partyStore.activePlayerId ?? null
  if (!id) return null

  const p = partyStore.players.find((pl: any) => pl.playerId === id)
  return p ? p.avatarIndex : null
})

const freezeAvatarIndex = computed(() => {
  const id = partyStore.freezeByPlayerId ?? null
  if (!id) return null

  const p = partyStore.players.find((pl: any) => pl.playerId === id)
  return p ? p.avatarIndex : null
})

const lightsOutAvatarIndex = computed(() => {
  const id = partyStore.lightsOutByPlayerId ?? null
  if (!id) return null

  const p = partyStore.players.find((pl: any) => pl.playerId === id)
  return p ? p.avatarIndex : null
})

const leaderAvatarIndex = computed(() => {
  const name = leaderUsername.value
  if (!name) return null

  const p = partyStore.players.find((pl: any) => pl.username === name)
  return p ? p.avatarIndex : null
})

const openPromptTemplates = [
  {
    line1: "Think you know the answer?",
    line2Before: "Hit the ",
    line2After: "!",
  },
  {
    line1: "Ready to make a guess?",
    line2Before: "Smash the ",
    line2After: "!",
  },
  {
    line1: "Got it figured out?",
    line2Before: "Press ",
    line2After: "!",
  },
  {
    line1: "Feeling confident?",
    line2Before: "Go for the ",
    line2After: "!",
  },
] as const

const openPromptIndex = ref(0)

const openPrompt = computed(
  () =>
    openPromptTemplates[openPromptIndex.value % openPromptTemplates.length] ??
    openPromptTemplates[0]
)

watch(
  () => partyStore.buzzerState,
  (next, prev) => {
    if (next === "open" && prev !== "open") {
      openPromptIndex.value = (openPromptIndex.value + 1) % openPromptTemplates.length
    }
  }
)

const isFinalRound = computed(() => Boolean(props.isFinalRound))
const isBonusRound = computed(() => Boolean(props.bonusRoundType))

const isDoublePointsRound = computed(() => isFinalRound.value || isBonusRound.value)

const pointsForCorrect = computed(() => (isDoublePointsRound.value ? 2 : 1))

const pointsForWrong = computed(() => (isDoublePointsRound.value ? 4 : 2))

const resultClass = computed(() =>
  partyStore.activePlayerId ? partyStore.roundResult || "" : "timeout"
)

const optionsForPrompt = computed(() => {
  const options: any[] = (gameStore.currentRound?.options || []).slice(0, 4)

  return options.map((opt) => {
    const label = String(opt?.title || opt?.name || "")

    if (!partyStore.isXlzActive) return label

    const seed = hashToUint32(`${gameStore.currentRoundIndex}|${label}`)

    return scrambleText(label, seed)
  })
})

const isFartMessage = computed(() => {
  if (partyStore.buzzerState !== "answering") return false

  const fartByPlayerId = partyStore.fartByPlayerId
  const activePlayerId = partyStore.activePlayerId

  if (partyStore.fartCharges <= 0) return false
  if (!fartByPlayerId || !activePlayerId) return false

  return activePlayerId !== fartByPlayerId
})

const isDevilMessage = computed(() => {
  if (partyStore.buzzerState !== "answering") return false
  return partyStore.isDevilActive
})

const currentActiveMessage = computed(() => {
  if (isDevilMessage.value) {
    return {
      type: "devilActive",
      key: `devil-${partyStore.activePlayerId || "active"}`,
      class: "powerup-text devil-text",
    }
  }

  if (isFartMessage.value) {
    return {
      type: "fart",
      key: `fart-${partyStore.activePlayerId}`,
      class: "powerup-text fart-text",
    }
  }

  if (partyStore.buzzerState === "answering") {
    return {
      type: "answering",
      key: "answering",
      class: "status-pill answering",
    }
  }

  if (partyStore.roundResult && gameStore.gameState !== "revealing") {
    return {
      type: "result",
      key: "result",
      class: `status-pill result ${resultClass.value}`,
    }
  }

  if (partyStore.isLightsOut) {
    return {
      type: "lightsOut",
      key: "lightsOut",
      class: "powerup-text",
    }
  }

  if (isFreezeActive.value) {
    return {
      type: "freeze",
      key: "freeze",
      class: "powerup-text",
    }
  }

  if (leaderMessageVisible.value) {
    return {
      type: "leaderEvent",
      key: "leader",
      class: "leader-text",
    }
  }

  if (partyStore.buzzerState === "open") {
    if (isFinalRound.value) {
      return {
        type: "openFinal",
        key: "final",
        class: "status-pill open",
      }
    }

    if (isBonusRound.value) {
      return {
        type: "openBonus",
        key: "bonus",
        class: "status-pill open",
      }
    }

    if (leaderGapActive.value) {
      return {
        type: "openGap",
        key: "gap",
        class: "status-pill open",
      }
    }

    return {
      type: "openRegular",
      key: "regular",
      class: "status-pill open",
    }
  }

  return {
    type: "none",
    key: "none",
    class: "",
  }
})

watch(
  () => currentActiveMessage.value.key,
  (nextKey, prevKey) => {
    if (nextKey === "none" || nextKey === prevKey) return

    triggerRobotTalk()
    playPop()
  }
)
</script>

<style scoped>
.buzzer-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  margin-top: 16px;
}

.message-container {
  position: relative;
  width: 100%;
  min-height: 140px;
}

.status-pill,
.powerup-text,
.leader-text {
  box-sizing: border-box;
  position: relative;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1.5;
  text-align: left;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  width: 100%;
  height: 100%;
}

.status-pill.result {
  text-transform: none;
}

.status-pill.open {
  border: 2px solid var(--neon-pink);
}

.pink-text {
  color: var(--neon-pink);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.green-text {
  color: var(--neon-success);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.red-text {
  color: var(--neon-error);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.status-pill.answering {
  border: 2px solid var(--neon-blue);
  color: rgba(255, 255, 255, 0.85);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.status-pill.correct {
  border: 2px solid var(--neon-success);
  color: var(--neon-success);
}

.status-pill.incorrect {
  border: 2px solid var(--neon-error);
  color: var(--neon-error);
}

.status-pill.timeout {
  border: 2px solid var(--neon-blue);
}

.waiting-player,
.player-highlight {
  display: inline-flex;
  align-items: center;
  gap: 0.35ch;
  white-space: nowrap;
  color: white;
}

.answer-highlight {
  color: white;
}

.powerup-text {
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.12);
  border: 2px solid rgba(56, 189, 248, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

.powerup-text.devil-text {
  background: rgba(255, 0, 0, 0.12);
  border-color: var(--neon-social);
}

.leader-text {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--neon-yellow);
  color: var(--neon-yellow);
}

/* Sprechblasen-Pfeil zeigt nach unten auf den Robot-Moderator */
.status-pill::before,
.powerup-text::before,
.leader-text::before {
  content: "";
  position: absolute;
  bottom: -12px;
  left: 60%;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 12px 10px 0 10px;
  border-color: transparent transparent transparent transparent;
  z-index: 10;
}

.status-pill.open::before {
  border-top-color: var(--neon-pink);
}

.status-pill.answering::before {
  border-top-color: var(--neon-blue);
}

.status-pill.correct::before {
  border-top-color: var(--neon-success);
}

.status-pill.incorrect::before {
  border-top-color: var(--neon-error);
}

.status-pill.timeout::before {
  border-top-color: var(--neon-blue);
}

.powerup-text::before {
  border-top-color: rgba(56, 189, 248, 0.5);
}

.powerup-text.devil-text::before {
  border-top-color: var(--neon-social);
}

.leader-text::before {
  border-top-color: var(--neon-yellow);
}
</style>