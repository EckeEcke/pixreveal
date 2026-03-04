<template>
  <div>
    <h1>Lobby</h1>
    {{ onlineStore.currentRoomId }}
    {{  onlineStore.client }}
    <PlayerDisplay
      v-for="player in players"
      :key="player.playerId"
      :name="player.username"
      :avatar-index="player.avatarIndex"
    />
    <button
      v-if="players && players.length > 1 && onlineStore.isHost"
      class="btn-outline"
      @click="onlineStore.triggerGameStart(rounds)"
    >
      START GAME
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import PlayerDisplay from "@/components/PlayerDisplay.vue";
import { useOnlineStore } from "@/stores/online";
import { useRouter } from "vue-router";
import { useGameStore } from "@/stores/game";

const { rounds } = useGameStore()

const onlineStore = useOnlineStore();
const router = useRouter()

const players = computed(() => onlineStore.playersOnline);
onMounted(() => {
    if (players.value.length <= 0) router.push('/')
})
</script>
