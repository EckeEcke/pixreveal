const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vue = require('vue');

function compile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
}

function data(file) {
  const module = { exports: {} };
  new Function('exports', compile(file))(module.exports);
  return module.exports;
}

const { ACHIEVEMENTS } = data('src/data/achievements.ts');
const unlockables = data('src/data/unlockables.ts');

function setup(ids = []) {
  const records = new Map(ids.map(id => [id, { id, unlockedAt: 1 }]));
  const database = {
    transaction() {
      const transaction = {
        objectStore() {
          return {
            getAll() {
              const request = { result: [...records.values()] };
              queueMicrotask(() => {
                request.onsuccess();
                queueMicrotask(() => transaction.oncomplete());
              });
              return request;
            },
            put(record) {
              records.set(record.id, record);
              queueMicrotask(() => transaction.oncomplete());
            },
          };
        },
      };
      return transaction;
    },
  };
  const indexedDB = {
    open() {
      const request = { result: database };
      queueMicrotask(() => request.onsuccess());
      return request;
    },
  };
  const dependencies = {
    vue,
    pinia: { defineStore: (_, factory) => factory },
    'vue3-toastify': { toast: { success() {} } },
    '@/data/achievements': { ACHIEVEMENTS },
    '@/data/unlockables': unlockables,
    '@/stores/sound': { useSoundStore: () => ({ playSound() {} }) },
  };
  const module = { exports: {} };
  new Function('exports', 'require', 'indexedDB', compile('src/stores/achievements.ts'))(
    module.exports, id => {
      assert.ok(id in dependencies, `Unexpected dependency: ${id}`);
      return dependencies[id];
    }, indexedDB,
  );
  return { store: module.exports.useAchievementsStore(), records };
}

test('retired records keep earned cosmetics without inflating active achievement counts', async () => {
  const { store } = setup(['edit-player', 'retired-first', 'retired-second']);
  await store.loadAchievements();
  assert.equal(store.unlockedCount.value, 1);
  assert.equal(store.cosmeticProgress.value, 3);
  assert.equal(store.hasBonusAvatars.value, true);
  assert.equal(store.hasAvatarEffects.value, false);
  assert.deepEqual(Object.keys(store.unlockedAtById.value), ['edit-player']);

  assert.equal(await store.unlock('play-singleplayer'), true);
  assert.equal(store.unlockedCount.value, 2);
  assert.equal(store.cosmeticProgress.value, 4);
  assert.equal(store.hasAvatarEffects.value, true);
});

test('retired records cannot prematurely grant completionist', async () => {
  const active = ACHIEVEMENTS.filter(a => a.id !== 'completionist').map(a => a.id);
  const { store, records } = setup([...active.slice(0, -2), 'retired-first', 'retired-second']);
  await store.loadAchievements();
  assert.equal(store.isUnlocked('completionist'), false);
  assert.equal(await store.unlock(active.at(-2)), true);
  await new Promise(setImmediate);
  assert.equal(store.isUnlocked('completionist'), false);
  assert.equal(records.has('completionist'), false);
});

test('all remaining achievements grant completionist and make every reward reachable', async () => {
  const active = ACHIEVEMENTS.filter(a => a.id !== 'completionist').map(a => a.id);
  const { store, records } = setup(active);
  await store.loadAchievements();
  await new Promise(setImmediate);
  assert.equal(store.isUnlocked('completionist'), true);
  assert.equal(records.has('completionist'), true);
  assert.equal(store.unlockedCount.value, ACHIEVEMENTS.length);
  assert.equal(store.cosmeticProgress.value, ACHIEVEMENTS.length);
  for (const reward of [...unlockables.NAME_EFFECTS, ...unlockables.AVATAR_EFFECTS]) {
    assert.ok(reward.unlockAt <= store.cosmeticProgress.value, `${reward.id} must be reachable`);
  }
});
