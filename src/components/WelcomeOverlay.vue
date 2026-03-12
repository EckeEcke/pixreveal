<template>
  <div class="welcome-overlay">
    <div class="setup-card">
      <h1 class="logo">Pix<span>Reveal</span></h1>

      <div class="setup-section">
        <div class="player-info-wrapper" @click="showAvatarModal = true">
          <div class="player-avatar" :style="avatarStyle">
            <Icon icon="pixel:pencil" class="edit-badge" />
          </div>
          <div class="player-name">
            {{ playerStore.playerName || "SET PLAYER NAME" }}
          </div>
        </div>
      </div>

      <div class="setup-section">
        <p class="section-label">
          FOR THE BEST EXPERIENCE ENABLE AUDIO AND FULLSCREEN
        </p>
        <div class="settings-grid">
          <div class="config-element">
            <button
              class="setup-btn"
              :class="{ active: soundStore.isAudioEnabled }"
              @click="toggleAudio"
            >
              <Icon
                class="btn-icon"
                :icon="
                  soundStore.isAudioEnabled
                    ? 'pixel:sound-on-solid'
                    : 'pixel:sound-mute-solid'
                "
              />
              <span class="btn-text">{{
                soundStore.isAudioEnabled ? "AUDIO ON" : "AUDIO OFF"
              }}</span>
            </button>
          </div>

          <div class="config-element">
            <button
              class="setup-btn"
              :class="{ active: isFullscreen }"
              @click="toggleFullscreen"
            >
              <Icon
                class="btn-icon"
                :icon="isFullscreen ? 'pixel:expand-solid' : 'pixel:expand'"
              />
              <span class="btn-text">FULLSCREEN</span>
            </button>
          </div>
        </div>
      </div>

      <button class="start-btn" @click="handleStart">PRESS TO START</button>
    </div>

    <PlayerEditModal v-if="showAvatarModal" @close="showAvatarModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import PlayerEditModal from "@/components/PlayerEditModal.vue";
import { getRandomUserName } from "@/utils/random";

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const showAvatarModal = ref(false);
const isFullscreen = ref(!!document.fullscreenElement);

const emit = defineEmits(["start"]);

const avatarStyle = computed(() => {
  const index = playerStore.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated",
  };
});

const toggleAudio = () => {
  soundStore.isAudioEnabled = !soundStore.isAudioEnabled;
  soundStore.playSound("confirm");
};

const toggleFullscreen = () => {
  soundStore.playSound("click");
  const elem = document.documentElement;
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    document.exitFullscreen();
  }
};

const updateFullscreenStatus = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

const setUser = () =>
  playerStore.setUser({
    username: playerStore.playerName || getRandomUserName(),
    avatar: playerStore.avatarIndex,
  });

const handleStart = () => {
  soundStore.playSound("correct");
  setUser();
  emit("close");
};

onMounted(() => {
  document.addEventListener("fullscreenchange", updateFullscreenStatus);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", updateFullscreenStatus);
});
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.setup-card {
  background: var(--card-bg);
  border: 2px solid #334155;
  padding: 32px;
  margin: 0 16px;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
}

.logo {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  @media (min-width: 579px) {
    font-size: 38px;
  }
}

.setup-section {
  margin: 48px 0;
}

.section-label {
  font-size: 14px;
  margin-bottom: 16px;
}

.player-info-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.player-avatar {
  position: relative;
  width: 72px;
  height: 72px;
  background-color: #2d3748;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.player-info-wrapper:hover .player-avatar {
  transform: scale(1.05);
  border-color: var(--primary);
}

.edit-badge {
  position: absolute;
  right: -8px;
  bottom: -8px;
  background: var(--primary);
  border-radius: 50%;
  padding: 4px;
  font-size: 16px;
  color: white;
}

.player-name {
  font-family: "8bit", sans-serif;
  text-transform: uppercase;
  font-size: 14px;
  color: #fff;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.setup-btn {
  width: 100%;
  background: #222;
  border: 2px solid #444;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.setup-btn.active {
  border-color: var(--primary);
  background: rgba(255, 102, 0, 0.1);
}

.btn-icon {
  font-size: 24px;
  color: #64748b;
}

.active .btn-icon {
  color: var(--primary);
}

.btn-text {
  font-family: "8bit", sans-serif;
  font-size: 9px;
  color: #fff;
}

.start-btn {
  width: 100%;
  background: var(--primary);
  color: #000;
  border: none;
  padding: 20px;
  border-radius: 4px;
  font-family: "8bit", sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 1rem;
  animation: arcadeBlink 1.4s infinite;
  transition: all 0.3s;
}

.start-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.start-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #b45309;
}

@keyframes arcadeBlink {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.4);
  }
}
</style>
