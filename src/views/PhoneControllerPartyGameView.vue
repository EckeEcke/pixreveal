<template>
  <SeoLandingView :page="phoneControllerLanding" />
</template>

<script setup lang="ts">
import SeoLandingView from "@/components/page-layout/SeoLandingView.vue";
import { phoneControllerLanding } from "@/data/seoLandingPages";
</script>
