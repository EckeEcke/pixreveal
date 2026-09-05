<template>
  <div class="setup-card manual">
    <div class="close-btn-wrapper">
      <button @click="$emit('close')" data-sfx="back" class="close-btn">
        <Icon icon="pixel:window-close-solid" />
      </button>
    </div>
    <article>
      <h2 class="logo">HOW TO PLAY</h2>
      <h3 class="subline">PixReveal Manual</h3>
      <p>
        PixReveal is a <strong>free browser party game</strong> about guessing
        <strong>pixelart</strong> within a time limit. The faster you answer
        correctly, the higher you score. This
        <strong>pixelart quiz</strong> offers different game modes with unique
        mechanics for visibility and time management. Playable directly in the
        browser, <strong>no download needed</strong>.
      </p>

      <p>
        You get four answer options. If you think that you know the correct
        answer, click the button. Alternatively you can also press 1, 2, 3 or 4
        on the keyboard. But be careful: you only get one try per drawing.
      </p>

      <StepsComponent class="content-container" />

      <h3>The Game Modes</h3>
      <div class="modes-grid">
        <div>
          <h4>Classic</h4>
          <p>
            Identify the drawing as it reveals one pixel at a time. Time = Points.
            The more time is left on the timer, the more stars ⭐ you earn. The more
            stars you earn the higher your final rank.
          </p>
        </div>

        <div>
          <h4>Daily Challenge</h4>
          <p>
            Every day a new set of drawings is available for you to solve! All
            players play the same set. Compete for the top rank on the global
            leaderboard!
          </p>
        </div>
      
        <div>
          <h4>Gravity</h4>
          <p>
            Similar to Classic, but with a twist. Pixels drop in Tetris style.
            Otherwise the same gameplay: correct answer out of four options as fast
            as possible to earn the most points.
          </p>
        </div>

        <div>
          <h4>Survival</h4>
          <p>
            The ultimate <strong>highscore challenge</strong>. You start with 30
            seconds. Every correct guess adds 3 seconds to the clock. How many
            drawings can you solve before the time runs out?
          </p>
        </div>

        <div>
          <h4>Inspect</h4>
          <p>
            The drawing is fully complete but shrouded in darkness. Use your
            <strong>magnifying glass</strong>
            (search lens) to inspect sections and uncover the hidden pixelart.
          </p>
        </div>
      </div>
    
      <YoutubeEmbed video-id="Prz-jTEg7fU" thumbnail-url="/assets/images/demo-preview.webp" class="content-container" />

      <h3>Multiplayer and user generated content</h3>
      <div class="two-columns">
        <div>
          <p>
            To play PixReveal in multiplayer, you need to host a game or join a
            hosted game. For sharing a hosted game you have four options:
          </p>
        </div>
        <ul>
          <li>enter room id manually</li>
          <li>copying an invite link</li>
          <li>sharing a link via native share</li>
          <li>scan the QR code (very helpful for Party Mode)</li>
        </ul>
      </div>

      <h4>Free Online Multiplayer</h4>
      <p>
        Play with others in the <strong>real-time multiplayer mode</strong>.
        Host a session, invite friends and compete for the highest rank.
        Everyone plays the same drawings – may the fastest scout win!
      </p>

      <h4>Local Party Mode Multiplayer</h4>
      <p>
        PixReveal offers a free alternative to Jackbox-style games! Gather
        around a single screen, and everyone can join the fun by buzzing in with
        their own devices. No need for multiple screens or complex setups. Just
        one host starts the game, and everyone else can join as a player on
        their phones.
      </p>
      <p>
        After each round, the last-placed player (or players, decided randomly
        in case of a points tie) is awarded a random powerup. You can hold up to
        <strong>three powerups</strong> at once — if you earn a fourth, it
        replaces the oldest one in your inventory. Use them to sabotage your
        friends:
      </p>
      <PowerUpInfo />
      <p>
        Send emotes from your phone to the host screen to react to the current
        game (or distract other players). Bonus rounds and the final round allow you to gain
        twice as much points, but also lose twice as much! Risk versus reward.
      </p>
      <p>
        The game is designed to be enjoyed in a social setting, making it
        perfect for parties, family gatherings, or casual game nights.
      </p>
      <h4>Submit your Art - User Generat content</h4>
      <p>
        Have you created your own pixelart? Share it with the PixReveal
        community! Use the
        <router-link to="/editor">Editor</router-link> to upload your drawings
        and submit them for others to guess. Community-made content expands the
        pool of drawings and keeps the game fresh for everyone. Enable user art
        via the settings. Once approved, your art will be available in the game.
        Additionally PixReveal provides a
        <router-link to="/user-gallery">user art gallery</router-link>. Check
        out art created by other players. If your art is not listed yet, then it
        is still waiting for approval.
      </p>

      <h3>Settings & Customization</h3>
      <p>
        Fine-tune your session for the best experience. I highly recommend
        enabling
        <strong>audio cues</strong> and <strong>fullscreen mode</strong> to
        fully immerse yourself in the pixel-hunting atmosphere. PixReveal adapts
        to your playstyle: whether you want
        <strong>action-packed 5-second blitz rounds</strong> for a quick
        adrenaline rush, or a <strong>relaxed 20-second marathon</strong> with
        20 drawings to test your long-term recognition skills. Customize your
        experience by selecting your favorite <strong>Categories</strong>. You
        can combine as many as you like to increase the total pool of drawings.
      </p>
      <p>
        Add an additional CRT filter for an even more retro look. And if you
        want more drawings, you can activate the ugc setting (user generated
        content) to include drawings created by users to the game.
      </p>
      <h3>Rankings</h3>
      <RankOverview />
    </article>
    <br />
    <ButtonPrimary data-sfx="back" @click="$emit('close')">
      <Icon icon="pixel:arrow-circle-left-solid" /> BACK
    </ButtonPrimary>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import RankOverview from "@/components/game-ui/RankOverview.vue";
import ButtonPrimary from "../page-ui/ButtonPrimary.vue";
import PowerUpInfo from "../game-ui/PowerUpInfo.vue";
import StepsComponent from "../page-ui/StepsComponent.vue";
</script>

<style scoped>
.setup-card.manual {
  position: relative;
  top: 0;
  box-sizing: border-box;
  padding: 32px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
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

h1 {
  text-align: left;
}

a {
  color: var(--primary);
  font-weight: 700;
}

.content-container {
  margin: 32px auto;
}

.modes-grid {
  display: grid;
  gap: 16px;
  row-gap: 0;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.two-columns {
  margin: 32px 0;
  display: grid;
  gap: 16px;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.logo {
  font-family: inherit;
  text-align: start;
  margin-bottom: 4px;
  font-weight: 900;
  font-size: 32px;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6);
}

.subline {
  color: var(--primary);
  text-transform: uppercase;
  margin-top: 0;
  margin-bottom: 32px;
}
</style>