<template>
  <section class="powerup-info" aria-label="Party powerups info">
    <h3 class="title">Party Powerups</h3>
    <ul class="grid">
      <li class="item">
        <span class="emoji">&#x1F526;</span>
        <div>
          <div class="name">Darken</div>
          <div class="desc">Darken the drawing</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F500;</span>
        <div>
          <div class="name">Mix up</div>
          <div class="desc">Mix up the letters of the answers</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x2744;&#xFE0F;</span>
        <div>
          <div class="name">Freeze</div>
          <div class="desc">Block friends from buzzing or acting</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F608;</span>
        <div>
          <div class="name">Devil</div>
          <div class="desc">Haunts the answer buttons in the next buzz</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F643;</span>
        <div>
          <div class="name">Rotate</div>
          <div class="desc">Turns the image upside down</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F4A8;</span>
        <div>
          <div class="name">Fart</div>
          <div class="desc">Just try it out</div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.powerup-info {
  box-sizing: border-box;
}

.title {
  margin: 32px 0 24px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6);
}

.grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  align-items: start;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 12px 14px;
  box-sizing: border-box;
  min-width: 0;
}

.emoji {
  font-size: 18px;
  line-height: 1;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.6));
  margin-top: 2px;
}

.name {
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.95);
}

.desc {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
  text-transform: none;
  line-height: 1.35;
}

@media (max-width: 575px) {
  .grid {
    grid-template-columns: 1fr;
  }
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