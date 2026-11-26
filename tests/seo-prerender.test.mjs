import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { buildLandingHtml, collectStyles } from '../scripts/prerender-html.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let server, renderPage, landingDefinitions, prerenderDefinitions, blogPosts, template;

before(async () => {
  server = await createServer({
    root, configFile: false, plugins: [vue()],
    resolve: { alias: { '@': resolve(root, 'src') } },
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  });
  ({ renderPage, landingDefinitions, prerenderDefinitions } = await server.ssrLoadModule('/src/prerender.ts'));
  ({ blogPosts } = await server.ssrLoadModule('/src/data/blogPosts.ts'));
  template = await readFile(resolve(root, 'index.html'), 'utf8');
});
after(async () => { await server?.close(); });

test('all six pages include their own content, metadata, links and valid structured data before JavaScript', async () => {
  assert.equal(landingDefinitions.length, 6);
  const titles = new Set();
  const topics = new Set();
  for (const definition of landingDefinitions) {
    const rendered = await renderPage(definition.path);
    const html = buildLandingHtml(template, definition, rendered, ['assets/landing.css']);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
    assert.ok(html.includes(`href="${definition.meta.canonical}"`));
    assert.ok(html.includes('name="robots" content="index, follow"'));
    assert.ok(html.includes('data-prerendered="true"'));
    assert.ok(html.includes(definition.page.topic.heading));
    assert.ok(html.includes(`href="${definition.page.topic.link.to.replaceAll('&', '&amp;')}"`));
    assert.ok(html.includes('href="/assets/landing.css"'));
    assert.ok(!html.includes('as="fetch"'));
    assert.ok(!html.includes('<iframe'));
    assert.ok(!html.includes('src="https://i.ytimg.com'));
    const preloads = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map(match => match[0]);
    assert.equal(preloads.length, 1);
    assert.ok(preloads[0].includes(definition.page.image.src));
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    const faq = schemas.find(schema => schema['@type'] === 'FAQPage');
    assert.deepEqual(faq.mainEntity.map(item => item.name), definition.page.faqs.map(item => item.question));
    assert.deepEqual(faq.mainEntity.map(item => item.acceptedAnswer.text), definition.page.faqs.map(item => item.answer));
    assert.ok(schemas.find(schema => schema['@type'] === 'VideoObject').thumbnailUrl[0].startsWith('https://'));
    titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
    topics.add(definition.page.topic.heading);
  }
  assert.equal(titles.size, 6);
  assert.equal(topics.size, 6);
});

test('manifest styles include transitive dependencies once, including cyclic imports', () => {
  assert.deepEqual(collectStyles({
    entry: { css: ['page.css'], imports: ['shared'] },
    shared: { css: ['base.css', 'page.css'], imports: ['entry'] },
  }, 'entry'), ['page.css', 'base.css']);
  assert.throws(() => collectStyles({}, 'missing'), /Missing client manifest/);
});

test('the blog includes every update, archive anchors, metadata and Blog structured data without JavaScript', async () => {
  const definition = prerenderDefinitions.find(page => page.path === '/blog');
  const rendered = await renderPage('/blog');
  const html = buildLandingHtml(template, definition, rendered, ['assets/blog.css']);
  assert.equal((html.match(/<article\b/g) ?? []).length, blogPosts.length);
  assert.ok(blogPosts.length > 0);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
  assert.ok(html.includes('href="https://www.pixreveal.com/blog"'));
  assert.ok(html.includes('name="robots" content="index, follow"'));
  assert.ok(html.includes('data-prerendered="true"'));
  assert.ok(html.includes('href="/assets/blog.css"'));
  assert.ok(!html.includes('rel="preload"'));
  assert.ok(html.includes('href="/editor"'));
  assert.ok(html.includes('<footer'));
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
  const blog = schemas.find(schema => schema['@type'] === 'Blog');
  assert.deepEqual(blog.blogPost.map(post => post.headline), blogPosts.map(post => post.title));
  assert.deepEqual(blog.blogPost.map(post => post.datePublished), blogPosts.map(post => post.date));
  for (const post of blogPosts) {
    assert.ok(html.includes(`id="${post.id}"`), post.id);
    assert.ok(html.includes(`datetime="${post.date}"`), post.id);
    assert.ok(html.includes(`href="#updates-${post.date.slice(0, 7)}"`), post.id);
  }
  for (const post of blogPosts.slice(0, 4)) assert.ok(html.includes(`href="#${post.id}"`));
  assert.equal(new Set(blogPosts.map(post => post.id)).size, blogPosts.length);
});

test('metadata is escaped as HTML without corrupting ampersands in titles or descriptions', () => {
  const html = buildLandingHtml(template, {
    meta: { title: 'A & B <game>', description: 'A "quote" & <tag>', canonical: 'https://example.com/a', robots: 'index, follow' },
    page: { image: { src: '/image.webp' } },
  }, '<main>Content</main>', []);
  assert.ok(html.includes('<title>A &amp; B &lt;game&gt;</title>'));
  assert.ok(html.includes('content="A &quot;quote&quot; &amp; &lt;tag&gt;"'));
});

test('Vercel serves clean landing HTML paths while retaining the SPA and API routing', async () => {
  const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
  assert.equal(config.cleanUrls, true);
  const fallback = new RegExp(`^${config.rewrites.find(rule => rule.destination === '/').source}$`);
  for (const definition of prerenderDefinitions) {
    assert.equal(fallback.test(definition.path), false, definition.path);
    assert.equal(fallback.test(definition.path + '/'), false, definition.path);
  }
  for (const path of ['/singleplayer', '/classic', '/play-party', '/about']) assert.equal(fallback.test(path), true);
  for (const path of ['/api/user-art', '/assets/game.js']) assert.equal(fallback.test(path), false);
});
