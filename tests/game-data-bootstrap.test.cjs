const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

const moduleUnderTest = { exports: {} };
new Function('exports', ts.transpileModule(
  fs.readFileSync('src/utils/gameDataBootstrap.ts', 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText)(moduleUnderTest.exports);
const { createGameDataBootstrap } = moduleUnderTest.exports;

function setup() {
  const calls = [];
  let deferred;
  const bootstrap = createGameDataBootstrap({
    daily: () => calls.push('daily'),
    scores: () => calls.push('scores'),
    userArt: () => calls.push('userArt'),
    defer: load => { deferred = load; calls.push('scheduled'); return () => { deferred = undefined; }; },
  });
  return { bootstrap, calls, flush: () => deferred?.() };
}

test('landing navigation makes no game API requests; entering the game warms data once', () => {
  const h = setup();
  h.bootstrap.enterRoute(true);
  h.bootstrap.enterRoute(true);
  assert.deepEqual(h.calls, []);
  h.bootstrap.enterRoute(false);
  assert.deepEqual(h.calls, ['daily', 'scores', 'scheduled']);
  h.flush();
  assert.deepEqual(h.calls, ['daily', 'scores', 'scheduled', 'userArt']);
  h.bootstrap.enterRoute(true);
  h.bootstrap.enterRoute(false);
  assert.equal(h.calls.length, 4);
});

test('direct game navigation keeps the existing data warmup and teardown cancels pending user art', () => {
  const h = setup();
  h.bootstrap.enterRoute(false);
  assert.deepEqual(h.calls, ['daily', 'scores', 'scheduled']);
  h.bootstrap.dispose();
  h.flush();
  assert.deepEqual(h.calls, ['daily', 'scores', 'scheduled']);
});
