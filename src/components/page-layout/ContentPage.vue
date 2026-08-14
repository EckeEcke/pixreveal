<template>
  <div class="content-page">
    <div class="content-view">
      <div class="content-wrapper">
        <div class="close-btn-wrapper">
          <router-link to="/" data-sfx="back" class="close-btn">
            <Icon icon="pixel:window-close-solid" />
          </router-link>
        </div>
        <slot></slot>
      </div>
    </div>
    <FooterApp />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import FooterApp from "@/components/page-layout/FooterApp.vue";
</script>

<style scoped>
.content-page {
  width: 100%;
}

.content-view::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -60%;
  width: 30%;
  height: 300%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(30deg);
  animation: shine 4s forwards;
  pointer-events: none;
}

.content-view {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 32px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.content-wrapper {
  position: relative;
}

.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  top: -32px;
  right: -32px;
  z-index: 1;
}
</style>
