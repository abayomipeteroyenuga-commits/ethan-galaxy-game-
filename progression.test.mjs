import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, dailyOperationFor, missionMedal, normalizeGalaxySave } from './progression.mjs';

const defaults = {
  credits: 0, unlocked: 1, completed: [], best: 0,
  ship: 0, owned: [0], weapon: 0, hull: 0,
  missionRecords: {}, dailyRecords: {}, achievements: [],
};

test('legacy saves are upgraded without losing existing campaign progress', () => {
  const save = normalizeGalaxySave({
    credits: 920, unlocked: 9, completed: [1, 2, 2, 9, 0, 31],
    best: 4500, ship: 1, owned: [0, 1], weapon: 2, hull: 1,
  }, defaults);
  assert.equal(save.credits, 920);
  assert.equal(save.unlocked, 9);
  assert.deepEqual(save.completed, [1, 2, 9]);
  assert.equal(save.best, 4500);
  assert.equal(save.ship, 1);
  assert.deepEqual(save.owned, [0, 1]);
  assert.deepEqual(save.missionRecords, {});
});

test('save normalisation clamps currencies, upgrades and invalid records', () => {
  const save = normalizeGalaxySave({
    credits: -5, unlocked: 99, ship: 12, weapon: 8, hull: -2,
    missionRecords: {
      5: { score: 4000, time: 74.4, kills: 26, medal: 9, wins: 2 },
      44: { score: 9000, medal: 3 },
    },
    dailyRecords: {
      '2026-11-17': { mission: 30, score: 5000, time: 65.6, medal: 4, completed: true, rewarded: true },
      '2026-02-30': { mission: 3, score: 200 },
    },
    achievements: ['first-flight', 'not-real', 'first-flight'],
  }, defaults);
  assert.equal(save.credits, 0);
  assert.equal(save.unlocked, 30);
  assert.equal(save.ship, 2);
  assert.equal(save.weapon, 4);
  assert.equal(save.hull, 0);
  assert.deepEqual(save.missionRecords, { 5: { score: 4000, time: 74, kills: 26, medal: 3, wins: 2 } });
  assert.deepEqual(save.dailyRecords['2026-11-17'], { mission: 30, score: 5000, time: 66, kills: 0, medal: 3, completed: true, rewarded: true });
  assert.equal(Object.keys(save.dailyRecords).length, 1);
  assert.deepEqual(save.achievements, ['first-flight']);
});

test('daily operation is deterministic for the same local date and valid across dates', () => {
  const first = dailyOperationFor('2026-11-17');
  assert.deepEqual(first, dailyOperationFor('2026-11-17'));
  assert.equal(first.date, '2026-11-17');
  assert.ok(first.mission >= 1 && first.mission <= 30);
  assert.ok(first.galaxy >= 0 && first.galaxy <= 5);
  assert.equal(first.difficulty, 1.25);
  assert.notDeepEqual(first, dailyOperationFor('2026-11-18'));
  assert.equal(dailyOperationFor('bad-date').date, '');
});

test('mission medals reward clears and better score/time combinations', () => {
  assert.equal(missionMedal({ win: false, score: 9000, elapsed: 30, mission: 5 }), 0);
  assert.equal(missionMedal({ win: true, score: 200, elapsed: 300, mission: 1 }), 1);
  assert.equal(missionMedal({ win: true, score: 1200, elapsed: 160, mission: 1 }), 2);
  assert.equal(missionMedal({ win: true, score: 1800, elapsed: 60, mission: 1 }), 3);
  assert.equal(missionMedal({ win: true, score: 5400, elapsed: 120, mission: 5 }), 3);
});

test('achievement catalogue contains unique IDs and positive crystal rewards', () => {
  const ids = ACHIEVEMENTS.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ACHIEVEMENTS.every(item => item.reward > 0 && item.name && item.description));
});
