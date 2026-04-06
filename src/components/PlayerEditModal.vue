<template>
  <ModalWrapper>
    <button @click="$emit('close')" data-sfx="click" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <h2>EDIT PLAYER</h2>
    <div class="input-group" @keyup.enter="handleEnter">
      <h3>Player Name</h3>
      <input
        id="username"
        v-model="playerStore.playerName"
        type="text"
        placeholder="Enter Name..."
        maxlength="10"
        @input="soundStore.playSound('click')"
      />
    </div>
    <div class="avatar-selection">
      <div class="headline-wrapper">
        <h3>Choose your Avatar</h3>
      </div>
      <div>
        <div class="avatar-grid">
          <div
            v-for="avatar in avatars"
            :key="avatar.id"
            class="avatar-slot"
            :class="{ active: playerStore.avatarIndex === avatar.id }"
            data-sfx="click"
            @click="selectAvatar(avatar.id)"
          >
            <div class="avatar-image" :style="getAvatarStyle(avatar.id)"></div>
          </div>
        </div>
      </div>
    </div>
    <button class="confirm-btn" data-sfx="click" @click="$emit('close')">CONFIRM</button>
  </ModalWrapper>
</template>

<script setup>
import avatarSpriteSheet from "@/assets/avatars/avatars.jpg";
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";
import ModalWrapper from "./ModalWrapper.vue";

const playerStore = usePlayerStore();
const soundStore = useSoundStore();

const avatars = Array.from({ length: 36 }, (_, i) => ({ id: i }));
const getAvatarStyle = (index) => {
  const columns = 6;
  const x = index % columns;
  const y = Math.floor(index / columns);
  return {
    backgroundImage: `url(${avatarSpriteSheet})`,
    backgroundPosition: `${x * 20}% ${y * 20}%`,
    backgroundSize: "600%",
  };
};

const selectAvatar = (id) => {
  playerStore.avatarIndex = id;
};
</script>

<style scoped>
h2 {
  font-family: "8bit";
}

h3 {
  color: var(--primary);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 16px;
  padding-right: 5px;
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
  border-color: var(--primary);
  background-color: rgba(255, 77, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.5);
  transform: scale(1.5);
  opacity: 1;
  filter: contrast(2);
}

.close-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  padding: 0;
  background: none;
  border: none;
  color: var(--primary);
  font-size: 36px;
}

.confirm-btn {
  background: var(--primary);
  width: 100%;
  padding: 8px 16px;
  border: none;
  font-family: inherit;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 32px;
}

@media (max-width: 575px) {
  .avatar-grid {
    margin: 0;
  }
  .avatar-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
