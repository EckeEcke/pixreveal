<template>
  <div class="seo-landing">
    <ContentPage>
      <main>
        <section class="hero" aria-labelledby="landing-heading">
          <div class="hero-copy">
            <p class="eyebrow">{{ page.eyebrow }}</p>
            <h1 id="landing-heading">{{ page.heading }}<br /><span>{{ page.headingAccent }}</span></h1>
            <p class="hero-description">{{ page.description }}</p>
            <div class="actions">
              <ButtonPrimary
                v-if="page.primaryAction.kind === 'solo'"
                :disabled="isStarting"
                class="primary-action"
                data-sfx="click"
                @clicked="$emit('play')"
              >
                <Icon icon="pixel:play-solid" aria-hidden="true" />
                {{ isStarting ? 'Loading game…' : page.primaryAction.label }}
              </ButtonPrimary>
              <ButtonLinkPrimary v-else :link="page.primaryAction.to" class="primary-action">
                <Icon icon="pixel:play-solid" aria-hidden="true" />
                {{ page.primaryAction.label }}
              </ButtonLinkPrimary>
              <ButtonLinkSecondary :link="page.secondaryAction.to">
                {{ page.secondaryAction.label }}
              </ButtonLinkSecondary>
            </div>
            <p v-if="startError" class="start-error" role="alert">{{ startError }}</p>
            <ul class="quick-facts" aria-label="Game features">
              <li v-for="fact in page.facts" :key="fact">
                <Icon icon="pixel:check" aria-hidden="true" /> {{ fact }}
              </li>
            </ul>
          </div>
          <img
            class="party-image"
            :src="page.image.src"
            :alt="page.image.alt"
            :width="page.image.width"
            :height="page.image.height"
            fetchpriority="high"
            decoding="async"
          />
        </section>

        <section id="how-to-play" class="how-section section-divider" aria-labelledby="how-heading">
          <div>
            <p class="eyebrow">{{ page.howEyebrow }}</p>
            <h2 id="how-heading">{{ page.howHeading }}</h2>
          </div>
          <div class="how-content">
            <ol class="steps">
              <li v-for="(step, index) in page.steps" :key="step.title">
                <span class="step-number" aria-hidden="true">0{{ index + 1 }}</span>
                <div>
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </li>
            </ol>
            <figure class="trailer-block">
              <YoutubeEmbed
                video-id="YQl5jOqm2n0"
                thumbnail-url="/assets/images/trailer-preview.webp"
                badge="Trailer"
                :priority="false"
              />
            </figure>
          </div>
        </section>

        <section class="topic-section section-divider" aria-labelledby="topic-heading">
          <div>
            <p class="eyebrow">{{ page.topic.eyebrow }}</p>
            <h2 id="topic-heading">{{ page.topic.heading }}</h2>
          </div>
          <div class="topic-copy">
            <p v-for="paragraph in page.topic.paragraphs" :key="paragraph">{{ paragraph }}</p>
            <router-link :to="page.topic.link.to" class="topic-link">
              {{ page.topic.link.label }} <Icon icon="pixel:arrow-right-solid" aria-hidden="true" />
            </router-link>
          </div>
        </section>

        <section class="ways-section section-divider" aria-labelledby="ways-heading">
          <p class="eyebrow">YOUR GAME, YOUR WAY</p>
          <h2 id="ways-heading">Play solo. Bring your friends.</h2>
          <p class="section-description">{{ page.waysDescription }}</p>
          <div class="ways-grid">
            <router-link
              v-for="mode in page.playWays"
              :key="mode.to"
              :to="mode.to"
              class="way-card"
              data-sfx="click"
            >
              <Icon :icon="mode.icon" class="way-icon" aria-hidden="true" />
              <h3>{{ mode.title }}</h3>
              <p>{{ mode.description }}</p>
              <span class="way-action">
                {{ mode.action }} <Icon icon="pixel:arrow-right-solid" aria-hidden="true" />
              </span>
            </router-link>
          </div>
        </section>

        <section class="questions section-divider" aria-labelledby="questions-heading">
          <div class="questions-intro">
            <p class="eyebrow">BEFORE YOUR FIRST GUESS</p>
            <h2 id="questions-heading">A little more<br />about the game.</h2>
            <p>{{ page.faqIntro }}</p>
          </div>
          <div class="question-list">
            <details v-for="item in page.faqs" :key="item.question">
              <summary>
                {{ item.question }}<Icon icon="pixel:chevron-down" aria-hidden="true" />
              </summary>
              <p>{{ item.answer }}</p>
            </details>
          </div>
        </section>

        <section class="final-invite section-divider" aria-labelledby="ready-heading">
          <div>
            <h2 id="ready-heading">{{ page.ctaHeading }}</h2>
            <p>{{ page.ctaDescription }}</p>
          </div>
          <ButtonPrimary
            v-if="page.primaryAction.kind === 'solo'"
            :disabled="isStarting"
            class="primary-action"
            data-sfx="click"
            @clicked="$emit('play')"
          >
            <Icon icon="pixel:play-solid" aria-hidden="true" />
            {{ isStarting ? 'Loading game…' : page.primaryAction.label }}
          </ButtonPrimary>
          <ButtonLinkPrimary v-else :link="page.primaryAction.to" class="primary-action">
            <Icon icon="pixel:play-solid" aria-hidden="true" />
            {{ page.primaryAction.label }}
          </ButtonLinkPrimary>
        </section>
      </main>
      <JsonLd :data="faqSchema" />
    </ContentPage>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import ContentPage from "@/components/page-layout/ContentPage.vue";
