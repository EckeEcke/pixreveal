<template>
  <template v-if="activePlayerName">
    <span class="waiting-player">
      <InlineAvatar
        v-if="activeAvatarIndex !== null"
        :avatarIndex="activeAvatarIndex"
      />{{ activePlayerName }}
    </span>
    <template v-if="isDevilActive">
      is playing Devil! Is it
    </template>
    <template v-else>
      hit the buzzer! Is it
    </template>
  </template>
  <template v-else-if="showOptionsEarly">
    Time's almost up! Is it
  </template>

  <template v-if="activePlayerName || showOptionsEarly">
    <span
      v-for="(opt, index) in options"
      :key="`${index}-${opt}`"
      class="prompt-option"
      :style="getOptionStyle(index)"
    >
      {{ opt }}{{ index < options.length - 2 ? ", " : "" }}
      <span v-if="index === options.length - 2">
        &nbsp;<span class="white-text">or</span>&nbsp;
      </span>
      <span v-else-if="index === options.length - 1">?</span>
    </span>
    <span v-if="isXlzActive">&nbsp;Hmm.. this looks off.</span>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { usePartyStore } from "@/stores/party"
import InlineAvatar from "./InlineAvatar.vue"

const props = defineProps<{
  activePlayerName: string
  options: string[]
  isXlzActive: boolean
  isDevilActive?: boolean
  timeRemaining: number
  maxRevealTime: number
}>()

const partyStore = usePartyStore()

const activeAvatarIndex = computed(() => {
  const id = partyStore.activePlayerId ?? null
  if (!id) return null
  const p = partyStore.players.find((pl: any) => pl.playerId === id)
  return p ? p.avatarIndex : null
})

const EARLY_REVEAL_THRESHOLD = 5
const MIN_MAX_REVEAL_TIME = 10

const showOptionsEarly = computed(() => {
  if (props.maxRevealTime < MIN_MAX_REVEAL_TIME) return false
  return props.timeRemaining <= EARLY_REVEAL_THRESHOLD
})

const buttonColors = [
  { color: "var(--neon-pink)", glow: "var(--pink-glow)" },
  { color: "var(--neon-blue)", glow: "var(--blue-glow)" },
  { color: "var(--neon-purple)", glow: "var(--purple-glow)" },
  { color: "var(--neon-yellow)", glow: "var(--yellow-glow)" },
] as const

const getOptionStyle = (index: number) => {
  const entry = buttonColors[index % buttonColors.length] ?? buttonColors[0]
  return {
    color: entry.color,
    textShadow: `0 0 8px ${entry.glow}`,
  }
}
</script>

<style scoped>
/* keep avatar and player name together on same line */
.waiting-player {
  display: inline-flex;
  align-items: center;
  gap: 0.35ch;
  white-space: nowrap;
}

.prompt-option {
  font-weight: 700;
}
</style>