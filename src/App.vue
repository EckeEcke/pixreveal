<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>

</script>

<style>
body {
  margin: 0;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: "Inter", sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
}

</style>
