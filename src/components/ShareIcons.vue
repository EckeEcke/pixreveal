<template>
  <div class="social-bar">
    <button class="btn-outline" @click="share('whatsapp')" title="Share via WhatsApp">
      <Icon icon="streamline-pixel:logo-whatapp" />
    </button>
    
    <button class="btn-outline" @click="share('x')" title="Share on X">
      <Icon icon="pixel:x" />
    </button>
    
    <button class="btn-outline" @click="share('facebook')" title="Share on Facebook">
      <Icon icon="streamline-pixel:logo-social-media-facebook-circle" />
    </button>

    <button class="btn-outline" @click="share('reddit')" title="Share on Reddit">
      <Icon icon="pixel:reddit" />
    </button>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue"

const props = defineProps({
  msg: {
    type: String,
    default: "Check out PixReveal! Can you guess the pixel art faster than me?"
  }
})

const share = (platform) => {
  const url = window.location.origin
  const text = encodeURIComponent(props.msg)
  const fullUrl = encodeURIComponent(url)

  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${fullUrl}`,
    x: `https://twitter.com/intent/tweet?text=${text}&url=${fullUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`,
    reddit: `https://www.reddit.com/submit?url=${fullUrl}&title=${text}`
  }

  if (links[platform]) {
    window.open(links[platform], "_blank", "noopener,noreferrer")
  }
}
</script>

<style scoped>
.social-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-outline {
  padding: 8px;
  min-width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: none;
}

/* Icons erhalten den Neon-Glow auf Hover */
.btn-outline.sm:hover :deep(svg) {
  filter: drop-shadow(0 0 5px currentColor)
}
</style>