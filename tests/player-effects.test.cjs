const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vue = require('vue');

function compile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

const catalogModule = { exports: {} };
new Function('exports', compile('src/data/unlockables.ts'))(catalogModule.exports);
const catalog = catalogModule.exports;
const highlightsModule = { exports: {} };
const revealModule = { exports: {} };
new Function('exports', compile('src/utils/pixelReveal.ts'))(revealModule.exports);
new Function('exports', 'require', compile('src/utils/onlineHighlights.ts'))(highlightsModule.exports, () => revealModule.exports);

function profile(progress, saved = {}) {
  const values = new Map([['pixreveal:playerProfile', JSON.stringify(saved)]]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const achievements = {
    cosmeticProgress: progress,
    hasBonusAvatars: progress >= catalog.BONUS_AVATAR_ACHIEVEMENT_THRESHOLD,
    loadAchievements: async () => {},
  };
  const dependencies = {
    vue,
    pinia: { defineStore: (_, factory) => factory },
    '@/utils/random': { getRandomUserName: () => 'PLAYER' },
    './config': { useConfigStore: () => ({ revealTime: 10 }) },
    '@/utils/crypto': { generatePlayerId: () => 'ABCDE' },
    '@/utils/onlineHighlights': highlightsModule.exports,
    '@/data/unlockables': catalog,
    '@/stores/achievements': { useAchievementsStore: () => achievements },
  };
  const module = { exports: {} };
  new Function('exports', 'require', 'localStorage', 'sessionStorage', 'crypto', compile('src/stores/player.ts'))(
    module.exports, id => {
      assert.ok(id in dependencies, `Unexpected dependency: ${id}`);
      return dependencies[id];
    }, storage, storage, { randomUUID: () => 'controller-id' },
  );
  return {
    store: module.exports.usePlayerStore(),
    saved: () => JSON.parse(values.get('pixreveal:playerProfile')),
  };
}

test('each cosmetic respects its own unlock threshold', () => {
  for (const effect of catalog.AVATAR_EFFECTS) {
    const locked = profile(effect.unlockAt - 1).store;
    locked.setPlayerAvatarEffect(effect.id);
    assert.equal(locked.playerAvatarEffect.value, 'none');
    const unlocked = profile(effect.unlockAt).store;
    unlocked.setPlayerAvatarEffect(effect.id);
    assert.equal(unlocked.playerAvatarEffect.value, effect.id);
  }
  for (const effect of catalog.NAME_EFFECTS) {
    const locked = profile(effect.unlockAt - 1).store;
    locked.setPlayerNameEffect(effect.id);
    assert.equal(locked.playerNameEffect.value, 'none');
    const unlocked = profile(effect.unlockAt).store;
    unlocked.setPlayerNameEffect(effect.id);
    assert.equal(unlocked.playerNameEffect.value, effect.id);
  }
});

test('Hologram and Stardust persist and restore together', async () => {
  const hologram = catalog.AVATAR_EFFECTS.find(effect => effect.id === 'avatar-effect-hologram');
  const stardust = catalog.NAME_EFFECTS.find(effect => effect.id === 'stardust');
  assert.ok(hologram);
  assert.ok(stardust);
  const { store, saved } = profile(Math.max(hologram.unlockAt, stardust.unlockAt));
  store.setPlayerAvatarEffect(hologram.id);
  store.setPlayerNameEffect(stardust.id);
  await vue.nextTick();
  assert.equal(saved().avatarEffect, hologram.id);
  assert.equal(saved().nameEffect, stardust.id);
  const restored = profile(10, saved()).store;
  assert.equal(restored.playerAvatarEffect.value, hologram.id);
  assert.equal(restored.playerNameEffect.value, stardust.id);
});

test('unknown effects are rejected and effects can always be disabled', () => {
  const { store } = profile(10);
  store.setPlayerAvatarEffect('unknown');
  store.setPlayerNameEffect('unknown');
  assert.equal(store.playerAvatarEffect.value, 'none');
  assert.equal(store.playerNameEffect.value, 'none');
  const existing = profile(0, { avatarEffect: 'avatar-effect-hologram', nameEffect: 'stardust' }).store;
  existing.setPlayerAvatarEffect('none');
  existing.setPlayerNameEffect('none');
  assert.equal(existing.playerAvatarEffect.value, 'none');
  assert.equal(existing.playerNameEffect.value, 'none');
});
