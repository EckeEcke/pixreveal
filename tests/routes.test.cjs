const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { createRouter, createMemoryHistory } = require('vue-router');

function routes() {
  let options;
  const source = fs.readFileSync('src/router/index.ts', 'utf8')
    .replace('import.meta.env.BASE_URL', '"/"');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  const dependencies = {
    createWebHistory: createMemoryHistory,
    createRouter(value) {
      options = value;
      return { beforeEach() {}, onError() {}, afterEach() {} };
    },
  };
  new Function('exports', 'require', code)(module.exports, id =>
    id === 'vue-router' ? dependencies : { default: { render: () => null } },
  );
  return createRouter({ ...options, history: createMemoryHistory() });
}

test('old friend-duel links resolve to the regular not-found page', () => {
  const router = routes();
  for (const path of [
    '/challenge?sessionId=old', '/challenge-game', '/challenge-classic',
    '/challenge-gravity', '/challenge-inspect', '/gameover-challenge?sessionId=old',
  ]) {
    assert.equal(router.resolve(path).matched.at(-1).path, '/:pathMatch(.*)*');
  }
});

test('singleplayer, multiplayer and daily routes remain available', () => {
  const router = routes();
  for (const path of [
    '/', '/singleplayer', '/classic', '/gravity', '/inspect', '/survival', '/gameover',
    '/play-party', '/play-online', '/online', '/party-host', '/party-player',
    '/daily', '/rankings-daily', '/gameover-daily', '/hall-of-fame',
  ]) {
    assert.equal(router.resolve(path).matched.at(-1).path, path);
  }
});
