<template>
  <div ref="winnerMessage" class="winner-message">
    <h2 class="logo">DAILY<span> CHAMPION</span></h2>
    <router-link to="/hall-of-fame" class="player-wrapper">
      <TopPlayerDisplay
        v-if="winnerData"
        :name="winnerData.name"
        :avatar-index="winnerData.avatarIndex"
        :score="winnerData.score"
      />
    </router-link>
    <div class="message"><b> Congratulations!</b> You reached the highest score in yesterday's Daily Challenge and made it to the Hall of Fame!</div>
    <ButtonPrimary
      data-sfx="click"
      class="btn-primary"
      @clicked="$router.push('/hall-of-fame')"
    >
      OPEN HALL OF FAME
    </ButtonPrimary>
    <Icon icon="pixel:crown-solid" class="background-icon" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useConfetti } from "@/composables/useConfetti";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";
import TopPlayerDisplay from "./TopPlayerDisplay.vue";
import { useDailyStore } from "@/stores/daily.ts";

const dailyStore = useDailyStore();

const winnerData = computed(() => dailyStore.winners[0]?.winner);

const winnerMessage = ref<HTMLElement | null>(null);
const hasFiredConfetti = ref(false);

const { fireFromElement } = useConfetti();

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!winnerMessage.value) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && !hasFiredConfetti.value) {
        hasFiredConfetti.value = true;

        fireFromElement(winnerMessage.value!);

        observer?.disconnect();
      }
    },
    {
      threshold: 0.5,
    },
  );

  observer.observe(winnerMessage.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.winner-message {
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-direction: column;
  border-radius: 8px;
  padding: 32px;
  max-width: 850px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  overflow: hidden;
}

.winner-message::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -60%;
  width: 30%;
  height: 300%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
  animation: shine 4s infinite;
}

.winner-message h3 {
  color: var(--neon-yellow);
  margin: 0;
  animation: none 1.5s ease-in-out infinite;
  font-family: "8bit";
  font-size: 24px;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.25);
}

.crown-icon {
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 5px var(--neon-yellow));
  font-size: 64px;
}

.btn-primary {
  margin-top: 16px;
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
.message {
  text-align: center;
  max-width: 450px;
}

.player-wrapper {
  margin: 16px auto;
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
