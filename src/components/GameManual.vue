<template>
  <div class="setup-card manual">
    <div class="close-btn-wrapper">
      <button @click="$emit('close')" class="close-btn">
        <Icon icon="pixel:window-close-solid" />
      </button>
    </div>
    <article>
      <h2>How to play PixReveal</h2>
      <p>
        PixReveal is a <strong>free browser game</strong> about guessing
        <strong>pixelart</strong> within a time limit. The faster you answer
        correctly, the higher you score. This
        <strong>pixelart quiz</strong> offers different game modes with unique
        mechanics for visibility and time management. Playable directly in the
        browser, <strong>no download needed</strong>.
      </p>

      <h2>The Game Modes</h2>

      <h3>Classic & Blitz</h3>
      <p>
        Identify the drawing as it reveals one pixel at a time. Choose from four
        options.
        <strong>Pro tip:</strong> In the settings, you can toggle the
        <strong>5-second Blitz mode</strong>
        for an extreme speed challenge. Earn stars based on your remaining time.
      </p>

      <h3>Buzzer Mode</h3>
      <p>
        A true <strong>reaction test</strong>. Answer options stay hidden until
        you hit the <strong>Buzzer</strong>. Once pressed, the reveal stops, and
        you have only 5 seconds to make your choice.
      </p>

      <h3>Survival</h3>
      <p>
        The ultimate <strong>highscore challenge</strong>. You start with 30
        seconds. Every correct guess adds 3 seconds to the clock. How many
        drawings can you solve before the time runs out?
      </p>

      <h3>Inspect</h3>
      <p>
        The drawing is fully complete but shrouded in darkness. Use your
        <strong>magnifying glass</strong>
        (search lens) to inspect sections and uncover the hidden pixelart.
      </p>

      <h2>Free Online Multiplayer</h2>
      <p>
        Play with others in the <strong>real-time multiplayer mode</strong>.
        Host a session, invite friends via link or room ID, and compete for the
        highest rank. Everyone plays the same drawings – may the fastest scout
        win!
      </p>
      <h2>Settings & Customization</h2>
      <p>
        Fine-tune your session for the best experience. We highly recommend
        enabling <strong>audio cues</strong> and
        <strong>fullscreen mode</strong> to fully immerse yourself in the
        pixel-hunting atmosphere. PixReveal adapts to your playstyle: whether
        you want <strong>action-packed 5-second blitz rounds</strong> for a
        quick adrenaline rush, or a
        <strong>relaxed 20-second marathon</strong> with 20 drawings to test
        your long-term recognition skills. Customize your experience by
        selecting your favorite <strong>Categories</strong>. You can combine as
        many as you like to increase the total pool of drawings.
      </p>
    </article>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
</script>

<style scoped>
.setup-card.manual {
  position: relative;
  top: 0;
}

.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  position: sticky;
  top: 0;
  right: 16px;
  z-index: 1;
}

.close-btn {
  padding: 0;
  background: var(--card-bg);
  border: none;
  color: var(--primary);
  font-size: 36px;
  cursor: pointer;
}
</style>
