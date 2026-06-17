// ============================================================
// MS. PETTY -- PETTY DOSSIER (local-first stats tracker)
// SuperKind Toy Co. -- sovereign: pure localStorage, zero deps.
// Single source of truth for the MY PETTY panel + GAME OVER board.
// v2: PRICIEST PEW, catch rate, clean catches, oops taken + satirical verdict.
// Backward compatible: same KEY, only new fields added.
// ============================================================

const KEY = "mspetty_dossier_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch (e) { return {}; }
}

function write(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); }
  catch (e) {}
}

export function getRank(score) {
  if (score >= 4444) return { title: "APEX PETTY",        emoji: "💅", color: "#FFD93D" };
  if (score >= 888)  return { title: "CERTIFIED PETTY",   emoji: "🔫", color: "#FF2D9B" };
  if (score >= 444)  return { title: "EMERGING PETTY",    emoji: "💜", color: "#B584E8" };
  return               { title: "PETTY IN TRAINING",  emoji: "🍼", color: "#888888" };
}

function getDossierFrom(d) {
  const totalDisrupted = d.totalDisrupted || 0;
  const totalCatches = d.totalCatches || 0;
  return {
    bestScore: d.bestScore || 0,
    lifetimeShots: d.lifetimeShots || 0,
    totalRuns: d.totalRuns || 0,
    totalEarned: d.totalEarned || 0,
    totalDisrupted,
    totalCatches,
    totalPenalties: d.totalPenalties || 0,
    longestStreak: d.longestStreak || 0,
    avgScore: d.avgScore || 0,
    bestLevel: d.bestLevel || "—",
    lifetimeCatchRate: totalDisrupted > 0 ? Math.round((totalCatches / totalDisrupted) * 100) : 0,
    bestCatch: {
      name: d.bestCatchName || "—",
      emoji: d.bestCatchEmoji || "🌟",
      value: d.bestCatchValue || 0,
    },
  };
}

export function getDossier() {
  return getDossierFrom(read());
}

export function pettyVerdict(run, dossier) {
  const { score, scoreDelta, isNewBest, prevBest, isNewBestCatch, bestCatch } = run;
  const pew = bestCatch && bestCatch.value > 0 ? bestCatch : null;
  const pick = (arr) => arr[Math.abs(score) % arr.length];

  if (prevBest === 0 && (dossier.totalRuns || 0) <= 1) {
    return {
      headline: "FIRST BLOOD 🩸 the board knows your name now.",
      sub: "no record to beat but your own. so go beat it.",
    };
  }

  if (isNewBest) {
    const headline = pick([
      "NEW PERSONAL RECORD 💅 the old you just got laid off.",
      "you outpettied yourself. they call that growth, baby.",
      "PEAK PETTY. somebody go check on your former self.",
    ]);
    const pewBit = (isNewBestCatch && pew)
      ? ` and that ${pew.emoji} ${pew.name}? richest pew you ever pulled.`
      : " frame it. post it. make 'em watch.";
    return { headline, sub: `+${scoreDelta} over your old sorry self.${pewBit}` };
  }

  if (scoreDelta >= -50) {
    return {
      headline: "SO CLOSE she could taste it. 😮‍💨",
      sub: `${Math.abs(scoreDelta)} short of your best. one more run. you know you want it.`,
    };
  }

  const headline = pick([
    "your BEST self clocked in. you took a personal day.",
    "the peak version of you is somewhere laughing.",
    "she's not mad at this run. she's just seen you do better.",
  ]);
  return {
    headline,
    sub: `${Math.abs(scoreDelta)} below your peak of ${prevBest}. record's still got your name on it though.`,
  };
}

export function recordRun({
  score = 0, earned = 0, disrupted = 0, level = null,
  catches = 0, penalties = 0,
  bestCatch = { name: "", emoji: "", value: 0 },
  worstPenalty = { name: "", emoji: "", value: 0 },
} = {}) {
  const d = read();
  const prevBest = d.bestScore || 0;
  const prevBestCatchValue = d.bestCatchValue || 0;
  const prevScore = d.lastScore || 0;

  const streak = score > prevScore ? (d.currentStreak || 0) + 1 : 0;
  const totalRuns = (d.totalRuns || 0) + 1;
  const scoreSum = (d.scoreSum || 0) + score;
  const isNewBest = score > prevBest;
  const isNewBestCatch = bestCatch.value > prevBestCatchValue;

  const next = {
    ...d,
    bestScore: Math.max(prevBest, score),
    lifetimeShots: (d.lifetimeShots || 0) + earned,
    totalRuns,
    totalEarned: (d.totalEarned || 0) + earned,
    totalDisrupted: (d.totalDisrupted || 0) + disrupted,
    totalCatches: (d.totalCatches || 0) + catches,
    totalPenalties: (d.totalPenalties || 0) + penalties,
    scoreSum,
    avgScore: Math.round(scoreSum / totalRuns),
    currentStreak: streak,
    longestStreak: Math.max(d.longestStreak || 0, streak),
    bestLevel: (isNewBest && level) ? level : (d.bestLevel || level || "GENESIS"),
    lastScore: score,
    bestCatchValue: Math.max(prevBestCatchValue, bestCatch.value || 0),
    bestCatchName: isNewBestCatch ? bestCatch.name : (d.bestCatchName || bestCatch.name || ""),
    bestCatchEmoji: isNewBestCatch ? bestCatch.emoji : (d.bestCatchEmoji || bestCatch.emoji || ""),
  };
  write(next);

  const catchRate = disrupted > 0 ? Math.round((catches / disrupted) * 100) : 0;
  const lastRun = {
    score, earned, disrupted, catches, penalties, level,
    bestCatch, worstPenalty,
    prevBest, scoreDelta: score - prevBest,
    isNewBest, isNewBestCatch,
    catchRate, streak, longestStreak: next.longestStreak,
  };

  const dossier = getDossierFrom(next);
  return {
    ...dossier,
    rank: getRank(score),
    lastRun,
    verdict: pettyVerdict(lastRun, dossier),
  };
}
