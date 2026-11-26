<template>
  <section class="faq-section">
    <h2>Frequently Asked Questions</h2>

    <div class="faq-columns" :class="{ 'two-columns': twoColumns }">
      <div v-for="(group, index) in itemGroups" :key="index" class="faq-column">
        <details v-for="item in group" :key="item.question" class="faq-item">
          <summary>{{ item.question }}</summary>
          <div class="faq-answer">
            <p>{{ item.answer }}</p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface FaqItem {
  question: string
  answer: string
}

const props = withDefaults(defineProps<{
  items: FaqItem[]
  twoColumns?: boolean
}>(), {
  twoColumns: false,
});

const itemGroups = computed(() => {
  if (!props.twoColumns) return [props.items];
  const midpoint = Math.ceil(props.items.length / 2);
  return [props.items.slice(0, midpoint), props.items.slice(midpoint)];
});
</script>

<style scoped>
.faq-section {
  text-align: left;
}

.faq-columns {
  display: grid;
  column-gap: 32px;
  row-gap: 12px;
  align-items: start;
}

.faq-column {
  display: grid;
  gap: 12px;
  min-width: 0;
}

@media (min-width: 1024px) {
  .faq-columns.two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.faq-item summary {
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.faq-item summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.faq-answer {
  margin-top: 12px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.faq-answer p {
  margin: 0;
}
</style>
