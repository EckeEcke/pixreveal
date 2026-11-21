const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const ref = value => ({ value });
const computed = fn => ({ get value() { return fn(); } });
// Execute the production TypeScript with controlled transport, clock and router dependencies.
function load(file, bindings) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const stripped = ts.factory.updateSourceFile(ast, ast.statements.filter(node => !ts.isImportDeclaration(node)));
  const code = ts.transpileModule(ts.createPrinter().printFile(stripped), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('exports', ...Object.keys(bindings), code)(exports, ...Object.values(bindings));
  return exports;
}
function clock() {
  let id = 0;
  const timers = new Map();
  global.window = { setTimeout(fn) { timers.set(++id, fn); return id; }, clearTimeout(id) { timers.delete(id); } };
  return { timers, fire() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(fn => fn()); } };
}
function inactivity(mode, host = false) {
  const time = clock();
  const events = [], exits = [];
  let visible = 0;
  global.document = { visibilityState: 'hidden' };
  const api = load('src/composables/useInactivity.ts', { ref, INACTIVITY_GRACE_MS: 30000 }).useInactivity({
    getMode: () => mode, getIsHost: () => host, getGameRunning: () => true,
    getActiveChannel: () => ({ trigger: (...args) => events.push(args) }), getPlayerId: () => 'a',
    onInactive: options => exits.push(options), onPartyVisible: () => visible++,
  });
  return { api, time, events, exits, visible: () => visible };
}
test('party controllers retain their session while hidden and resync when visible', () => {
  const h = inactivity('party');
  h.api.handleVisibilityChange(); h.time.fire();
  assert.equal(h.exits.length, 0);
  document.visibilityState = 'visible'; h.api.handleVisibilityChange();
  assert.equal(h.visible(), 1);
  h.api.handleBeforeUnload();
  assert.equal(h.exits.length, 0);
  assert.equal(h.events.length, 0);
});
test('party host survives a background tab but explicit unload still ends the session', () => {
  const h = inactivity('party', true);
  h.api.handleVisibilityChange(); h.time.fire();
  assert.equal(h.exits.length, 0);
  h.api.handleBeforeUnload();
  assert.equal(h.events[0][0], 'client-host-inactive');
});
test('online inactivity still removes the player', () => {
  const h = inactivity('regular');
  h.api.handleVisibilityChange(); h.time.fire();
  assert.equal(h.exits.length, 1);
});
function connection(mode) {
  const time = clock(); let lost = 0, cleared = 0;
  const api = load('src/composables/useConnectionState.ts', { ref, CONNECTION_LOSS_TIMEOUT_MS: 60000, FORCE_RECONNECT_COOLDOWN_MS: 8000, CONNECT_WATCHDOG_MS: 3000 }).useConnectionState({
    getIsLoading: () => true, setIsLoading: value => { if (!value) cleared++; }, getMode: () => mode,
    getGameRunning: () => true, getPlayerId: () => 'a', getActiveChannel: () => ({ trigger() {} }), onConnectionLost: () => lost++,
  });
  return { api, change: api.createStateChangeHandler(), time, lost: () => lost, cleared: () => cleared };
}
test('online transport loss immediately exits instead of reconnecting', () => {
  const h = connection('regular'); h.change({ previous: 'connected', current: 'connecting' });
  assert.equal(h.lost(), 1); assert.equal(h.time.timers.size, 0);
});
test('party transport connected does not imply synchronized', () => {
  const h = connection('party'); h.change({ previous: 'connecting', current: 'connected' });
  assert.equal(h.cleared(), 0);
});
test('party disconnect timeout preserves the session', () => {
  const h = connection('party'); h.change({ previous: 'connected', current: 'disconnected' }); h.time.fire();
  assert.equal(h.lost(), 0);
});
function party(host = false) {
  const events = {}, routes = []; let completed = 0;
  const channel = { bind: (name, fn) => { events[name] = fn; }, unbind() {}, trigger() {} };
  const channelStore = { isHost: host, activeChannel: channel, mode: 'party', playerId: 'a', onlineGameRunning: true,
    playersOnline: [], completePartySync() { completed++; }, setGameRunning(value) { this.onlineGameRunning = value; }, removePlayer() {} };
  const gameStore = { currentRoundIndex: 0, isGameOver: false, setRoundIndex(value) { this.currentRoundIndex = value; } };
  const retry = { reset() {} };
  const heartbeat = { markHostActivity() {}, start() {}, stop() {}, playerLastSeen: ref({}) };
  const store = load('src/stores/party.ts', {
    defineStore: (_, factory) => factory, ref, computed, watch() {}, useChannelStore: () => channelStore,
    useGameStore: () => gameStore, useSoundStore: () => ({}), useConfigStore: () => ({}),
    useRouter: () => ({ currentRoute: { value: { path: '/party-player' } }, push: route => routes.push(route) }),
    usePartyHeartbeat: () => heartbeat, usePowerups: () => ({}), useBuzzerRetry: () => retry,
    useAnswerRetry: () => retry, useSuddenDeath: () => ({}), workerSetInterval: () => 1,
    workerClearInterval() {}, workerSetTimeout: () => 1, workerClearTimeout() {},
  }).usePartyStore();
  store.setupEvents();
  return { store, events, routes, channelStore, gameStore, completed: () => completed };
}
const snapshot = { sentAt: 1, isGameOver: false, roundIndex: 2, buzzerState: 'open', players: [{ playerId: 'a', points: 42 }] };
test('valid host snapshot restores scores and completes synchronization', () => {
  const h = party(); h.events['client-party-state']({ state: snapshot });
  assert.equal(h.store.players.value[0].points, 42); assert.equal(h.gameStore.currentRoundIndex, 2);
  assert.equal(h.completed(), 1);
});
test('invalid snapshot cannot unlock the controller', () => {
  const h = party(); h.events['client-party-state']({ state: {} });
  assert.equal(h.completed(), 0);
});
test('missed game-over is recovered from a snapshot', () => {
  const h = party(); h.events['client-party-state']({ state: { ...snapshot, isGameOver: true } });
  assert.equal(h.gameStore.isGameOver, true); assert.equal(h.channelStore.onlineGameRunning, false);
  assert.deepEqual(h.routes, ['/gameover-party-player']);
});
test('party inactivity preserves accumulated player stats on the host', () => {
  const h = party(true); h.store.players.value = [{ playerId: 'a', points: 42 }];
  h.events['client-player-inactive']({ playerId: 'a' });
  assert.equal(h.store.players.value[0].points, 42);
});

