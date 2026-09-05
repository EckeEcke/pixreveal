<template>
  <main class="page">
    <ContentPage>
      <h1>
        <span class="pre-headline">SMARTPHONE CONTROLLER GAME FOR TV</span> <br />
        TURN ANY PHONE INTO A WIRELESS BUZZER
      </h1>
      <div class="hero">
        <img class="party-image" src="/assets/images/image-partymode.webp" alt="group of people playing PixReveal" />

        <div>
          <p class="hero-desc">
            PixReveal turns every iOS and Android device into a real-time game controller for your TV or laptop.
          </p>
          <p class="hero-desc">
            Scan the QR code on the main screen to transform your phone browser into a buzzer with powerups and emotes.
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
          </div>
        </div>
      </div>

      <YoutubeEmbed video-id="YQl5jOqm2n0" thumbnail-url="/assets/images/trailer-preview.webp" />

      <div class="two-columns">
        <PartyHowTo />
        <PowerUpInfo class="powerups" />
      </div>

      <div class="two-columns">
        <section class="seo-section">
          <h2>How Mobile Controller Games Work in Your Web Browser</h2>
          <p class="party-desc">
            Modern browser technology allows smartphones to act as responsive wireless controllers without needing native app installations. One central display—such as a Smart TV, PC monitor, or projector via Chromecast/AirPlay—acts as the main arena where the pixel art reveals itself in real time.
          </p>
          <p class="party-desc">
            Players simply point their phone camera at the screen's QR code. This instantly connects their mobile browser to the live room session over WebSockets, giving each player a personal touch interface to lock in guesses, haptic-feel buzzers, and sabotage options.
          </p>
          <p class="party-desc">
            This setup eliminates the friction of traditional console party games. There are no battery charges for extra gamepads, no app store downloads, and zero configuration steps. Anyone with a smartphone can join a local game night within seconds.
          </p>
        </section>
        <FAQComponent :items="phoneControllerFaqs" />
      </div>

      <div class="two-columns">
        <section class="seo-section">
          <h2>Key Advantages of Phone-Controlled Browser Games</h2>
          <ul class="benefit-list">
            <li>Zero hardware cost: Uses smartphones everyone already owns</li>
            <li>Instant onboarding via camera QR code scanning</li>
            <li>Compatible with Smart TVs, Fire TV, Apple TV, and PCs</li>
            <li>No App Store or Google Play Store downloads required</li>
            <li>Customized mobile UI that changes with game states</li>
            <li>Scalable local multiplayer supporting 2 to 10 simultaneous players</li>
          </ul>
        </section>
        <section class="seo-section">
          <h2>How to Connect Your TV and Phones</h2>
          <ol class="step-list">
            <li>Open PixReveal on your Smart TV, laptop, or cast via AirPlay.</li>
            <li>Click "Host Game" to generate a unique room QR code.</li>
            <li>Have players scan the QR code using their default phone cameras.</li>
            <li>Enter player nicknames on the mobile screen to lock in.</li>
            <li>Watch the TV for pixel art reveals while keeping your eyes on your phone buzzer.</li>
            <li>Tap your mobile screen to buzz in and submit answers instantly.</li>
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
    question: "Do players need to install an app from the App Store or Google Play?",
    answer:
      "No. PixReveal operates 100% in mobile web browsers. Scanning the host screen QR code opens a lightweight, WebSocket-driven controller UI instantly without downloading software.",
  },
  {
    question: "Which devices can be used as the main display?",
    answer:
      "Any web browser capable of displaying HTML5 works. You can host the game on a Smart TV browser, a laptop connected via HDMI, an iPad, or stream your desktop using Chromecast or Apple AirPlay.",
  },
  {
    question: "Is there latency between the phone tap and the TV display?",
    answer:
      "PixReveal uses low-latency WebSockets to transmit player inputs instantly. When a player hits the buzzer on their smartphone, the response registers on the main screen in milliseconds.",
  },
  {
    question: "What happens if a player's phone screen goes to sleep?",
    answer:
      "The web controller automatically maintains active connections while open. If a phone locks, simply unlocking it re-establishes the connection to the active lobby without losing score progress.",
  },
  {
    question: "Does everyone need to be connected to the same Wi-Fi network?",
    answer:
      "No. Controllers communicate via cloud servers, meaning phones can be on mobile 4G/5G data or a separate Wi-Fi network while remaining completely synced with the TV host screen.",
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

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.two-columns {
  margin: 32px 0;
}
</style>