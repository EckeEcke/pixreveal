<template>
  <main>
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>
    <DailyRankings class="rankings" />
  </main>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import DailyRankings from "@/components/game-ui/DailyRankings.vue";
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
}

.back-btn-wrapper {
  min-width: 32px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 16px;
}

.rankings {
  width: 400px;
  max-width: 100%;
  min-height: calc(100vh - 64px);
}
</style>
