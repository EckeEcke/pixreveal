<template>
  <ul class="mode-info-list">
    <li class="item">
      <span class="emoji">&#x1F511;</span>
      <div>
        <div class="name">quick to join</div>
        <div class="desc">Enter the room ID, use a link, or scan a QR code — no account needed.</div>
      </div>
    </li>
    <li class="item">
      <span class="emoji">&#x1F5BC;&#xFE0F;</span>
      <div>
        <div class="name">race the same drawing</div>
        <div class="desc">Every round, all players see the same drawing at once. The faster you answer, the more points you score.</div>
      </div>
    </li>
    <li class="item">
      <span class="emoji">&#x2B50;</span>
      <div>
        <div class="name">bonus round every 5 rounds</div>
        <div class="desc">Double points and a twist modifier keep it competitive.</div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.mode-info-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  display: grid;
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: start;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
  backdrop-filter: blur(4px);
  box-sizing: border-box;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.item:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.emoji {
  font-size: 20px;
  line-height: 1;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.6));
}

.name {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.95);
  text-transform: uppercase;
}

.desc {
  margin-top: 2px;
  font-size: 14px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
  text-transform: none;
}

@media (max-width: 575px) {
  .item {
    padding: 10px 14px;
  }
  .name {
    font-size: 14px;
  }
  .desc {
    font-size: 12px;
  }
}
</style>