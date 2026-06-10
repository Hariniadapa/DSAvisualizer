export const LEVELS = [
  { level:1, minXP:0,    title:'Novice' },
  { level:2, minXP:100,  title:'Apprentice' },
  { level:3, minXP:250,  title:'Coder' },
  { level:4, minXP:500,  title:'Solver' },
  { level:5, minXP:900,  title:'Expert' },
  { level:6, minXP:1400, title:'Master' },
  { level:7, minXP:2000, title:'Legend' },
];

export const XP_REWARDS = { easy:50, medium:100, hard:200, hint:-10, streak_bonus:25 };

export function getStats() {
  return {
    xp:          parseInt(localStorage.getItem('xp')          || '0'),
    streak:      parseInt(localStorage.getItem('streak')      || '0'),
    lastSolved:  localStorage.getItem('lastSolved')            || null,
    solvedCount: parseInt(localStorage.getItem('solvedCount') || '0'),
    solvedIds:   JSON.parse(localStorage.getItem('solvedIds') || '[]'),
  };
}

export function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      current = LEVELS[i];
      next    = LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = next
    ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
    : 100;
  return { current, next, progress: Math.round(progress) };
}

export function recordSolved(problemId, difficulty) {
  const stats     = getStats();
  if (stats.solvedIds.includes(problemId))
    return { xpGained:0, newStreak:stats.streak, alreadySolved:true };

  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let newStreak   = stats.streak;

  if      (stats.lastSolved === today)     { /* no change */ }
  else if (stats.lastSolved === yesterday) { newStreak += 1; }
  else                                     { newStreak  = 1; }

  const base     = XP_REWARDS[difficulty] || 50;
  const bonus    = newStreak > 1 ? XP_REWARDS.streak_bonus : 0;
  const xpGained = base + bonus;

  localStorage.setItem('xp',          String(stats.xp + xpGained));
  localStorage.setItem('streak',      String(newStreak));
  localStorage.setItem('lastSolved',  today);
  localStorage.setItem('solvedCount', String(stats.solvedCount + 1));
  localStorage.setItem('solvedIds',   JSON.stringify([...stats.solvedIds, problemId]));

  return { xpGained, newStreak, alreadySolved:false };
}

export function recordHintUsed() {
  const stats = getStats();
  localStorage.setItem('xp', String(Math.max(0, stats.xp + XP_REWARDS.hint)));
}