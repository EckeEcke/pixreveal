import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTopChampions, getWinnerProfileId } from '../src/utils/championStats.js';

const entry = (date, name, id, avatarIndex = 0) => ({ date, winner: { name, userId: `${name}-${id}`, avatarIndex } });

test('groups renamed profiles, counts each day once and uses latest appearance', () => {
  const old = entry('2026-10-01', 'Old-Name', 'ABCDE');
  const latest = entry('2026-11-01', 'New Name', 'ABCDE', 4);
  const result = getTopChampions([old, latest, latest, entry('2026-10-02', 'New Name', 'FGHJK')]);
  assert.equal(result[0].wins, 2);
  assert.equal(result[0].latest, latest);
  assert.equal(result.length, 2);
  assert.equal(getWinnerProfileId(old), 'ABCDE');
});

test('returns three profiles, breaks ties by latest win and excludes missing IDs', () => {
  const entries = ['ABCDE', 'FGHJK', 'LMNPQ', 'RTVWX'].map((id, index) => entry(`2026-11-0${index + 1}`, 'Same Name', id));
  entries.push({ date: '2026-11-05', winner: { name: 'No ID' } });
  const result = getTopChampions(entries);
  assert.deepEqual(result.map(x => x.profileId), ['RTVWX', 'LMNPQ', 'FGHJK']);
  assert.equal(getTopChampions([]).length, 0);
  assert.equal(getWinnerProfileId({ date: '2026-11-01', userId: 'Legacy-ABCDE', winner: { name: 'Legacy' } }), 'ABCDE');
});
