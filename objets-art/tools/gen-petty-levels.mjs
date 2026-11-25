#!/usr/bin/env node
// ============================================================
// Generates objets-art/petty/petty-levels.js from the Ms. Petty repo.
// The repo (src/MsPetty.jsx + src/pettyStats.js) is the source of truth.
// Every value is lifted out of the source text. Nothing is typed by hand.
// If the repo changes, rerun:  node objets-art/tools/gen-petty-levels.mjs
// ============================================================
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");
const jsx = readFileSync(resolve(repo, "src/MsPetty.jsx"), "utf8");
const stats = readFileSync(resolve(repo, "src/pettyStats.js"), "utf8");

let sha = "unknown";
try { sha = execSync("git log -1 --format=%h -- src/MsPetty.jsx src/pettyStats.js", { cwd: repo }).toString().trim(); } catch (_) {}

const fail = (what) => { console.error("gen-petty-levels: could not find " + what + " in the repo source"); process.exit(1); };

// Balanced-bracket slice starting at the first `open` after `startIdx`.
function balanced(src, startIdx, open, close) {
  const i = src.indexOf(open, startIdx);
  if (i < 0) return null;
  let depth = 0, inStr = null;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (inStr) { if (c === "\\") { k++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return src.slice(i, k + 1); }
  }
  return null;
}
function block(src, marker, open, close, what) {
  const at = src.indexOf(marker);
  if (at < 0) fail(what);
  const body = balanced(src, at, open, close);
  if (!body) fail(what);
  return src.slice(at, src.indexOf(open, at)) + body;
}
function constLine(src, name) {
  const m = src.match(new RegExp("^const " + name + "\\s*=\\s*[^;]+;.*$", "m"));
  if (!m) fail(name);
  return m[0];
}

// 1) Color system (LEVELS references these names).
const colorStart = jsx.indexOf("// ── COLOR SYSTEM");
const colorEnd = jsx.indexOf("// ── FONT STACK");
if (colorStart < 0 || colorEnd < 0) fail("COLOR SYSTEM block");
const colors = jsx.slice(colorStart, colorEnd).trim();

// 2) LEVELS + getLevel.
const levels = block(jsx, "const LEVELS = ", "[", "]", "LEVELS") + ";";
const getLevel = block(jsx, "function getLevel(", "{", "}", "getLevel()");

// 3) Game constants.
const consts = ["INITIAL_TIME", "BALLOON_INTERVAL", "ITEM_FALL_SPEED", "BALLOON_RISE_BASE", "BALLOON_SIZE", "ITEM_SIZE", "ITEM_TAP_PADDING"].map((n) => constLine(jsx, n));

// 4) Flash message banks from catchItem().
const fm = jsx.match(/const msgs = val > 0\s*\?\s*(\[[^\]]+\])\s*:\s*(\[[^\]]+\]);/);
if (!fm) fail("catch/avoid flash message bank");

