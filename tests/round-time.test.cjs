const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vue = require('vue');
const { createHmac } = require('node:crypto');

function load(file, bindings) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const stripped = ts.factory.updateSourceFile(ast, ast.statements.filter(node => !ts.isImportDeclaration(node)));
  const code = ts.transpileModule(ts.createPrinter().printFile(stripped), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function('exports', ...Object.keys(bindings), code)(exports, ...Object.values(bindings));
  return exports;
}

async function authorize(headers) {
  const { default: handler } = await import('../api/apinator-auth.js');
  const env = { APINATOR_KEY: 'test-key', APINATOR_SECRET: 'test-secret', NODE_ENV: 'production' };
  const previous = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]));
  Object.assign(process.env, env);
  const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  try {
    await handler({ method: 'POST', body: { socket_id: 'test.socket', channel_name: 'presence-pixreveal-ETEST' },
      headers: { 'x-player-id': 'host', 'x-player-host': 'true', ...headers } }, response);
    assert.equal(response.code, 200);
    const signature = createHmac('sha256', 'test-secret')
      .update('test.socket:presence-pixreveal-ETEST:' + response.body.channel_data).digest('hex');
    assert.equal(response.body.auth, 'test-key:' + signature);
    return JSON.parse(response.body.channel_data).user_info;
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test('auth converts round-time and round-count headers to numbers before signing the presence payload', async () => {
  for (const time of [5, 10, 15, 20]) {
    const info = await authorize({ 'x-player-duration': String(time), 'x-player-rounds': '15' });
    assert.equal(info.duration, time);
    assert.equal(info.rounds, 15);
    assert.equal(typeof info.duration, 'number');
    assert.equal(typeof info.rounds, 'number');
  }
});

test('missing or invalid time headers retain safe defaults instead of emitting invalid timer values', async () => {
  const missing = await authorize({});
  assert.equal(missing.duration, 15);
  assert.equal(missing.rounds, null);
  for (const value of ['', '0', '-5', 'NaN', 'Infinity', '15.5', '20s']) {
    const info = await authorize({ 'x-player-duration': value, 'x-player-rounds': value });
    assert.equal(info.duration, 15);
    assert.equal(info.rounds, null);
  }
});

function presence() {
  return load('src/composables/useSubscriptionLifecycle.ts', {
    isHostFlag: value => value === true || value === 'true',
  }).syncPlayersFromHash;
}

test('existing rooms with string-valued host settings normalize both time and rounds on receipt', () => {
  const config = { maxRounds: 5, revealTime: 10 };
  const players = presence()({
    host: { name: 'Host', avatar: 0, host: 'true', rounds: '15', duration: '20' },
    guest: { name: 'Guest', avatar: 1, host: false, rounds: '5', duration: '5' },
  }, config);
  assert.deepEqual(config, { maxRounds: 15, revealTime: 20 });
  assert.equal(typeof config.revealTime, 'number');
  assert.equal(typeof config.maxRounds, 'number');
  assert.equal(players.length, 2);
  assert.equal(players[0].isHost, true);
});

test('malformed or absent presence settings cannot replace a valid round time', () => {
  const sync = presence();
  for (const value of [undefined, null, '', '0', '-5', 'broken', Infinity, 1.5]) {
    const config = { maxRounds: 10, revealTime: 15 };
    sync({ host: { name: 'Host', avatar: 0, host: true, rounds: value, duration: value } }, config);
    assert.deepEqual(config, { maxRounds: 10, revealTime: 15 });
  }
});

test('game-start events from older hosts cannot reintroduce a string round time', () => {
  for (const [input, expected] of [['20', 20], [5, 5], [' 15 ', 15], ['broken', 10], ['0', 10]]) {
    const config = { revealTime: 10, maxRounds: 5, filteredDrawings: [] };
    const store = load('src/stores/game.ts', {
      defineStore: (_, factory) => factory, ref: vue.ref, computed: vue.computed,
      useConfigStore: () => config,
    }).useGameStore();
    const rounds = [{ answer: 'Mario', data: [[1]], options: [], revealSeed: 123 }];
    store.prepareGame(input, rounds);
    assert.equal(config.revealTime, expected);
    assert.equal(typeof config.revealTime, 'number');
    assert.equal(config.maxRounds, 1);
    assert.equal(store.rounds.value[0].revealSeed, 123);
    assert.equal(store.gameState.value, 'starting');
  }
});
