<template>
  <div>
    <div class="card">
      <h2 class="logo">DAILY <span>RANKINGS</span></h2>
      <p v-if="isYesterday">RANKINGS FOR <strong>YESTERDAY</strong></p>
      <p v-else-if="sortedRankings.length <= 0">NO RANKINGS YET FOR TODAY</p>
      <p v-else>
        Rankings for <strong>{{ dailyStore.date }}</strong>
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
          size="small"
        />
      </div>
    </template>

    <DailyCountdown class="countdown" />
    <ButtonPrimary
      v-if="!isYesterday"
      data-sfx="click"
      class="btn-primary"
      @clicked="$router.push('/rankings-yesterday')"
    >
      VIEW YESTERDAY RANKINGS
    </ButtonPrimary>
    <ButtonPrimary
      data-sfx="click"
      class="btn-primary"
      @clicked="$router.push('/hall-of-fame')"
    >
      OPEN HALL OF FAME
    </ButtonPrimary>
    <ButtonSecondary
      data-sfx="click"
      class="btn-primary"
      @clicked="$router.push('/')"
    >
      BACK TO HOME
    </ButtonSecondary>
    </div>
    
  </div>
</template>

<script setup>
import { useDailyStore } from "@/stores/daily";
import { computed } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import DailyCountdown from "../page-ui/DailyCountdown.vue";
import LoadingAnimation from "../page-layout/LoadingAnimation.vue";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";
import ButtonSecondary from "../page-ui/ButtonSecondary.vue";

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
  margin-bottom: 16px;
}

p {
  text-align: center;
  letter-spacing: 1px;
}

.logo {
  margin-top: 0;
}

.countdown {
  margin-bottom: 32px;
}

.btn-primary {
  width: 100%;
  margin: 16px auto 0;
}

.card {
  display: flex;
  flex-direction: column;
  place-items: center;
  border-radius: 8px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  width: 100%;
  max-width: 616px;
  box-sizing: border-box;
  margin-bottom: 32px;
}

.player-wrapper {
  width: 100%;
}
</style>
