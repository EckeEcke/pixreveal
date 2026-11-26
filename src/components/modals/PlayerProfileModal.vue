<template>
  <ModalWrapper @close="emit('close')">
    <button
      class="close-btn"
      type="button"
      aria-label="Close player profile"
      data-sfx="back"
      @click="emit('close')"
    >
      <Icon icon="pixel:window-close-solid" />
    </button>

    <h2>PLAYER PROFILE</h2>

    <div class="profile-identity">
      <span class="avatar-image" :class="playerStore.playerAvatarEffect" :style="avatarStyle" aria-hidden="true" />
      <div class="player-copy">
        <span class="eyebrow">CURRENT PLAYER</span>
        <strong :class="nameEffectClass">{{ playerStore.playerName || "MYSTERY PLAYER" }}</strong>
      </div>
    </div>

    <button
      v-if="achievementsStore.isLoaded"
      class="unlock-progress"
      :class="{ 'unlock-progress--complete': !nextReward }"
      type="button"
      data-sfx="click"
      aria-label="View achievements and unlock progress"
      @click="emit('achievements')"
    >
      <span class="progress-heading">
        <span>{{ nextReward ? 'NEXT UNLOCK' : 'ALL REWARDS UNLOCKED' }}</span>
        <strong>{{ rewardProgress }} / {{ rewardTarget }}</strong>
      </span>
      <span class="reward-row">
        <span class="reward-preview" aria-hidden="true">
          <strong v-if="nextReward?.kind === 'name'" :class="`name-effect-${nextReward.effect}`">
            {{ playerStore.playerName || 'PLAYER' }}
          </strong>
          <span
            v-else-if="nextReward"
            class="reward-avatar"
            :class="nextReward.kind === 'avatar' ? nextReward.effect : undefined"
            :style="nextReward.kind === 'avatars' ? getAvatarStyle(0, 'unlockables') : avatarStyle"
          />
          <Icon v-else icon="pixel:trophy-solid" />
        </span>
        <span class="reward-copy">
          <strong>{{ nextReward?.title || 'Collection complete' }}</strong>
          <span v-if="nextReward">
            {{ remainingAchievements }} {{ remainingAchievements === 1 ? 'achievement' : 'achievements' }} to go
          </span>
          <span v-else>Enjoy your avatars and effects</span>
        </span>
        <Icon icon="pixel:chevron-right" class="progress-chevron" aria-hidden="true" />
      </span>
      <span
        class="progress-track"
        role="progressbar"
        :aria-label="nextReward ? `Progress towards ${nextReward.title}` : 'All rewards unlocked'"
        :aria-valuenow="rewardProgress"
        :aria-valuemin="0"
        :aria-valuemax="rewardTarget"
        :aria-valuetext="`${rewardProgress} of ${rewardTarget} achievements`"
      >
        <span class="progress-fill" :style="{ width: `${rewardProgress / rewardTarget * 100}%` }" />
      </span>
    </button>

    <div class="profile-actions">
      <button
        class="edit-action"
        type="button"
        data-sfx="click"
        @click="emit('edit')"
      >
        <Icon icon="pixel:edit-solid" class="edit-icon" />
        <span>EDIT PLAYER</span>
      </button>
      <button
        class="achievement-action"
        type="button"
        data-sfx="click"
        @click="emit('achievements')"
      >
        <Icon icon="pixel:trophy-solid" class="achievement-icon" />
        <span>ACHIEVEMENTS</span>
        <strong>{{ achievementsStore.unlockedCount }} / {{ ACHIEVEMENTS.length }}</strong>
      </button>
      <button
        class="unlockables-action"
        type="button"
        data-sfx="click"
        @click="emit('unlockables')"
      >
        <Icon icon="pixel:lock-alt-solid" class="unlockables-icon" />
        <span>UNLOCKABLES</span>
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import { usePlayerStore } from "@/stores/player";
import { useAchievementsStore } from "@/stores/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";
import { AVATAR_EFFECTS, NAME_EFFECTS, BONUS_AVATAR_ACHIEVEMENT_THRESHOLD } from "@/data/unlockables";
import { getAvatarStyle } from "@/utils/avatar";

