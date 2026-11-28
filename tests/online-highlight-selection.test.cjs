const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vue = require('vue');

function execute(file, bindings = {}) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const source = ts.factory.updateSourceFile(ast, ast.statements.filter(node => !ts.isImportDeclaration(node)));
  const code = ts.transpileModule(ts.createPrinter().printFile(source), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('exports', ...Object.keys(bindings), code)(exports, ...Object.values(bindings));
  return exports;
}
const revealUtils = execute('src/utils/pixelReveal.ts');
const utils = execute('src/utils/onlineHighlights.ts', revealUtils);
const { buildOnlineHighlights, compactOnlineHighlightData, summarizeOnlineAnswers } = utils;
const pixels = Array.from({ length: 16 }, () => Array(16).fill(5));
const answer = (roundIndex, isCorrect = true, elapsedMs = 3000, visiblePixelCount = 20, extra = {}) =>
  ({ roundIndex, isCorrect, elapsedMs, visiblePixelCount, givenAnswer: isCorrect ? 'Mario' : 'Link', pixels, ...extra });
const player = (playerId, onlineHighlights, extra = {}) =>
  ({ playerId, username: playerId, avatarIndex: 1, isHost: playerId === 'p0', isOnline: true,
    points: 20, correctAnswers: 10, hasFinished: true, onlineHighlights, ...extra });

function playerStore() {
  const scope = vue.effectScope();
  const storage = { getItem: () => null, setItem() {} };
  const store = scope.run(() => execute('src/stores/player.ts', {
    ref: vue.ref, watch: vue.watch, defineStore: (_, factory) => factory,
    localStorage: storage, sessionStorage: storage, crypto: { randomUUID: () => 'controller' },
    generatePlayerId: () => 'p0', getRandomUserName: () => 'Player',
    NAME_EFFECTS: [], AVATAR_EFFECTS: [], useConfigStore: () => ({ revealTime: 10 }),
    useAchievementsStore: () => ({ loadAchievements: async () => {}, hasBonusAvatars: false }), ...utils,
  }).usePlayerStore());
  return { store, dispose: () => scope.stop() };
}

test('recording twenty rounds keeps four image candidates and complete metadata, then resets both for a new player', () => {
  const h = playerStore();
  try {
    const rounds = Array.from({ length: 20 }, (_, i) => answer(i, i % 2 === 0, 2000 + i * 100, 10 + i));
    rounds[0] = answer(0, true, 5000, 0);
    rounds[2] = answer(2, true, 1000, 6);
    rounds[17] = answer(17, false, 500, 0);
    rounds[19] = answer(19, false, 20000, 240);
    for (const round of rounds) {
      h.store.recordHighlight(round);
      assert.ok(h.store.onlineHighlights.value.length <= 4);
    }
    assert.deepEqual(h.store.onlineHighlights.value.map(entry => entry.roundIndex), [0, 2, 17, 19]);
    assert.equal(h.store.onlineAnswerSummaries.value.length, 20);
    assert.ok(h.store.onlineAnswerSummaries.value.every(summary => !('pixels' in summary)));
    h.store.setUser({ username: 'Next player', avatar: 2 });
    assert.deepEqual(h.store.onlineHighlights.value, []);
    assert.deepEqual(h.store.onlineAnswerSummaries.value, []);
  } finally { h.dispose(); }
});

test('timeouts contribute statistics without becoming a blind-miss image, and duplicate rounds replace their metadata', () => {
  const h = playerStore();
  try {
    h.store.recordHighlight(answer(0));
    h.store.recordHighlight(answer(1, false, 10000, 200, { givenAnswer: '', pixels: [] }));
    h.store.recordHighlight(answer(0, true, 2500, 15));
    assert.equal(h.store.onlineHighlights.value.length, 1);
    assert.equal(h.store.onlineAnswerSummaries.value.length, 2);
    assert.equal(h.store.onlineAnswerSummaries.value[0].elapsedMs, 2500);
    assert.equal(h.store.onlineAnswerSummaries.value[1].givenAnswer, '');
    assert.equal(h.store.onlineAnswerSummaries.value[1].visiblePixelCount, 200);
  } finally { h.dispose(); }
});

function largeMatch() {
  return Array.from({ length: 10 }, (_, i) => player(`p${i}`, Array.from({ length: 20 }, (_, round) =>
    answer(round, true, round === i ? 500 + i : 3000 + round * 100, round === i ? 1 : 20 + round))));
}

