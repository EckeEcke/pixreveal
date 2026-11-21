<template>
  <div class="setup-card manual">
    <div class="close-btn-wrapper">
      <button type="button" @click="$emit('close')" data-sfx="back" class="close-btn" aria-label="Close how to play">
        <Icon icon="pixel:window-close-solid" />
      </button>
    </div>
    <article>
      <section class="manual-section manual-intro">
      <h2 class="logo">HOW TO PLAY</h2>
      <h3 class="subline">PixReveal Manual</h3>
      <p>
        PixReveal is a <strong>free browser party game</strong> about guessing
        <strong>pixel art</strong> within a time limit. The faster you answer
        correctly, the higher you score. This
        <strong>pixel art quiz</strong> offers different game modes with unique
        mechanics for visibility and time management. Playable directly in the
        browser, <strong>no download needed</strong>.
      </p>

      <p>
        You get four answer options. If you think that you know the correct
        answer, click the button. Alternatively you can also press 1, 2, 3 or 4
        on the keyboard. But be careful: you only get one try per drawing.
      </p>

      <StepsComponent class="content-container" />
      </section>
      <section class="manual-section">
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
            (search lens) to inspect sections and uncover the hidden pixel art.
          </p>
        </div>
      </div>

      </section>
      <section class="manual-section">
      <h3>Challenge a friend</h3>
      <p>
        After playing a round of <strong>Classic</strong>, <strong>Gravity</strong>, or <strong>Inspect</strong>, you can create a challenge to test your friends! Simply copy the generated link and send it over. Your friend will play the exact same set of drawings. Once finished, a detailed comparison screen reveals who won the match. <strong>No signup required</strong>, and every challenge link stays active for <strong>7 days</strong>.
      </p>

      <YoutubeEmbed video-id="Prz-jTEg7fU" thumbnail-url="/assets/images/demo-preview.webp" class="content-container" />

      </section>
      <section class="manual-section">
      <h3>Multiplayer & Content</h3>
      <div class="two-columns">
        <div>
          <p>
            To play PixReveal in multiplayer, you need to host a game or join a
            hosted game. For sharing a hosted game you have four options:
          </p>
        </div>
        <ul>
          <li>Enter room ID manually</li>
          <li>Copy an invite link</li>
          <li>Share via native share menu</li>
          <li>Scan the QR code (ideal for Party Mode)</li>
        </ul>
      </div>

      <h4>Free Online Multiplayer</h4>
      <p>
        Play with others in <strong>real-time multiplayer mode</strong>.
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

      </section>
      <section class="manual-section">
      <h3>Submit Your Art - User Generated Content</h3>
      <p>
        Have you created your own pixel art? Share it with the PixReveal
        community! Use the
        <router-link to="/editor">Editor</router-link> to upload your drawings
        and submit them for others to guess. Community-made content expands the
        pool of drawings and keeps the game fresh for everyone. Enable user art
        via the settings. Once approved, your art will be available in the game.
        Additionally, PixReveal provides a
        <router-link to="/user-gallery">user art gallery</router-link> to check
        out art created by other players.
      </p>

      </section>
      <section class="manual-section">
      <h3>Achievements & Unlockables</h3>
      <p>
        Play PixReveal to complete achievements. By unlocking achievements, you can earn new avatars and other cosmetic options. Some achievements are easy to unlock, while others require more skill and dedication. Check your progress in the avatar section that you can access via the avatar in the page header.
      </p>
      
      </section>
      <section class="manual-section">
      <h3>Settings & Customization</h3>
      <p>
        Fine-tune your session for the best experience. Enabling
        <strong>audio</strong> and <strong>fullscreen mode</strong> is recommended to
        fully immerse yourself in the pixel-game atmosphere. PixReveal adapts
        to your playstyle: whether you want
        <strong>fast 5-second blitz rounds</strong> for a quick
        adrenaline rush, or a <strong>relaxed 20-second marathon</strong> with
        20 drawings to test your long-term recognition skills. Customize your
        experience by selecting your preferred <strong>Game Vibe</strong>, 
        from nerdy themes like anime & gaming to general topics like food and nature.
      </p>
      </section>
    </article>
    <div class="manual-actions">
      <ButtonSecondary @clicked="$emit('close')" data-sfx="back">Go back</ButtonSecondary>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue"
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue"
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue"
import PowerUpInfo from "../game-ui/PowerUpInfo.vue"
import StepsComponent from "../page-ui/StepsComponent.vue"

defineEmits(["close"])
</script>

<style scoped>
.setup-card.manual {
  position: relative;
  top: 0;
  box-sizing: border-box;
  padding: 32px 24px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  @media (min-width: 500px) {
    padding: 32px;
  }
}

.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
}

a {
  color: var(--primary);
  font-weight: 700;
}

article {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.manual-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.manual-section + .manual-section {
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.manual-section > :deep(*) {
  margin-block: 0;
}

.manual-section > h3:not(.subline) {
  font-size: 20px;
  line-height: 1.35;
}

.manual-section > h4 {
  margin-top: 8px;
  font-size: 16px;
  line-height: 1.4;
}

.manual-section p,
.manual-section li {
  line-height: 1.65;
}

.manual-section > p {
  max-width: 75ch;
}

.manual-section > .content-container,
.manual-section > :deep(.powerup-info) {
  margin-block: 8px;
}

.modes-grid,
.two-columns {
  display: grid;
  gap: 24px 32px;
}

.modes-grid > div { min-width: 0; }

.modes-grid h4 {
  margin: 0 0 8px;
  color: var(--primary);
  font-size: 16px;
}

.modes-grid p,
.two-columns p,
.two-columns ul { margin: 0; }

.two-columns ul { padding-left: 20px; }
.two-columns li + li { margin-top: 8px; }

.logo {
  font-family: inherit;
  text-align: start;
  font-weight: 900;
  font-size: 32px;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6);
}

.subline {
  color: var(--primary);
  text-transform: uppercase;
}

.manual-intro > .subline { margin-top: -12px; margin-bottom: 8px; }

.manual-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (min-width: 700px) {
  .modes-grid,
  .two-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 499px) {
  .logo { font-size: 26px; padding-right: 24px; }
  .setup-card.manual { padding: 28px 20px; }
}
</style>
