<template>
  <div class="stream-platform-page">
    <main class="stream-platform-content">
      <section class="stream-platform-card">
        <p class="eyebrow">STREAM MODE</p>
        <h1>CHOOSE YOUR CHAT</h1>
        <p class="intro">Let your viewers play along through the stream chat.</p>

        <div class="platform-grid">
          <router-link to="/stream/youtube" class="tile-link" data-sfx="click">
            <SelectionTile
              icon-name="pixel:youtube"
              btn-text="YOUTUBE"
              sub-title="Play through your YouTube live chat"
              btn-color="var(--neon-error)"
              :feature-badges="['YouTube Live', 'OAuth login']"
            />
          </router-link>

          <router-link to="/stream/twitch" class="tile-link" data-sfx="click">
            <SelectionTile
              icon-name="pixel:twitch"
              btn-text="TWITCH"
              sub-title="Play through your Twitch chat"
              btn-color="var(--neon-social)"
              :feature-badges="['Twitch chat', 'No login required']"
            />
          </router-link>
        </div>

        <YoutubeEmbed
          class="stream-platform-video"
          video-id="9Np-F4NZ_RI"
        />

        <div class="two-columns">
          <section class="seo-section">
            <h2>Interactive Stream Games for Twitch & YouTube Live</h2>
            <p class="party-desc">
              PixReveal Stream Mode lets content creators host interactive pixel-guessing games directly with their live audience. Viewers don't need to join external lobbies or scan QR codes—they simply type their guesses straight into your stream chat.
            </p>
            <p class="party-desc">
              The automated bot tracks chat messages in real time, registers the fastest correct guesses, and updates the live stream leaderboard instantly. Whether you broadcast on Twitch or YouTube Live, setting up takes less than 60 seconds.
            </p>
          </section>

          <section class="seo-section">
            <h2>How Stream Mode Works</h2>
            <ol class="step-list">
              <li>Select your streaming platform (Twitch or YouTube Live).</li>
              <li>Connect your channel or enter your stream details.</li>
              <li>Capture the host screen using OBS, Streamlabs, or Prism.</li>
              <li>Your viewers type 1, 2, 3, 4 or the full word directly in live chat.</li>
            </ol>
          </section>
        </div>

        <FAQComponent :items="streamFaqs" class="stream-faq" />

        <router-link to="/" class="link">GO TO HOME</router-link>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import FAQComponent from "@/components/page-ui/FAQComponent.vue";

const streamFaqs = [
  {
    question: "Do my viewers need to open a separate browser tab to play?",
    answer:
      "No! That is the best part of Stream Mode. Viewers stay on Twitch or YouTube and participate entirely by typing numbers or answer words into your live stream chat.",
  },
  {
    question: "How does latency/stream delay affect gameplay?",
    answer:
      "PixReveal is built specifically with stream delay in mind. Reveal speeds and timer limits can be adjusted to give both low-latency and standard-delay viewers a fair chance to guess.",
  },
  {
    question: "Is Stream Mode free for content creators?",
    answer:
      "Yes, PixReveal Stream Mode is 100% free for streamers and requires no premium subscription or software installations.",
  },
];
</script>

<style scoped>
.stream-platform-page {
  width: 100%;
  min-height: 100dvh;
  padding: 0;
  box-sizing: border-box;
}

.stream-platform-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100dvh - 128px);
  padding: 32px 16px;
  box-sizing: border-box;
}

.stream-platform-card {
  width: min(100%, 820px);
  padding: 40px;
  background: rgba(15, 12, 29, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  text-align: center;
}

.stream-platform-video {
  margin: 48px auto;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--primary);
  font-weight: 800;
  letter-spacing: 2px;
}

h1 {
  margin: 0;
}

.intro {
  margin: 12px 0 32px;
  opacity: 0.7;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  text-align: left;
}

.tile-link {
  display: block;
  color: inherit;
  text-decoration: none;
  width: 100%;
}

.tile-link button {
  width: 100%;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin: 32px 0;
  text-align: left;
}

@media (min-width: 768px) {
  .two-columns {
    grid-template-columns: 1fr 1fr;
  }
}

.seo-section h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.party-desc {
  margin: 12px 0;
  line-height: 1.6;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
}

.step-list {
  margin: 12px 0;
  padding-left: 20px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
}

.step-list li {
  margin-bottom: 8px;
}

.stream-faq {
  margin-top: 32px;
  text-align: left;
}

.link {
  display: block;
  text-align: center;
  margin-top: 32px;
  color: var(--color-secondary);
  text-decoration: none;
}

@media (max-width: 640px) {
  .stream-platform-card {
    padding: 24px 16px;
  }

  .platform-grid {
    grid-template-columns: 1fr;
  }
}
</style>