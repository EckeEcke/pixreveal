<template>
  <ContentPage>
    <main aria-labelledby="blog-heading">
      <h1 id="blog-heading" class="logo">BLOG</h1>
      <div class="subline">PixReveal Updates</div>

      <div class="blog-layout">
        <aside class="blog-sidebar" aria-label="Browse blog updates">
          <nav class="latest-updates" aria-labelledby="latest-heading">
            <h2 id="latest-heading">Latest updates</h2>
            <a v-for="post in latestPosts" :key="post.id" :href="`#${post.id}`">
              <span>{{ post.title }}</span>
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            </a>
          </nav>

          <details class="archive-mobile">
            <summary>Archive</summary>
            <nav class="archive-links" aria-label="Updates by month">
              <a v-for="month in months" :key="month.id" :href="`#${month.id}`">
                <span>{{ month.label }}</span>
                <span class="post-count" :aria-label="`${month.posts.length} updates`">{{ month.posts.length }}</span>
              </a>
            </nav>
          </details>

          <nav class="archive archive-desktop" aria-labelledby="archive-heading">
            <h2 id="archive-heading">Archive</h2>
            <div class="archive-links">
              <a v-for="month in months" :key="month.id" :href="`#${month.id}`">
                <span>{{ month.label }}</span>
                <span class="post-count" :aria-label="`${month.posts.length} updates`">{{ month.posts.length }}</span>
              </a>
            </div>
          </nav>

          <section class="community-box">
            <h2>Feedback or a bug?</h2>
            <p>Share your feedback and talk about PixReveal with other players.</p>
            <a href="https://discord.gg/NuYwabjXUj" target="_blank" rel="noopener noreferrer">Join the Discord <span aria-hidden="true">↗</span></a>
            <a href="https://www.reddit.com/r/pixreveal/" target="_blank" rel="noopener noreferrer">Visit r/pixreveal <span aria-hidden="true">↗</span></a>
          </section>
        </aside>

        <div class="blog-posts">
          <section v-for="month in months" :id="month.id" :key="month.id" class="month-section" :aria-labelledby="`${month.id}-heading`">
            <h2 :id="`${month.id}-heading`" class="month-heading">{{ month.label }}</h2>
            <div class="log-grid">
              <article v-for="post in month.posts" :id="post.id" :key="post.id" class="log-card" :aria-labelledby="`${post.id}-heading`">
                <time class="date" :datetime="post.date">{{ formatDate(post.date) }}</time>
                <h3 :id="`${post.id}-heading`" class="log-title">{{ post.title }}</h3>
                <p><template v-for="(part, index) in post.content" :key="index"><router-link v-if="part.to" :to="part.to">{{ part.text }}</router-link><a v-else-if="part.href" :href="part.href" target="_blank" rel="noopener noreferrer">{{ part.text }}</a><strong v-else-if="part.strong">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template></p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
    <JsonLd :data="blogSchema" />
  </ContentPage>
</template>

<script setup lang="ts">
import ContentPage from "@/components/page-layout/ContentPage.vue";
import JsonLd from "@/components/page-ui/JsonLd";
import { blogPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/data/blogPosts";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long", year: "numeric", timeZone: "UTC",
});
const formatDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`));
const latestPosts = blogPosts.slice(0, 4);
const months: { id: string; label: string; posts: BlogPost[] }[] = [];
for (const post of blogPosts) {
  const id = `updates-${post.date.slice(0, 7)}`;
  let month = months.find(group => group.id === id);
  if (!month) {
    month = { id, label: monthFormatter.format(new Date(`${post.date}T00:00:00Z`)), posts: [] };
    months.push(month);
  }
  month.posts.push(post);
}

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "PixReveal Blog",
  description: "Features, patch notes, and multiplayer announcements from PixReveal.",
  url: "https://www.pixreveal.com/blog",
  inLanguage: "en",
  blogPost: blogPosts.map(post => ({
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    url: `https://www.pixreveal.com/blog#${post.id}`,
    author: { "@type": "Person", name: "Christian Eckardt", url: "https://www.pixreveal.com/about" },
  })),
};
</script>

<style scoped>
.logo {
  font-family: inherit;
  text-align: start;
  margin-bottom: 4px;
  font-weight: 900;
  font-size: 32px;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6);
}

.subline {
  color: var(--primary);
  text-transform: uppercase;
}

.blog-layout {
  display: grid;
  gap: 32px;
  margin-top: 32px;
  align-items: start;
}

.blog-posts,
.blog-sidebar {
  min-width: 0;
}

.blog-sidebar {
  display: grid;
  gap: 32px;
}

.blog-sidebar h2 {
  margin: 0 0 16px;
  font-size: 18px;
  line-height: 1.35;
}

.latest-updates,
.archive-desktop,
.community-box {
  display: none;
}

.archive-links {
  display: grid;
}

.archive-links a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 0;
  font-size: 14px;
  text-decoration: none;
  color: inherit;
}

.archive-mobile {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.archive-mobile summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}

.archive-mobile summary::-webkit-details-marker {
  display: none;
}

.archive-mobile summary::after {
  content: "";
  width: 7px;
  height: 7px;
  margin: 0 3px 4px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
}

.archive-mobile[open] summary::after {
  transform: rotate(225deg);
  margin-bottom: -4px;
}

.archive-mobile .archive-links {
  padding-bottom: 12px;
}

.post-count {
  font-size: 12px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

.month-section,
.log-card {
  scroll-margin-top: 24px;
}

.month-section + .month-section {
  margin-top: 40px;
}

.month-heading {
  margin: 0 0 20px;
  font-size: 18px;
  line-height: 1.4;
}

.log-grid {
  display: grid;
  gap: 24px;
}

.log-card {
  padding: 0 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  min-width: 0;
  overflow-wrap: anywhere;
}

.log-card p {
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;
}

.date {
  display: block;
  margin-bottom: 10px;
  opacity: 0.65;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.log-title {
  margin: 0 0 12px;
  font-size: 21px;
  line-height: 1.4;
}

a {
  color: var(--primary);
  font-weight: 700;
}

a:focus-visible,
.archive-mobile summary:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

@media (min-width: 1024px) {
  .blog-layout {
    grid-template-columns: minmax(0, 1fr) 250px;
    column-gap: 48px;
  }

  .blog-posts {
    grid-column: 1;
    grid-row: 1;
  }

  .blog-sidebar {
    grid-column: 2;
    grid-row: 1;
  }

  .latest-updates,
  .archive-desktop,
  .community-box {
    display: block;
  }

  .archive-mobile {
    display: none;
  }

  .latest-updates a {
    display: grid;
    gap: 6px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: inherit;
    text-decoration: none;
    font-size: 14px;
    line-height: 1.5;
  }

  .latest-updates a:first-of-type {
    padding-top: 0;
  }

  .latest-updates time {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.6;
  }

  .archive-links {
    display: grid;
    gap: 0;
  }

  .archive-links a {
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .blog-sidebar a:hover {
    color: var(--primary);
  }

  .community-box {
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(15, 12, 29, 0.75);
  }

  .community-box p {
    margin: 0 0 16px;
    font-size: 14px;
  }

  .community-box a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 0;
    font-size: 14px;
    text-decoration: none;
  }
}
</style>