import YoutubeEmbed from "@/components/page-ui/YoutubeEmbed.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonLinkPrimary from "@/components/page-ui/ButtonLinkPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import JsonLd from "@/components/page-ui/JsonLd";
import type { SeoLandingContent } from "@/data/seoLandingPages";

const props = withDefaults(defineProps<{
  page: SeoLandingContent;
  isStarting?: boolean;
  startError?: string;
}>(), { isStarting: false, startError: "" });
defineEmits<{ play: [] }>();

const faqSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: props.page.faqs.map(item => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}));
</script>

<style scoped>
.seo-landing { width: 100%; }
main { color: var(--text-main); }
.hero, .how-content, .topic-section, .questions { display: grid; gap: 32px; }
.hero { align-items: center; }
.hero-copy, .how-section > div, .trailer-block, .questions > div { min-width: 0; }
.eyebrow { margin: 0 0 6px; color: var(--primary); font-size: 10px; font-weight: 800; letter-spacing: 0.12em; line-height: 1.5; }
h1 { margin: 0; color: #fff; font-family: var(--font-display), sans-serif; font-size: clamp(30px, 4vw, 46px); font-weight: 900; line-height: 1.12; letter-spacing: -0.035em; text-align: left; text-transform: none; text-shadow: none; }
h1 > span { color: var(--primary); }
h2 { margin: 0; color: #fff; font-size: clamp(22px, 2.5vw, 28px); line-height: 1.25; font-weight: 800; letter-spacing: -0.02em; text-shadow: none; }
h3 { margin: 0; color: #fff; font-size: 16px; line-height: 1.35; }
p { line-height: 1.6; }
.hero-description { max-width: 43ch; margin: 20px 0 24px; color: rgba(255, 255, 255, 0.76); font-size: 16px; }
.actions { display: grid; gap: 10px; }
.actions > *, .final-invite > :is(button, a) { min-height: 48px; box-sizing: border-box; font-size: 14px; }
.actions svg, .final-invite > :is(button, a) svg { font-size: 19px; }
.primary-action { padding: 14px 18px; border: 2px solid #000; }
.quick-facts { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 18px 0 0; padding: 0; list-style: none; color: rgba(255, 255, 255, 0.65); font-size: 11px; }
.quick-facts li { display: flex; align-items: center; gap: 5px; }
.quick-facts svg { color: var(--neon-mint); font-size: 14px; }
.start-error { color: var(--primary); font-size: 13px; }
.party-image { display: block; width: 100%; height: auto; border-radius: 8px; }
.section-divider { margin-top: 48px; padding-top: 36px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
#how-to-play { scroll-margin-top: 24px; }
.how-content { margin-top: 24px; }
.steps { display: grid; gap: 20px; margin: 0; padding: 0; list-style: none; }
.steps li { display: flex; align-items: flex-start; gap: 14px; }
.step-number { display: flex; flex: 0 0 32px; justify-content: center; align-items: center; height: 32px; border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); border-radius: 6px; background: color-mix(in srgb, var(--primary) 8%, transparent); color: var(--primary); font-size: 11px; font-weight: 800; }
.steps h3 { font-size: 14px; }
.steps p { margin: 5px 0 0; color: rgba(255, 255, 255, 0.65); font-size: 13px; }
.trailer-block { margin: 0; }
.topic-copy { min-width: 0; }
.topic-copy p { margin: 0 0 16px; color: rgba(255, 255, 255, 0.7); font-size: 14px; }
.topic-link { display: inline-flex; align-items: center; gap: 8px; color: #fff; font-size: 13px; text-underline-offset: 4px; }
.topic-link svg { flex-shrink: 0; color: var(--primary); }
.section-description { max-width: 65ch; margin: 12px 0 24px; color: rgba(255, 255, 255, 0.65); font-size: 14px; }
.ways-grid { display: grid; gap: 12px; }
.way-card { display: flex; flex-direction: column; min-width: 0; gap: 12px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; background: rgba(255, 255, 255, 0.025); text-decoration: none; transition: border-color 0.2s, background-color 0.2s; }
.way-card:hover { border-color: color-mix(in srgb, var(--primary) 50%, transparent); background-color: color-mix(in srgb, var(--primary) 4%, transparent); }
.way-icon { color: var(--primary); font-size: 24px; }
.way-card h3 { font-size: 15px; }
.way-card p { margin: 0 0 6px; color: rgba(255, 255, 255, 0.65); font-size: 13px; }
.way-action { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; color: #fff; font-size: 11px; font-weight: 700; }
.questions-intro > p:last-child { max-width: 30ch; margin: 16px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; }
.question-list details { border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
.question-list details:first-child { border-top: 1px solid rgba(255, 255, 255, 0.12); }
.question-list summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 17px 0; color: #fff; font-size: 13px; font-weight: 700; line-height: 1.5; list-style: none; cursor: pointer; }
.question-list summary::-webkit-details-marker { display: none; }
.question-list summary svg { flex-shrink: 0; color: var(--primary); transition: transform 0.2s; }
.question-list details[open] summary svg { transform: rotate(180deg); }
.question-list details > p { margin: 0; padding: 0 24px 18px 0; color: rgba(255, 255, 255, 0.65); font-size: 13px; }
.final-invite { display: flex; flex-direction: column; gap: 20px; }
.final-invite h2 { font-size: 22px; }
.final-invite p { margin: 8px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 13px; }
main :is(a, button, summary):focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
@media (min-width: 480px) { .actions { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) {
  .hero { grid-template-columns: 1.15fr 0.85fr; gap: 32px; }
  .how-content { grid-template-columns: 1fr 1fr; align-items: start; }
  .ways-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .topic-section, .questions { grid-template-columns: 0.8fr 1.2fr; gap: 40px; }
  .final-invite { flex-direction: row; align-items: center; justify-content: space-between; }
  .final-invite > :is(button, a) { flex-shrink: 0; min-width: 170px; }
}
@media (max-width: 1023px) {
  .seo-landing :deep(.content-view) { padding: 52px 20px 24px; }
  .seo-landing :deep(.close-btn-wrapper) { top: -52px; right: -20px; }
  .hero { gap: 28px; }
  .hero-description { margin-top: 16px; }
}
@media (prefers-reduced-motion: reduce) { main :is(a, button, summary svg) { transition: none; } }
</style>

