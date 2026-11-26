<template>
  <SeoLandingView :page="garticLanding" />
</template>

<script setup lang="ts">
import SeoLandingView from "@/components/page-layout/SeoLandingView.vue";
import { garticLanding } from "@/data/seoLandingPages";
</script>
