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
        browser with no login or app needed.
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
        <router-link to="/play-party?role=host" class="btn-cta host">
          HOST A FREE GAME
        </router-link>
        <router-link to="/play-party?role=join" class="btn-cta join">
          JOIN WITH ROOM ID
        </router-link>
      </div>
      <PartyHowTo />
      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
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
