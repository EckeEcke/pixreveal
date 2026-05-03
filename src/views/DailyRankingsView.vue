<template>
  <div class="back-btn-wrapper">
    <button class="back-btn" @click="$router.back()">
      <Icon icon="pixel:angle-left-solid" />
    </button>
  </div>
  <DailyRankings class="rankings"/>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import DailyRankings from "@/components/game-ui/DailyRankings.vue";
import { useDailyStore } from "@/stores/daily";

const dailyStore = useDailyStore();

if (!dailyStore.dailyRounds.length) {
  dailyStore.fetchDailyData();
}
</script>

<style scoped>
.back-btn-wrapper {
  min-width: 32px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 16px;
}

.rankings {
  min-height: calc(100vh - 64px);
}
</style>
