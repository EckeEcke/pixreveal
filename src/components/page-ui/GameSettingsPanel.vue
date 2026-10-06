<template>
  <div class="game-settings-panel">
    <!-- DRAWING MIX -->
    <section class="setting-group preset-group">
      <div class="setting-heading">
        <span class="selection-label">DRAWING MIX</span>
        <span class="setting-hint">CHOOSE YOUR VIBE</span>
      </div>

      <div class="preset-grid">
        <label
          v-for="preset in presets"
          :key="preset.value"
          class="preset-item"
          :class="{
            'is-selected': configStore.activePreset === preset.value,
            'is-disabled': isPresetDisabled(preset.value)
          }"
          :style="{ '--preset-color': preset.color }"
        >
          <input
            type="radio"
            name="preset"
            :value="preset.value"
            :checked="configStore.activePreset === preset.value"
            :disabled="isPresetDisabled(preset.value)"
            @change="setPreset(preset.value)"
          />

          <span class="preset-content">
            <span class="preset-indicator"></span>
            <span class="preset-label">{{ preset.label }}</span>
          </span>
        </label>
      </div>
    </section>

    <!-- ROUNDS -->
    <section class="setting-group">
      <div class="setting-heading">
        <span class="selection-label">ROUNDS</span>
      </div>

      <div class="value-grid">
        <label
          v-for="amount in [5, 10, 15, 20]"
          :key="amount"
          class="value-item"
          :class="{
            'is-selected': configStore.maxRounds === amount,
            'is-disabled':
              configStore.filteredDrawings.length < amount * 4
          }"
        >
          <input
            type="radio"
            name="maxRounds"
            :value="amount"
            :checked="configStore.maxRounds === amount"
            :disabled="configStore.filteredDrawings.length < amount * 4"
            @change="setRounds(amount)"
          />

          <span class="value-button">
            <strong>{{ amount }}</strong>
          </span>
        </label>
      </div>
    </section>

    <!-- ROUND TIME -->
    <section class="setting-group">
      <div class="setting-heading">
        <span class="selection-label">ROUND TIME</span>
      </div>

      <div class="value-grid">
        <label
          v-for="duration in [5, 10, 15, 20]"
          :key="duration"
          class="value-item"
          :class="{
            'is-selected': configStore.revealTime === duration
          }"
        >
          <input
            type="radio"
            name="revealTime"
            :value="duration"
            :checked="configStore.revealTime === duration"
            @change="setRevealTime(duration)"
          />

          <span class="value-button">
            <strong>{{ duration }}</strong>
            <small>SEC</small>
          </span>
        </label>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useConfigStore, PRESETS } from "@/stores/config"
import { useSoundStore } from "@/stores/sound"
import drawings from "@/data/drawings.json"

const configStore = useConfigStore()
const soundStore = useSoundStore()

const presets = [
  {
    label: "GENERAL",
    value: "general",
    color: "var(--neon-success)"
  },
  {
    label: "MIXED",
    value: "all",
    color: "var(--neon-mint)"
  },
  {
    label: "NERDY",
    value: "nerdy",
    color: "var(--neon-cyan)"
  }
]

const isPresetDisabled = (presetKey) => {
  const categories = PRESETS[presetKey.toUpperCase()]

  if (!categories) return false

  const pool = configStore.includeUgc
    ? drawings.concat(configStore.ugcDrawings)
    : drawings

  const availableCount = pool.filter((drawing) =>
    categories.includes(drawing.category)
  ).length

  return availableCount < configStore.maxRounds * 4
}

const setPreset = (presetKey) => {
  soundStore.playSound("click")
  configStore.setPreset(presetKey)
}

const setRounds = (amount) => {
  soundStore.playSound("click")
  configStore.maxRounds = amount
}

const setRevealTime = (duration) => {
  soundStore.playSound("click")
  configStore.revealTime = duration
}
</script>

<style scoped>
.game-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* --------------------------------
   GROUP
-------------------------------- */

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.selection-label {
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.setting-hint {
  color: rgba(255, 255, 255, 0.35);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* --------------------------------
   DRAWING MIX
-------------------------------- */

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-item {
  position: relative;
  min-width: 0;
  cursor: pointer;
}

.preset-item input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.preset-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  overflow: hidden;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.015);
  color: rgba(255, 255, 255, 0.75);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.preset-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--preset-color);
  opacity: 0.45;
  transition:
    width 0.15s ease,
    opacity 0.15s ease;
}

.preset-label {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.preset-item:hover .preset-content {
  border-color: var(--preset-color);
  color: #fff;
  transform: translateY(-1px);
}

.preset-item:hover .preset-indicator {
  opacity: 0.9;
}

.preset-item.is-selected .preset-content {
  background: var(--preset-color);
  border-color: #fff;
  color: #000;
  box-shadow: 0 0 14px color-mix(
    in srgb,
    var(--preset-color) 30%,
    transparent
  );
}

.preset-item.is-selected .preset-indicator {
  width: 100%;
  opacity: 0.12;
}

.preset-item.is-disabled {
  cursor: not-allowed;
}

.preset-item.is-disabled .preset-content {
  opacity: 0.2;
  filter: grayscale(1);
  border-style: dotted;
}

.preset-item.is-disabled:hover .preset-content {
  border-color: var(--border-color);
  transform: none;
}

/* --------------------------------
   NUMERIC SETTINGS
-------------------------------- */

.value-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.value-item {
  min-width: 0;
  cursor: pointer;
}

.value-item input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.value-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.01);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.value-item:hover .value-button {
  border-color: #aaa;
  color: #fff;
  transform: translateY(-1px);
}

.value-item.is-selected .value-button {
  background: #29282d;
  border-color: #fff;
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.value-button strong {
  font-size: 13px;
  font-weight: 700;
}

.value-button small {
  margin-left: 2px;
  font-size: 8px;
  font-weight: 700;
  opacity: 0.55;
}

/* Disabled round counts */

.value-item.is-disabled {
  cursor: not-allowed;
}

.value-item.is-disabled .value-button {
  opacity: 0.2;
  filter: grayscale(1);
  border-style: dotted;
}

.value-item.is-disabled:hover .value-button {
  border-color: var(--border-color);
  color: inherit;
  transform: none;
}

/* --------------------------------
   MOBILE
-------------------------------- */

@media (max-width: 480px) {
  .game-settings-panel {
    gap: 18px;
  }

  .preset-grid,
  .value-grid {
    gap: 6px;
  }

  .preset-content {
    min-height: 44px;
  }

  .value-button {
    min-height: 40px;
  }

  .setting-hint {
    display: none;
  }
}
</style>