const emit = defineEmits<{
  close: [];
  edit: [];
  achievements: [];
  unlockables: [];
}>();

const playerStore = usePlayerStore();
const achievementsStore = useAchievementsStore();

const avatarStyle = computed(() =>
  getAvatarStyle(playerStore.avatarIndex, playerStore.avatarSpriteSheet),
);
const nameEffectClass = computed(() =>
  playerStore.playerNameEffect === "none"
    ? undefined
    : `name-effect-${playerStore.playerNameEffect}`,
);

const rewards = [
  { title: 'Bonus Avatars', unlockAt: BONUS_AVATAR_ACHIEVEMENT_THRESHOLD, kind: 'avatars', effect: '' },
  ...AVATAR_EFFECTS.map(effect => ({ ...effect, kind: 'avatar', effect: effect.id })),
  ...NAME_EFFECTS.map(effect => ({ ...effect, kind: 'name', effect: effect.id })),
].sort((a, b) => a.unlockAt - b.unlockAt);

const nextReward = computed(() =>
  rewards.find(reward => achievementsStore.cosmeticProgress < reward.unlockAt),
);
const rewardTarget = computed(() => nextReward.value?.unlockAt ?? rewards[rewards.length - 1]!.unlockAt);
const rewardProgress = computed(() => Math.min(achievementsStore.cosmeticProgress, rewardTarget.value));
const remainingAchievements = computed(() => rewardTarget.value - rewardProgress.value);

onMounted(() => {
  void achievementsStore.loadAchievements();
});
</script>

<style scoped>
.profile-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
}

.avatar-image {
  display: block;
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background-color: #20232b;
  background-repeat: no-repeat;
  image-rendering: pixelated;
}

.player-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.eyebrow {
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
}

.player-copy strong {
  overflow-wrap: anywhere;
  color: #fff;
  font-family: var(--font-display), sans-serif;
  font-size: 20px;
  text-transform: uppercase;
}

.profile-actions {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.unlock-progress {
  display: grid;
  width: 100%;
  gap: 14px;
  margin-top: 14px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
  border-radius: 8px;
  background: linear-gradient(125deg, color-mix(in srgb, var(--primary) 6%, transparent), transparent);
  color: #fff;
  font-family: var(--font-display), sans-serif;
  text-align: left;
  transition: border-color 0.2s, background-color 0.2s;
}

.unlock-progress:hover {
  border-color: var(--primary);
  background-color: color-mix(in srgb, var(--primary) 4%, transparent);
}

.unlock-progress:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}

.progress-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.progress-heading strong {
  flex-shrink: 0;
  color: var(--primary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  letter-spacing: normal;
}

.reward-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.reward-preview {
  display: flex;
  flex: 0 0 80px;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.22);
}

.reward-preview strong {
  overflow: hidden;
  max-width: 100%;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reward-preview > svg {
  color: var(--neon-mint);
  font-size: 28px;
}

.reward-avatar {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 3px;
}

.reward-copy {
  display: grid;
  flex: 1;
  gap: 5px;
  min-width: 0;
}

.reward-copy strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.reward-copy > span {
  color: var(--primary);
  font-size: 11px;
  line-height: 1.4;
}

.progress-chevron {
  flex-shrink: 0;
  color: var(--primary);
  font-size: 18px;
}

.progress-track {
  display: block;
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  box-shadow: 0 0 12px color-mix(in srgb, var(--primary) 25%, transparent);
  transition: width 0.6s ease;
}

.unlock-progress--complete .progress-heading strong,
.unlock-progress--complete .reward-copy > span {
  color: var(--neon-mint);
}

@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
}

.profile-actions button {
  display: flex;
  align-items: center;
  min-height: 48px;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.04);
  font-family: var(--font-display), sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  transition: 0.2s all;
  cursor: pointer;
}

.profile-actions button:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.09);
}

.edit-icon {
  color: var(--primary);
}

.achievement-icon {
  color: var(--neon-yellow, #ffe34d);
}

.unlockables-icon {
  color: var(--neon-cyan);
}

.achievement-action strong {
  margin-left: auto;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
</style>
