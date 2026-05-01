<template>
  <ContentPage>
    <h2>UPDATES</h2>
    <div class="log-grid">
      <div class="log-card">
        <div class="log-info">
          <span class="date">01-05-26</span>
        </div>
        <h3 class="log-title">Daily Challenges added</h3>
        <p>
          It was in planning for a while, now I can finally announce that daily challenges
          are available on PixReveal! Solve a new set of pixel art drawings every day and
          put your name on the leaderboard! All players play the same set per day. The
          game mode varies between Classic Reveal, Gravity and Inspect. Check every day
          for a new quick challenge and compete with the world for the top rank.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">04-24-26</span>
        </div>
        <h3 class="log-title">UI & Aesthetics Update: Tile Refinement</h3>
        <p>
          I’ve overhauled the main menu and mode selection grids to enhance visual clarity
          and player intuition. By introducing a dynamic color-coding system, each game
          mode now carries its own distinct visual identity—ranging from vibrant "Survival
          Red" to "Gravity Green." I also refined the Relative Color Syntax in CSS to
          ensure that every tile maintains its signature neon glow while improving
          contrast against the dark, pixel background. This adjustment doesn't just make
          the interface pop. It streamlines navigation, allowing you to identify your
          favorite game modes at a single glance.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">04-17-26</span>
        </div>
        <h3 class="log-title">New User Generated Content: Submit your own pixel art</h3>
        <p>
          The core of PixReveal is its art, and now you can be a part of it. I have
          officially launched the User-Generated Content (UGC) Editor, allowing players to
          create and submit their own pixel art masterpieces directly within
          pixreveal.com. Once a design is submitted, it enters my moderation queue for a
          quick quality check. As soon as I’ve approved the submission, your artwork will
          be seamlessly integrated into the game, making it playable for everyone in both
          Solo and Multiplayer modes. To include user generated content, activate UGC in
          the settings. The bridge between the editor and the live game ensures a
          constantly evolving library of fresh, high-quality challenges for the community.
        </p>
      </div>

      <div class="log-card">
        <div class="log-info">
          <span class="date">04-10-26</span>
        </div>
        <h3 class="log-title">Local Party Mode Added: The Free Jackbox Alternative</h3>
        <p>
          Bring the party to your living room with the new Local Party Mode — a completely
          free alternative to classic party games. The perfect game for your weekend! It
          works just like a classic Jackbox session: one central device, like your laptop
          or TV, acts as the Big Screen to display the drawing reveal and live rankings.
          Meanwhile, everyone else joins the fun using their smartphones as controllers.
          Internet connection required. The gameplay is fast and frantic: your phone
          displays a massive buzzer. The moment you think you recognize the pixel art, hit
          it! Only then will the four answer possibilities appear on your device. It’s a
          high-stakes race of speed and recognition that turns any gathering into a
          competitive pixel-guessing arena — no expensive consoles or extra
          controllers/apps required.
        </p>
      </div>
    </div>
    <div class="devlog-footer">
      <button class="confirm-btn" data-sfx="click" @click="$router.back()">BACK</button>
    </div>
  </ContentPage>
</template>

<script setup>
import ContentPage from "@/components/page-layout/ContentPage.vue";
</script>

<style scoped>
.log-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 32px;
  overflow-y: auto;
}

.log-card {
  --log-color: #00ffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  p {
    line-height: 1.4;
  }
  border-bottom: 1px solid rgb(from var(--log-color) r g b / 0.4);
  @media (min-width: 576px) {
    background: linear-gradient(
      135deg,
      rgb(from var(--log-color) r g b / 0.15) 0%,
      rgba(0, 40, 40, 0.05) 50%,
      rgba(0, 0, 0, 0.4) 100%
    );
    padding: 24px;
    border: none;
  }
}

.log-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-family: monospace;
}

.date {
  opacity: 0.5;
  font-size: 0.9rem;
}

.log-title {
  margin: 0 0 16px 0;
  letter-spacing: 1px;
  font-size: 1.4rem;
}

.confirm-btn {
  background: var(--primary);
  color: black;
  border: none;
  padding: 10px 24px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 32px;
}
</style>
