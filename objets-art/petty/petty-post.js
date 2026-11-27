// ============================================================
// PETTY RUN — AFTER THE RUN. Order is locked:
//   THE RECEIPTS (+ roast) → THE PETTY REPORT → LEADERBOARD → SHOP → run it back.
// Every screen has PEW PEW AGAIN and a way back to the showroom.
// ============================================================
import * as C from "./petty-levels.js";
import { pickRoast } from "./petty-roasts.js";
import { recordPettyRun, localBoard, createRemote } from "./petty-board.js";
import { makePettyReport } from "./petty-report.js";
import { discoverShipTokens, shipTokenURL } from "./petty-ownership.js";

// Where "Buy this ship" goes, first match wins:
//   1. a sale page pasted in here (Manifold claim page or similar), else
//   2. the ship's own token, found on chain once it mints (ids 5+ on the ILLI$T
//      contract, matched to the ship by name), else
//   3. "Coming soon" pointing at the creator's Manifold page.
export const SHIP_SALE_URLS = {
  "aurora-voyager": null,
  "harvest-moon-glider": null,
  "plasmatic-glider": null,
  "star-drift": null,
  "sleigh-genesis": null,
  "beast-mobile": null,
};
const COMING_SOON_URL = "https://manifold.xyz/@maxximillian";
export const X_HANDLE = "@blaqqatbuilds @maxximillian"; // the dev org + the dev on X
const STREAM_LINKS = [["Stream on Twitch", "https://www.twitch.tv/"], ["Go live on TikTok", "https://www.tiktok.com/live"]];
const BOARDS = [["today", "Today"], ["all_time", "All time"], ["ship", "This ship"], ["fumbles", "Hall of Fumbles"]];
const STEPS = [["receipts", "Receipts"], ["report", "Petty Report"], ["board", "Leaderboard"], ["shop", "Shop"]];
const ENDED = { time: "TIME'S UP", ego_death: "EGO DEATH", quit: "QUIT" };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const descOf = (emoji, name) => { for (const l of C.LEVELS) for (const it of [...l.catchItems, ...l.avoidItems]) if (it.emoji === emoji && it.name === name) return it.desc; return ""; };
// canon telemetry rows: only items that exist in LEVELS
const TELEMETRY = [["🍕", "Pizzas"], ["🌹", "Roses"], ["🌮", "Tacos"], ["🌯", "Burritos"]]
  .filter(([e]) => C.LEVELS.some((l) => l.catchItems.some((it) => it.emoji === e)));