// 5) Fumble line, EGO DEATH threshold, timer cap, +1s chance, level time-bonus cap.
const fumbleM = jsx.match(/setFlash\(\{ text: "(the smile won that round[^"]*)"/);
if (!fumbleM) fail("fumble flash line");
const fumblePenaltyM = jsx.match(/setTimeLeft\(t => Math\.max\(0, t - (\d+)\)\);\s*\n\s*setFlash\(\{ text: "the smile won/);
if (!fumblePenaltyM) fail("fumble time penalty");
const egoM = jsx.match(/if \(score <= (-\d+)\) \{/);
if (!egoM) fail("EGO DEATH threshold");
const capM = jsx.match(/Math\.min\(t \+ currentLevel\.timeBonus, (\d+)\)/);
if (!capM) fail("time bonus cap");
const plusM = jsx.match(/if \(val > 0 && Math\.random\(\) > ([\d.]+)\) setTimeLeft\(t => Math\.min\(t \+ (\d+), (\d+)\)\)/);
if (!plusM) fail("+1s catch bonus");

// 6) getRank from the Petty Dossier.
const getRank = block(stats, "export function getRank(", "{", "}", "getRank()");
const dossierKey = (stats.match(/const KEY = "([^"]+)"/) || [])[1] || fail("dossier KEY");

// 7) Pew Pew Arsenal shop data (hardcoded in the live game on purpose).
const pewGifs = block(jsx, "const PEW_GIFS = ", "{", "}", "PEW_GIFS") + ";";
const transient = constLine(jsx, "TRANSIENT_CONTRACT");
const transientToken = constLine(jsx, "transientToken");
const pews = block(jsx, "const ONCHAIN_PEWS = ", "[", "]", "ONCHAIN_PEWS") + ";";
const cashE = constLine(jsx, "LINK_CASH_ENDODECA");
const cashB = constLine(jsx, "LINK_CASH_BLAQQAT");
const tipLabelM = jsx.match(/>(BUY THE DEV A SHOT[^<]*)</);
if (!tipLabelM) fail("tip jar label");
const shopTagM = jsx.match(/"own a pew pew\. play forever\."/);
if (!shopTagM) fail("shop tagline");

const out = `// ============================================================
// PETTY RUN — LEVEL + ITEM CANON (GENERATED FILE, DO NOT EDIT)
// ------------------------------------------------------------
// Source of truth: the Ms. Petty repo (DrkSiddh/mspetty)
//   src/MsPetty.jsx   LEVELS, getLevel, game constants, flash banks,
//                     fumble line, EGO DEATH rule, Pew Pew Arsenal shop
//   src/pettyStats.js getRank
// Generated from repo commit ${sha} by objets-art/tools/gen-petty-levels.mjs.
// The repo wins. To change canon, change the repo and regenerate.
// ============================================================

${colors}

${levels}

${getLevel}

// ── GAME CONSTANTS (verbatim) ────────────────────────────────
${consts.join("\n")}

// ── RULES LIFTED FROM THE GAME LOOP ──────────────────────────
export const EGO_DEATH_AT = ${egoM[1]};              // run ends when score <= this
export const TIME_CAP = ${capM[1]};                  // timer never exceeds this (level bonus + catch bonus)
export const CATCH_TIME_CHANCE = ${plusM[1]};        // catch: Math.random() > this → +${plusM[2]}s
export const CATCH_TIME_BONUS = ${plusM[2]};
export const FUMBLE_TIME_PENALTY = ${fumblePenaltyM[1]};  // timed rounds only
export const FUMBLE_LINE = ${JSON.stringify(fumbleM[1])};
export const flashMessages = (val) => val > 0
  ? ${fm[1]}
  : ${fm[2]};
// Item pick weighting from popBalloon(): catch items twice + avoid items once.
export function itemPool(level) {
  const allItems = [...level.catchItems, ...level.avoidItems];
  return level.catchItems.length > 0
    ? [...level.catchItems, ...level.catchItems, ...level.avoidItems]
    : allItems;
}

// ── RANK (src/pettyStats.js) ─────────────────────────────────
${getRank}
export const LIVE_DOSSIER_KEY = ${JSON.stringify(dossierKey)};

// ── PEW PEW ARSENAL (hardcoded shop, verbatim) ───────────────
${pewGifs}
${transient}
${transientToken}
${pews}
${cashE}
${cashB}
export const TIP_JAR_LABEL = ${JSON.stringify(tipLabelM[1])};
export const SHOP_TAGLINE = ${shopTagM[0]};

export {
  LIME, MAGENTA, PURPLE, PURPLE_LT, YELLOW, PINK, CYAN, BLACK, DARK, CARD,
  LEVELS, getLevel,
  INITIAL_TIME, BALLOON_INTERVAL, ITEM_FALL_SPEED, BALLOON_RISE_BASE, BALLOON_SIZE, ITEM_SIZE, ITEM_TAP_PADDING,
  PEW_GIFS, TRANSIENT_CONTRACT, transientToken, ONCHAIN_PEWS, LINK_CASH_ENDODECA, LINK_CASH_BLAQQAT,
};
`.replace("export function getRank(", "export function getRank(");

const target = resolve(here, "../petty/petty-levels.js");
writeFileSync(target, out);
console.log("wrote " + target + " from " + sha);
