<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">FUN FRIDAY ONLINE TEAM GAMES FOR FREE</span>
        <br />
        PIXREVEAL: SAFE FOR WORK PICTURE REVEAL QUIZ FOR YOUR TEAM
      </h1>

      <YoutubeEmbed video-id="YQl5jOqm2n0" />

      <p class="party-desc">
        Looking for <strong>fun games in the office on fridays</strong> that require zero setup? 
        PixReveal is a free, browser-based image reveal quiz where pictures progressively 
        unfold pixel by pixel. It is completely safe for work (SFW) and anyone can understand the 
        gameplay instantly. You can jump straight into the action with your team with no registration, 
        no downloads, and no login needed.
      </p>

      <p class="party-desc">
        Bring your team together with handcrafted pixel art. PixReveal supports both local 
        party play and online multiplayer. Simply invite your coworkers to join, follow 
        the progressive reveal of the drawing, and see who can guess the correct 
        answer first!
      </p>

      <div class="cta-container">
        <ButtonLinkPrimary link="/play-party?role=host">
          HOST A TEAM GAME
        </ButtonLinkPrimary>
      </div>

      <FAQComponent :items="officeFridayFaqs" />
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue"
import ContentPage from "@/components/page-layout/ContentPage.vue"
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue"
import FAQComponent from "@/components/page-ui/FAQComponent.vue"

const officeFridayFaqs = [
  {
    question: "Is PixReveal safe for work (SFW)?",
    answer: "Yes, the game is completely safe for work. The quiz features family-friendly, handcrafted pixel art drawings that are suitable for any professional environment or team event."
  },
  {
    question: "How do you play PixReveal with a team?",
    answer: "PixReveal supports both local party play and online multiplayer. For local party games, you can host the room on a big screen and everyone connects using their smartphones as controllers. For online multiplayer, you simply invite your coworkers to join the room from their own devices to guess the drawings together."
  },
  {
    question: "Do team members need to create an account?",
    answer: "No. There is no registration, login, or account creation required for anyone. You can host rooms, join games, and play instantly directly in your browser."
  }
]
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