export function createPost(B, { api, lobby, launch, fmtScore }) {
  const { $ } = B;
  const remote = createRemote(B.SB_URL, B.SB_KEY);
  const m = document.createElement("div");
  m.className = "modal"; m.id = "pettyPost"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "ppTitle");
  m.innerHTML = `<div class="sheet psheet ppost"><button class="x" data-close aria-label="Back to the showroom">&times;</button>
    <div class="kicker" id="ppKicker"></div>
    <nav class="pp-steps" id="ppSteps" aria-label="After the run"></nav>
    <div id="ppBody"></div>
    <div class="btnrow pp-foot"><button class="bigbtn primary" id="ppNext"></button><button class="bigbtn cream" id="ppAgain">Pew pew again</button><button class="bigbtn ghost" id="ppHome">Back to the showroom</button></div>
  </div>`;
  document.body.appendChild(m);
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) B.closeModal("pettyPost"); });

  let run = null, step = "receipts", boardTab = "today", remoteId = null, ranks = null, reportBlob = null, reportUrl = null, rec = null, submitP = null;
  const boardCache = {};

  function roastInput() {
    const caughtNames = Object.keys(run.poisonLog || {});
    const flew = ["Debt Hole", "Dragon Spawn"].find((n) => caughtNames.includes(n));
    return { ...run, caughtNames, flewInto: flew ? run.poisonLog[flew] : null, rankToday: ranks ? Number(ranks.today) : null, vegasIdx: C.LEVELS.findIndex((l) => l.name === "VEGAS") };
  }

  // ── open after landing ──
  async function open(r) {
    run = r; step = "receipts"; boardTab = "today"; remoteId = null; ranks = null; reportBlob = null;
    for (const k in boardCache) delete boardCache[k];
    run.ens = run.opts.ens || null; run.wallet = run.opts.wallet || null;
    run.rank = C.getRank(run.score);
    run.roast = pickRoast(roastInput()).line;
    const acc = lobby.access;
    rec = recordPettyRun(run, acc ? { wallet: acc.address, ens: acc.ens, lasers: acc.lasers.map((l) => l.id), shipTokens: acc.shipTokens, ships: acc.ships, manifold: acc.manifold, seenAt: new Date().toISOString() } : null);
    // the dealership sees plays next to test drives. Its RPC needs an email
    // ("invalid email" otherwise), so emailless plays are kept on this device and
    // live in mspetty.petty_run_3d instead.
    const lead = { email: B.viewerEmail, mode: "Petty Run · " + (run.mode === "speed" ? "Speed Round" : "Infinite"),
      stats: { kind: "petty_run", hater: run.name, score: run.score, lolz: run.lolz, fumbles: run.fumbles, balloons: run.balloons, ended: run.ended, level: run.levelReached, seconds: run.duration } };
    if (B.viewerEmail) B.saveRecord("petty_run", lead);
    else { try { const k = "objets.leads", a = JSON.parse(localStorage.getItem(k) || "[]"); a.push(Object.assign({ kind: "petty_run", car: run.ship.name, at: new Date().toISOString() }, lead)); localStorage.setItem(k, JSON.stringify(a.slice(-20))); } catch (_) {} }
    render();
    B.openModal("pettyPost");
    discoverShipTokens(B.CARS).then((m) => { shipTokens = m; if (step === "shop") render(); }).catch(() => {});
    makeReport();
    let done; submitP = new Promise((r) => (done = r));
    try {
      remoteId = await remote.submit(run);
      if (remoteId) {
        const rk = await remote.rank(remoteId, run.ship.id);
        ranks = Array.isArray(rk) ? rk[0] : rk;
        const again = pickRoast(roastInput()).line;
        if (again !== run.roast) { run.roast = again; makeReport(); if (step === "receipts") render(); }
      }
    } catch (e) { remoteId = null; }
    done();
    if (step === "board") render();
  }
  async function makeReport() {
    const blob = await makePettyReport(B, run, run.roast, fmtScore).catch(() => null);
    if (reportUrl) URL.revokeObjectURL(reportUrl);
    reportBlob = blob; reportUrl = blob ? URL.createObjectURL(blob) : null;
    if (step === "report") render();
  }

  // ── screens ──
  function header() {
    const who = run.ens || run.name;
    $("ppKicker").textContent = [who, run.ship.name, run.mode === "speed" ? "Speed Round" : "Infinite", run.at.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })].join(" · ");
    $("ppSteps").innerHTML = STEPS.map(([k, l], i) => `<button data-s="${k}" aria-current="${k === step ? "step" : "false"}"><i>${i + 1}</i>${l}</button>`).join("");
    $("ppSteps").querySelectorAll("button").forEach((b) => (b.onclick = () => { step = b.dataset.s; render(); }));
    const i = STEPS.findIndex(([k]) => k === step);
    const nextLbl = { receipts: "See the Petty Report", report: "See the leaderboard", board: "Shop the ships" }[step];
    $("ppNext").hidden = !nextLbl; if (nextLbl) $("ppNext").innerHTML = esc(nextLbl) + " &rarr;";
    $("ppNext").onclick = () => { step = STEPS[Math.min(STEPS.length - 1, i + 1)][0]; render(); m.querySelector(".sheet").scrollTop = 0; };
  }
  function tile(label, value, tone, sub, wide) {
    return `<div class="pp-tile ${tone || ""}${wide ? " wide" : ""}"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub ? `<span>${esc(sub)}</span>` : ""}</div>`;
  }
  function receipts() {
    const r = run, tags = [];
    if (r.laser) tags.push(`Flown with ${r.laser.name}`);
    if (r.perks.fullLoadout) tags.push("FULL LOADOUT");
    else if (r.perks.tripleBeam) tags.push("TRIPLE BEAM");
    if (r.perks.ownerBadge) tags.push("OWNER");
    const tiles = [
      tile("High vibes destroyed", r.balloons.toLocaleString(), "", "balloons popped"),
      tile("Total value extracted", "+" + r.earned.toLocaleString(), "good"),
      tile("$LOLZ", r.lolz.toLocaleString(), "bad", "value fumbled"),
      tile("Fumbles", String(r.fumbles), "bad", "rewards that got away"),
      tile("Poison swallowed", String(r.poison), r.poison ? "bad" : "", r.poison ? fmtScore(r.poisonCost) + " $SHOTS" : "clean"),
      tile("Longest clean streak", String(r.bestChain), "good", "catches in a row"),
      tile("Longest L streak", String(r.worstChain), r.worstChain ? "bad" : "", "bad catches in a row"),
      tile("Highest level reached", r.levelReached, "", "final level: " + r.finalLevel, true),
      ...TELEMETRY.map(([e, n]) => tile(n + " caught", e + " " + (r.itemCounts[e] || 0), "good")),
    ];
    const bf = r.biggestFumble;
    const away = r.ledger.length
      ? `<div class="pp-away">${r.ledger.slice(0, 24).map((f) => `<span title="${esc(f.name)}"><em>${f.emoji}</em><s>+${f.value}</s></span>`).join("")}${r.ledger.length > 24 ? `<span class="more">+${r.ledger.length - 24} more</span>` : ""}</div>
         <div class="pp-bigfumble"><div class="e">${bf.emoji}</div><div><small>THE BIGGEST ONE</small><h3>${esc(bf.name)}</h3><s>+${bf.value}</s><p>${esc(descOf(bf.emoji, bf.name))}</p><p class="lv">Fell out in ${esc(bf.level)}</p></div>
           <div class="pp-bfstats"><div><small>Times it got away</small><strong>×${r.ledger.filter((f) => f.name === bf.name).length}</strong></div><div><small>Total let go</small><strong>+${r.lolz.toLocaleString()}</strong></div></div></div>`
      : `<div class="pp-bigfumble clean"><div class="e">🧾</div><div><small>NOTHING GOT AWAY</small><h3>Zero fumbles</h3><p>Every lime thing that fell out, you caught.</p></div></div>`;
    return `<h2 id="ppTitle">The Receipts</h2>
      ${tags.length ? `<div class="pp-tags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      <div class="pp-hero">
        <div class="pp-tile big ${r.score < 0 ? "bad" : "good"}"><small>$SHOTS</small><strong>${esc(fmtScore(r.score))}</strong><span class="rk">${r.rank.emoji} ${esc(r.rank.title)}</span><span class="pbl">${rec && rec.isNewBest ? (rec.prevBest == null ? "First run on the books" : "New personal best. Old one: " + esc(fmtScore(rec.prevBest))) : "Personal best: " + esc(fmtScore(rec ? rec.dossier.bestScore : r.score))} · Run ${rec ? rec.dossier.totalRuns : 1}</span></div>
        <div class="pp-tile big ${r.ended === "ego_death" ? "bad" : ""}"><small>How it ended</small><strong>${ENDED[r.ended]}</strong><span>${r.duration}s in the ${esc(r.ship.name)}</span></div>
      </div>
      <div class="pp-tiles">${tiles.join("")}</div>
      <h3 class="pp-h3">The ones that got away</h3>${away}
      <div class="pp-roast">${esc(r.roast)}</div>`;
  }
  function report() {
    return `<h2 id="ppTitle">The Petty Report</h2>
      <div class="bro"><div>${reportUrl ? `<img src="${reportUrl}" alt="Your Petty Report">` : `<div class="pp-making">Making your report…</div>`}
        ${run.video && run.video.size ? `<video src="${URL.createObjectURL(run.video)}" controls playsinline></video>` : ""}</div>
        <div class="stack"><p class="lead">Your stats, three frames from the run, the one that got away and a QR code that drops a friend straight into this ship.</p>
          <button class="bigbtn primary" id="ppSavePng"${reportBlob ? "" : " disabled"}>Save report (PNG)</button>
          ${run.video && run.video.size ? `<button class="bigbtn cream" id="ppSaveVid">Save run video</button>` : ""}
          <button class="bigbtn ghost" id="ppShare">Share and enter the giveaway</button>
          <div class="ok" id="ppSaveMsg"></div></div></div>`;
  }
  function board() {
    return `<h2 id="ppTitle">Leaderboard</h2>
      <div class="tabs pp-btabs">${BOARDS.map(([k, l]) => `<button data-b="${k}" aria-selected="${k === boardTab}">${l}</button>`).join("")}</div>
      <div class="pp-boardnote" id="ppBoardNote"></div>
      <div class="pp-board" id="ppBoard"><div class="pp-making">Loading the board…</div></div>`;
  }
  let shipTokens = null; // { shipId: tokenId } once the chain answers
  function saleButton(s) {
    const tokenId = shipTokens && shipTokens[s.id];
    const url = SHIP_SALE_URLS[s.id] || (tokenId ? shipTokenURL(tokenId) : null);
    if (url) return `<a class="bigbtn primary" href="${esc(url)}" target="_blank" rel="noopener">Buy the ${esc(s.name)}</a>`;
    return `<a class="bigbtn primary" href="${COMING_SOON_URL}" target="_blank" rel="noopener">The ${esc(s.name)} drops soon &rarr;</a><span class="pp-soon">Not minted yet. Watch Manifold for the drop.</span>`;
  }
  function shop() {
    const s = run.ship;
    return `<h2 id="ppTitle">Shop</h2>
      <div class="pp-shiphero"><div class="pic"><img src="thumbs/${s.key}.webp" alt="${esc(s.name)}"></div>
        <div><div class="kicker">ILLI Motors &middot; SuperKind Toy Co.</div><h3>${esc(s.name)}</h3><div class="specs"><span>${esc(s.edition)}</span><span>${esc(s.finish)}</span><span>${esc(s.cls)}</span></div>
          <p class="lead">Hold it, and Ms. Petty plays different.</p>
          <ul class="pp-perks"><li><b>Infinite</b> no clock, fly till EGO DEATH</li><li><b>Triple beam</b> three laser pew pews, red center, purple outer</li><li><b>Owner badge</b> next to your name on the leaderboard</li><li><b>Your name on the hull</b> painted on, every run</li></ul>
          <div class="btnrow">${saleButton(s)}</div></div></div>
      <h3 class="pp-h3">Pew Pew Arsenal</h3><p class="pp-tag">${esc(C.SHOP_TAGLINE)}</p>
      <p>Every pew pew is an ERC-721 on Base. Collect one → it enables Infinite Play + your own custom laser color.</p>
      <div class="pp-arsenal">${C.ONCHAIN_PEWS.map((p) => `<div class="pp-pew"><img src="${esc(p.art)}" alt="${esc(p.name)} pew pew" loading="lazy"><div><div class="chips2"><span class="now">NOW ONCHAIN</span><span>TOKEN #${p.id}</span></div><h4>${esc(p.name)}</h4><div class="en">⚡ Enables Infinite Play</div><a class="bigbtn ghost" href="${esc(C.transientToken(p.id))}" target="_blank" rel="noopener">Collect on Transient Labs &rarr;</a></div></div>`).join("")}</div>
      <div class="btnrow"><a class="bigbtn ghost" href="https://www.transient.xyz/nfts/base/${C.TRANSIENT_CONTRACT}" target="_blank" rel="noopener">See the full arsenal on Transient Labs &rarr;</a></div>
      <div class="pp-tip"><h3>${esc(C.TIP_JAR_LABEL)}</h3><div class="btnrow"><a class="bigbtn cream" href="${C.LINK_CASH_ENDODECA}" target="_blank" rel="noopener">$Endodeca</a><a class="bigbtn cream" href="${C.LINK_CASH_BLAQQAT}" target="_blank" rel="noopener">$BlaqqatBuilds</a></div></div>`;
  }

  function render() {
    header();
    const body = $("ppBody");
    body.innerHTML = step === "receipts" ? receipts() : step === "report" ? report() : step === "board" ? board() : shop();
    if (step === "report") {
      const sp = $("ppSavePng"); if (sp) sp.onclick = async () => { const r = await B.saveFile("petty-report-" + run.ship.id + ".png", reportBlob); $("ppSaveMsg").textContent = r === "saved" ? "Report saved." : r === "declined" ? "Save cancelled." : "This view could not save the file. Open the page on objets.art to save it."; };
      const sv = $("ppSaveVid"); if (sv) sv.onclick = async () => { const r = await B.saveFile("petty-run-" + run.ship.id + "." + (run.videoExt || "webm"), run.video); $("ppSaveMsg").textContent = r === "saved" ? "Run video saved." : r === "declined" ? "Save cancelled." : "This view could not save the video. Open the page on objets.art to save it."; };
      $("ppShare").onclick = openShare;
    }
    if (step === "board") { body.querySelectorAll("[data-b]").forEach((b) => (b.onclick = () => { boardTab = b.dataset.b; render(); })); loadBoard(); }
  }

  async function loadBoard() {
    const tab = boardTab, el = $("ppBoard"), note = $("ppBoardNote");
    let rows = null, local = false;
    if (submitP) await submitP;
    if (tab !== boardTab || !el.isConnected) return;
    if (remoteId !== null) {
      try { rows = boardCache[tab] || (boardCache[tab] = await remote.board(tab, run.ship.id)); } catch (_) { rows = null; }
    }
    if (!rows || !rows.length) { rows = localBoard(tab, run.ship.id); local = true; }
    if (tab !== boardTab || !el.isConnected) return;
    const myId = local ? rec.localId : remoteId;
    const myRank = !local && ranks ? Number(ranks[tab === "fumbles" ? "fumbles" : tab === "ship" ? "ship" : tab === "today" ? "today" : "all_time"]) : null;
    note.textContent = local ? (remoteId === null ? "Couldn't reach the global board, so this is the board from runs on this device." : "Showing runs from this device.") : (myRank ? "Your run: #" + myRank + " on this board." : "");
    const row = (r, mine) => `<div class="pp-row${mine ? " me" : ""}"><span class="rk">#${r.rank}</span><span class="nm">${esc(r.ens || r.hater_name)}${r.holds_ship ? '<i class="own">OWNER</i>' : ""}</span><img src="thumbs/${(B.CARS.find((c) => c.id === r.ship_id) || B.CARS[0]).key}.webp" alt=""><span class="sc ${r.score < 0 ? "neg" : ""}">${esc(fmtScore(r.score))}</span><span class="lz">${Number(r.lolz).toLocaleString()}</span></div>`;
    let html = `<div class="pp-row hd"><span class="rk">Rank</span><span class="nm">Hater</span><span class="shp">Ship</span><span class="sc">$SHOTS</span><span class="lz">$LOLZ</span></div>` + rows.map((r) => row(r, r.id === myId)).join("");
    if (!local && myRank && !rows.some((r) => r.id === myId)) html += row({ rank: myRank, ens: run.ens, hater_name: run.name, holds_ship: run.perks.ownerBadge, ship_id: run.ship.id, score: run.score, lolz: run.lolz }, true);
    el.innerHTML = html;
    const me = el.querySelector(".me"); if (me) me.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // ── share: the existing drawer, Petty Run caption + socials ──
  function caption() {
    return `Just extracted ${run.score} $SHOTS in the ${run.ship.name} and fumbled ${run.lolz} $LOLZ worth of good stuff. Ms. Petty saw everything. 🎈✨🔫 ${X_HANDLE} #MsPetty #SuperKindToyCo #ObjetsArt`;
  }
  function playUrl() { return B.COLLECTION_URL + "/#play-" + run.ship.id; }
  function openShare() {
    api.shareActive = true;
    $("caption").value = caption();
    buildSocials();
    const v = run.video;
    const canFiles = !!(navigator.canShare && v && v.size && (() => { try { return navigator.canShare({ files: [new File([v], "petty-run." + (run.videoExt || "webm"), { type: v.type })] }); } catch (_) { return false; } })());
    $("nativeShare").hidden = !canFiles;
    $("shareDrawer").classList.add("open");
  }
  function buildSocials() {
    const txt = $("caption").value, u = playUrl(), e = encodeURIComponent;
    const L = [
      ["X", "https://x.com/intent/post?text=" + e(txt)],                       // no URL on X
      ["Farcaster", "https://warpcast.com/~/compose?text=" + e(txt) + "&embeds[]=" + e(u)],
      ["Threads", "https://www.threads.net/intent/post?text=" + e(txt + " " + u)],
      ["Bluesky", "https://bsky.app/intent/compose?text=" + e(txt + " " + u)],
      ["Telegram", "https://t.me/share/url?url=" + e(u) + "&text=" + e(txt)],
      ...STREAM_LINKS,
    ];
    $("socials").innerHTML = L.map(([n, h]) => `<a href="${h}" target="_blank" rel="noopener">${esc(n)}</a>`).join("");
  }
  async function nativeShare() {
    try { await navigator.share({ files: [new File([run.video], "petty-run-" + run.ship.id + "." + (run.videoExt || "webm"), { type: run.video.type })], text: $("caption").value }); } catch (_) {}
  }

  $("ppAgain").onclick = () => { B.closeModal("pettyPost"); setTimeout(() => launch({ ...run.opts }), 250); };
  $("ppHome").onclick = () => B.closeModal("pettyPost");

  return { open, buildSocials, nativeShare };
}
