<template>
  <SeoLandingView :page="jackboxLanding" />
</template>

<script setup lang="ts">
import SeoLandingView from "@/components/page-layout/SeoLandingView.vue";
import { jackboxLanding } from "@/data/seoLandingPages";
</script>
