<template>
  <main>
    <div class="back-btn-wrapper">
      <button class="back-btn" @click="$router.back()" data-sfx="back">
        <Icon icon="pixel:angle-left-solid" />
      </button>
    </div>
    <div class="card">
      <h1 class="logo">HALL OF <span>FAME</span></h1>
      <p class="subline">
        <Icon icon="pixel:sparkles" /> All winners of Daily Challenge
        <Icon icon="pixel:sparkles" />
      </p>
      <ButtonPrimary
        v-if="!isYesterday"
        data-sfx="click"
        class="btn-primary"
        @clicked="startDaily"
      >
        {{
          dailyStore.hasPlayedToday
            ? "CHECK TODAY'S RANKINGS"
            : "PLAY DAILY CHALLENGE"
        }}
      </ButtonPrimary>
    </div>
    <div class="player-grid">
      <PlayerDisplay
        v-for="player in winners"
        :key="player.date"
        :subline="player.date"
        :name="player.winner.name"
        :avatar-index="player.winner.avatarIndex"
        :points="player.winner.score"
        class="player-card"
      />
    </div>
  </main>
</template>

<script setup>
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useDailyStore } from "@/stores/daily";
import { useGameStore } from "@/stores/game";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";

const dailyStore = useDailyStore();
const { prepareGame } = useGameStore();
const playerStore = usePlayerStore();
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

const winners = computed(() => dailyStore.winners);

if (!dailyStore.dailyRounds.length) {
  dailyStore.fetchDailyData();
}
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
  max-width: 616px;
  margin-bottom: 16px;
}

.player-grid {
  width: 100%;
  max-width: 616px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 32px auto;
}

.subline {
  margin-bottom: 32px;
  display: flex;
  place-items: center;
  gap: 8px;
  text-align: center;
  color: var(--neon-yellow);
  font-weight: 700;
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
}
</style>
