<template>
  <ModalWrapper @close="closeEdit">
    <button @click="closeEdit" data-sfx="back" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <h2>{{ title ? title : "EDIT PLAYER" }}</h2>
    <div class="input-group" @keyup.enter="confirmEdit">
      <h3>Set Your Name</h3>
      <input
        id="username"
        :value="playerStore.playerName"
        type="text"
        placeholder="Enter Name..."
        :maxlength="NAME_MAX_LENGTH"
        autocapitalize="characters"
        autocomplete="off"
        spellcheck="false"
        @input="onNameInput"
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
            <div class="avatar-image" :style="getAvatarStyle(avatar.id)" :class="playerStore.avatarEffect ? `avatar-effect-${playerStore.avatarEffect}` : ''"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="achievementsStore.hasNameEffects || achievementsStore.hasAvatarEffects" class="cosmetic-selects">
      <div v-if="achievementsStore.hasAvatarEffects" class="input-group">
        <h3>Avatar Effect</h3>
        <select
          :value="playerStore.playerAvatarEffect"
          @change="setAvatarEffect"
        >
          <option value="none">None</option>
          <option
            v-for="effect in AVATAR_EFFECTS"
            :key="effect.id"
            :value="effect.id"
            :disabled="achievementsStore.unlockedCount < effect.unlockAt"
          >
            {{ effect.title }}
          </option>
        </select>
      </div>
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
import { NAME_EFFECTS, AVATAR_EFFECTS } from "@/data/unlockables";
import { getAvatarStyle as resolveAvatarStyle } from "@/utils/avatar";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";

defineProps({
  title: String,
  btnText: String,
});
const emit = defineEmits(["close", "btn-click"]);

const NAME_MAX_LENGTH = 10;

const playerStore = usePlayerStore();
const soundStore = useSoundStore();
const achievementsStore = useAchievementsStore();
const originalProfile = {
  name: playerStore.playerName,
  avatarIndex: playerStore.avatarIndex,
  spriteSheet: playerStore.avatarSpriteSheet,
  avatarEffect: playerStore.avatarEffect,
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

const onNameInput = (event) => {
  const input = event.target;
  const { selectionStart, selectionEnd } = input;

  const upper = input.value.toUpperCase().slice(0, NAME_MAX_LENGTH);
  input.value = upper;
  input.setSelectionRange(selectionStart, selectionEnd);

  playerStore.playerName = upper;
  soundStore.playSound("click");
};

const selectAvatar = (id) => {
  playerStore.setAvatar(id);
};

const setSheet = (sheet) => {
  if (sheet === "unlockables" && !achievementsStore.hasBonusAvatars) return;
  playerStore.setSheet(sheet);
};

const setAvatarEffect = (event) => {
  if (!achievementsStore.hasAvatarEffects) return;
  playerStore.setPlayerAvatarEffect(event.target.value);
};

const setPlayerNameEffect = (event) => {
  if (!achievementsStore.hasNameEffects) return;
  playerStore.setPlayerNameEffect(event.target.value);
};

const unlockIfProfileChanged = () => {
  const changed =
    playerStore.playerName !== originalProfile.name ||
    playerStore.avatarIndex !== originalProfile.avatarIndex ||
    playerStore.avatarSpriteSheet !== originalProfile.spriteSheet ||
    playerStore.avatarEffect !== originalProfile.avatarEffect;

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

#username {
  text-transform: uppercase;
}

#username::placeholder {
  text-transform: none;
}

.avatar-grid-scroll-container {
  width: 100%;
  padding: 0 12px;
  margin: 0 -12px;
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
  opacity: 0.7;
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

.avatar-effect-inverted {
  filter: invert(1);
}

.avatar-effect-sepia {
  filter: sepia(1);
}

.avatar-effect-blur {
  filter: blur(0px);
  animation: glitch-blur 4s infinite steps(1, start);
}

@keyframes glitch-blur {
  0%, 100% {
    filter: blur(0px) brightness(1);
  }
  15% {
    filter: blur(3px) brightness(1.2);
  }
  18% {
    filter: blur(0px) brightness(1);
  }
  42% {
    filter: blur(6px) contrast(140%) brightness(1.1);
  }
  46% {
    filter: blur(1px) contrast(100%);
  }
  50% {
    filter: blur(0px) brightness(1);
  }
  80% {
    filter: blur(4px) brightness(1.15);
  }
  84% {
    filter: blur(0px) brightness(1);
  }
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
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease;
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
  transition: color 0.2s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
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