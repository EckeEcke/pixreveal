<template>
  <div>
    <h2 class="logo">DAILY <span>RANKINGS</span></h2>
    <p>Rankings for {{ dailyStore.date }}</p>
    <div
      v-for="(ranking, index) in sortedRankings"
      :key="index"
      class="player-wrapper"
    >
      <PlayerDisplay
        :name="ranking.name"
        :avatar-index="ranking.avatarIndex"
        :points="ranking.score"
        :position="index + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { useDailyStore } from "@/stores/daily";
import { computed } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";

const dailyStore = useDailyStore();
const sortedRankings = computed(() => {
  return [...dailyStore.dailyRankings].sort((a, b) => b.score - a.score);
});
</script>

<style scoped>
h2 {
  font-family: "8bit";
  text-align: center;
  margin: 64px auto 32px;
}

p {
  margin-bottom: 32px;
  text-align: center;
}

.logo {
  margin-top: 0;
}
</style>