test('a ten-player twenty-round match selects twenty highlights with broad player and drawing coverage', () => {
  const input = largeMatch(), before = JSON.stringify(input);
  const selected = buildOnlineHighlights(input, replayRounds());
  assert.equal(selected.length, 20);
  assert.equal(new Set(selected.map(slide => slide.username)).size, 10);
  assert.equal(new Set(selected.map(slide => slide.highlight.roundIndex)).size, 20);
  for (const p of input) assert.ok(selected.filter(slide => slide.username === p.username).length <= 4);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(buildOnlineHighlights([...input].reverse(), replayRounds()), selected);
});

test('a player receives at most four cards, prioritizing exceptional guesses over ordinary answers', () => {
  const selected = buildOnlineHighlights([player('one', [
    answer(0, true, 3000, 0), answer(1, true, 1000, 4),
    ...Array.from({ length: 18 }, (_, i) => answer(i + 2, true, 3000 + i, 20 + i)),
  ])], replayRounds());
  assert.equal(selected.length, 4);
  assert.deepEqual(selected.slice(0, 2).map(slide => slide.title), ['Blind guess', 'Fastest guess']);
});

test('a drawing repeats only for a comparison, with at most two cards even for a ten-way tie', () => {
  const repeated = buildOnlineHighlights([
    player('one', [answer(0, true, 1000)]), player('two', [answer(0, true, 2000)]),
  ]);
  assert.equal(repeated.length, 1);
  const comparison = buildOnlineHighlights([
    player('one', [answer(0, true, 1000)]), player('two', [answer(0, false, 2000)]),
  ]);
  assert.equal(comparison.length, 2);
  const tied = buildOnlineHighlights(Array.from({ length: 10 }, (_, i) => player(`p${i}`, [answer(0, true, 1000)])));
  assert.equal(tied.length, 2);
  assert.ok(tied.every(slide => slide.title === 'Everyone got it'));
});

test('round-wide and global claims use all metadata, including discarded images and timeouts', () => {
  const first = player('one', [answer(0, true, 1000, 2), answer(5, true, 3000, 20)]);
  const second = player('two', [answer(3, false)], {
    onlineAnswerSummaries: summarizeOnlineAnswers([answer(3, false), answer(5, false, 10000, 200, { givenAnswer: '' })]),
  });
  assert.equal(buildOnlineHighlights([first, second]).find(slide => slide.key === 'one-5').title, 'Only correct guess');
  const cropped = player('one', [answer(0, true, 3000, 20)], {
    onlineAnswerSummaries: summarizeOnlineAnswers([answer(0, true, 3000, 20), answer(1, true, 1000, 2)]),
  });
  const full = buildOnlineHighlights([cropped, player('two', [answer(0, true, 4000, 30)])]);
  assert.equal(full.find(slide => slide.key === 'one-0').title, 'Everyone got it');
});

test('old payloads are compacted while retaining every round summary and legacy fallbacks', () => {
  const raw = largeMatch()[0];
  const compact = compactOnlineHighlightData(raw);
  assert.equal(compact.onlineHighlights.length, 4);
  assert.equal(compact.onlineAnswerSummaries.length, 20);
  assert.ok(compact.onlineAnswerSummaries.every(summary => !('pixels' in summary)));
  const legacy = compactOnlineHighlightData({ bestCorrectHighlight: answer(0), worstIncorrectHighlight: answer(1, false) });
  assert.equal(legacy.onlineHighlights.length, 2);
  assert.equal(legacy.onlineAnswerSummaries.length, 2);
});

function onlineHarness(ownData, profiles, isHost = true) {
  const handlers = {}, sent = [];
  const channel = { bind: (name, fn) => { handlers[name] = fn; },
    trigger: (name, data) => { sent.push([name, JSON.parse(JSON.stringify(data))]); } };
  const state = { activeChannel: channel, mode: 'regular', playerId: ownData.playerId, isHost,
    playersOnline: profiles.map(profile => ({ ...profile, onlineHighlights: [], onlineAnswerSummaries: [], hasFinished: false })),
    setGameRunning() {}, removePlayer() {}, reset() {} };
  const own = { ...ownData, answerHistory: Array(20).fill(true) };
  const store = execute('src/stores/online.ts', {
    defineStore: (_, factory) => factory, ref: vue.ref, watch() {},
    useChannelStore: () => state, usePlayerStore: () => own,
    useGameStore: () => ({ rounds: [], prepareGame() {} }),
    useConfigStore: () => ({ revealTime: 10, maxRounds: 20 }),
    useRouter: () => ({ push() {} }), createRevealSeed: () => 'seed', ...utils,
  }).useOnlineStore();
  store.setupEvents();
  return { store, state, own, handlers, sent };
}

