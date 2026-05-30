<template>
  <span class="waiting-player">{{ activePlayerName }}</span>
  hit the buzzer! Is it
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
defineProps<{
  activePlayerName: string;
  options: string[];
  isXlzActive: boolean;
}>();

const optionColors = [
  { color: "var(--neon-pink)", glow: "var(--pink-glow)" },
  { color: "var(--neon-blue)", glow: "var(--blue-glow)" },
  { color: "var(--neon-purple)", glow: "var(--purple-glow)" },
  { color: "var(--neon-yellow)", glow: "var(--yellow-glow)" },
] as const;

const getOptionStyle = (index: number) => {
  const entry = optionColors[index % optionColors.length] ?? optionColors[0];
  return {
    "--opt-color": entry.color,
    "--opt-glow": entry.glow,
  };
};
</script>