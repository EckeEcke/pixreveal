<template>
  <div class="game-settings-panel">
    <!-- VIBE / PRESETS -->
    <div class="setting-group">
      <label class="selection-label">DRAWING MIX</label>
      <div class="radio-group">
        <label
          v-for="preset in presets"
          :key="preset.value"
          class="radio-item"
        >
          <input
            type="radio"
            name="preset"
            :value="preset.value"
            :checked="configStore.activePreset === preset.value"
            :disabled="isPresetDisabled(preset.value)"
            @change="setPreset(preset.value)"
          />
          <span 
            class="radio-button preset-btn"
            :style="{ '--preset-color': preset.color }"
          >
            {{ preset.label }}
          </span>
        </label>
      </div>
    </div>

    <!-- RUNDENANZAHL -->
    <div class="setting-group">
      <label class="selection-label">ROUNDS</label>
      <div class="radio-group">
        <label v-for="amount in [5, 10, 15, 20]" :key="amount" class="radio-item">
          <input
            type="radio"
            name="maxRounds"
            :value="amount"
            :checked="configStore.maxRounds === amount"
            :disabled="configStore.filteredDrawings.length < amount * 4"
            @change="setRounds(amount)"
          />
          <span class="radio-button setting-btn">{{ amount }}</span>
        </label>
      </div>
    </div>

    <!-- RUNDENZEIT -->
    <div class="setting-group">
      <label class="selection-label">ROUND TIME</label>
      <div class="radio-group">
        <label v-for="duration in [5, 10, 15, 20]" :key="duration" class="radio-item">
          <input
            type="radio"
            name="revealTime"
            :value="duration"
            :checked="configStore.revealTime === duration"
            @change="setRevealTime(duration)"
          />
          <span class="radio-button setting-btn">{{ duration }}s</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore, PRESETS } from "@/stores/config"
import { useSoundStore } from "@/stores/sound"
import drawings from "@/data/drawings.json"

const configStore = useConfigStore()
const soundStore = useSoundStore()

const presets = [
  { label: "GENERAL", value: "general", color: "var(--neon-success)" },
  { label: "MIXED", value: "all", color: "var(--neon-mint)" },
  { label: "NERDY", value: "nerdy", color: "var(--neon-cyan)" }
]

const isPresetDisabled = (presetKey) => {
  const categories = PRESETS[presetKey.toUpperCase()]
  if (!categories) return false

  const pool = configStore.includeUgc
    ? drawings.concat(configStore.ugcDrawings)
    : drawings

  const availableCount = pool.filter((d) => categories.includes(d.category)).length
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
  gap: 12px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selection-label {
  font-size: 0.75rem;
  color: var(--primary);
  text-transform: uppercase;
  text-align: left;
}

.radio-group {
  display: flex;
  gap: 8px;
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
  padding: 8px 0;
  border: 2px solid var(--border-color);
  color: #fff;
  font-size: 11px;
  transition: all 0.2s ease;
}

/* Individuelle Farben für Presets */
.radio-item input:checked + .preset-btn {
  background: var(--preset-color);
  border-color: white;
  color: #000;
  font-weight: 700;

}

/* Dezentere Sekundärfarbe für Standard-Settings (Rounds/Time) */
.radio-item input:checked + .setting-btn {
  background: #29282d;
  border-color: #fff;
  color: #fff;
  font-weight: 700;
}

.radio-item:hover .radio-button {
  border-color: #777;
}

.radio-item input:disabled + .radio-button {
  cursor: not-allowed;
  opacity: 0.2;
  filter: grayscale(1);
  border-style: dotted;
}
</style>