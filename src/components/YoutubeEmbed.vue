<template>
  <div class="video-wrapper" @click="isLoaded = true">
    <div v-if="!isLoaded" class="video-placeholder">
      <img
        :src="`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`"
        alt="PixReveal Gameplay Video"
        loading="lazy"
      />
      <div class="play-overlay">
        <div class="play-button"></div>
      </div>
    </div>

    <iframe
      v-else
      :src="`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`"
      title="YouTube video player"
      frameborder="0"
      allow="
        accelerometer;
        autoplay;
        clipboard-write;
        encrypted-media;
        gyroscope;
        picture-in-picture;
        web-share;
      "
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  videoId: {
    type: String,
    required: true,
  },
});

const isLoaded = ref(false);
</script>

<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border: 2px solid var(--neon-purple); /* Dein PixReveal Style */
  box-shadow: 0 0 15px var(--purple-glow);
  cursor: pointer;
  overflow: hidden;
  box-sizing: border-box;
}

.video-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.video-wrapper:hover img {
  opacity: 1;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.play-button {
  width: 70px;
  height: 70px;
  background: rgba(180, 0, 255, 0.8);
  border-radius: 50%;
  position: relative;
  transition: transform 0.2s ease;
}

.play-button::after {
  content: "";
  position: absolute;
  left: 28px;
  top: 20px;
  border-style: solid;
  border-width: 15px 0 15px 25px;
  border-color: transparent transparent transparent white;
}

.video-wrapper:hover .play-button {
  transform: scale(1.1);
  background: var(--neon-purple);
}

iframe {
  width: 100%;
  height: 100%;
}
</style>
