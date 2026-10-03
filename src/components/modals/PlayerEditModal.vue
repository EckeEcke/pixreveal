<template>
  <ModalWrapper @close="closeEdit">
    <button @click="closeEdit" data-sfx="back" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <h2>{{ title ? title : "EDIT PLAYER" }}</h2>
    <div class="input-group" @keyup.enter="handleEnter">
      <h3>Set Your Name</h3>
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
      <div
        v-if="achievementsStore.hasBonusAvatars"
        class="role-toggle"
        :class="`role-${selectedSheet}`"
      >
        <button
          :class="{ active: selectedSheet === 'classic' }"
          @click="setSheet('classic')"
          data-sfx="click"
        >
          CLASSIC
        </button>

        <button
          :class="{ active: selectedSheet === 'unlockables' }"
          @click="setSheet('unlockables')"
          data-sfx="click"
        >
          BONUS
        </button>
      </div>
      <div class="avatar-grid-scroll-container">
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
    <div v-if="achievementsStore.hasNameEffects" class="cosmetic-selects">
      <div v-if="achievementsStore.hasNameEffects" class="input-group">
        <h3>Player Name Effect</h3>
        <select
          :value="playerStore.playerNameEffect"
          @change="setPlayerNameEffect"
        >
          <option value="none">None</option>
          <option
            v-for="effect in availableNameEffects"
            :key="effect.id"
            :value="effect.id"
            :disabled="achievementsStore.unlockedCount < effect.unlockAt"
          >
            {{ effect.title }}
          </option>
        </select>
      </div>
    </div>
    <ButtonPrimary
      data-sfx="click"
      class="btn-primary"
      @clicked="confirmEdit"
    >
      {{ btnText ? btnText : "CONFIRM" }}
    </ButtonPrimary>
  </ModalWrapper>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { usePlayerStore } from "@/stores/player";
import { useSoundStore } from "@/stores/sound";
import { useAchievementsStore } from "@/stores/achievements";
import { NAME_EFFECTS } from "@/data/unlockables";
import { getAvatarStyle as resolveAvatarStyle } from "@/utils/avatar";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";

defineProps({
  title: String,
  btnText: String,
});
const emit = defineEmits(["close", "btn-click"]);

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const achievementsStore = useAchievementsStore();
const originalProfile = {
  name: playerStore.playerName,
  avatarIndex: playerStore.avatarIndex,
  spriteSheet: playerStore.avatarSpriteSheet,
};

const avatars = Array.from({ length: 36 }, (_, i) => ({ id: i }));
const availableNameEffects = NAME_EFFECTS;
const getAvatarStyle = (index) => {
  return resolveAvatarStyle(index, selectedSheet.value);
};

const selectedSheet = computed(() => playerStore.avatarSpriteSheet);

onMounted(() => {
  void achievementsStore.loadAchievements();
});

const selectAvatar = (id) => {
  playerStore.setAvatar(id);
};

const setSheet = (sheet) => {
  if (sheet === "unlockables" && !achievementsStore.hasBonusAvatars) return;
  playerStore.setSheet(sheet)
}

const setPlayerNameEffect = (event) => {
  if (!achievementsStore.hasNameEffects) return;
  playerStore.setPlayerNameEffect(event.target.value);
};

const unlockIfProfileChanged = () => {
  const changed =
    playerStore.playerName !== originalProfile.name ||
    playerStore.avatarIndex !== originalProfile.avatarIndex ||
    playerStore.avatarSpriteSheet !== originalProfile.spriteSheet;

  if (changed) void achievementsStore.unlock("edit-player");
};

const closeEdit = () => {
  unlockIfProfileChanged();
  emit("close");
};

const confirmEdit = () => {
  unlockIfProfileChanged();
  emit("btn-click");
};
</script>

<style scoped>
h3 {
  color: var(--primary);
  margin-bottom: 8px;
  text-transform: uppercase;
}

/* Der neue, sichere Scroll-Container für Mobile */
.avatar-grid-scroll-container {
  width: 100%;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 16px;
  padding: 4px 5px 4px 4px;
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
  transform: scale(1.02);
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
  transform: scale(1.3);
  opacity: 1;
  filter: contrast(2);
  z-index: 2;
}

.btn-primary {
  width: 100%;
  margin-top: 36px;
}

.cosmetic-selects {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.cosmetic-selects .input-group {
  margin-bottom: 0;
}

.cosmetic-selects select {
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;
  color: #fff;
  background: #111;
  font: inherit;
}

.cosmetic-selects select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.locked-sheet-icon {
  margin-left: 6px;
}

@media (max-width: 575px) {
  .avatar-grid-scroll-container {
    max-height: 250px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .avatar-grid {
    grid-template-columns: repeat(5, 1fr);
    margin-top: 8px;
  }

  .avatar-grid-scroll-container::-webkit-scrollbar {
    width: 6px;
  }

  .avatar-grid-scroll-container::-webkit-scrollbar-thumb {
    background-color: var(--primary);
    border-radius: 3px;
  }
}

/* =========================================================
   TOGGLE
   ========================================================= */

.role-toggle {
  position: relative;
  display: flex;

  background: #111;
  border: 2px solid var(--border-color);
  border-radius: 4px;

  margin-bottom: 16px;
  padding: 3px;
  gap: 3px;

  overflow: hidden;
}

/* Sliding selection indicator */
.role-toggle::before {
  content: "";

  position: absolute;
  z-index: 0;

  top: 3px;
  bottom: 3px;
  left: 2px;

  width: calc(50% - 6px);

  background: #29282d;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.35);

  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.2s ease;
}

.role-toggle.role-unlockables::before {
  transform: translateX(calc(100% + 3px));
}

.role-toggle button {
  position: relative;
  z-index: 1;

  flex: 1;

  text-align: center;

  padding: 10px 0;

  background: transparent;
  border: none;
  border-radius: 2px;

  color: rgba(255, 255, 255, 0.38);

  font-size: 14px;
  font-family: inherit;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;

  cursor: pointer;

  transition:
    color 0.2s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.role-toggle button:hover {
  color: rgba(255, 255, 255, 0.7);
}

.role-toggle button.active {
  color: #fff;
  transform: scale(1.03);
}

.role-toggle button:active {
  transform: scale(0.97);
}

.role-toggle button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
</style>
