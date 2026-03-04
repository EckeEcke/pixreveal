<template>
  <main>
    <header>
      <h1 class="logo">GAME <span>OVER</span></h1>
    </header>
    <div>
      <div v-if="isOnlinePlay">
        <div
          v-for="(player, index) in playersSortedByPoints"
          :key="player.playerId"
          class="player-wrapper"
        >
          <div class="position">{{ index + 1 }}.</div>
          <PlayerDisplay
            :name="player.username"
            :avatar-index="player.avatarIndex"
            :points="player.points"
            :has-finished="player.hasFinished"
          />
        </div>
        <div v-if="playersOnline.some((player) => !player.hasFinished)">
          <LoadingAnimation text="WAITING FOR REMAINING PLAYERS" />
        </div>
      </div>
      <PlayerDisplay
        v-else
        :name="playerStore.playerName"
        :avatar-index="playerStore.avatarIndex"
        :points="playerStore.points"
      />
    </div>
    <button
      v-if="!playersOnline.some((player) => !player.hasFinished)"
      class="btn-outline"
      @click="playAgain"
    >
      Play Again
    </button>
  </main>
</template>

<script setup>
import { computed } from "vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useRouter } from "vue-router";
import { useOnlineStore } from "@/stores/online";
import { usePlayerStore } from "@/stores/player";
import LoadingAnimation from "@/components/LoadingAnimation.vue";

const playerStore = usePlayerStore();
const onlineStore = useOnlineStore();
const router = useRouter();

const playersOnline = computed(() => onlineStore.playersOnline);

const playersSortedByPoints = computed(() => {
  return [...playersOnline.value].sort((a, b) => b.points - a.points);
});

const isOnlinePlay = computed(
  () => onlineStore.playersOnline && onlineStore.playersOnline.length > 1,
);

const playAgain = () => router.push("/");
</script>

<style scoped>
.logo {
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 0 10px var(--neon-orange);
  margin-bottom: 2rem;
}

.logo span {
  color: var(--neon-orange);
}

.player-wrapper {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
}

.position {
  color: var(--neon-orange);
  font-weight: 700;
  font-size: 32px;
}

.btn-outline {
  margin-top: 32px;
}
</style>
