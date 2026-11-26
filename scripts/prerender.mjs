import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { buildLandingHtml, collectStyles } from './prerender-html.mjs';

process.env.NODE_ENV = 'production';
const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = resolve(root, 'dist');
const [template, manifestSource] = await Promise.all([
  readFile(resolve(outDir, 'index.html'), 'utf8'),
  readFile(resolve(outDir, '.vite/manifest.json'), 'utf8'),
]);
const manifest = JSON.parse(manifestSource);
const server = await createServer({
  root,
  configFile: false,
  mode: 'production',
  plugins: [vue()],
  optimizeDeps: { noDiscovery: true, entries: [] },
  resolve: { alias: { '@': resolve(root, 'src') } },
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
});

try {
  const { prerenderDefinitions, renderPage } = await server.ssrLoadModule('/src/prerender.ts');
  for (const definition of prerenderDefinitions) {
    const styles = [...new Set([...collectStyles(manifest, 'index.html'), ...collectStyles(manifest, definition.view)])];
    const rendered = await renderPage(definition.path);
    const html = buildLandingHtml(template, definition, rendered, styles);
    const css = (await Promise.all(styles.map(file => readFile(resolve(outDir, file), 'utf8')))).join('\n');
    const scopes = new Set([...rendered.matchAll(/\b(data-v-[a-f0-9]+)(?=[\s=>])/g)].map(match => match[1]));
    for (const scope of scopes) {
      if (!css.includes(`[${scope}]`)) throw new Error(`Missing prerender styles for ${scope} on ${definition.path}`);
    }
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    if (!schemas.some(schema => schema['@type'] === definition.requiredSchema)) throw new Error(`Missing ${definition.requiredSchema} data on ${definition.path}`);
    await writeFile(resolve(outDir, `${definition.path.slice(1)}.html`), html);
    console.log(`Prerendered ${definition.path}`);
  }
} finally {
  await server.close();
}
