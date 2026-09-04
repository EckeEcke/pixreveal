<template>
  <div>
    <div class="card">
      <h2 class="logo">DAILY <span>RANKINGS</span></h2>
      <LoadingAnimation v-if="dailyStore.isLoading" />
    <template v-else>
      <div class="top-player-wrapper" v-if="sortedRankings.length > 0">
        <h3><div class="first">1</div>TOP PLAYER</h3>
        <TopPlayerDisplay
            :name="sortedRankings[0].name"
            :avatar-index="sortedRankings[0].avatarIndex"
            :score="sortedRankings[0].score"
          />
          <ButtonPrimary
            v-if="!isYesterday && !dailyStore.hasPlayedToday"
            data-sfx="click"
            class="btn-primary"
            @clicked="startDaily"
          >
            Beat them
          </ButtonPrimary>
      </div>
      
      <p v-if="isYesterday">RANKINGS FOR <strong>YESTERDAY</strong></p>
      <p v-else-if="sortedRankings.length <= 0">NO RANKINGS YET FOR TODAY</p>
      <p v-else>
        Today's Rankings
      </p>
      <div
        v-for="(ranking, index) in sortedRankings.slice(1)"
        :key="index"
        class="player-wrapper"
      >
        <PlayerDisplay
          :name="ranking.name"
          :avatar-index="ranking.avatarIndex"
          :points="ranking.score"
          :position="index + 2"
          size="small"
        />
      </div>
    </template>

    <DailyCountdown class="countdown" />
    <ButtonSecondary
      v-if="isYesterday"
      data-sfx="click"
      class="btn-primary"
      @clicked="$router.push('/rankings-daily')"
    >
      VIEW TODAY'S RANKINGS
    </ButtonSecondary>
    <ButtonSecondary
      v-if="!isYesterday"
      data-sfx="click"
      class="btn-secondary"
      @clicked="$router.push('/rankings-yesterday')"
    >
      VIEW YESTERDAY'S RANKINGS
    </ButtonSecondary>
    <ButtonSecondary
      data-sfx="click"
      class="btn-secondary"
      @clicked="$router.push('/hall-of-fame')"
    >
      OPEN HALL OF FAME
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
import TopPlayerDisplay from "../game-ui/TopPlayerDisplay.vue";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";
import { useRouter } from "vue-router";

const props = defineProps({
  isYesterday: Boolean,
});

const playerStore = usePlayerStore();

const dailyStore = useDailyStore();
const sortedRankings = computed(() => {
  return props.isYesterday
    ? [...dailyStore.yesterdayRankings].sort((a, b) => b.score - a.score)
    : [...dailyStore.dailyRankings].sort((a, b) => b.score - a.score);
});

const { prepareGame } = useGameStore();

const router = useRouter();

const startDaily = () => {
  prepareGame(10, dailyStore.dailyRounds);
  playerStore.gameMode = dailyStore.mode;
  if (dailyStore.hasPlayedToday) {
    router.push("/rankings-daily");
  } else {
    router.push("/daily");
  }
};
</script>

<style scoped>
h2 {
  font-family: "8bit";
  font-size: 32px;
  text-align: center;
  margin-bottom: 16px;
}

h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
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
  margin: 8px auto 0;
}

.btn-secondary {
  width: 100%;
  margin: 16px auto 0;
}

.card {
  display: flex;
  flex-direction: column;
  place-items: center;
  border-radius: 8px;
  padding: 24px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 616px;
  box-sizing: border-box;
  margin-bottom: 32px;
}



.player-wrapper {
  width: 100%;
}

.top-player-wrapper {
  width: 100%;
  margin-bottom: 32px;
}

.first {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 20px;
  line-height: 0.1;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: black;
  border-color: var(--neon-yellow);
  background: var(--neon-yellow);
  box-shadow: 0 0 20px var(--yellow-glow), 2px 2px 4px #00000088;
  padding-left: 1px;
}
</style>
