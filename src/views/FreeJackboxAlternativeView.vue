<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">FREE JACKBOX ALTERNATIVE</span>
        <br />
        LOCAL PARTY MULTIPLAYER QUIZ
      </h1>

      <YoutubeEmbed video-id="YQl5jOqm2n0" />

      <p class="party-desc">
        PixReveal is the ultimate free Jackbox alternative and the perfect
        browser party game for your next game night, team building event, or
        office break with your colleagues. If you love
        <strong>games like Jackbox</strong> or a fast-paced
        <strong>multiplayer pixel quiz</strong>, you can play right in your
        browser with no login or app needed. PixReveal supports up to 10 players.
      </p>

      <p class="party-desc">
        Host the <strong>pixel guessing game</strong> on the big screen and use
        your phones as controllers. Watch the pixel art unveil piece by piece.
        Think you know it? Hit the buzzer on your phone and guess! A correct
        answer gets you 1 point, while a wrong answer costs you -2 points. Use
        chaotic power-ups to sabotage your friends or coworkers and win the
        game!
      </p>

      <div class="cta-container">
        <ButtonLinkPrimary link="/play-party?role=host">
          HOST A FREE GAME
        </ButtonLinkPrimary>
        <ButtonLinkSecondary link="/play-party?role=join">
          JOIN WITH ROOM ID
        </ButtonLinkSecondary>
      </div>
      <PartyHowTo />
      <FAQComponent :items="jackboxFaqs"></FAQComponent>
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const jackboxFaqs = [
  {
    question: "What does \"Jackbox style\" mean for PixReveal?",
    answer: "It means you only need one central screen to host the game—like a PC, tablet, or TV. Everyone else connects instantly using their own smartphones as controllers to hit the buzzer and select their answers."
  },
  {
    question: "How do friends connect and join the room?",
    answer: "PixReveal is built exclusively for playing with friends. Joining is instant and seamless: players can either type in the room ID on their devices, click a shared invite link, or simply scan a QR code from the host screen to jump straight into the action."
  },
  {
    question: "What is the goal of the game and how do you score?",
    answer: "The goal is to recognize the drawing before your friends do as the pixels pop up randomly across the canvas. When you think you know it, hit the buzzer and choose from 4 answer options on your phone. Getting a correct answer awards 1 point, but guessing incorrectly penalizes you with -2 points."
  },
  {
    question: "What are bonus rounds?",
    answer: "Every 5 rounds, a bonus round with special effects triggers. In these bonus rounds, as well as in the final round of the game, the stakes are doubled: you get double points for a correct guess, but you also lose double the points for a wrong answer."
  },
  {
    question: "Do players need an app or registration?",
    answer: "No, players can just join the game directly via browser. You can set an avatar image and a player name. Or just use a default random name."
  }
]
</script>

<style scoped>
h1 {
  font-family: inherit;
  text-align: left;
}

.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
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
  @media (min-width: 576px) {
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
