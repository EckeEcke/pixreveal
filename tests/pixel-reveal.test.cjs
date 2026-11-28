const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vue = require('vue');

function execute(source, bindings, result = '') {
  const ast = ts.createSourceFile('test.ts', source, ts.ScriptTarget.Latest, true);
  const stripped = ts.factory.updateSourceFile(ast, ast.statements.filter(node => !ts.isImportDeclaration(node)));
  const code = ts.transpileModule(ts.createPrinter().printFile(stripped), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  return new Function('exports', ...Object.keys(bindings), code + result)(exports, ...Object.values(bindings)) ?? exports;
}

const reveal = execute(fs.readFileSync('src/utils/pixelReveal.ts', 'utf8'), {});
const pixels = Array.from({ length: 256 }, (_, i) => i);
const finish = seed => reveal.createPixelReveal(pixels, 8000, 0, seed).advance(8000).map(item => item.pixel);

test('same seed produces a complete identical permutation independently of other randomness', () => {
  const first = finish('online:round-1');
  for (let i = 0; i < 200; i++) Math.random();
  assert.deepEqual(finish('online:round-1'), first);
  assert.notDeepEqual(first, pixels);
  assert.deepEqual([...first].sort((a, b) => a - b), pixels);
  assert.notDeepEqual(finish('online:round-2'), first);
  assert.notDeepEqual(finish(0), finish(1));
  assert.deepEqual(pixels, Array.from({ length: 256 }, (_, i) => i));
});

test('Daily seeds use the challenge date and round, independent of client time', () => {
  const seed = reveal.dailyRevealSeed('2026-11-26', 2);
  assert.deepEqual(finish(seed), finish(reveal.dailyRevealSeed('2026-11-26', 2)));
  assert.notDeepEqual(finish(seed), finish(reveal.dailyRevealSeed('2026-11-27', 2)));
  assert.notDeepEqual(finish(seed), finish(reveal.dailyRevealSeed('2026-11-26', 3)));
});

test('different frame rates and delayed frames reach the same pixels and animation ages', () => {
  const run = (times, origin) => {
    const timeline = reveal.createPixelReveal(pixels, 8000, origin, 'shared');
    return times.flatMap(elapsed => timeline.advance(origin + elapsed).map(item => ({
      pixel: item.pixel, revealedAt: elapsed - item.ageMs,
    })));
  };
  const frequent = Array.from({ length: 500 }, (_, i) => (i + 1) * 16);
  assert.deepEqual(run(frequent, 0), run([100, 500, 3900, 8000], 24000));
});

test('pauses exclude transition time and repeated pause signals do not reset the baseline', () => {
  const timeline = reveal.createPixelReveal(pixels, 8000, 1000, 'paused');
  assert.equal(timeline.advance(3000).length, 64);
  timeline.setPaused(true, 3000);
  timeline.setPaused(true, 4000);
  assert.equal(timeline.advance(13000).length, 0);
  timeline.setPaused(false, 13000);
  timeline.setPaused(false, 14000);
  assert.equal(timeline.advance(15000).length, 64);
  timeline.setPaused(true, 15000);
  timeline.setPaused(false, 17000);
  assert.equal(timeline.advance(21000).length, 128);
  assert.equal(timeline.advance(22000).length, 0);
});

test('empty, immediate and initially paused reveals have defined completion boundaries', () => {
  assert.deepEqual(reveal.createPixelReveal([], 8000, 0, 1).advance(8000), []);
  const instant = reveal.createPixelReveal(pixels, 0, 0, 1);
  assert.equal(instant.advance(0).length, 256);
  assert.equal(instant.advance(10).length, 0);
  const paused = reveal.createPixelReveal(pixels, 8000, 0, 1);
  paused.setPaused(true, 0);
  assert.equal(paused.advance(10000).length, 0);
  paused.setPaused(false, 10000);
  assert.equal(paused.advance(10030).length, 0);
  assert.equal(paused.advance(10032).length, 1);
});

function online() {
  const events = {}, sent = [];
  const channel = { bind(name, fn) { events[name] = fn; }, trigger(name, data) { sent.push([name, JSON.parse(JSON.stringify(data))]); } };
  const channelStore = { activeChannel: channel, mode: 'regular', playersOnline: [], setGameRunning() {} };
  const configStore = { revealTime: 10, maxRounds: 2 };
  const gameStore = { rounds: [], prepareGame(time, rounds) {
    this.rounds = rounds ?? [0, 1].map(i => ({ answer: `Drawing ${i}`, data: [[1, 2], [3, 4]], options: [] }));
  } };
  let nextSeed = 0;
  const store = execute(fs.readFileSync('src/stores/online.ts', 'utf8'), {
    defineStore: (_, factory) => factory, ref: vue.ref, watch() {},
    useChannelStore: () => channelStore, useGameStore: () => gameStore,
    usePlayerStore: () => ({}), useConfigStore: () => configStore,
    useRouter: () => ({ push() {} }), createRevealSeed: () => nextSeed++,
  }).useOnlineStore();
  store.setupEvents();
  return { store, gameStore, sent, events };
}

test('Online sends per-round seeds to guests and generates fresh seeds for replay', () => {
  const host = online(), guest = online();
  host.store.triggerGameStart();
  const [event, payload] = host.sent[0];
  assert.equal(event, 'client-game-started');
  assert.deepEqual(payload.rounds.map(round => round.revealSeed), [0, 1]);
  guest.events[event](payload);
  assert.deepEqual(guest.gameStore.rounds, host.gameStore.rounds);
  for (let i = 0; i < payload.rounds.length; i++) {
    assert.deepEqual(finish(guest.gameStore.rounds[i].revealSeed), finish(host.gameStore.rounds[i].revealSeed));
  }
  host.store.triggerGameStart();
  assert.deepEqual(host.sent[1][1].rounds.map(round => round.revealSeed), [2, 3]);
  assert.deepEqual(payload.rounds.map(round => round.revealSeed), [0, 1]);
});

function canvas(seed = 'same') {
  let now = 0, frameId = null, unmount;
  const scope = vue.effectScope();
  const props = vue.reactive({ pixelArray: [[1, 2], [3, 4]], isRevealing: true, timerDuration: 10, revealSeed: seed });
  const context = new Proxy({}, { get: (_, key) => key === 'createLinearGradient'
    ? () => ({ addColorStop() {} }) : () => {} });
  const source = fs.readFileSync('src/components/canvas/PixelCanvas.vue', 'utf8').match(/<script setup>([\s\S]*?)<\/script>/)[1];
  const api = scope.run(() => execute(source, {
    ref: vue.ref, computed: vue.computed, watch: vue.watch,
    onMounted() {}, onUnmounted(fn) { unmount = fn; },
    defineProps: () => props, defineEmits() {}, defineExpose() {},
    usePlayerStore: () => ({}), useSoundStore: () => ({ playSound() {} }),
    useCanvasBase: () => ({ canvasRef: vue.ref(null), getContext: () => context,
      calculateGrid: () => ({ cellSize: 150, gap: 5, baseSize: 140 }),
      getAnimationFrameId: () => frameId, setAnimationFrameId: id => { frameId = id; },
      stopAnimation: () => { frameId = null; },
    }),
    createPixelReveal: reveal.createPixelReveal, colorPalette: ['#000', '#111', '#222', '#333', '#444'],
    document: { hidden: false, removeEventListener() {} },
    performance: { now: () => now }, requestAnimationFrame: () => 1,
    setTimeout() {},
  }, ';return { startReveal, render, triggerCorrectAnswer, triggerIncorrectAnswer, getDisplayedPixelArray };'));
  api.startReveal();
  return { props, api, async update(values) { Object.assign(props, values); await vue.nextTick(); },
    frame(time) { now = time; api.render(); return api.getDisplayedPixelArray(); },
    dispose() { unmount(); scope.stop(); },
  };
}

test('actual canvas catches up identically and changing the seed starts a fresh reveal', async () => {
  const first = canvas(), second = canvas();
  try {
    first.frame(2000); first.frame(4000);
    assert.deepEqual(first.frame(6000), second.frame(6000));
    assert.equal(first.api.getDisplayedPixelArray().flat().filter(Boolean).length, 3);
    await first.update({ revealSeed: 'another-round' });
    assert.equal(first.api.getDisplayedPixelArray().flat().filter(Boolean).length, 0);
    assert.equal(first.frame(8000).flat().filter(Boolean).length, 1);
  } finally { first.dispose(); second.dispose(); }
});

test('actual canvas stops reveal on answers, respects transition pauses, and displays Inspect instantly', async () => {
  const h = canvas();
  try {
    h.frame(2000);
    await h.update({ pauseReveal: true });
    assert.equal(h.frame(12000).flat().filter(Boolean).length, 1);
    await h.update({ pauseReveal: false });
    assert.equal(h.frame(14000).flat().filter(Boolean).length, 2);
    h.api.triggerCorrectAnswer();
    h.frame(16000);
    assert.deepEqual(h.api.getDisplayedPixelArray(), h.props.pixelArray);
    await h.update({ pixelArray: [[4, 3], [2, 1]] });
    h.frame(18000);
    h.api.triggerIncorrectAnswer();
    h.frame(18500);
    assert.deepEqual(h.api.getDisplayedPixelArray(), h.props.pixelArray);
    await h.update({ isRevealing: false, pixelArray: [[1, 1], [2, 2]] });
    assert.deepEqual(h.api.getDisplayedPixelArray(), h.props.pixelArray);
  } finally { h.dispose(); }
});
