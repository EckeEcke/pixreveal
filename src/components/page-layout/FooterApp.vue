<template>
  <footer>
    <div class="footer-main">
      <!-- Brand-Block -->
      <div class="brand">
        <div class="brand-text">
          <router-link to="/" class="brand-logo" data-sfx="click">
            PIX<span>REVEAL</span>
          </router-link>
          <p class="brand-claim">
            Free pixel art guessing game. Guess the picture while it gets
            revealed – solo or with friends.
          </p>
        </div>

        <div class="brand-actions">
          <PlatformBar :twitch-live="twitchLive" />

          <div v-if="false" class="kofi-link">
            <a
              href="https://ko-fi.com/V4R823QKXZ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buy Me a Coffee at ko-fi.com"
            >
              <img
                src="/assets/images/kofi.webp"
                alt="Buy Me a Coffee at ko-fi.com"
                width="139"
                height="36"
                loading="lazy"
                decoding="async"
                class="kofi-img"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Link-Spalten (Akkordeon nur auf kleinen Phones) -->
      <nav class="columns" aria-label="Footer">
        <div
          v-for="section in sections"
          :key="section.id"
          class="column"
          :class="[section.color, { open: openId === section.id }]"
        >
          <button
            class="column-toggle"
            type="button"
            data-sfx="click"
            :aria-expanded="openId === section.id"
            :aria-controls="`footer-${section.id}`"
            @click="toggle(section.id)"
          >
            {{ section.title }}
          </button>
          <div :id="`footer-${section.id}`" class="column-body">
            <ul>
              <li v-for="link in section.links" :key="link.to">
                <router-link data-sfx="click" :to="link.to">
                  {{ link.label }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>

    <!-- Unterste Zeile -->
    <div class="footer-bottom">
      <div class="legal">
        <router-link data-sfx="click" to="/privacy">Privacy</router-link>
      </div>
      <div class="credits">
        <span>
          Music: Lo-Bit 10-13 by
          <a
            href="https://freemusicarchive.org/music/holiznapatreon/lo-bit-lofi-gamer-tracks"
            target="_blank"
            rel="noopener"
            >HoliznaPATREON</a
          >
        </span>
        <span>
          © 2026 PixReveal | Code & Design by
          <a
            href="https://eckeecke.github.io"
            target="_blank"
            rel="noopener"
            >Christian Eckardt</a
          >
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";
import PlatformBar from "@/components/page-ui/PlatformBar.vue";

defineProps({
  twitchLive: {
    type: Boolean,
    default: false,
  },
});

const sections = [
  {
    id: "games",
    title: "WAYS TO PLAY",
    color: "c-mint",
    links: [
      { label: "Picture Reveal Game", to: "/picture-reveal-game" },
      { label: "Phone Controller Party Game", to: "/phone-controller-party-game" },
      { label: "Friday Afterwork Game", to: "/friday-afterwork-game" },
    ],
  },
  {
    id: "alternatives",
    title: "ALTERNATIVES",
    color: "c-yellow",
    links: [
      { label: "Jackbox Alternative", to: "/free-jackbox-alternative" },
      { label: "Pixel Guessr Alternative", to: "/free-pixel-guessr-alternative" },
      { label: "Skribbl/Gartic Alternative", to: "/free-skribbl-and-gartic-alternative" },
    ],
  },
  {
    id: "info",
    title: "INFO",
    color: "c-cyan",
    links: [
      { label: "About", to: "/about" },
      { label: "FAQ", to: "/faq" },
      { label: "Blog", to: "/blog" },
      { label: "Partners", to: "/partners" },
    ],
  },
];

// Nur relevant unter 600px – darüber sind alle Spalten per CSS offen
const openId = ref(null);
const toggle = (id) => {
  openId.value = openId.value === id ? null : id;
};
</script>

<style scoped>
footer {
  display: grid;
  gap: 32px;
  margin: 64px auto 32px;
  width: min(100% - 32px, 700px);
  @media (min-width: 1024px) {
    width: min(100% - 32px, 1000px);
  }
  a {
    color: inherit;
  }
}

.footer-main {
  display: grid;
  gap: 32px;
  @media (min-width: 1024px) {
    grid-template-columns: 300px 1fr;
    gap: 48px;
  }
}

/* ---------- Brand ---------- */
.brand {
  display: grid;
  gap: 24px;
  align-content: start;
  justify-items: center;
  text-align: center;

  @media (min-width: 600px) {
    justify-items: start;
    text-align: left;
  }
}

.brand-text {
  display: grid;
  gap: 16px;
  justify-items: inherit;
}

.brand-actions {
  display: grid;
  gap: 16px;
  justify-items: center;

  /* Tablet: Icons und Ko-fi in einer Zeile, linksbündig */
  @media (min-width: 600px) and (max-width: 1023px) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 24px;
  }

  /* Desktop: wieder gestapelt */
  @media (min-width: 1024px) {
    justify-items: start;
  }
}

.brand-logo {
  font-family: "8bit";
  font-size: 20px;
  text-decoration: none;
  color: var(--white);
  span {
    color: var(--primary, #ff4d6d);
  }
}

.brand-claim {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  max-width: 320px;
  opacity: 0.85;
}

.kofi-link {
  display: flex;
}

/* ---------- Columns ---------- */
.columns {
  display: grid;
  border-top: 1px solid rgb(255 255 255 / 12%);
  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    border-top: none;
  }
}

.column {
  border-bottom: 1px solid rgb(255 255 255 / 12%);
  @media (min-width: 600px) {
    border-bottom: none;
  }
}

.column-toggle {
  all: unset;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 0;
  cursor: pointer;
  font-family: var(--font-heading, inherit); /* an deine Headline-/Pixel-Schrift anpassen */
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--col, var(--white));

  /* Chevron */
  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.2s;
    margin-right: 4px;
    margin-bottom: 2px;
  }

  @media (min-width: 600px) {
    padding: 0 0 16px;
    cursor: default;
    &::after {
      display: none;
    }
  }
}

.column.open .column-toggle::after {
  transform: rotate(-135deg);
}

/* Animiertes Auf-/Zuklappen via grid-template-rows */
.column-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
  ul {
    overflow: hidden;
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 12px;
    visibility: hidden;
    transition: visibility 0.25s;
  }
  @media (min-width: 600px) {
    grid-template-rows: 1fr;
    ul {
      visibility: visible;
    }
  }
}

.column.open .column-body {
  grid-template-rows: 1fr;
  ul {
    padding-bottom: 16px;
    visibility: visible;
  }
}

.column-body a {
  font-size: 14px;
  text-decoration: none;
  opacity: 0.85;
  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
}

.c-mint { --col: var(--neon-mint); }
.c-yellow { --col: var(--neon-yellow); }
.c-cyan { --col: var(--neon-cyan); }

/* ---------- Bottom ---------- */
.footer-bottom {
  display: grid;
  gap: 16px;
  justify-items: center;
  text-align: center;
  font-size: 12px;
  @media (min-width: 600px) {
    grid-template-columns: auto 1fr;
    justify-items: stretch;
    align-items: center;
    text-align: right;
    border-top: 1px solid rgb(255 255 255 / 12%);
    padding-top: 24px;
  }
}

.legal {
  display: flex;
  gap: 16px;
  justify-content: center;
  a {
    text-decoration: none;
    opacity: 0.85;
    &:hover {
      text-decoration: underline;
    }
  }
}

.credits {
  display: grid;
  gap: 8px;
  opacity: 0.8;
}
</style>