<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">ONLINE PICTURE REVEAL GAME</span>
        <br />
        FAST-PACED PROGRESSIVE IMAGE REVEAL QUIZ
      </h1>

      <YoutubeEmbed video-id="YQl5jOqm2n0" />

      <p class="party-desc">
        Looking for a fun <strong>picture reveal game</strong> to test your reflexes and brainpower? 
        PixReveal is a free, browser-based quiz game where images progressively reveal themselves 
        pixel by pixel. Whether you want to play a quick solo round or host a massive game night with 
        friends, you can jump straight into the action with no registration, no downloads, and no login needed.
      </p>

      <p class="party-desc">
        Enjoy the <strong>image reveal quiz</strong> with handcrafted pixel art across multiple 
        game modes. Watch the pixels pop up randomly in Classic mode, or have pixels drop in Tetris style in Gravity mode. 
        Play the local party multiplayer in Jackbox style. Simply host the game on a big screen, connect instantly using your 
        smartphones as controllers, hit the buzzer, and guess the picture before anyone else!
      </p>

      <div class="cta-container">
        <ButtonLinkPrimary link="/singleplayer">
          Play Singleplayer
        </ButtonLinkPrimary>
        <ButtonLinkSecondary link="/play-party?role=host">
          HOST A PARTY
        </ButtonLinkSecondary>
      </div>
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue"
import ContentPage from "@/components/page-layout/ContentPage.vue"
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
</script>

<style scoped>
h1 {
  font-family: inherit;
  text-align: left;
}

.pre-headline {
  font-size: 16px;
  color: var(--primary);
}

h2 {
  margin-top: 0;
  margin-bottom: 32px;
}

.cta-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}

@media (min-width: 576px) {
  .cta-container {
    grid-template-columns: 1fr 1fr;
  }
}

.btn-cta {
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  transition: transform 0.1s;
}

.btn-cta:active {
  transform: scale(0.98);
}

.btn-cta.host {
  background: var(--primary);
  color: #fff;
}

.btn-cta.join {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.party-desc {
  margin: 32px 0;
  line-height: 1.5;
}

.link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--color-secondary);
}
</style>