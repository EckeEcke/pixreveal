const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { effectScope, ref, nextTick } = require('vue');
function previews(count = 2) {
  const pending = [], created = [], revoked = [];
  class Canvas {
    getContext() { return { clearRect() {}, fillRect() {}, strokeRect() {} }; }
    convertToBlob() { return new Promise((resolve, reject) => pending.push({ resolve, reject })); }
  }
  const code = ts.transpileModule(fs.readFileSync('src/composables/useDrawingImageUrls.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  const urls = { createObjectURL() { const url = 'blob:' + created.length; created.push(url); return url; }, revokeObjectURL: url => revoked.push(url) };
  new Function('exports', 'require', 'OffscreenCanvas', 'URL', code)(module.exports, id => id === 'vue' ? require('vue') : { default: { 1: '#000' } }, Canvas, urls);
  const drawings = ref(Array.from({ length: count }, () => ({ data: [[1]] })));
  const scope = effectScope();
  const state = scope.run(() => module.exports.useDrawingImageUrls(drawings));
  return { state, scope, drawings, pending, created, revoked };
}
async function waitFor(fn) {
  for (let i = 0; i < 100; i++) { if (fn()) return; await new Promise(resolve => setTimeout(resolve, 1)); }
  assert.fail('Preview operation did not finish');
}
test('completed previews are published before remaining previews finish', async () => {
  const h = previews();
  try {
    h.pending[0].resolve({});
    await waitFor(() => h.pending.length === 2);
    assert.ok(h.state.imageUrls.value[0]);
    assert.equal(h.state.imageUrls.value[1], '');
    assert.equal(h.state.isGenerating.value, true);
    h.pending[1].resolve({});
    await waitFor(() => !h.state.isGenerating.value);
    assert.equal(h.state.imageUrls.value.filter(Boolean).length, 2);
  } finally { h.scope.stop(); }
  assert.deepEqual(h.revoked, h.created);
});
test('changing drawings cancels old work and revokes its URLs', async () => {
  const h = previews();
  try {
    h.pending[0].resolve({});
    await waitFor(() => h.pending.length === 2);
    h.drawings.value = [{ data: [[1]] }];
    await nextTick();
    assert.deepEqual(h.revoked, ['blob:0']);
    h.pending[1].resolve({});
    h.pending[2].resolve({});
    await waitFor(() => !h.state.isGenerating.value);
    assert.deepEqual(h.state.imageUrls.value, ['blob:1']);
  } finally { h.scope.stop(); }
  assert.deepEqual(h.revoked, h.created);
});
test('leaving during generation prevents late URLs from leaking', async () => {
  const h = previews(1); h.scope.stop(); h.pending[0].resolve({});
  await nextTick(); await new Promise(resolve => setTimeout(resolve, 1));
  assert.deepEqual(h.created, []);
});
test('one failed image does not prevent later previews from appearing', async () => {
  const h = previews();
  try {
    h.pending[0].reject(new Error('Bad image'));
    await waitFor(() => h.pending.length === 2);
    h.pending[1].resolve({});
    await waitFor(() => !h.state.isGenerating.value);
    assert.equal(h.state.imageUrls.value[0], '');
    assert.ok(h.state.imageUrls.value[1]);
  } finally { h.scope.stop(); }
});
