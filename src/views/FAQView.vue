<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">QUESTIONS & ANSWERS</span>
        <br />
        PIXREVEAL
      </h1>
      <FAQComponent :items="generalFaqs" />

      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const generalFaqs = [
  {
    question: "What is PixReveal and how do you play?",
    answer:
      "PixReveal is a drawing quiz game where images reveal themselves pixel by pixel. Your goal is to recognize the drawing and guess the correct answer before the timer runs out. The faster you submit the correct answer, the more points you get.",
  },
  {
    question: "What game modes are available?",
    answer:
      "You can play in Classic mode, where pixels pop up randomly across the canvas, or in Gravity mode, where pixels drop down from the top in a Tetris-style animation. In Inspect mode the canvas is completely dark. Only through a lens you can inspect parts of the whole image. Move the lens to find out what it is.",
  },
  {
    question: "Can I play solo or with friends?",
    answer:
      "You can play solo in singleplayer mode to chase high scores, or play with friends. There is no random matchmaking with strangers. For multiplayer, you can either host a local party game Jackbox-style where one screen acts as the host and everyone uses their smartphones as controllers, or invite friends to a private online lobby where everyone plays on their own screen.",
  },
  {
    question: "How many players can play multiplayer?",
    answer:
      "Party Mode and Online Multiplayer both support up to 10 players.",
  },
  {
    question: "Is PixReveal safe for work?",
    answer:
      "Yes, PixReveal is safe for work. It is designed as a game for everyone. All drawings including user generated content are curated to provide a great experience for everybody.",
  },
  {
    question: "I am not into anime or gaming. Can I still play the game?",
    answer:
    "Yes, PixReveal is customizable. Just open the settings and unselect the categories that do not fit your likings. Then these drawings will be excluded from the game. Categories are Animals & Nature, Anime & Cartoons, Food, Gaming, Movies & TV and Objects & People.",
  },
  {
    question: "Can I play PixReveal via keyboard?",
    answer:
      "Yes, the game is playable via keyboard! You can use 1, 2, 3 and 4 to select the according answers. By selecting the small ⌨️ keyboard icon on the top right of the game screen, you can also display small key hints on the answer buttons.",
  },
  {
    question: "I submitted art, but I don't see it in the game?",
    answer:
      "Submitted artwork goes through a manual approval process for moderation. Additionally, user-generated content (UGC) must be enabled in the settings. Once your art is approved, it can be viewed and admired in the user gallery.",
  },
  {
    question: "Where can I report bugs?",
    answer:
      "If you encounter any bugs or issues, you can report them via GitHub or Discord. Both platforms are linked directly on the about page.",
  },
  {
    question: "Is there a registration or account system?",
    answer:
      "No, a registration system does not exist. You can host rooms, play solo, join games, and submit your final scores to the global leaderboard instantly without ever needing an account.",
  },
];
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
  margin-top: 40px;
  margin-bottom: 24px;
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

.faq-section {
  margin-top: 48px;
  text-align: left;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.faq-item summary {
  font-weight: 700;
  cursor: pointer;
  outline: none;
  user-select: none;
}

.faq-answer {
  margin-top: 12px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.faq-answer p {
  margin: 0;
}

.link {
  display: block;
  text-align: center;
  margin-top: 32px;
  color: var(--color-secondary);
}
</style>