function channelSession(mode = 'party') {
  const intervals = new Map(); let intervalId = 0, saved = null, clients = 0;
  const time = clock();
  window.addEventListener = window.removeEventListener = () => {};
  global.document = { addEventListener() {}, removeEventListener() {} };
  const store = load('src/stores/channel.ts', {
    defineStore: (_, factory) => factory, ref, shallowRef: ref, watch() {},
    useRouter: () => ({ push() {} }), useConfigStore: () => ({}), usePlayerStore: () => ({}),
    usePlayerManagement: () => ({ playersOnline: ref([]), allowedIdsDuringGame: ref(null), reset() {}, lockAllowedIdsForRunningGame() {} }),
    useSessionPersistence: () => ({ readSession: () => saved, persistSession: value => { saved = value; }, clearSession: () => { saved = null; }, updateGameRunning: value => { if (saved) saved.wasInGame = value; } }),
    useInactivity: () => ({ reset() {}, handleInactivity() {} }),
    useConnectionState: () => ({ connectionState: ref('connected'), setForceReconnect() {}, createStateChangeHandler: () => () => {}, reset() {} }),
    useSubscriptionLifecycle() {}, useMemberEvents() {}, useChatEvents() {},
    parseClusterFromRoomId: () => 'eu',
    createApinatorClient: () => { clients++; return { connect() {}, bind() {}, unbind() {}, disconnect() {}, unsubscribe() {}, subscribe: () => ({ bind() {}, unbind() {}, trigger() {} }) }; },
    workerSetInterval: fn => { intervals.set(++intervalId, fn); return intervalId; },
    workerClearInterval: id => intervals.delete(id), workerSetTimeout() {}, SUBSCRIBE_TIMEOUT_MS: 22000,
  }).useChannelStore();
  store.setMode(mode); store.joinSession({ playerId: 'a' }, 'ABCDE'); store.setGameRunning(true);
  return { store, intervals, time, saved: () => saved, clients: () => clients };
}
test('party synchronization retries, offers manual reconnect, and stops after a snapshot', () => {
  const h = channelSession();
  const now = Date.now; let current = 100000;
  Date.now = () => current;
  try {
    h.store.requestPartySync(); h.store.requestPartySync();
    assert.equal(h.intervals.size, 1);
    assert.equal(h.store.awaitingPartyState.value, true);
    assert.equal(h.store.canRetryPartySync.value, false);
    current += 12000; [...h.intervals.values()][0]();
    assert.equal(h.store.canRetryPartySync.value, true);
    h.store.completePartySync();
    assert.equal(h.store.awaitingPartyState.value, false); assert.equal(h.intervals.size, 0);
  } finally { Date.now = now; }
});
test('forced party reconnect preserves the running-game flag and clears pending sync timers', () => {
  const h = channelSession(); h.store.requestPartySync();
  assert.equal(h.store.tryReconnect({ force: true }), true);
  assert.equal(h.saved().wasInGame, true); assert.equal(h.clients(), 2);
  assert.equal(h.intervals.size, 0);
});
test('forced online reconnect is refused', () => {
  const h = channelSession('regular');
  assert.equal(h.store.tryReconnect({ force: true }), false); assert.equal(h.clients(), 1);
});

