<template>
  <span
    v-if="avatarIndex !== null && avatarIndex !== undefined"
    :style="avatarStyle"
    class="inline-avatar"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import avatarSheet from "@/assets/avatars/avatars.webp";
import type { CSSProperties } from "vue";

const props = defineProps<{
  avatarIndex?: number | null;
}>();

const avatarStyle = computed<CSSProperties>(() => {
  const idx = props.avatarIndex ?? 0;
  const col = idx % 6;
  const row = Math.floor(idx / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated" as CSSProperties["imageRendering"],
    width: "1em",
    height: "1em",
    display: "inline-block",
    verticalAlign: "middle",
    borderRadius: "0.2em",
  };
});
</script>

<style scoped>
.inline-avatar {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 2px;
  border-radius: 0.2em;
  image-rendering: pixelated;
  background-color: #2d3748;
  background-repeat: no-repeat;
}
.inline-avatar {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
  border-radius: 0.2em;
  image-rendering: pixelated;
  background-color: #2d3748;
  background-repeat: no-repeat;
}
</style>
