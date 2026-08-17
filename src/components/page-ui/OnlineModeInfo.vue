<template>
  <ul class="mode-info-list">
    <li class="item">
      <Icon icon="streamline-pixel:phone-scan-qr-code-1" class="icon" />
      <div>
        <div class="name">quick to join</div>
        <div class="desc">Enter the room ID, use a link, or scan a QR code — no account needed.</div>
      </div>
    </li>
    <li class="item">
      <Icon icon="streamline-pixel:photography-photo-image" class="icon" />
      <div>
        <div class="name">race the same drawing</div>
        <div class="desc">Every round, all players see the same drawing at once. The faster you answer, the more points you score.</div>
      </div>
    </li>
    <li class="item">
      <Icon icon="streamline-pixel:social-rewards-rating-star-1" class="icon" />
      <div>
        <div class="name">bonus round every 5 rounds</div>
        <div class="desc">Double points and a twist modifier keep it competitive.</div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<style scoped>
.mode-info-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: grid;
  gap: 4px;
}

.item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 14px;
  align-items: center;
  padding: 10px 4px;
  box-sizing: border-box;
}

.item + .item {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.icon {
  font-size: 32px;
  color: var(--primary);
  min-width: 32px;
}

.name {
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.95);
  text-transform: uppercase;
}

.desc {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.65;
  color: rgba(255, 255, 255, 0.9);
  text-transform: none;
}

@media (max-width: 575px) {
  .item {
    padding: 8px 2px;
  }
  .icon {
    font-size: 26px;
    min-width: 26px;
  }
  .name {
    font-size: 12px;
  }
  .desc {
    font-size: 11px;
  }
}
</style>