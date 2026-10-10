<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">FREE AIRCONSOLE ALTERNATIVE</span> <br />
        PHONE CONTROLLER PARTY GAME FOR YOUR TV
      </h1>
      <div class="hero">
        <img class="party-image" src="/assets/images/image-partymode.webp" alt="group of people playing PixReveal" />

        <div>
          <p class="hero-desc">
            Looking for a free AirConsole alternative? PixReveal turns every iOS and Android phone into a controller for your TV or laptop.
            Scan the QR code on the main screen and your phone browser becomes a quiz buzzer.
          </p>
          <div class="cta-container">
            <ButtonLinkPrimary link="/play-party?role=host">
              HOST A FREE GAME
            </ButtonLinkPrimary>
            <ButtonLinkSecondary link="/">
              DISCOVER MORE
            </ButtonLinkSecondary>
          </div>
          <div class="feature-badges">
            <span class="badge">2–10 players</span>
            <span class="badge">Phone controllers</span>
            <span class="badge">No app required</span>
            <span class="badge">No login</span>
          </div>
        </div>
      </div>

      <YoutubeEmbed video-id="YQl5jOqm2n0" thumbnail-url="/assets/images/trailer-preview.webp" class="trailer" />

      <div class="two-columns">
        <PartyHowTo />
        <PowerUpInfo class="powerups" />
      </div>

      <div class="two-columns">
        <section class="seo-section">
          <h2>PixReveal vs. AirConsole</h2>
          <p class="party-desc">
            AirConsole is a platform with many different games for your TV, played with phones as controllers. PixReveal takes a different route: it is one focused party game built around a single idea. Guess the pixel art while it reveals itself, and buzz in faster than your friends.
          </p>
          <p class="party-desc">
            If you want one quick game that everyone can join within seconds, PixReveal is made for exactly that. There is nothing to browse and nothing to set up. You host, everyone scans the QR code, and the first round starts.
          </p>
          <p class="party-desc">
            PixReveal is free to play, including powerups and bonus rounds, and it runs in the browser of your TV, laptop or tablet.
          </p>
        </section>
        <FAQComponent :items="phoneControllerFaqs" />
      </div>

      <div class="two-columns">
        <section class="seo-section">
          <h2>Why Use Phones as Controllers?</h2>
          <ul class="benefit-list">
            <li>No extra hardware: everyone already owns a smartphone</li>
            <li>Instant onboarding by scanning a QR code with the camera</li>
            <li>No account, no login and no App Store or Google Play download</li>
            <li>Works on Smart TV browsers, laptops, tablets and via screen casting</li>
            <li>Controller screen changes with the game state: buzzer, answers, powerups</li>
            <li>2 to 10 players in one room, locally or on a video call</li>
          </ul>
        </section>
        <section class="seo-section">
          <h2>How to Connect Your TV and Phones</h2>
          <ol class="step-list">
            <li>Open PixReveal on your Smart TV, laptop, or cast your screen via Chromecast or AirPlay.</li>
            <li>Click "Host a free game" to create a room with its own QR code.</li>
            <li>Have players scan the QR code with their regular phone camera.</li>
            <li>Enter a nickname on the phone to join the lobby.</li>
            <li>Watch the screen for the pixel art reveal while keeping a finger on your buzzer.</li>
            <li>Tap your phone to buzz in and pick the right answer before the others.</li>
          </ol>
        </section>
      </div>

      <router-link to="/" class="link">GO TO HOME</router-link>
    </ContentPage>
  </main>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import PartyHowTo from "@/components/page-ui/PartyHowTo.vue";
import PowerUpInfo from "@/components/game-ui/PowerUpInfo.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const phoneControllerFaqs = [
  {
    question: "Is PixReveal a free alternative to AirConsole?",
    answer:
      "PixReveal works in a similar way: one screen shows the game and everyone uses their phone as a controller. The difference is that PixReveal is one focused pixel art guessing game that is free to play without an account.",
  },
  {
    question: "Do I need a special app or device to host?",
    answer:
      "No. Open PixReveal in the browser of your Smart TV, laptop or tablet, or cast your screen with Chromecast or AirPlay. Players scan the QR code with their phone camera.",
  },
  {
    question: "Do players need to install an app from the App Store or Google Play?",
    answer:
      "No. PixReveal runs 100% in the mobile browser. Scanning the QR code on the host screen opens the controller instantly, without downloading anything.",
  },
  {
    question: "Which devices can be used as the main display?",
    answer:
      "Any device with a modern web browser works. You can host on a Smart TV browser, a laptop connected via HDMI, an iPad, or cast your screen with Chromecast or Apple AirPlay.",
  },
  {
    question: "Is there latency between the phone tap and the TV display?",
    answer:
      "PixReveal uses WebSockets to send player inputs in real time. When a player hits the buzzer on their phone, the main screen reacts almost immediately.",
  },
  {
    question: "What happens if a player's phone screen goes to sleep?",
    answer:
      "If a phone locks, simply unlock it and reopen the page to rejoin the active lobby. Rejoining is supported, so players can get back into the game.",
  },
  {
    question: "Does everyone need to be connected to the same Wi-Fi network?",
    answer:
      "No. Controllers communicate through cloud servers, so phones can use mobile data or a different Wi-Fi network and still stay in sync with the host screen.",
  },
];
</script>

<style scoped>
h1 {
  font-family: inherit;
  text-align: left;
  line-height: 1.1;
}
.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
}
.pre-headline {
  font-size: 14px;
  color: var(--primary);
  letter-spacing: 0.08em;
}
.hero-desc {
  margin: 0 0 16px;
  line-height: 1.5;
  font-size: 1.02rem;
}
h2 {
  margin-bottom: 20px;
}
.cta-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin: 24px 0 16px;

  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr;
  }
}
.feature-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 24px 0 32px;
}
.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.85rem;
  color: var(--white);
}
.party-desc {
  margin: 16px 0;
  line-height: 1.6;
}
.benefit-list,
.step-list {
  margin: 16px 0;
  padding-left: 20px;
  line-height: 1.8;
}
.link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--color-secondary);
}

.party-image {
  width: 100%;
  border-radius: 8px;
}

.hero, .two-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin: 32px 0;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.trailer {
  margin: 32px 0 64px;
}
</style>