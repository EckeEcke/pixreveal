<template>
  <ul class="mode-info-list">
    <li class="item">
      <span class="emoji">&#x1F4FA;</span>
      <div>
        <div class="name">host on a big screen</div>
        <div class="desc">TV or laptop — this screen shows the drawing and controls the game.</div>
      </div>
    </li>
    <li class="item">
      <span class="emoji">&#x1F4F1;</span>
      <div>
        <div class="name">join via phone</div>
        <div class="desc">Everyone plays from their phone — including you, if you want to join in as host.</div>
      </div>
    </li>
    <li class="item">
      <span class="emoji">&#x1F310;</span>
      <div>
        <div class="name">local or online</div>
        <div class="desc">Not in the same room? Screen-share your host screen (Zoom, Discord, etc.) so everyone can see the drawing too.</div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.mode-info-list {
  list-style: none;
  padding: 0;
  margin: 32px 0;
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