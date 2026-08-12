<template>
  <footer>
    <PlatformBar />

    <div class="link-wrapper">
      <button class="internal-link" data-sfx="click" @click="openManual">
        <Icon icon="pixel:book" /> HOW TO PLAY
      </button>
      <router-link class="internal-link" data-sfx="click" to="/hall-of-fame">
        <Icon icon="pixel:crown-solid" /> HALL OF FAME
      </router-link>
      <router-link class="internal-link" data-sfx="click" to="/user-gallery">
        <Icon icon="pixel:image-solid" /> USER ART GALLERY
      </router-link>
    </div>

    <div class="link-wrapper">
      <router-link class="internal-link" data-sfx="click" to="/blog">
        <Icon icon="pixel:bullhorn" /> BLOG
      </router-link>
      <router-link class="internal-link" data-sfx="click" to="/partners">
        <Icon icon="pixel:chart-network" /> PARTNERS
      </router-link>
      <router-link class="internal-link" data-sfx="click" to="/about">
        <Icon icon="pixel:info-circle" /> ABOUT
      </router-link>
      <router-link class="internal-link" data-sfx="click" to="/faq">
        <Icon icon="pixel:question" /> FAQ
      </router-link>
    </div>

    <div class="link-wrapper">
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/free-jackbox-alternative"
      >
        <Icon icon="pixel:startups" /> JACKBOX ALTERNATIVE
      </router-link>
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/free-pixel-guessr-alternative"
      >
        <Icon icon="pixel:search" /> PIXEL GUESSR ALTERNATIVE
      </router-link>
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/free-skribbl-and-gartic-alternative"
      >
        <Icon icon="pixel:pen" /> SKRIBBL/GARTIC ALTERNATIVE
      </router-link>
    </div>

    <div class="link-wrapper">
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/picture-reveal-game"
      >
        <Icon icon="pixel:sparkles" /> PICTURE REVEAL GAME
      </router-link>
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/phone-controller-party-game"
      >
        <Icon icon="pixel:gaming" /> PHONE CONTROLLER PARTY GAME
      </router-link>
      <router-link
        class="internal-link"
        data-sfx="click"
        to="/friday-afterwork-game"
      >
        <Icon icon="pixel:users" /> FRIDAY AFTERWORK GAME
      </router-link>
    </div>

    <div>
      Music: Lo-Bit 10-13 by
      <a
        href="https://freemusicarchive.org/music/holiznapatreon/lo-bit-lofi-gamer-tracks"
        target="_blank"
        >HoliznaPATREON</a
      >
    </div>
    <div class="kofi-link">
      <a href="https://ko-fi.com/V4R823QKXZ" target="_blank"
        ><img
          height="36"
          style="border: 2px solid black; border-radius: 16px; height: 36px"
          src="https://storage.ko-fi.com/cdn/kofi4.png?v=6"
          border="0"
          alt="Buy Me a Coffee at ko-fi.com"
      /></a>
      Help keep PixReveal free
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
import PlatformBar from "@/components/page-ui/PlatformBar.vue";
import { Icon } from "@iconify/vue";

const configStore = useConfigStore();

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
  font-size: 14px;
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

.kofi-link {
  display: flex;
  flex-direction: column;
  gap: 16px;
  place-items: center;
  justify-items: center;
  margin: 0 auto;
  font-size: 12px;
}
</style>
