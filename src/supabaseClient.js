// ============================================================
// MS. PETTY — minimal Supabase PostgREST RPC client
// ------------------------------------------------------------
// NOTE: there is no pre-existing submit_run RPC in this repo to mirror, so this
// follows the standard Supabase PostgREST convention: publishable (anon) key +
// Accept-Profile / Content-Profile headers to target the `mspetty` schema.
//
// TODO(confirm): set these in the Vercel/Vite env before the RPCs go live:
//   VITE_SUPABASE_URL                (defaults to the known project URL below)
//   VITE_SUPABASE_PUBLISHABLE_KEY    (anon/publishable key — required to insert)
// Until the key is present, calls soft no-op so the UI never blocks or crashes.
// ============================================================

const ENV = (typeof import.meta !== "undefined" && import.meta.env) || {};

const SUPABASE_URL =
  ENV.VITE_SUPABASE_URL || "https://qycdhyhhxruoibsxrxfq.supabase.co";
const SUPABASE_KEY = ENV.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const SCHEMA = "mspetty";

async function rpc(fn, args) {
  // No key configured yet → soft no-op. The caller still shows success state.
  if (!SUPABASE_KEY) {
    return { ok: false, skipped: true, reason: "no_publishable_key" };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Accept-Profile": SCHEMA,
        "Content-Profile": SCHEMA,
      },
      body: JSON.stringify(args),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    // Never throw — the forms must succeed visually regardless of network.
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

// TASK 5 — gameplay share submission
export function submitGameplayShare(postUrl) {
  return rpc("submit_gameplay_share", { post_url: postUrl });
}

// TASK 6 — grant (whitelist) application
export function submitGrantApplication(wallet, email, postUrl) {
  return rpc("submit_grant_application", {
    wallet,
    email,
    post_url: postUrl,
  });
}

// STEP 3 — LIVE LEADERBOARD ----------------------------------------------------
// Submit a finished run. Backend RPC mspetty.submit_run is already live.
// TODO(confirm): exact RPC parameter names on mspetty.submit_run.
export function submitRun({ haterName, score, lolz = 0, level = null }) {
  return rpc("submit_run", {
    hater_name: haterName,
    score,
    lolz,
    level,
  });
}

// Read the top scores for the leaderboard panel (PostgREST GET, mspetty schema).
// TODO(confirm): exposed table/view name + columns. Assumes a `leaderboard`
// view/table with hater_name + score. Degrades to [] if the schema differs.
export async function getLeaderboard(limit = 20) {
  if (!SUPABASE_KEY) return { ok: false, rows: [] };
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/leaderboard` +
      `?select=hater_name,score&order=score.desc&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Accept-Profile": SCHEMA,
      },
    });
    if (!res.ok) return { ok: false, rows: [] };
    const rows = await res.json();
    return { ok: true, rows: Array.isArray(rows) ? rows : [] };
  } catch (e) {
    return { ok: false, rows: [] };
  }
}
