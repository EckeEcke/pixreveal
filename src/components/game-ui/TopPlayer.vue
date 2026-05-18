<template>
  <div v-if="topRanking" class="top-player-card setup-card">
    <div class="card-header">
      <Icon icon="pixel:crown-solid" class="crown" />
      <div class="top-player">
        <h2 class="logo">TOP<span> PLAYER</span></h2>
      </div>

      <p>Top ranking in today's daily challenge</p>
    </div>

    <div class="player-wrapper">
      <PlayerDisplay
        :name="topRanking.name"
        :avatar-index="topRanking.avatarIndex"
        :points="topRanking.score"
        :rounded="true"
      />
    </div>

    <InfoBox icon="✅" class="info-box">
      <div class="info">
        <p>You already played today!</p>
        <p>Come back tomorrow to play again.</p>
      </div>
    </InfoBox>

    <ButtonPrimary
      v-if="!dailyStore.hasPlayedToday"
      data-sfx="click"
      class="btn-primary"
      @clicked="startDaily"
    >
      Play Daily Challenge
    </ButtonPrimary>
    <ButtonPrimary
      v-else
      data-sfx="click"
      class="btn-primary"
      @clicked="router.push('/rankings-daily')"
    >
      Check Rankings
    </ButtonPrimary>

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
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";
import InfoBox from "./InfoBox.vue";

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
  padding: 24px;
  max-width: 850px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.card-header {
  text-align: center;
}

.crown {
  font-size: 24px;
  color: var(--neon-yellow);
}

.info-box {
  box-sizing: border-box;
  width: 400px;
  max-width: 100%;
}

.info {
  color: var(--neon-success);
  font-weight: 700;
}

.info p:nth-of-type(2) {
  color: var(--color-secondary);
  font-weight: 400;
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
}

.btn-primary {
  margin: 16px auto 0;
}

.top-player {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  width: 100%;
}

@media (min-width: 576px) {
  .top-player::before,
  .top-player::after {
    content: "";
    height: 2px;
    width: 120px;

    background: linear-gradient(to right, transparent, rgba(255, 80, 180, 0.7));

    border-radius: 999px;
  }

  .top-player::after {
    transform: scaleX(-1);
  }
}
</style>
