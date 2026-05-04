<template>
  <div class="position" :class="getClass()">
    {{ position }}
  </div>
</template>

<script setup lang="ts">

const props = defineProps < {
  position?: number,
} > ();

const getClass = () => {
  if (props.position === 1) return "first";
  if (props.position === 2) return "second";
  if (props.position === 3) return "third";
  return "";
};
</script>

<style scoped>
.position {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--white);
  font-weight: 700;
  font-size: 20px;
  line-height: 0.1;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  @media(min-width:576px) {
    font-size: 24px;
  }
}

.first {
  color: black;
  border-color: var(--neon-yellow);
  background: var(--neon-yellow);
  box-shadow:
    0 0 20px var(--yellow-glow),
    2px 2px 4px #00000088;
}

.second {
  color: black;
  border-color: #c0c0c0;
  background: #c0c0c0;
  box-shadow:
    0 0 15px rgba(192, 192, 192, 0.4),
    2px 2px 4px #00000088;
}

.third {
  color: black;
  border-color: #cd7f32;
  background: #cd7f32;
  box-shadow:
    0 0 15px rgba(205, 127, 50, 0.4),
    2px 2px 4px #00000088;
}
</style>