test('host finishing first or last respects the final limits and synchronizes the same cards to guests', () => {
  for (const hostLast of [true, false]) {
    const match = largeMatch(), host = onlineHarness(match[0], match);
    if (!hostLast) host.store.broadcastScore();
    for (const p of match.slice(1)) host.handlers['client-player-finished']({ ...p, answerHistory: Array(20).fill(true) });
    if (hostLast) {
      assert.equal(host.sent.filter(([event]) => event === 'client-online-highlights').length, 0);
      host.store.broadcastScore();
    }
    const ownPayload = host.sent.find(([event]) => event === 'client-player-finished')[1];
    assert.ok(ownPayload.onlineHighlights.length <= 4);
    assert.equal(ownPayload.onlineAnswerSummaries.length, 20);
    assert.ok(!('bestCorrectHighlight' in ownPayload) && !('worstIncorrectHighlight' in ownPayload));
    const finalEvents = host.sent.filter(([event]) => event === 'client-online-highlights');
    assert.equal(finalEvents.length, 1);
    const payload = finalEvents[0][1];
    assert.ok(payload.players.reduce((count, p) => count + p.onlineHighlights.length, 0) <= 20);
    assert.ok(payload.players.every(p => p.onlineHighlights.length <= 4 && p.onlineAnswerSummaries.length === 20));
    assert.ok(payload.players.every(p => p.onlineAnswerSummaries.every(summary => !('pixels' in summary))));
    assert.ok(JSON.stringify(payload).length < JSON.stringify({ players: match }).length / 2);
    const guest = onlineHarness(match[1], match, false);
    guest.handlers['client-online-highlights'](payload);
    assert.deepEqual(buildOnlineHighlights(guest.state.playersOnline), buildOnlineHighlights(host.state.playersOnline));
    host.store.triggerGameStart();
    assert.deepEqual(host.own.onlineAnswerSummaries, []);
    assert.deepEqual(host.own.onlineHighlights, []);
    assert.ok(host.state.playersOnline.every(p => !p.onlineAnswerSummaries.length && !p.onlineHighlights.length));
  }
});

const replayRounds = () => Array.from({ length: 20 }, (_, i) => ({ answer: 'Mario', data: pixels, options: [], revealSeed: `round-${i}` }));

test('complete round results prioritize everyone correct, everyone wrong, one correct and one wrong', () => {
  for (const [correct, title] of [[3, 'Everyone got it'], [0, 'Everyone missed'], [1, 'Only correct guess'], [2, 'Only wrong guess']]) {
    const profiles = Array.from({ length: 3 }, (_, i) => player(`p${i}`, [], {
      onlineAnswerSummaries: summarizeOnlineAnswers([answer(0, i < correct, 1000 + i * 100, 20 + i)]),
    }));
    const selected = buildOnlineHighlights(profiles, replayRounds());
    assert.equal(selected[0].title, title);
    assert.deepEqual(selected[0].roundResult, { correct, total: 3 });
    assert.equal(selected[0].highlight.pixels.flat().filter(Boolean).length, selected[0].highlight.visiblePixelCount);
    assert.ok(!buildOnlineHighlights([...profiles, player('unknown', [])], replayRounds()).some(slide => slide.roundResult));
  }
});

test('a late ordinary-looking answer remains eligible when it turns out to be the only correct one', () => {
  const profiles = Array.from({ length: 3 }, (_, i) => player(`p${i}`, [], {
    onlineAnswerSummaries: summarizeOnlineAnswers(Array.from({ length: 20 }, (_, round) =>
      answer(round, round === 17 ? i === 2 : true, 1000 + round * 300, 5 + round * 4))),
  }));
  const selected = buildOnlineHighlights(profiles, replayRounds());
  assert.equal(selected[0].key, 'p2-17');
  assert.equal(selected[0].title, 'Only correct guess');
  assert.equal(selected[0].highlight.visiblePixelCount, 73);
  assert.ok(selected.length <= 20);
});

