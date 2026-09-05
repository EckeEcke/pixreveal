<template>
  <ContentPage>
    <article class="privacy-content">
      <p class="eyebrow">PRIVACY</p>
      <h1>DATA PROTECTION</h1>
      <p class="lead">
        This information explains how PixReveal processes data when you use
        Stream Mode, including Twitch chat integration and the YouTube chat connection.
      </p>

      <section>
        <h2>1. Controller</h2>
        <p>
          The controller for processing on this website is the operator named
          in the legal notice. For questions about data protection or to
          exercise your rights, please use the contact details provided
          there.
        </p>
      </section>

      <section>
        <h2>2. Twitch Integration</h2>
        <p>
          When using Twitch Stream Mode, you only provide your public Twitch channel name.
          PixReveal connects to the public Twitch IRC/WebSocket chat to read chat messages in real time.
          No login credentials or private personal data are requested or processed for Twitch integration.
        </p>
      </section>

      <section>
        <h2>3. YouTube OAuth & Limited Use Disclosure</h2>
        <p>
          YouTube Stream Mode uses Google OAuth 2.0 with PKCE. When you sign
          in, Google authenticates your account and asks for permission to
          provide PixReveal with read-only access to the YouTube live chat
          associated with your channel.
        </p>
        <p>
          PixReveal does not receive or store your Google password. OAuth
          tokens are kept in your browser's local storage so the chat can be
          read during the current browser session and future sessions. You
          can revoke access at any time in your Google Account's third-party
          app settings or by removing the stored PixReveal YouTube data from
          your browser.
        </p>
        <p>
          PixReveal's use and transfer to any other app of information received from Google APIs will adhere to the
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            class="privacy-link"
          >
            Google API Services User Data Policy
          </a>, including the Limited Use requirements.
        </p>
      </section>

      <section>
        <h2>4. Chat Messages</h2>
        <p>
          While Stream Mode is running, PixReveal reads live chat
          messages (from Twitch or YouTube API). The message text, public
          display name or channel identifier, and publication time are used
          to identify guesses, assign points, prevent duplicate guesses, and
          show the answer ticker and leaderboard.
        </p>
        <p>
          Chat messages are processed directly in the browser. Stream scores and
          leaderboard entries are stored locally in your browser for the
          stream session. They are not uploaded by PixReveal to its own
          server. Do not enter sensitive or personal information in chat.
        </p>
      </section>

      <section>
        <h2>5. Legal Basis</h2>
        <p>
          Where required by applicable data protection law, processing for YouTube OAuth is
          based on your consent when you authorize access (Article 6
          (1) (a) GDPR). The processing of public chat data is based on the performance of a service
          or legitimate interest in operating the game feature (Article 6 (1) (b) &amp; (f) GDPR). You may withdraw consent at
          any time; withdrawal does not affect processing that already took
          place lawfully.
        </p>
      </section>

      <section>
        <h2>6. Google, Twitch, and Third Parties</h2>
        <p>
          The OAuth login and YouTube chat API are provided by Google LLC. Twitch chat integration is provided by Twitch Interactive, Inc.
          When you use these features, data is transmitted to the respective platform according to
          Google's and Twitch's privacy policies. PixReveal does not control third-party processing.
          Data may be processed outside the European Economic Area under standard contractual clauses or equivalent legal safeguards.
        </p>
      </section>

      <section>
        <h2>7. Retention and Your Rights</h2>
        <p>
          You can delete locally stored OAuth data, stream scores, and
          leaderboard data by clearing this site's browser storage. You have
          the right to request access, rectification, erasure, restriction of
          processing, data portability, and to object where the legal
          requirements are met. You also have the right to lodge a complaint
          with a data protection supervisory authority.
        </p>
      </section>

      <section>
        <h2>8. Updates</h2>
        <p>
          This notice may be updated when Stream Mode or its data flows
          change. The version published on this page applies to your use of
          the feature.
        </p>
      </section>
    </article>
  </ContentPage>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
</script>

<style scoped>
.privacy-content {
  width: 100%;
}

.eyebrow {
  margin: 32px 0 8px;
  color: var(--primary);
  font-weight: 800;
  letter-spacing: 2px;
}

h1 {
  margin: 0;
  font-family: inherit;
  text-align: left;
}

.lead {
  margin: 16px 0 32px;
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.8;
}

section {
  margin-top: 28px;
}

h2 {
  margin: 0 0 10px;
  color: #fff;
  font-size: 18px;
  font-family: inherit;
}

p {
  margin: 0 0 12px;
  line-height: 1.7;
}

.privacy-link {
  color: white;
  opacity: 0.8;
}

@media (max-width: 600px) {
  .lead {
    font-size: 16px;
  }
}
</style>
