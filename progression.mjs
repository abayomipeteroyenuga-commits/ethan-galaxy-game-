const DATE_KEY = /^\\d{4}-\\d{2}-\\d{2}$/;
const ACHIEVEMENTS = [
  { id: 'first-flight', name: 'First Flight', description: 'Clear your first campaign mission', reward: 100 },
  { id: 'guardian-slayer', name: 'Guardian Slayer', description: 'Defeat a galaxy Guardian', reward: 175 },
  { id: 'sector-veteran', name: 'Sector Veteran', description: 'Clear ten campaign missions', reward: 250 },
  { id: 'galaxy-liberator', name: 'Galaxy Liberator', description: 'Complete all thirty campaign missions', reward: 1000 },
  { id: 'survival-ace', name: 'Survival Ace', description: 'Reach a 5,000-point survival record', reward: 300 },
  { id: 'fleet-commander', name: 'Fleet Commander', description: 'Unlock all three fighter ships', reward: 300 },
];
const VALID_ACHIEVEMENTS = new Set(ACHIEVEMENTS.map(item => item.id));

function safeInteger(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
}
function safeTime(value) {
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}
function validDateKey(key) {
  if (typeof key !== 'string' || !DATE_KEY.test(key)) return false;
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

export function dailyOperationFor(value = new Date()) {
  const date = typeof value === 'string' ? value : localDateKey(value);
  if (!validDateKey(date)) return { date: '', mission: 1, galaxy: 0, difficulty: 1.25, reward: 350 };
  const seed = Number(date.replace(/-/g, '')) >>> 0;
  let mixed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  mixed ^= mixed >>> 16;
  const mission = (mixed % 30) + 1;
  return {
    date,
    mission,
    galaxy: Math.floor((mission - 1) / 5),
    difficulty: 1.25,
    reward: 350,
  };
}

export function missionMedal({ win, score, elapsed, mission }) {
  if (!win) return 0;
  const n = safeInteger(mission, 1, 1, 30);
  const quota = 10 + n * 2;
  const target = quota * 100 + (n % 5 === 0 ? 2000 + n * 100 : 0);
  if (safeInteger(score, 0) >= Math.ceil(target * 1.2) &&
      Number.isFinite(elapsed) && elapsed <= (n % 5 === 0 ? 150 : 90)) return 3;
  if (safeInteger(score, 0) >= Math.ceil(target * .8)) return 2;
  return 1;
}

export function normalizeGalaxySave(value, defaults) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const completed = [...new Set(
    (Array.isArray(raw.completed) ? raw.completed : [])
      .filter(n => Number.isInteger(n) && n >= 1 && n <= 30)
  )].sort((a, b) => a - b);

  const owned = [...new Set([
    0,
    ...(Array.isArray(raw.owned) ? raw.owned.filter(n => Number.isInteger(n) && n >= 0 && n <= 2) : []),
  ])];

  const missionRecords = {};
  if (raw.missionRecords && typeof raw.missionRecords === 'object' && !Array.isArray(raw.missionRecords)) {
    for (const [key, record] of Object.entries(raw.missionRecords)) {
      const mission = Number(key);
      if (!Number.isInteger(mission) || mission < 1 || mission > 30 || !record || typeof record !== 'object') continue;
      missionRecords[mission] = {
        score: safeInteger(record.score),
        time: safeTime(record.time),
        kills: safeInteger(record.kills),
        medal: safeInteger(record.medal, 0, 0, 3),
        wins: safeInteger(record.wins),
      };
    }
  }

  const dailyRecords = {};
  if (raw.dailyRecords && typeof raw.dailyRecords === 'object' && !Array.isArray(raw.dailyRecords)) {
    for (const [date, record] of Object.entries(raw.dailyRecords)) {
      if (!validDateKey(date) || !record || typeof record !== 'object') continue;
      dailyRecords[date] = {
        mission: safeInteger(record.mission, 1, 1, 30),
        score: safeInteger(record.score),
        time: safeTime(record.time),
        kills: safeInteger(record.kills),
        medal: safeInteger(record.medal, 0, 0, 3),
        completed: Boolean(record.completed),
        rewarded: Boolean(record.rewarded),
      };
    }
  }

  const achievements = [...new Set(
    (Array.isArray(raw.achievements) ? raw.achievements : [])
      .filter(id => typeof id === 'string' && VALID_ACHIEVEMENTS.has(id))
  )];

  return {
    ...defaults,
    credits: safeInteger(raw.credits),
    unlocked: safeInteger(raw.unlocked, defaults.unlocked, 1, 30),
    completed,
    best: safeInteger(raw.best),
    ship: safeInteger(raw.ship, 0, 0, 2),
    owned,
    weapon: safeInteger(raw.weapon, 0, 0, 4),
    hull: safeInteger(raw.hull, 0, 0, 4),
    missionRecords,
    dailyRecords,
    achievements,
  };
}

export { ACHIEVEMENTS, localDateKey };
