<template>
  <div class="rankings">
    <h1 class="logo">PARTY<span>RANKINGS</span></h1>
    <TransitionGroup name="rank-move" tag="div" class="ranking-list">
      <div
        v-for="(player, index) in partyPlayersSorted"
        :key="player.playerId"
        class="ranking-item"
        :class="{ frozen: isPlayerFrozen(player.playerId) }"
      >
        <div v-if="isPlayerFrozen(player.playerId)" class="frozen-overlay" />
        <PlayerDisplay
          :position="index + 1"
          :name="player.username"
          :avatar-index="player.avatarIndex"
          :points="player.points"
          :size="partyPlayersSorted.length > 5 ? 'small' : 'medium'"
          :is-active="activePlayerId === player.playerId"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";

type RankingPlayer = {
  playerId: string;
  username: string;
  avatarIndex: number;
  points: number;
};

const props = defineProps<{
  partyPlayersSorted: RankingPlayer[];
  activePlayerId: string | null;
  freezeByPlayerId?: string | null;
  freezeUntilAt?: number | null;
}>();

const isFreezeActive = computed(
  () => typeof props.freezeUntilAt === "number" && props.freezeUntilAt > Date.now(),
);

const isPlayerFrozen = (playerId: string) => {
  if (!isFreezeActive.value) return false;
  if (!playerId) return false;
  return props.freezeByPlayerId ? playerId !== props.freezeByPlayerId : true;
};
</script>

<style scoped>
.rankings {
  padding-left: 24px;
}

.logo {
  text-align: center;
  margin-bottom: 32px;
  font-size: 1.5rem;
  letter-spacing: 2px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  position: relative;
}

.frozen-overlay {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.22);
  backdrop-filter: blur(1px);
  pointer-events: none;
  z-index: 2;
}

.rank-move-move {
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (max-width: 1023px) {
  .rankings {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 24px;
  }
}
</style>