test('party subscription timeout retains the session and offers retry', () => {
  const h = channelSession(); h.store.tryReconnect({ force: true }); h.time.fire();
  assert.notEqual(h.saved(), null); assert.notEqual(h.store.activeChannel.value, null);
  assert.equal(h.store.canRetryPartySync.value, true);
});
function subscription() {
  clock(); const events = {}; let clears = 0, resets = 0, syncs = 0;
  load('src/composables/useSubscriptionLifecycle.ts', {
    ref, isHostFlag: value => value === true, MAX_PLAYERS_REGULAR: 10, MAX_PLAYERS_PARTY_NON_HOST: 10,
    NO_HOST_GRACE_MS: 8000, toast: { error() {} },
  }).useSubscriptionLifecycle({
    channel: { bind: (name, fn) => { events[name] = fn; }, trigger() {} },
    isHost: ref(false), mode: ref('party'), playerId: ref('a'), onlineGameRunning: ref(true),
    subscribeTimeoutId: ref(null), noHostGraceTimeoutId: ref(null), configStore: {},
    playerMgmt: { playersOnline: ref([]), rehydrateAllowedIds() {}, lockAllowedIdsForRunningGame() {} },
    sessionPersistence: { readSession: () => null },
    loading: { isReconnecting: true, clear() { clears++; }, setReconnecting() {} },
    router: { currentRoute: { value: { path: '/party-player' } }, push() {} },
    reset() { resets++; }, setGameRunning() {}, onPartySyncRequired() { syncs++; },
  });
  return { events, clears: () => clears, resets: () => resets, syncs: () => syncs };
}
test('party resubscription requests a snapshot instead of clearing the reconnect state', () => {
  const h = subscription();
  h.events['realtime:subscription_succeeded']({ presence: { hash: { host: { host: true }, a: { host: false } } } });
  assert.equal(h.syncs(), 1); assert.equal(h.clears(), 0);
});
test('transient party subscription errors retain the session for retry', () => {
  const h = subscription(); h.events['realtime:subscription_error']({ type: 'NetworkError' });
  assert.equal(h.resets(), 0); assert.equal(h.syncs(), 1);
});
