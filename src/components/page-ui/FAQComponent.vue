<template>
  <section class="faq-section">
    <h2>Frequently Asked Questions</h2>
    
    <details 
      v-for="(item, index) in items" 
      :key="index" 
      class="faq-item"
    >
      <summary>{{ item.question }}</summary>
      <div class="faq-answer">
        <p>{{ item.answer }}</p>
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
}

defineProps<{
  items: FaqItem[]
}>()
</script>

<style scoped>
.faq-section {
  margin-top: 48px;
  text-align: left;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.faq-item summary {
  font-weight: 700;
  cursor: pointer;
  outline: none;
  user-select: none;
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