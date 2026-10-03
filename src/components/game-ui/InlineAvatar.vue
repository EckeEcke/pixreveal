<template>
  <span
    v-if="avatarIndex !== null && avatarIndex !== undefined"
    :style="avatarStyle"
    class="inline-avatar"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CSSProperties } from "vue";
import { getAvatarStyle, type AvatarSpriteSheet } from "@/utils/avatar";

const props = defineProps<{
  avatarIndex?: number | null;
  avatarSpriteSheet?: AvatarSpriteSheet;
}>();

const avatarStyle = computed<CSSProperties>(() => {
  return {
    ...getAvatarStyle(props.avatarIndex, props.avatarSpriteSheet),
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
