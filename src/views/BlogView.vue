<template>
  <ContentPage>
    <h1 class="logo">PIXREVEAL <span>UPDATES</span> & <span>BLOG</span></h1>
    <div class="log-grid">
      <div class="log-card">
        <div class="log-info">
          <span class="date">07-24-26</span>
        </div>
        <h3 class="log-title">Support PixReveal on Ko-fi</h3>
        <p>
          My priority remains keeping PixReveal 100% free for everyone. Still I have running costs to host PixReveal. If you enjoy
          playing and want to support the project, I’ve set up a Ko-fi page! Any
          support helps cover server costs and fuels future updates. <a href="https://ko-fi.com/pixreveal" target="_blank">PixReveal on Ko-fi</a>
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">07-23-26</span>
        </div>
        <h3 class="log-title">
          Adding Blur game mode as replacement for Buzzer mode
        </h3>
        <p>
          The core of PixReveal is its party multiplayer. But at the same time I
          always wanted to provide a nice singleplayer experience. Since the
          Buzzer mode was not really popular and hitting the buzzer when playing
          on your own is rather pointless, I added a new game mode: Blur. Some
          might already know the mechanic as a bonus round. The image is super
          blurry initially and gets clearer step by step. I think it brings a
          nice variety to PixReveal singleplayer and I hope you like it as well.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">07-20-26</span>
        </div>
        <h3 class="log-title">Fill button for the pixel art editor</h3>
        <p>
          I highly appreciate users submitting pixel art to PixReveal via my
          <router-link to="/editor">Editor</router-link>! Thank you all! Since I
          saw some users coloring the background, I added a fill button. By
          clicking it every pixel without a set color will be turned into the
          currently selected color.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">07-14-26</span>
        </div>
        <h3 class="log-title">Adding more juice: Shake effect on low timer</h3>
        <p>
          To make the gameplay more exciting I added a shake effect. When the
          timer reaches 3 or lower, the canvas starts shaking. Increasing the
          tension and dynamics of PixReveal. The shake effect is available in
          all game modes.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">07-09-26</span>
        </div>
        <h3 class="log-title">
          Adding more juice: Shine effect after answering
        </h3>
        <p>
          "Juice" describes audio visual elements that make a game feel more
          "gamey". To achieve this I added a shine effect on the feedback
          animation after giving an answer ✅/❌ and on the revealed drawing.
          The effect is available in all game modes.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">06-10-26</span>
        </div>
        <h3 class="log-title">Improved game round generation</h3>
        <p>
          When you start a game of PixReveal, a random set of quiz rounds is
          being generated for you. To increase the fun and avoid annoying early
          repetition of drawings between rounds, I tweaked the algorithm to
          create as many unique sets of drawings as possible before repeating
          one. Since PixReveal now has over 200 unique drawings including user
          generated content, it will take you a while until you see a drawing
          you already know.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">06-05-26</span>
        </div>
        <h3 class="log-title">Hall of Fame for Daily Challenge winners</h3>
        <p>
          So far PixReveal only had a daily leaderboard for the current day and
          the day before. This felt a bit lame. I wanted to honor the winners
          more. Therefore I added a Hall of Fame, where each daily winner is
          displayed with their name, avatar, score and the date they won. You
          can check it out here:
          <router-link to="/hall-of-fame">enter Hall of Fame</router-link>
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-28-26</span>
        </div>
        <h3 class="log-title">New sudden death added to party mode!</h3>
        <p>
          For the case of multiple players having the most points at the end of
          party mode, I added sudden death. Keep playing until there is only one
          winner! If you were not among the top players, you can still react to
          the game using emotes or influence the outcome by using your remaining
          powerups. Along with new sudden death there also is a new party title
          awarded for the survivor.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-27-26</span>
        </div>
        <h3 class="log-title">More music and adjusted difficulty!</h3>
        <p>
          Listening to the same music over and over again gets tedious, right?
          To keep things fresh I added a random song selection, choosing one of
          four songs to play during gameplay. Additionally as a consequence of
          player feedback I adjusted the difficulty of Inspect mode. By making
          the lens larger, it is now easier to spot the hidden pixel art and
          more enjoyable for all players.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-23-26</span>
        </div>
        <h3 class="log-title">
          New Bonus rounds in singleplayer and online multiplayer!
        </h3>
        <p>
          Local party multiplayer already had them. Now singleplayer and online
          mutlplayer have them, too! Bonus rounds mix up the gameplay by making
          it harder to guess. But at the same time you get the chance to score
          twice as much! Inspect mode and Survival won't have these bonus
          rounds, since it does not fit the gameplay style. These will get their
          own additional mechanics. Stay tuned!
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-17-26</span>
        </div>
        <h3 class="log-title">Bonus rounds in party multiplayer</h3>
        <p>
          Jackbox style party mode becomes more dynamic! New bonus rounds added:
          blur, sepia and black&white. On top of that in a bonus round points
          and malus are doubled. You can win 2 points, but you could also lose 4
          points! Classic risk versus reward. In the final round points are also
          doubled now to guarantee an exciting finish!
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-16-26</span>
        </div>
        <h3 class="log-title">
          Party multiplayer titles and moderator improvements
        </h3>
        <p>
          The game over view for the party mode got an upgrade! The moderator
          now comments on the results of the game. Players earn titles based on
          the way they played. The saboteur used the most powerups while the
          pacifist did not use any at all. Manage to answer correctly while
          scrambled powerup is active to earn a title. Or the spammer title for
          spamming emojis. We all know a person like that... Additionally the
          game over screen now provides emoji statistics: how many emojis were
          clicked and which emoji was the most popular. Upcoming multiplayer
          feature will be bonus rounds, mixing up the gameplay and offering a
          chance to gain bonus points.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-15-26</span>
        </div>
        <h3 class="log-title">Powerups in multiplayer</h3>
        <p>
          Next step to give the local party multiplayer more of a jackbox vibe:
          I just added powerups! Use the freeze powerup to stop your friends
          from hitting the buzzer. Turn the lights out for a few seconds to make
          it harder to guess. Or sabotage them even further by scrambling up the
          answer options. Besides that the first version of my moderator robot
          (not AI) is introduced. In the future it will be more prominent on
          PixReveal. Stay tuned!
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-14-26</span>
        </div>
        <h3 class="log-title">Emotes in Party Multiplayer</h3>
        <p>
          To improve the "party feeling" of the jackbox style party multiplayer,
          I added an emote feature. Send reactions from your phone to the host
          device to react to the current game (or distract other players).
          Following soon is statistics about used emotes in the end of the
          round.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-12-26</span>
        </div>
        <h3 class="log-title">User Art Gallery</h3>
        <p>
          PixReveal features a pixel art editor to submit your own pixel art to
          be added to the game. Out of appreciation for art created, I built a
          <router-link to="/user-gallery">user art gallery</router-link> page
          displaying all (approved) user generated drawings. You can also use
          the gallery to check if your drawing was already approved. If it is
          not listed yet, then approval is still pending.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-11-26</span>
        </div>
        <h3 class="log-title">QR codes for sharing multiplayer invite link</h3>
        <p>
          Multiplayer mode is one of the most popular features on PixReveal! To
          make it easier to play together, I added QR codes as option to share
          the invite link. This becomes especially handy in Local Party Mode.
          When the game is displayed on the home device, simply scan the QR code
          from the TV/monitor and you can join immidiately. No need to type in
          the room id manually or trying to figure out how to get the invite
          link sent from PC to a smartphone. I am also working on further
          improving the connection handling and adding more gameplay features to
          the multiplayer. So stay tuned!
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">05-01-26</span>
        </div>
        <h3 class="log-title">Daily Challenges added</h3>
        <p>
          It was in planning for a while, now I can finally announce that daily
          challenges are available on PixReveal! Solve a new set of pixel art
          drawings every day and put your name on the leaderboard! All players
          play the same set per day. The game mode varies between Classic
          Reveal, Gravity and Inspect. Check every day for a new quick challenge
          and compete with the world for the top rank.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">04-24-26</span>
        </div>
        <h3 class="log-title">UI & Aesthetics Update: Tile Refinement</h3>
        <p>
          I’ve overhauled the main menu and mode selection grids to enhance
          visual clarity and player intuition. By introducing a dynamic
          color-coding system, each game mode now carries its own distinct
          visual identity—ranging from vibrant "Survival Red" to "Gravity
          Green." I also refined the Relative Color Syntax in CSS to ensure that
          every tile maintains its signature neon glow while improving contrast
          against the dark, pixel background. This adjustment doesn't just make
          the interface pop. It streamlines navigation, allowing you to identify
          your favorite game modes at a single glance.
        </p>
      </div>
      <div class="log-card">
        <div class="log-info">
          <span class="date">04-17-26</span>
        </div>
        <h3 class="log-title">
          New User Generated Content: Submit your own pixel art
        </h3>
        <p>
          The core of PixReveal is its art, and now you can be a part of it. I
          have officially launched the User-Generated Content (UGC)
          <router-link to="/editor">Editor</router-link>, allowing players to
          create and submit their own pixel art masterpieces directly within
          pixreveal.com. Once a design is submitted, it enters my moderation
          queue for a quick quality check. As soon as I’ve approved the
          submission, your artwork will be seamlessly integrated into the game,
          making it playable for everyone in both Solo and Multiplayer modes. To
          include user generated content, activate UGC in the settings. The
          bridge between the editor and the live game ensures a constantly
          evolving library of fresh, high-quality challenges for the community.
        </p>
      </div>

      <div class="log-card">
        <div class="log-info">
          <span class="date">04-10-26</span>
        </div>
        <h3 class="log-title">
          Local Party Mode Added: The Free Jackbox Alternative
        </h3>
        <p>
          Bring the party to your living room with the new Local Party Mode — a
          completely free alternative to classic party games. The perfect game
          for your weekend! It works just like a classic Jackbox session: one
          central device, like your laptop or TV, acts as the Big Screen to
          display the drawing reveal and live rankings. Meanwhile, everyone else
          joins the fun using their smartphones as controllers. Internet
          connection required. The gameplay is fast and frantic: your phone
          displays a massive buzzer. The moment you think you recognize the
          pixel art, hit it! Only then will the four answer possibilities appear
          on your device. It’s a high-stakes race of speed and recognition that
          turns any gathering into a competitive pixel-guessing arena — no
          expensive consoles or extra controllers/apps required.
        </p>
      </div>
    </div>
    <div class="devlog-footer">
      <ButtonPrimary
        data-sfx="click"
        class="btn-primary"
        @clicked="$router.back()"
      >
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK
      </ButtonPrimary>
    </div>
  </ContentPage>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
</script>

<style scoped>
.log-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 32px;
  overflow-y: auto;
}

.log-card {
  padding: 0 0 16px;
  border-bottom: 1px solid rgb(from var(--primary) r g b / 0.25);
  box-sizing: border-box;

  p {
    margin: 0;
    line-height: 1.5;
    opacity: 0.9;
  }
}

.logo {
  font-family: inherit;
  text-align: start;
}

.log-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: monospace;
}

.date {
  opacity: 0.65;
  font-size: 0.9rem;
}

.log-title {
  margin: 0 0 10px 0;
  letter-spacing: 1px;
  font-size: 1.4rem;
  text-transform: uppercase;
}

@media (min-width: 576px) {
  .log-grid {
    gap: 24px;
  }

  .log-card {
    padding: 32px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(56, 189, 248, 0.35);
  }
}

.btn-primary {
  margin-top: 32px;
}

a {
  color: var(--primary);
  font-weight: 700;
}
</style>
