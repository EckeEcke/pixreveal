<template>
  <ModalWrapper>
    <button @click="$emit('close')" class="close-btn">
      <Icon icon="pixel:window-close-solid" />
    </button>
    <h2>SETTINGS</h2>
    <div class="modal-content">
      <div class="rounds-selection">
        <label class="selection-label">HOW MANY ROUNDS</label>
        <div class="radio-group">
          <label
            v-for="amount in [5, 10, 15, 20]"
            :key="amount"
            class="radio-item"
          >
            <input
              type="radio"
              name="rounds"
              :value="amount"
              v-model="configStore.maxRounds"
              :disabled="configStore.filteredDrawings.length < amount * 4"
              @change="soundStore.playSound('click')"
            />
            <span class="radio-button">{{ amount }}</span>
          </label>
        </div>
      </div>
      <div class="rounds-selection">
        <label class="selection-label">SET ROUND LENGTH</label>
        <div class="radio-group">
          <label
            v-for="duration in [5, 10, 15, 20]"
            :key="duration"
            class="radio-item"
          >
            <input
              type="radio"
              name="duration"
              :value="duration"
              v-model="configStore.revealTime"
              @change="soundStore.playSound('click')"
            />
            <span class="radio-button">{{ duration }}</span>
          </label>
        </div>
      </div>
      <div class="general-settings">
        <label class="selection-label">DISPLAY & AUDIO</label>

        <div class="config-buttons">
          <div class="config-element">
            <label class="config-label">
              <input
                type="checkbox"
                v-model="soundStore.isAudioEnabled"
                @change="soundStore.playSound('confirm')"
              />
              <div class="pixel-box">
                <Icon
                  class="status-icon"
                  :icon="
                    soundStore.isAudioEnabled
                      ? 'pixel:sound-on-solid'
                      : 'pixel:sound-mute-solid'
                  "
                />
                <span class="status-text">SOUND</span>
              </div>
            </label>
          </div>
          <div class="config-element">
            <label class="config-label">
              <input
                type="checkbox"
                v-model="isFullscreen"
                @change="toggleFullscreen"
              />
              <div class="pixel-box">
                <Icon
                  class="status-icon"
                  :icon="isFullscreen ? 'pixel:expand-solid' : 'pixel:expand'"
                />
                <span class="status-text">FULLSCREEN</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="filter-settings">
        <label class="selection-label">SET Categories</label>
        <div class="filter-container">
          <div
            v-for="cat in CATEGORIES"
            :key="cat.name"
            class="title-card"
            :class="{ active: configStore.isCategorySelected(cat.name) }"
            :style="{
              '--cat-color': cat.color,
              '--cat-color-alpha': cat.color + '33',
            }"
            @click="configStore.toggleCategory(cat.name)"
          >
            <span class="icon">{{ cat.icon }}</span>
            <span class="label">{{ cat.name }}</span>
          </div>
        </div>
      </div>
      <button class="confirm-btn" @click="$emit('close')">CONFIRM</button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref } from "vue";
import { useSoundStore } from "@/stores/sound";
import { Icon } from "@iconify/vue";
import ModalWrapper from "./ModalWrapper.vue";
import { CATEGORIES, useConfigStore } from "@/stores/config";

const soundStore = useSoundStore();
const configStore = useConfigStore();

const isFullscreen = ref(!!document.fullscreenElement);

const toggleFullscreen = () => {
  const elem = document.documentElement;

  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};
</script>

<style scoped>
h2 {
  font-family: "8bit";
  margin-bottom: 32px;
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
  cursor: pointer;
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
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.rounds-selection,
.general-settings,
.filter-settings {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selection-label {
  font-size: 0.8rem;
  color: var(--primary);
  text-transform: uppercase;
  text-align: left;
}

.radio-group {
  display: flex;
  gap: 10px;
}

.radio-item {
  flex: 1;
  cursor: pointer;
}

.radio-item input {
  display: none;
}

.radio-button {
  display: block;
  text-align: center;
  padding: 10px 0;
  background: #1a1a1a;
  border: 2px solid #333;
  color: #fff;
  font-size: 12px;
  transition: all 0.2s ease;
}

.radio-item:hover .radio-button {
  border-color: #666;
  background: #222;
}

.radio-item input:checked + .radio-button {
  background: var(--primary);
  border-color: var(--primary);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 0 10px var(--primary);
  transform: translateY(-2px);
}

.radio-item input:disabled + .radio-button {
  cursor: not-allowed;
  opacity: 0.2;
  filter: grayscale(1);
  border-style: dotted;
  background: #0a0a0a;
  transform: none;
  box-shadow: none;
}

.radio-item:has(input:disabled) {
  cursor: not-allowed;
}

.config-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  @media (min-width: 375px) {
    grid-template-columns: 1fr 1fr;
  }
}

.config-element {
  display: flex;
  justify-content: center;
  width: 100%;
}

.config-label {
  cursor: pointer;
  user-select: none;
  width: 100%;
  text-align: center;
}

.config-label input {
  display: none;
}

.pixel-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  border: 2px solid #444;
  background: #222;
  transition: all 0.1s;
  width: 100%;
  box-sizing: border-box;
}

.config-label input:checked + .pixel-box {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(255, 102, 0, 0.3);
}

.status-text {
  font-size: 12px;
  color: #888;
}

.config-label input:checked + .pixel-box .status-text {
  color: var(--primary);
}

.filter-container {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 5px 32px;
  margin: 0 -32px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-container::-webkit-scrollbar {
  display: none;
}

.title-card {
  flex: 0 0 120px;
  height: 130px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.4;
  filter: grayscale(0.8);
}

.title-card.active {
  opacity: 1;
  filter: grayscale(0);
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--cat-color);
  box-shadow: 0 0 20px var(--cat-color-alpha);
  transform: translateY(-4px);
}

.title-card .icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.title-card .label {
  font-family: "Rajdhani", sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #fff;
  text-align: center;
  padding: 0 5px;
}
</style>
