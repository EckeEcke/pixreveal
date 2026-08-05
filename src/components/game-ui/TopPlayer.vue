<template>
  <div v-if="topRanking" class="top-player-card setup-card">
    <div class="card-header">
      <div class="top-player">
        <h2 class="logo">TOP<span> PLAYER</span></h2>
      </div>

      <p>Best score in today's daily challenge</p>
    </div>

    <div class="player-wrapper">
      <router-link to="/rankings-daily">
        <TopPlayerDisplay
          :name="topRanking.name"
          :avatar-index="topRanking.avatarIndex"
          :score="topRanking.score"
        />
      </router-link>
    </div>

    <ButtonPrimary
      v-if="!dailyStore.hasPlayedToday"
      data-sfx="click"
      class="btn-primary"
      @clicked="startDaily"
    >
      <Icon icon="pixel:play-solid" />
      Play Daily Challenge
    </ButtonPrimary>

    <DailyCountdown />

    <Icon icon="pixel:calender" class="background-icon" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import TopPlayerDisplay from "@/components/game-ui/TopPlayerDisplay.vue";
import { useDailyStore } from "@/stores/daily";
import { useGameStore } from "@/stores/game";
import DailyCountdown from "../page-ui/DailyCountdown.vue";
import { usePlayerStore } from "@/stores/player";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";

const router = useRouter();
const dailyStore = useDailyStore();
const playerStore = usePlayerStore();

const { prepareGame } = useGameStore();

type DailyRanking = {
  name: string;
  score: number;
  avatarIndex: number;
};

const topRanking = computed<DailyRanking | null>(() => {
  const list = Array.isArray(dailyStore.dailyRankings)
    ? (dailyStore.dailyRankings as DailyRanking[])
    : [];
  if (!list.length) return null;
  return [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;
});

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
.top-player-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 32px;
  max-width: 850px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

a {
  text-decoration: none;
}

.card-header {
  text-align: center;
}

.crown {
  font-size: 24px;
  color: var(--neon-yellow);
}

.background-icon {
  position: absolute;
  font-size: 190px;
  right: -50px;
  bottom: -30px;
  color: var(--neon-yellow);
  opacity: 0.08;
  pointer-events: none;
}

h2 {
  margin-top: 0;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 900;
  letter-spacing: 2px;
}

p {
  line-height: 1.6;
  font-size: 16px;
  margin: 0;
}

.player-wrapper {
  width: 400px;
  max-width: 100%;
  margin: 16px auto;
}

.btn-primary {
  margin: 0 auto;
}

.top-player {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  width: 100%;
}

.logo {
  font-family: "8bit";
  letter-spacing: 1px;
  margin-bottom: 16px;
  margin-top: 16px;
  font-size: 16px;
  @media (min-width: 450px) {
    font-size: 22px;
  }
}
</style>
