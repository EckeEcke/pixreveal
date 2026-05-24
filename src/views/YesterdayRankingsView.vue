<template>
  <div>
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="click">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>
    <DailyRankings :is-yesterday="true" class="rankings" />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import DailyRankings from "@/components/game-ui/DailyRankings.vue";
</script>

<style scoped>
.back-btn-wrapper {
  min-width: 32px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 16px;
}

.rankings {
  width: 400px;
  max-width: 100%;
  min-height: calc(100vh - 64px);
}
</style>
