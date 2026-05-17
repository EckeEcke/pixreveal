<template>
  <div v-if="topRanking" class="top-player-card setup-card">
    <div class="info-text">
      <h2 class="logo">TOP<span> PLAYER</span></h2>
      <p>Top ranking in today's daily challenge</p>
    </div>

    <div class="player-wrapper">
      <PlayerDisplay
        :name="topRanking.name"
        :avatar-index="topRanking.avatarIndex"
        :points="topRanking.score"
      />
    </div>

    <button
      v-if="!dailyStore.hasPlayedToday"
      class="confirm-btn"
      @click="startDaily"
    >
      Play Daily Challenge
    </button>
    <button
      v-else
      class="confirm-btn"
      @click="router.push('/rankings-daily')"
    >
      Check Rankings
    </button>

    <DailyCountdown />

    <Icon icon="pixel:crown-solid" class="background-icon" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import { useDailyStore } from "@/stores/daily";
import { useGameStore } from "@/stores/game";
import DailyCountdown from "../page-ui/DailyCountdown.vue";
import { usePlayerStore } from "@/stores/player";

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
  margin-top: 24px;
  padding: 24px;
  max-width: 850px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
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
}

p {
  line-height: 1.6;
  font-size: 16px;
  color: #ffffff88;
  margin: 0;
}

.player-wrapper {
  width: 400px;
  max-width: 100%;
}

.confirm-btn {
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  padding: 12px 16px;
  margin: 16px auto 0;
  border: none;
  color: black;
  text-transform: uppercase;
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.info-text {
  text-align: center;
}
</style>
