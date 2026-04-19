<template>
  <div class="ranks">
    <div class="rank-row">
      <span class="rank-name prophet">Pixel Prophet</span>
      <div class="rank-divider"></div>
      <span class="rank-desc"
        >You see the art before it even exists. Pure sorcery.</span
      >
    </div>
    <div class="rank-row">
      <span class="rank-name eagle">Eagle Eye</span>
      <div class="rank-divider"></div>
      <span class="rank-desc"
        >Sharp as a 4K monitor in a 720p world. Impressive.</span
      >
    </div>
    <div class="rank-row">
      <span class="rank-name glitcher">Grid Glitcher</span>
      <div class="rank-divider"></div>
      <span class="rank-desc"
        >You're getting there. Not a total blur, but not HD yet.</span
      >
    </div>
    <div class="rank-row">
      <span class="rank-name blurry">Blurry Vision</span>
      <div class="rank-divider"></div>
      <span class="rank-desc"
        >Were you squinting the whole time? Needs more focus.</span
      >
    </div>
    <div class="rank-row">
      <span class="rank-name afk">AFK Architect</span>
      <div class="rank-divider"></div>
      <span class="rank-desc"
        >Did you even turn your monitor on? Or are you a bot?</span
      >
    </div>
  </div>
</template>

<style scoped>
.ranks {
  display: flex;
  flex-direction: column;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.rank-row:last-child {
  border-bottom: none;
}

.rank-name {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  min-width: 130px;
}

.rank-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.rank-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
}

.prophet {
  color: #ffcc00;
}
.eagle {
  color: #00ffcc;
}
.glitcher {
  color: #ff6600;
}
.blurry {
  color: #888888;
}
.afk {
  color: #ff0044;
}
</style>
