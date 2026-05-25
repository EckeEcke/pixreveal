<template>
  <footer>
    <PlatformBar />
    <div class="link-wrapper">
      <button class="internal-link" data-sfx="click" @click="openManual">
        <Icon icon="pixel:book" /> HOW TO PLAY
      </button>
      <router-link class="internal-link" data-sfx="click" to="/about">
        <Icon icon="pixel:info-circle" /> ABOUT
      </router-link>
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/free-jackbox-alternative"
      >
        <Icon icon="pixel:startups" /> FREE JACKBOX ALTERNATIVE
      </router-link>
      <router-link class="internal-link" data-sfx="click" to="/blog">
        <Icon icon="pixel:bullhorn" /> BLOG
      </router-link>
      <router-link class="internal-link" data-sfx="click" to="/user-gallery">
        <Icon icon="pixel:image-solid" /> USER ART GALLERY
      </router-link>
    </div>

    <div>
      Music: Lo-Bit 13 by
      <a
        href="https://freemusicarchive.org/music/holiznapatreon/lo-bit-lofi-gamer-tracks"
        target="_blank"
        >HoliznaPATREON</a
      >
    </div>
    <div>
      © 2026 PixReveal | Code & Design by
      <a
        href="https://eckeecke.github.io"
        target="_blank"
        rel="noopener"
        class="website-link"
        >Christian Eckardt</a
      >
    </div>
  </footer>
</template>

<script setup>
import { useConfigStore } from "@/stores/config";
import { useRouter } from "vue-router";
import PlatformBar from "@/components/page-ui/PlatformBar.vue";
import { Icon } from "@iconify/vue";

const configStore = useConfigStore();
const router = useRouter();

const openManual = () => {
  configStore.openManual();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>

<style scoped>
footer {
  display: grid;
  gap: 32px;
  text-align: center;
  margin: 16px auto 32px;
  a {
    color: inherit;
  }
}

.website-link {
  text-decoration: none;
  cursor: pointer;
}

.internal-link {
  display: inline-flex;
  place-items: center;
  gap: 4px;
  margin: 0 8px;
  background: none;
  color: var(--white);
  border: none;
  text-decoration: underline;
  font-family: inherit;
  font-size: 16px;
}

.link-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: center;
  align-items: center;
  margin: 32px 0;
  @media (min-width: 968px) {
    flex-direction: row;
    gap: 16px;
    margin: 0;
  }
}
</style>
