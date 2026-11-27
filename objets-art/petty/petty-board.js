// ============================================================
// PETTY RUN — PERSISTENCE
// Local (always on): objets_petty_dossier_v1, same shape and approach as the
// live game's Petty Dossier (src/pettyStats.js) plus 3D-only fields, and the
// last 20 runs for an offline leaderboard.
// Supabase: project xtkdnyqjheewsqnvugaj, schema mspetty, RPCs only.
// Every REST call sends Accept-Profile AND Content-Profile: mspetty.
// ============================================================
import { getRank } from "./petty-levels.js";

const KEY = "objets_petty_dossier_v1";
const HISTORY_CAP = 50;
const RUNS_CAP = 20;
const SCHEMA = "mspetty";

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } }
function write(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) {} }

export function getPettyDossier() { return read(); }

// One finished run → the dossier. Returns { dossier, prevBest, isNewBest, localId }.
export function recordPettyRun(run, inventory) {
  const d = read();
  const prevBest = d.bestScore == null ? null : d.bestScore;
  const shipId = run.ship.id;
  const totalRuns = (d.totalRuns || 0) + 1;
  const scoreSum = (d.scoreSum || 0) + run.score;
  const bf = run.biggestFumble;
  const prevBF = d.biggestFumbleEver || null;
  const localId = "local-" + Date.now().toString(36);
  const row = {
    id: localId, created_at: new Date().toISOString(), hater_name: run.name, ens: run.ens || null, wallet: run.wallet || null,
    ship_id: shipId, mode: run.mode, score: run.score, lolz: run.lolz, fumbles: run.fumbles, holds_ship: !!run.perks.ownerBadge,
    ended: run.ended, level_reached: run.levelReached,
  };
  const next = {
    ...d,
    // live-game dossier fields
    bestScore: prevBest == null ? run.score : Math.max(prevBest, run.score),
    lifetimeShots: (d.lifetimeShots || 0) + run.earned,
    lifetimeLolz: (d.lifetimeLolz || 0) + run.lolz,
    history: [...(Array.isArray(d.history) ? d.history : []), { ts: Date.now(), shots: run.score, lolz: run.lolz, ship: shipId }].slice(-HISTORY_CAP),
    totalRuns,
    totalEarned: (d.totalEarned || 0) + run.earned,
    totalDisrupted: (d.totalDisrupted || 0) + run.balloons,
    totalCatches: (d.totalCatches || 0) + run.catches,
    totalPenalties: (d.totalPenalties || 0) + run.poison,
    scoreSum,
    avgScore: Math.round(scoreSum / totalRuns),
    longestStreak: Math.max(d.longestStreak || 0, run.bestChain),
    bestLevel: run.score > (prevBest == null ? -Infinity : prevBest) ? run.levelReached : (d.bestLevel || run.levelReached),
    bestCatchValue: Math.max(d.bestCatchValue || 0, run.bestCatch ? run.bestCatch.value : 0),
    bestCatchName: run.bestCatch && run.bestCatch.value > (d.bestCatchValue || 0) ? run.bestCatch.name : (d.bestCatchName || ""),
    bestCatchEmoji: run.bestCatch && run.bestCatch.value > (d.bestCatchValue || 0) ? run.bestCatch.emoji : (d.bestCatchEmoji || ""),
    // Petty Run fields
    lifetimeFumbles: (d.lifetimeFumbles || 0) + run.fumbles,
    lifetimePoison: (d.lifetimePoison || 0) + run.poison,
    biggestFumbleEver: bf && (!prevBF || bf.value > prevBF.value) ? { emoji: bf.emoji, name: bf.name, value: bf.value } : prevBF,
    bestByShip: { ...(d.bestByShip || {}), [shipId]: Math.max((d.bestByShip || {})[shipId] ?? -Infinity, run.score) },
    runsByShip: { ...(d.runsByShip || {}), [shipId]: ((d.runsByShip || {})[shipId] || 0) + 1 },
    inventory: inventory || d.inventory || null,
    runs: [...(Array.isArray(d.runs) ? d.runs : []), row].slice(-RUNS_CAP),
  };
  write(next);
  return { dossier: next, prevBest, isNewBest: prevBest == null || run.score > prevBest, localId, rank: getRank(run.score) };
}

// ── local boards (offline, from the last 20 runs on this device) ──
export function localBoard(kind, shipId) {
  const runs = (read().runs || []).slice();
  const today = new Date().toDateString();
  let rows = runs;
  if (kind === "today") rows = runs.filter((r) => new Date(r.created_at).toDateString() === today);
  if (kind === "ship") rows = runs.filter((r) => r.ship_id === shipId);
  rows.sort(kind === "fumbles" ? (a, b) => b.lolz - a.lolz : (a, b) => b.score - a.score);
  return rows.slice(0, 20).map((r, i) => ({ ...r, rank: i + 1 }));
}

// ── Supabase (RPC only) ──
export function createRemote(SB_URL, SB_KEY) {
  async function rpc(fn, args) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 7000);
    try {
      const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
        method: "POST", signal: ctrl.signal,
        headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json", "Accept-Profile": SCHEMA, "Content-Profile": SCHEMA },
        body: JSON.stringify(args || {}),
      });
      if (!r.ok) throw new Error(fn + " " + r.status);
      return await r.json();
    } finally { clearTimeout(to); }
  }
  return {
    // returns the new run id (uuid)
    async submit(run) {
      const id = await rpc("submit_petty_run_3d", {
        p_hater_name: run.name, p_wallet: run.wallet || null, p_ens: run.ens || null, p_ship_id: run.ship.id, p_mode: run.mode,
        p_score: run.score, p_lolz: run.lolz, p_value_extracted: run.earned, p_balloons: run.balloons, p_catches: run.catches,
        p_poison: run.poison, p_fumbles: run.fumbles,
        p_biggest_fumble_emoji: run.biggestFumble ? run.biggestFumble.emoji : null,
        p_biggest_fumble_name: run.biggestFumble ? run.biggestFumble.name : null,
        p_biggest_fumble_value: run.biggestFumble ? run.biggestFumble.value : null,
        p_best_chain: run.bestChain, p_worst_chain: run.worstChain, p_level_reached: run.levelReached,
        p_duration_s: run.duration, p_ended: run.ended, p_weapon_token: run.laser ? run.laser.id : null,
        p_holds_ship: !!run.perks.ownerBadge, p_item_counts: run.itemCounts, p_roast: run.roast,
      });
      return typeof id === "string" ? id : (id && id.id) || (Array.isArray(id) && id[0] && (id[0].id || id[0].submit_petty_run_3d)) || null;
    },
    board(kind, shipId) { return rpc("petty_run_3d_board", { p_board: kind, p_ship_id: shipId || null }); },
    rank(id, shipId) { return rpc("petty_run_3d_my_rank", { p_id: id, p_ship_id: shipId || null }); },
  };
}
