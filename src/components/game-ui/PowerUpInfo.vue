<template>
  <section class="powerup-info" aria-label="Party powerups info">
    <div class="pill">
      <h3 class="title">PARTY POWERUPS</h3>
      <ul class="list">
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
          <span class="emoji">😈&#xFE0F;</span>
          <div>
            <div class="name">devil</div>
            <div class="desc">Haunts the answer buttons in the next buzz</div>
          </div>
        </li>
        <li class="item">
          <span class="emoji">🙃&#xFE0F;</span>
          <div>
            <div class="name">upside down</div>
            <div class="desc">Turns the image upside down</div>
          </div>
        </li>
        <li class="item">
          <span class="emoji">💨&#xFE0F;</span>
          <div>
            <div class="name">fart</div>
            <div class="desc">Just try it out</div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.powerup-info {
  margin-left: 24px;
  box-sizing: border-box;
}

.pill {
  padding: 12px 18px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 2px solid var(--primary);
  box-sizing: border-box;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1.5;
  text-align: left;
  text-transform: uppercase;
}

.title {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: start;
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
}

.desc {
  margin-top: 2px;
  font-size: 14px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
  text-transform: none;
}

@media (max-width: 575px) {
  .pill {
    padding: 10px 14px;
    font-size: 18px;
  }
  .title {
    font-size: 14px;
  }
  .name {
    font-size: 14px;
  }
  .desc {
    font-size: 12px;
  }
}
</style>

