<template>
  <div class="content-view">
    <div class="content-wrapper">
      <div class="close-btn-wrapper">
        <button @click="$router.push('/')" data-sfx="click" class="close-btn">
          <Icon icon="pixel:window-close-solid" />
        </button>
      </div>
      <slot></slot>
    </div>
  </div>
  <FooterApp />
</template>

<script setup>
import { Icon } from "@iconify/vue";
import FooterApp from "@/components/FooterApp.vue";
</script>

<style scoped>
.content-view {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 32px;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
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
