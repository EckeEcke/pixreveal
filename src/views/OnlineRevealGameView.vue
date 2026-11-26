<template>
  <SeoLandingView :page="pictureRevealLanding" />
</template>

<script setup lang="ts">
import SeoLandingView from "@/components/page-layout/SeoLandingView.vue";
import { pictureRevealLanding } from "@/data/seoLandingPages";
</script>
