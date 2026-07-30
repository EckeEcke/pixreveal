<template>
  <div ref="winnerMessage" class="winner-message">
    <h3>DAILY CHAMPION!</h3>
    <Icon icon="pixel:crown-solid" class="crown-icon" />
    <div>You won yesterday's Daily Challenge!</div>
    <ButtonPrimary
      data-sfx="click"
      class="btn-primary"
      @clicked="$router.push('/hall-of-fame')"
    >
      OPEN HALL OF FAME
    </ButtonPrimary>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useConfetti } from "@/composables/useConfetti";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";

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
  padding: 32px 24px;
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
  animation: sharp-pulse 1.5s ease-in-out infinite;
  font-size: 32px;
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
</style>
