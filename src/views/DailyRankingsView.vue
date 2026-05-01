<template>
  <DailyRankings />
</template>

<script setup>
import DailyRankings from "@/components/game-ui/DailyRankings.vue";
import { useDailyStore } from "@/stores/daily";

const dailyStore = useDailyStore();

if (!dailyStore.dailyRounds.length) {
  dailyStore.fetchDailyData();
}
</script>
