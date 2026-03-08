<template>
  <div
    class="player-hud"
    :class="{ pending: hasFinished === false, minimalistic: minimalistic }"
  >
    <div class="hud-avatar" :style="avatarStyle"></div>
    <div class="hud-info">
      <span class="hud-username">
        {{ name }}<template v-if="showYouIndicator"> (YOU)</template>
      </span>
      <div class="hud-stats">
        <div v-if="points || points === 0" class="hud-points">
          <Icon icon="pixel:star-solid" class="star-icon" /> {{ points }}
        </div>
        <div v-if="roundIndex || roundIndex === 0">
          <Icon icon="pixel:image-solid" class="image-icon" /> {{ roundIndex }}/{{ maxRounds }}
        </div>
        <div v-if="correctAnswers || correctAnswers === 0">
          <Icon icon="pixel:check-box-solid" class="check-icon" /> {{ correctAnswers || 0 }}
        </div>
      </div>
    </div>

    <div v-if="isHost" class="host-info">
      <Icon icon="pixel:crown-solid" />
      HOST
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import avatarSheet from "@/assets/avatars/avatars.jpg";
import { Icon } from "@iconify/vue";

const props = defineProps({
  name: String,
  avatarIndex: Number,
  points: Number | undefined,
  hasFinished: Boolean | undefined,
  isHost: Boolean,
  correctAnswers: Number | undefined,
  roundIndex: Number | undefined,
  maxRounds: Number | undefined,
  showYouIndicator: Boolean,
  minimalistic: Boolean,
});

const avatarStyle = computed(() => {
  const index = props.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);

  const x = col * 20;
  const y = row * 20;

  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});
</script>

<style scoped>
.player-hud {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--neon-orange);
  border-left: 8px solid var(--neon-orange);
  border-radius: 4px;
  backdrop-filter: blur(5px);
  min-width: 240px;
}

.player-hud.minimalistic {
  background: none;
  border: none;
  border-left: none;
  justify-content: center;
  backdrop-filter: unset;
  font-size: 24px;
  .hud-avatar {
    height: 66px;
    width: 66px;
  };
  .hud-username {
    font-size: 24px;
  };
  .hud-info {
    gap: 8px;
  }
}

.hud-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.hud-avatar {
  width: 42px;
  height: 42px;
  background-color: #2d3748;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.hud-stats {
  display: flex;
  gap: 16px;
  align-items: baseline;
  div {
    display: flex;
    gap: 4px;
    align-items: flex-start;
  }
}

.hud-username {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.host-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  background: lightgray;
  padding: 8px;
  border-radius: 8px;
  color: black;
  font-size: 12px;
}

.pending {
  opacity: 0.4;
}

.star-icon {
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 5px var(--neon-yellow));
}

.image-icon {
  color: var(--neon-blue);
  filter: drop-shadow(0 0 5px var(--neon-blue));
}

.check-icon {
  color: var(--neon-success);
  filter: drop-shadow(0 0 5px var(--neon-success));
}
</style>
