<template>
  <div class="position" :class="getClass()">
    {{ position }}
  </div>
</template>

<script setup>
const props = defineProps({
  position: Number,
});

const getClass = () => {
  if (props.position === 1) return "first";
  if (props.position === 2) return "second";
  if (props.position === 3) return "third";
  return "";
};
</script>

<style scoped>
.position {
  position: absolute;
  top: -12px;
  left: -12px;
  background: var(--bg-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary);
  font-weight: 700;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--primary);
  box-shadow: 2px 2px 4px #00000088;
}

.first {
  border-color: var(--neon-yellow);
  color: var(--neon-yellow);
  box-shadow:
    0 0 20px var(--yellow-glow),
    2px 2px 4px #00000088;
}

.second {
  border-color: #c0c0c0;
  color: #c0c0c0;
  box-shadow:
    0 0 15px rgba(192, 192, 192, 0.4),
    2px 2px 4px #00000088;
}

.third {
  border-color: #cd7f32;
  color: #cd7f32;
  box-shadow:
    0 0 15px rgba(205, 127, 50, 0.4),
    2px 2px 4px #00000088;
}
</style>
