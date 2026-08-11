<template>
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

<script setup lang="ts">
import { computed } from "vue"
import { usePartyStore } from "@/stores/party"
import InlineAvatar from "./InlineAvatar.vue"

defineProps<{
  activePlayerName: string
  options: string[]
  isXlzActive: boolean
  isDevilActive?: boolean
}>()

const partyStore = usePartyStore()

const activeAvatarIndex = computed(() => {
  const id = partyStore.activePlayerId ?? null
  if (!id) return null
  const p = partyStore.players.find((pl: any) => pl.playerId === id)
  return p ? p.avatarIndex : null
})

const optionColors = [
  { color: "var(--neon-pink)", glow: "var(--pink-glow)" },
  { color: "var(--neon-blue)", glow: "var(--blue-glow)" },
  { color: "var(--neon-purple)", glow: "var(--purple-glow)" },
  { color: "var(--neon-yellow)", glow: "var(--yellow-glow)" },
] as const

const getOptionStyle = (index: number) => {
  const entry = optionColors[index % optionColors.length] ?? optionColors[0]
  return {
    "--opt-color": entry.color,
    "--opt-glow": entry.glow,
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
</style>