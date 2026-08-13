<template>
  <section class="powerup-info" aria-label="Party powerups info">
    <h3 class="title">PARTY POWERUPS</h3>
    <ul class="grid">
      <li class="item">
        <span class="emoji">&#x1F526;</span>
        <div>
          <div class="name">lights out</div>
          <div class="desc">Darken the drawing</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F500;</span>
        <div>
          <div class="name">scramble</div>
          <div class="desc">Mix up the letters of the answers</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x2744;&#xFE0F;</span>
        <div>
          <div class="name">freeze</div>
          <div class="desc">Block friends from buzzing or acting</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F608;</span>
        <div>
          <div class="name">devil</div>
          <div class="desc">Haunts the answer buttons in the next buzz</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F643;</span>
        <div>
          <div class="name">upside down</div>
          <div class="desc">Turns the image upside down</div>
        </div>
      </li>
      <li class="item">
        <span class="emoji">&#x1F4A8;</span>
        <div>
          <div class="name">fart</div>
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
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
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
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 14px;
  backdrop-filter: blur(4px);
  box-sizing: border-box;
  min-width: 0;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.item:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.emoji {
  font-size: 18px;
  line-height: 1;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.6));
}

.name {
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.95);
  text-transform: uppercase;
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