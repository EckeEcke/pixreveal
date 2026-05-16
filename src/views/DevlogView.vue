<template>
  <ContentPage>
    <h2 class="logo">UPDATES</h2>
    <div class="log-grid">
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
          <router-link to="/user/gallery">user art gallery</router-link> page
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
      <button class="confirm-btn" data-sfx="click" @click="$router.back()">
        <Icon icon="pixel:arrow-circle-left-solid" /> BACK
      </button>
    </div>
  </ContentPage>
</template>

<script setup>
import { Icon } from "@iconify/vue";
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
  padding-bottom: 16px;
  border-bottom: 1px solid rgb(from var(--primary) r g b / 0.4);
  p {
    line-height: 1.4;
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
  display: flex;
  place-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--primary);
  color: black;
  border: none;
  padding: 12px 24px;
  color: black;
  font-size: 16px;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 32px;
}

a {
  color: var(--primary);
  font-weight: 700;
}
</style>
