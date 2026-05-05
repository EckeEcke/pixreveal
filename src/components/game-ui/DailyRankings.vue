<template>
  <div>
    <h2 class="logo">DAILY <span>RANKINGS</span></h2>
    <p v-if="isYesterday">RANKINGS FOR <strong>YESTERDAY</strong></p>
    <p v-else-if="sortedRankings.length <= 0">NO RANKINGS YET FOR TODAY</p>
    <p v-else>
      RANKINGS FOR <strong>{{ dailyStore.date }}</strong>
    </p>
    <LoadingAnimation v-if="dailyStore.isLoading" />
    <template v-else>
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
    </template>

    <DailyCountdown />
    <button
      v-if="!isYesterday"
      class="confirm-btn"
      @click="$router.push('/rankings-yesterday')"
    >
      VIEW RANKINGS OF YESTERDAY
    </button>
  </div>
</template>

<script setup>
import { useDailyStore } from "@/stores/daily";
import { computed } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import DailyCountdown from "../page-ui/DailyCountdown.vue";
import LoadingAnimation from "../page-layout/LoadingAnimation.vue";

const props = defineProps({
  isYesterday: Boolean,
});

const dailyStore = useDailyStore();
const sortedRankings = computed(() => {
  return props.isYesterday
    ? [...dailyStore.yesterdayRankings].sort((a, b) => b.score - a.score)
    : [...dailyStore.dailyRankings].sort((a, b) => b.score - a.score);
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
  letter-spacing: 1px;
}

.logo {
  margin-top: 0;
}

.confirm-btn {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  padding: 12px 16px;
  margin: 64px auto;
  border: none;
  color: black;
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
