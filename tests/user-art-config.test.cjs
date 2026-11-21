const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { createPinia, setActivePinia } = require('pinia');
function setup(fetchImpl) {
  setActivePinia(createPinia());
  const builtin = { name: 'Original', category: 'Gaming', data: [[1]], primaryColor: 1 };
  const errors = [];
  const code = ts.transpileModule(fs.readFileSync('src/stores/config.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('exports', 'require', 'fetch', code)(module.exports, id => {
    if (id === 'pinia' || id === 'vue') return require(id);
    if (id.includes('drawings.json')) return { default: [builtin] };
    if (id === 'vue3-toastify') return { toast: { error: message => errors.push(message) } };
    return { useSoundStore: () => ({ playSound() {} }) };
  }, fetchImpl);
  return { store: module.exports.useConfigStore(), builtin, errors };
}
test('enabling user art waits for the shared request and makes it playable', async () => {
  let resolve, calls = 0;
  const h = setup(url => { assert.equal(url, '/api/user-art'); calls++; return new Promise(done => { resolve = done; }); });
  const enable = h.store.setIncludeUgc(true);
  const ready = h.store.ensureUgcReady();
  assert.equal(h.store.ugcLoading, true); assert.equal(calls, 1);
  const art = { ...h.builtin, name: 'User drawing' };
  resolve({ ok: true, json: async () => [art] });
  await enable; assert.equal(await ready, true);
  assert.equal(h.store.ugcLoading, false); assert.equal(h.store.filteredDrawings.length, 2);
  await h.store.setIncludeUgc(false); assert.equal(h.store.filteredDrawings.length, 1);
  await h.store.setIncludeUgc(true); assert.equal(calls, 1);
});
test('failed loads do not enable user art or become a cached successful load', async () => {
  let calls = 0;
  const h = setup(async () => { calls++; return { ok: false, status: 503 }; });
  await h.store.setIncludeUgc(true);
  assert.equal(h.store.includeUgc, false); assert.equal(h.store.ugcLoaded, false); assert.equal(h.errors.length, 1);
  await h.store.setIncludeUgc(true); assert.equal(calls, 2);
});
