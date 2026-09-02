<template>
  <div>
    <div class="block-heading">
      <Icon icon="pixel:link-solid" class="link-icon" />
      Quick Links
    </div>
    <div class="quick-links-grid">
      <button class="quick-link" data-sfx="click" @click="openManual">
        <Icon icon="pixel:book" class="quick-link-icon icon-blue" />
        <span>How to Play</span>
      </button>

      <router-link class="quick-link" data-sfx="click" to="/hall-of-fame">
        <Icon icon="pixel:crown-solid" class="quick-link-icon icon-gold" />
        <span>Hall of Fame</span>
      </router-link>

      <router-link class="quick-link" data-sfx="click" to="/user-gallery">
        <Icon icon="pixel:image-solid" class="quick-link-icon icon-pink" />
        <span>User Art Gallery</span>
      </router-link>

      <router-link class="quick-link" data-sfx="click" to="/faq">
        <Icon icon="pixel:question" class="quick-link-icon icon-teal" />
        <span>FAQ</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from "@/stores/config";
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
.block-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12px;
  .link-icon {
    color: var(--neon-blue, #38bdf8);
  }
}
.bento-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.quick-links-grid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 400px) {
    grid-template-columns: 1fr 1fr;
  }
  gap: 10px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-display);
  font-size: 13px;
  text-decoration: none;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s all;
  text-align: left;
  min-width: 0;
  font-weight: 700;
}

.quick-link span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-link:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.25);
}

.quick-link-icon {
  font-size: 16px;
  flex: 0 0 auto;
}

.icon-blue {
  color: var(--neon-blue, #38bdf8);
}

.icon-gold {
  color: var(--neon-yellow, #ffb020);
}

.icon-pink {
  color: var(--neon-pink, #ec4899);
}

.icon-teal {
  color: var(--neon-cyan, #2dd4bf);
}

@container (max-width: 320px) {
  .quick-link {
    font-size: 12px;
    padding: 10px 12px;
    gap: 6px;
  }

  .quick-link-icon {
    font-size: 14px;
  }
}

@container (min-width: 480px) {
  .quick-link {
    font-size: 15px;
    padding: 16px 18px;
    gap: 10px;
    border-radius: 10px;
  }

  .quick-link-icon {
    font-size: 20px;
  }
}
</style>