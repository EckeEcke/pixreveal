const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vue = require('vue');

function execute(source, bindings = {}, result = '') {
  const ast = ts.createSourceFile('source.ts', source, ts.ScriptTarget.Latest, true);
  const stripped = ts.factory.updateSourceFile(ast, ast.statements.filter(node => !ts.isImportDeclaration(node)));
  const code = ts.transpileModule(ts.createPrinter().printFile(stripped), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  return new Function('exports', ...Object.keys(bindings), code + result)(exports, ...Object.values(bindings)) ?? exports;
}
const revealUtils = execute(fs.readFileSync('src/utils/pixelReveal.ts', 'utf8'));
const highlightUtils = execute(fs.readFileSync('src/utils/onlineHighlights.ts', 'utf8'), revealUtils);
const { buildOnlineHighlights, compactOnlineHighlightData, selectOnlineHighlightCandidates, summarizeOnlineAnswers } = highlightUtils;
function clock() {
  let now = 0, id = 0;
  const tasks = new Map();
  const set = (fn, delay, interval = false) => {
    tasks.set(++id, { fn, at: now + delay, interval: interval ? delay : 0 });
    return id;
  };
  return {
    tasks,
    workerSetTimeout: (fn, delay) => set(fn, delay), workerClearTimeout: id => tasks.delete(id),
    workerSetInterval: (fn, delay) => set(fn, delay, true), workerClearInterval: id => tasks.delete(id),
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...tasks].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        const [key, task] = next;
        now = task.at;
        if (task.interval) task.at += task.interval; else tasks.delete(key);
        task.fn();
      }
      now = end;
    },
  };
}
const player = (id, points, extra = {}) => ({ playerId: id, username: id, avatarIndex: 1, isHost: id === 'me', isOnline: true, points, correctAnswers: 1, hasFinished: true, ...extra });
function setup(players) {
  const time = clock(), calls = [], mounted = [], unmounted = [], scope = vue.effectScope();
  const channel = vue.reactive({ playersOnline: players, playerId: 'me', isHost: true, mode: 'regular', onlineGameRunning: true,
    activeChannel: { trigger: (...args) => calls.push(['event', ...args]) }, reset: () => calls.push(['reset-room']) });
  const source = fs.readFileSync('src/views/GameOverOnlineView.vue', 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const api = scope.run(() => execute(source, {
    ref: vue.ref, computed: vue.computed, watch: vue.watch,
    onMounted: fn => mounted.push(fn), onUnmounted: fn => unmounted.push(fn),
    useChannelStore: () => channel, useOnlineStore: () => ({ replayRounds: [], stopGame: () => calls.push(['stop-game']) }),
    useGameStore: () => ({ rounds: [], reset: () => calls.push(['reset-game']) }),
    useSoundStore: () => ({ playSound: name => calls.push(['play', name]), stopSound: name => calls.push(['stop', name]) }),
    useAchievementsStore: () => ({ unlock: id => calls.push(['unlock', id]) }),
    useRouter: () => ({ push: path => calls.push(['route', path]), replace: path => calls.push(['replace', path]) }),
    ...highlightUtils, ...time,
  }, ';return { handleIntroDone, handleWinnerDone, resultsReady, animatedPoints, revealedIds, countingUpIds, showWinnerAnimation, waitingForFinalResults, pendingPlayers, finishedPlayersCount, playAgainOnline, goBackOnline };'));
  mounted.forEach(fn => fn());
  return { api, time, calls, channel, async start() { api.handleIntroDone(); await vue.nextTick(); },
    dispose() { unmounted.forEach(fn => fn()); scope.stop(); } };
}

test('scores advance exactly one point per 50 ms, continue beyond five seconds and trigger the winner only at completion', async () => {
  const h = setup([player('me', 150), player('second', 5), player('third', 2)]);
  try {
    assert.equal(h.calls.filter(call => call[0] === 'play' && call[1] === 'winner').length, 0);
    await h.start();
    h.time.advance(900);
    assert.equal(h.api.animatedPoints.value.third, 0);
    h.time.advance(50);
    assert.equal(h.api.animatedPoints.value.third, 1);
    h.time.advance(50);
    assert.equal(h.api.animatedPoints.value.third, 2);
    h.time.advance(1700);
    assert.equal(h.api.revealedIds.value.size, 3);
    assert.equal(h.api.animatedPoints.value.me, 0);
    h.time.advance(49);
    assert.equal(h.api.animatedPoints.value.me, 0);
    h.time.advance(1);
    assert.equal(h.api.animatedPoints.value.me, 1);
    h.time.advance(5000);
    assert.equal(h.api.animatedPoints.value.me, 101);
    assert.equal(h.api.showWinnerAnimation.value, false);
    for (let i = 102; i <= 150; i++) {
      h.time.advance(50);
      assert.equal(h.api.animatedPoints.value.me, i);
      assert.equal(h.api.showWinnerAnimation.value, i === 150);
    }
    assert.equal(h.api.countingUpIds.value.size, 0);
    assert.equal(h.time.tasks.size, 0);
    assert.equal(h.calls.filter(call => call[0] === 'play' && call[1] === 'winner').length, 1);
    assert.deepEqual(h.calls.filter(call => call[0] === 'unlock' && call[1] === 'win-online'), [['unlock', 'win-online']]);
  } finally { h.dispose(); }
});

test('a zero-score game still reveals everybody and announces its winner without a five-second count', async () => {
  const h = setup([player('me', 0), player('other', 0)]);
  try {
    await h.start(); h.time.advance(900);
    assert.equal(h.api.revealedIds.value.size, 1);
    assert.equal(h.api.showWinnerAnimation.value, false);
    h.time.advance(900);
    assert.equal(h.api.revealedIds.value.size, 2);
    assert.equal(h.api.showWinnerAnimation.value, true);
    assert.equal(h.api.countingUpIds.value.size, 0);
  } finally { h.dispose(); }
});

test('actions and highlights unlock only when the winner overlay has finished, including games without highlights', async () => {
  for (const withHighlights of [true, false]) {
    const h = setup([player('me', 3, withHighlights ? { onlineHighlights: [snapshot(0, true, 1000, 5)] } : {}), player('other', 0)]);
    try {
      assert.equal(h.api.resultsReady.value, false);
      h.api.handleWinnerDone();
      assert.equal(h.api.resultsReady.value, false);
      await h.start(); h.time.advance(1800);
      assert.equal(h.api.resultsReady.value, false);
      assert.equal(h.api.showWinnerAnimation.value, false);
      h.time.advance(150);
      assert.equal(h.api.showWinnerAnimation.value, true);
      assert.equal(h.api.resultsReady.value, false);
      h.time.advance(10000);
      assert.equal(h.api.resultsReady.value, false, 'elapsed time alone must not reveal the details');
      h.api.handleWinnerDone();
      assert.equal(h.api.showWinnerAnimation.value, false);
      assert.equal(h.api.resultsReady.value, true);
      assert.equal(h.api.animatedPoints.value.me, 3);
      assert.equal(h.api.revealedIds.value.size, 2);
      assert.equal(h.time.tasks.size, 0);
    } finally { h.dispose(); }
  }
});

test('waiting shows finished counts and pending names, excludes offline players, and starts no scores until everybody finishes', async () => {
  const h = setup([player('me', 20), player('waiting', 15, { hasFinished: false }), player('offline', 0, { hasFinished: false, isOnline: false })]);
  try {
    await h.start(); h.time.advance(10000);
    assert.equal(h.api.finishedPlayersCount.value, 1);
    assert.deepEqual(h.api.pendingPlayers.value.map(p => p.username), ['waiting']);
    assert.deepEqual(h.api.animatedPoints.value, {});
    assert.equal(h.api.revealedIds.value.size, 0);
    assert.equal(h.api.showWinnerAnimation.value, false);
    h.channel.playersOnline[1].hasFinished = true; await vue.nextTick();
    assert.equal(h.api.waitingForFinalResults.value, false);
    h.time.advance(900);
    assert.equal(h.api.revealedIds.value.size, 1);
  } finally { h.dispose(); }
});

test('leaving during the count cancels all callbacks and stops the counting sound', async () => {
  const h = setup([player('me', 200), player('other', 100)]);
  await h.start(); h.time.advance(1900);
  assert.ok(h.api.countingUpIds.value.size > 0);
  h.dispose();
  const points = { ...h.api.animatedPoints.value };
  h.time.advance(20000);
  assert.deepEqual(h.api.animatedPoints.value, points);
  assert.equal(h.api.showWinnerAnimation.value, false);
  assert.equal(h.time.tasks.size, 0);
  assert.ok(h.calls.some(call => call[0] === 'stop' && call[1] === 'counting'));
});

test('Play Again keeps the room and Leave room notifies peers before resetting it', () => {
  const h = setup([player('me', 20), player('other', 10)]);
  try {
    h.api.playAgainOnline();
    assert.deepEqual(h.calls.at(-1), ['route', '/lobby']);
    assert.equal(h.calls.filter(call => call[0] === 'reset-room').length, 0);
    h.api.goBackOnline();
    assert.ok(h.calls.some(call => call[0] === 'event' && call[1] === 'client-host-inactive'));
    assert.deepEqual(h.calls.at(-1), ['route', '/']);
    assert.equal(h.calls.filter(call => call[0] === 'reset-room').length, 1);
  } finally { h.dispose(); }
});

const snapshot = (roundIndex, isCorrect, elapsedMs, visiblePixelCount) => ({ roundIndex, isCorrect, elapsedMs, visiblePixelCount, pixels: [[1, 2], [3, 0]], givenAnswer: 'Mario' });
const highlighted = (id, snapshots) => player(id, 20, { onlineHighlights: snapshots });
test('highlights identify shared fastest times, blind guesses and quick misses from actual data', () => {
  const result = buildOnlineHighlights([
    highlighted('one', [snapshot(0, true, 1000, 12), snapshot(1, false, 1000, 10)]),
    highlighted('two', [snapshot(0, true, 1000, 18), snapshot(1, true, 2000, 0)]),
    highlighted('missing', []),
  ]);
  assert.deepEqual(result.map(slide => slide.title), ['Blind guess', 'Joint fastest guess', 'Quick miss', 'Joint fastest guess']);
  assert.equal(new Set(result.map(slide => slide.key)).size, 4);
  assert.deepEqual(result[0].highlight.pixels, [[1, 2], [3, 0]]);
});

test('round-wide highlight claims require snapshots from everyone; other categories remain factual', () => {
  const first = highlighted('one', [snapshot(0, true, 3000, 20), snapshot(1, true, 1000, 1)]);
  const second = highlighted('two', [snapshot(0, false, 4000, 30), snapshot(1, false, 3000, 10)]);
  const full = buildOnlineHighlights([first, second]);
  assert.equal(full.find(slide => slide.key === 'one-0').title, 'Only correct guess');
  const incomplete = buildOnlineHighlights([first, second, highlighted('missing', [])]);
  assert.equal(incomplete.find(slide => slide.key === 'one-0').title, 'Correct answer');
  assert.equal(full.find(slide => slide.key === 'two-0').title, 'Only wrong guess');
});

test('legacy highlight fallbacks and duplicate rounds produce stable slides without mutating players', () => {
  const a = snapshot(0, true, 1000, 10), b = snapshot(0, false, 3000, 20);
  const input = [player('legacy', 10, { onlineHighlights: [], bestCorrectHighlight: a }), highlighted('duplicate', [b, b])];
  const before = JSON.stringify(input), first = buildOnlineHighlights(input);
  assert.equal(first.length, 2);
  assert.deepEqual(buildOnlineHighlights(input), first);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(buildOnlineHighlights([]), []);
});

test('quick, sparse, patient and blind-miss categories require the matching measurements', () => {
  for (const [answer, title] of [
    [snapshot(1, true, 1000, 20), 'Quick recognition'],
    [snapshot(2, true, 4000, 4), 'Only a few pixels'],
    [snapshot(3, true, 6000, 20), 'Took their time'],
    [snapshot(4, true, 3000, 20), 'Correct answer'],
    [snapshot(5, false, 3000, 0), 'Blind guess missed'],
  ]) {
    const result = buildOnlineHighlights([
      highlighted('baseline', [snapshot(0, true, 0, 1)]), highlighted('guesser', [answer]),
    ]);
    assert.equal(result.find(slide => slide.key === `guesser-${answer.roundIndex}`).title, title);
  }
});

test('fewest-pixel and everyone-correct highlights are selected only when the evidence supports them', () => {
  const result = buildOnlineHighlights([
    highlighted('one', [snapshot(0, true, 0, 20), snapshot(2, true, 3000, 20)]),
    highlighted('two', [snapshot(1, true, 2000, 1), snapshot(2, true, 3000, 30)]),
  ]);
  assert.equal(result.find(slide => slide.key === 'two-1').title, 'Fewest pixels');
  assert.equal(result.find(slide => slide.key === 'one-2').title, 'Everyone got it');
  assert.equal(result.find(slide => slide.key === 'two-2').title, 'Everyone got it');
});

test('highlight navigation wraps, pauses auto-rotation and restarts its interval after selection', () => {
  const time = clock(), mounted = [], unmounted = [], scope = vue.effectScope();
  const slides = Array.from({ length: 12 }, (_, i) => ({ key: String(i) }));
  const source = fs.readFileSync('src/components/game-ui/OnlineHighlights.vue', 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const api = scope.run(() => execute(source, {
    computed: vue.computed, ref: vue.ref, watch: vue.watch, onMounted: fn => mounted.push(fn), onBeforeUnmount: fn => unmounted.push(fn),
    defineProps: () => ({ highlights: slides }), ...time,
  }, ';return { activeIndex, isHovered, hasFocus, select };'));
  try {
    mounted.forEach(fn => fn()); time.advance(10000);
    assert.equal(api.activeIndex.value, 1);
    api.select(-1); assert.equal(api.activeIndex.value, 11);
    api.isHovered.value = true; time.advance(20000); assert.equal(api.activeIndex.value, 11);
    api.hasFocus.value = true; api.isHovered.value = false;
    time.advance(10000); assert.equal(api.activeIndex.value, 11);
    api.hasFocus.value = false; time.advance(10000); assert.equal(api.activeIndex.value, 0);
    api.select(5); time.advance(9999); assert.equal(api.activeIndex.value, 5);
    time.advance(1); assert.equal(api.activeIndex.value, 6);
  } finally { unmounted.forEach(fn => fn()); scope.stop(); }
  assert.equal(time.tasks.size, 0);
});
