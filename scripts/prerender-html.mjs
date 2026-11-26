export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

export function collectStyles(manifest, entry) {
  const styles = new Set();
  const visited = new Set();
  const visit = key => {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Missing client manifest entry: ${key}`);
    for (const file of chunk.css ?? []) styles.add(file);
    for (const dependency of chunk.imports ?? []) visit(dependency);
  };
  visit(entry);
  return [...styles];
}

export function buildLandingHtml(template, { meta, page }, rendered, styles) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  html = html.replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(meta.description)}">`);
  for (const prefix of ['og', 'twitter']) {
    for (const [key, value] of Object.entries({ title: meta.title, description: meta.description, url: meta.canonical })) {
      html = html.replace(new RegExp(`<meta\\s+property="${prefix}:${key}"[^>]*>`),
        `<meta property="${prefix}:${key}" content="${escapeHtml(value)}">`);
    }
  }
  const head = [
    `<meta name="robots" content="${escapeHtml(meta.robots)}">`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}">`,
    ...(page?.image ? [`<link rel="preload" as="image" href="${escapeHtml(page.image.src)}" fetchpriority="high">`] : []),
    ...styles.filter(file => !html.includes(`href="/${file}"`)).map(file => `<link rel="stylesheet" href="/${escapeHtml(file)}">`),
  ].join('\n    ');
  html = html.replace('</head>', `${head}\n  </head>`);
  // The original noscript text describes the SPA; these pages have their own full content.
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  if (!html.includes('<div id="app"></div>')) throw new Error('Missing app mount point in client HTML');
  return html.replace('<div id="app"></div>', `<div id="app" data-prerendered="true">${rendered}</div>`);
}
