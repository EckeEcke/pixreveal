<template>
  <div class="stream-platform-page">
    <HeaderApp show-back-btn />
    <main class="stream-platform-content">
      <section class="stream-platform-card">
        <p class="eyebrow">STREAM MODE</p>
        <h1>CHOOSE YOUR CHAT</h1>
        <p class="intro">Let your viewers play along through their stream chat.</p>

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
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import HeaderApp from "@/components/page-layout/HeaderApp.vue";
import SelectionTile from "@/components/page-ui/SelectionTile.vue";
</script>

<style scoped>
.stream-platform-page {
  width: 100%;
  min-height: 100dvh;
  padding: 0 16px 32px;
  box-sizing: border-box;
}

.stream-platform-page :deep(header) {
  margin: 0 auto;
}

.stream-platform-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100dvh - 128px);
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
  gap: 16px;
  text-align: left;
}

.tile-link {
  display: block;
  color: inherit;
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
