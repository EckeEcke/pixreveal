<template>
  <div class="social-bar">
    <button
      class="btn-outline"
      @click="share('whatsapp')"
      data-sfx="click"
      title="Share via WhatsApp"
    >
      <Icon icon="streamline-pixel:logo-whatapp" />
    </button>

    <button
      class="btn-outline"
      @click="share('discord')"
      data-sfx="click"
      title="Share on Discord"
    >
      <Icon icon="streamline-pixel:logo-discord" />
    </button>

    <button
      class="btn-outline"
      @click="share('facebook')"
      data-sfx="click"
      title="Share on Facebook"
    >
      <Icon icon="streamline-pixel:logo-social-media-facebook-circle" />
    </button>

    <button
      class="btn-outline"
      @click="share('reddit')"
      data-sfx="click"
      title="Share on Reddit"
    >
      <Icon icon="pixel:reddit" />
    </button>
    <button
      v-if="canNativeShare"
      class="btn-outline"
      @click="shareNative"
      title="More sharing options"
      data-sfx="click"
    >
      <Icon icon="pixel:share" />
    </button>

    <Transition name="fade">
      <div v-if="copiedNotice" class="copied-toast">
        Copied! Paste it into Discord.
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  msg: {
    type: String,
    default: "Check out PixReveal! Can you guess the pixel art faster than me?",
  },
});

const copiedNotice = ref(false);

const share = (platform) => {
  const url = window.location.origin;
  const text = encodeURIComponent(props.msg);
  const fullUrl = encodeURIComponent(url);

  if (platform === "discord") {
    shareDiscord();
    return;
  }

  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${fullUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`,
    reddit: `https://www.reddit.com/submit?url=${fullUrl}&title=${text}`,
  };

  if (links[platform]) {
    window.open(links[platform], "_blank", "noopener,noreferrer");
  }
};

const shareDiscord = async () => {
  const url = window.location.origin;
  const combined = `${props.msg} ${url}`;

  try {
    await navigator.clipboard.writeText(combined);
    copiedNotice.value = true;
    setTimeout(() => (copiedNotice.value = false), 2500);
  } catch (err) {
    console.log("Clipboard copy failed", err);
  }

  window.open("https://discord.com/channels/@me", "_blank", "noopener,noreferrer");
};

const canNativeShare = ref(false);

onMounted(() => {
  canNativeShare.value = !!navigator.share;
});

const shareNative = async () => {
  try {
    await navigator.share({
      title: "PixReveal",
      text: props.msg,
      url: window.location.origin,
    });
  } catch (err) {
    console.log("Native share failed", err);
  }
};
</script>

<style scoped>
.social-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  position: relative;
}

.btn-outline {
  padding: 8px;
  width: unset;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: none;
  color: var(--white);
  opacity: 0.8;
  backdrop-filter: none;
  border-radius: 4px;
}

.social-bar .btn-outline:hover {
  background: var(--neon-social);
  box-shadow: 0 0 20px var(--white);
}

.copied-toast {
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: var(--white);
  opacity: 0.9;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>