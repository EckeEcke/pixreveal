<template>
  <div class="setup-card manual">
    <div class="close-btn-wrapper">
      <button @click="$emit('close')" data-sfx="click" class="close-btn">
        <Icon icon="pixel:window-close-solid" />
      </button>
    </div>
    <article>
      <h2 class="logo">HOW TO <span>PLAY</span></h2>
      <h3>How to play PixReveal</h3>
      <p>
        PixReveal is a <strong>free browser party game</strong> about guessing
        <strong>pixelart</strong> within a time limit. The faster you answer correctly,
        the higher you score. This <strong>pixelart quiz</strong> offers different game
        modes with unique mechanics for visibility and time management. Playable directly
        in the browser, <strong>no download needed</strong>.
      </p>

      <YoutubeEmbed video-id="Prz-jTEg7fU" />

      <h3>The Game Modes</h3>

      <h4>Classic & Blitz</h4>
      <p>
        Identify the drawing as it reveals one pixel at a time. Choose from four options.
        <strong>Pro tip:</strong> In the settings, you can toggle the
        <strong>5-second Blitz mode</strong>
        for an extreme speed challenge. Earn stars based on your remaining time.
      </p>

      <h4>Gravity</h4>
      <p>
        Similar to Classic, but with a twist. Pixels drop in Tetris style. Otherwise the
        same gameplay: correct answer out of four options as fast as possible to earn the
        most points.
      </p>

      <h4>Buzzer Mode</h4>
      <p>
        A true <strong>reaction test</strong>. Answer options stay hidden until you hit
        the <strong>Buzzer</strong>. Once pressed, the reveal stops, and you have only 5
        seconds to make your choice.
      </p>

      <h4>Survival</h4>
      <p>
        The ultimate <strong>highscore challenge</strong>. You start with 30 seconds.
        Every correct guess adds 3 seconds to the clock. How many drawings can you solve
        before the time runs out?
      </p>

      <h4>Inspect</h4>
      <p>
        The drawing is fully complete but shrouded in darkness. Use your
        <strong>magnifying glass</strong>
        (search lens) to inspect sections and uncover the hidden pixelart.
      </p>

      <h4>Inspect</h4>
      <p>
        The drawing is fully complete but shrouded in darkness. Use your
        <strong>magnifying glass</strong>
        (search lens) to inspect sections and uncover the hidden pixelart.
      </p>

      <h4>Daily Challenge</h4>
      <p>
        Every day a new set of drawings is available for you to solve! All players play
        the same set. Compete for the top rank on the global leaderboard!
      </p>

      <h3>Free Online Multiplayer</h3>
      <p>
        Play with others in the <strong>real-time multiplayer mode</strong>. Host a
        session, invite friends via link or room ID, and compete for the highest rank.
        Everyone plays the same drawings – may the fastest scout win!
      </p>

      <h4>Local Party Mode Multiplayer</h4>
      <p>
        PixReveal offers a free alternative to Jackbox-style games! Gather around a single
        screen, and everyone can join the fun by buzzing in with their own devices. No
        need for multiple screens or complex setups. Just one host starts the game, and
        everyone else can join as a player on their phones. The game is designed to be
        enjoyed in a social setting, making it perfect for parties, family gatherings, or
        casual game nights.
      </p>
      <h4>Submit your Art - User Generat content</h4>
      <p>
        Have you created your own pixelart? Share it with the PixReveal community! Use the
        <strong>Editor</strong> to upload your drawings and submit them for others to
        guess. Community-made content expands the pool of drawings and keeps the game
        fresh for everyone. Enable user art via the settings. Once approved, your art will
        be available in the game. You can also find user art in the editor under Presets
        (marked as [User Art])
      </p>

      <h4>Settings & Customization</h4>
      <p>
        Fine-tune your session for the best experience. I highly recommend enabling
        <strong>audio cues</strong> and <strong>fullscreen mode</strong> to fully immerse
        yourself in the pixel-hunting atmosphere. PixReveal adapts to your playstyle:
        whether you want <strong>action-packed 5-second blitz rounds</strong> for a quick
        adrenaline rush, or a <strong>relaxed 20-second marathon</strong> with 20 drawings
        to test your long-term recognition skills. Customize your experience by selecting
        your favorite <strong>Categories</strong>. You can combine as many as you like to
        increase the total pool of drawings.
      </p>
      <h3>Rankings</h3>
      <RankOverview />
    </article>
    <br />
    <button class="confirm-btn" data-sfx="click" @click="$emit('close')">BACK</button>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import RankOverview from "@/components/game-ui/RankOverview.vue";
</script>

<style scoped>
.setup-card.manual {
  position: relative;
  top: 0;
  box-sizing: border-box;
  padding: 32px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
}

.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.confirm-btn {
  background: var(--primary);
  padding: 8px 16px;
  border: none;
  font-family: inherit;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
}

h1 {
  text-align: left;
}
</style>
