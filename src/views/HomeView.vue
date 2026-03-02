<template>
  <div class="home-content-wrapper">
    <header>
      <h1 class="logo">Pix<span>Reveal</span></h1>
    </header>
    <main class="home-container">
      <section class="setup-card">
        <div class="avatar-selection">
          <h3>Choose your Avatar</h3>
          <div class="avatar-grid">
            <div
              v-for="avatar in avatars"
              :key="avatar.id"
              class="avatar-slot"
              :class="{ active: selectedAvatarIndex === avatar.id }"
              @click="selectedAvatarIndex = avatar.id"
            >
              <div
                class="avatar-image"
                :style="getAvatarStyle(avatar.id)"
              ></div>
            </div>
          </div>
        </div>
        <div class="input-group" @keyup.enter="handleEnter">
          <label for="username">Player Name</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter Name..."
            maxlength="15"
          />
        </div>

        <button
          class="btn-outline"
          :disabled="!username || !selectedAvatarIndex"
          @click="startGame"
        >
          PLAY GAME
        </button>
      </section>
      <router-link to="/editor" class="editor-link">Open Editor</router-link>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import { usePlayerStore } from "@/stores/player";

const router = useRouter();
const playerStore = usePlayerStore();
const username = ref(playerStore.playerName || "");

const selectedAvatarIndex = ref(playerStore.avatarIndex || null);

const avatars = Array.from({ length: 36 }, (_, i) => ({ id: i }));

const getAvatarStyle = (index) => {
  const columns = 6;

  const x = index % columns;
  const y = Math.floor(index / columns);

  const percentX = x * 20;
  const percentY = y * 20;

  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${percentX}% ${percentY}%`,
    backgroundSize: "600%",
  };
};

const startGame = () => {
  if (username.value && selectedAvatarIndex.value) {
    playerStore.setUser({
      username: username.value,
      avatar: selectedAvatarIndex.value,
    });
    router.push("/game");
  }
};

const handleEnter = () => {
  if (username.value && selectedAvatarIndex.value) {
    startGame();
  }
};
</script>

<style scoped>
.home-content-wrapper {
  width: 100%;
}
.logo {
  text-align: center;
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

.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 20px;
}

.setup-card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 77, 0, 0.3);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 1rem 0 2rem;
  padding-right: 5px;
}

.avatar-grid::-webkit-scrollbar {
  width: 4px;
}
.avatar-grid::-webkit-scrollbar-thumb {
  background: var(--neon-orange);
  border-radius: 2px;
}

.avatar-slot {
  aspect-ratio: 1;
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  overflow: hidden;
  opacity: 0.5;
}

.avatar-image {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.avatar-slot:hover {
  border-color: rgba(255, 77, 0, 0.5);
  transform: scale(1.25);
  z-index: 1;
  opacity: 1;
}

.avatar-slot.active {
  border-color: var(--neon-orange);
  background-color: rgba(255, 77, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.5);
  transform: scale(1.5);
  opacity: 1;
  filter: contrast(2);
}

.avatar-number {
  position: absolute;
  bottom: 2px;
  right: 3px;
  font-size: 0.5rem;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 3px;
  border-radius: 2px;
  pointer-events: none;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--neon-orange);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

input[type="text"] {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-bottom: 2px solid rgba(255, 77, 0, 0.5);
  padding: 10px;
  color: #fff;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s;
}

input[type="text"]:focus {
  border-color: var(--neon-orange);
}

.btn-start {
  width: 100%;
  padding: 15px;
  background: var(--neon-orange);
  color: #000;
  border: none;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
}

.btn-start:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.editor-link {
  color: white;
  margin-top: 32px;
}
</style>
