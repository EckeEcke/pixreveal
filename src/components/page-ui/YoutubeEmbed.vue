<template>
  <div class="video-wrapper" @click="isLoaded = true">
    <component :is="'script'" type="application/ld+json">
      {{ JSON.stringify(schemaData) }}
    </component>

    <div v-if="!isLoaded" class="video-placeholder">
      <picture>
        <source
          v-if="thumbnailUrl"
          media="(max-width: 768px)"
          :srcset="thumbnailUrl"
        />
        <img
          :src="youtubeThumbnail"
          alt="PixReveal Gameplay Video"
          width="640"
          height="360"
          decoding="async"
          :loading="priority ? 'eager' : 'lazy'"
          :fetchpriority="priority ? 'high' : undefined"
        />
      </picture>

      <noscript>
        <a :href="`https://www.youtube.com/watch?v=${videoId}`" target="_blank" rel="noopener">
          Watch PixReveal Gameplay Trailer on YouTube
        </a>
      </noscript>

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
import { ref, computed } from "vue"

const props = defineProps({
  videoId: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: "",
  },
  priority: {
    type: Boolean,
    default: true,
  },
})

const isLoaded = ref(false)

const youtubeThumbnail = computed(
  () => `https://i.ytimg.com/vi/${props.videoId}/maxresdefault.jpg`
)

const schemaData = computed(() => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "PixReveal Gameplay Trailer",
  "description": "Watch the official gameplay trailer of PixReveal, the free pixel art party game.",
  "thumbnailUrl": [props.thumbnailUrl || youtubeThumbnail.value],
  "uploadDate": "2026-03-01T08:00:00+01:00",
  "duration": "PT48S",
  "expires": "2040-01-01T00:00:00+01:00",
  "contentUrl": `https://www.youtube.com/watch?v=${props.videoId}`,
  "embedUrl": `https://www.youtube.com/embed/${props.videoId}`
}))
</script>

<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  box-sizing: border-box;
}

.video-placeholder,
.video-placeholder picture {
  display: block;
  width: 100%;
  height: 100%;
}

.video-placeholder img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

noscript a {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  z-index: 10;
  text-decoration: none;
  border-radius: 4px;
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
  background: var(--primary);
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
  background: var(--neon-primary);
}

iframe {
  width: 100%;
  height: 100%;
}
</style>