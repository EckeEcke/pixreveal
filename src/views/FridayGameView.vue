<template>
  <SeoLandingView :page="afterworkLanding" />
</template>

<script setup lang="ts">
import SeoLandingView from "@/components/page-layout/SeoLandingView.vue";
import { afterworkLanding } from "@/data/seoLandingPages";
</script>