test('the gallery reconstructs all two hundred guesses, including timeouts, one round at a time', () => {
  const profiles = largeMatch().map(p => ({ ...p, ...compactOnlineHighlightData(p), onlineHighlights: [] }));
  profiles[0].onlineAnswerSummaries[19] = { ...profiles[0].onlineAnswerSummaries[19], givenAnswer: '', isCorrect: false, visiblePixelCount: 256 };
  const rounds = replayRounds(), before = JSON.stringify(profiles);
  let total = 0;
  for (let round = 0; round < 20; round++) {
    const guesses = utils.buildOnlineGuesses(profiles, rounds, round);
    assert.equal(guesses.length, 10);
    total += guesses.length;
    assert.ok(guesses.every(guess => guess.highlight.pixels.flat().filter(Boolean).length === guess.highlight.visiblePixelCount));
  }
  assert.equal(total, 200);
  assert.equal(utils.buildOnlineGuesses(profiles, rounds, 19)[0].highlight.givenAnswer, '');
  assert.equal(JSON.stringify(profiles), before);
  assert.deepEqual(utils.buildOnlineGuesses(profiles, rounds, 99), []);
});

test('seeded online matches transmit all answer metadata without image snapshots and retain round data after gameover', () => {
  const match = largeMatch(), rounds = replayRounds(), host = onlineHarness(match[0], match);
  host.store.replayRounds.value = rounds;
  host.store.broadcastScore();
  for (const p of match.slice(1)) {
    host.handlers['client-player-finished']({ ...p, ...compactOnlineHighlightData(p), onlineHighlights: [], answerHistory: Array(20).fill(true) });
  }
  const own = host.sent.find(([event]) => event === 'client-player-finished')[1];
  assert.deepEqual(own.onlineHighlights, []);
  assert.equal(own.onlineAnswerSummaries.length, 20);
  const payload = host.sent.find(([event]) => event === 'client-online-highlights')[1];
  assert.ok(payload.players.every(p => p.onlineHighlights.length === 0 && p.onlineAnswerSummaries.length === 20));
  const guest = onlineHarness(match[1], match, false);
  guest.store.replayRounds.value = rounds;
  guest.handlers['client-online-highlights'](payload);
  assert.equal(buildOnlineHighlights(guest.state.playersOnline, guest.store.replayRounds.value).length, 20);
  assert.deepEqual(buildOnlineHighlights(guest.state.playersOnline, rounds), buildOnlineHighlights(host.state.playersOnline, rounds));
  assert.equal(utils.buildOnlineGuesses(guest.state.playersOnline, rounds, 19).length, 10);
  host.store.stopGame();
  assert.deepEqual(host.store.replayRounds.value, []);
});

test('gallery round navigation renders only the selected round and follows available round indices', async () => {
  const profiles = vue.reactive(largeMatch().map(p => ({ ...p, ...compactOnlineHighlightData(p), onlineHighlights: [] })));
  const rounds = replayRounds(), scope = vue.effectScope();
  const source = fs.readFileSync('src/components/game-ui/OnlineGuessesGallery.vue', 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const file = ts.createSourceFile('gallery.ts', source, ts.ScriptTarget.Latest, true);
  const stripped = ts.factory.updateSourceFile(file, file.statements.filter(node => !ts.isImportDeclaration(node)));
  const code = ts.transpileModule(ts.createPrinter().printFile(stripped), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const bindings = { ref: vue.ref, computed: vue.computed, watch: vue.watch, defineProps: () => ({ players: profiles, rounds }), ...utils };
  const api = scope.run(() => new Function(...Object.keys(bindings), code + ';return {activeRound, activeIndex, guesses, roundIndices};')(...Object.values(bindings)));
  try {
    assert.equal(api.activeRound.value, 0);
    assert.equal(api.guesses.value.length, 10);
    api.activeRound.value = 19;
    assert.equal(api.activeIndex.value, 19);
    assert.ok(api.guesses.value.every(guess => guess.highlight.roundIndex === 19));
    profiles.forEach(p => { p.onlineAnswerSummaries = p.onlineAnswerSummaries.filter(answer => answer.roundIndex === 5); });
    await vue.nextTick();
    assert.equal(api.activeRound.value, 5);
    assert.equal(api.activeIndex.value, 0);
    assert.deepEqual(api.roundIndices.value, [5]);
  } finally { scope.stop(); }
});
