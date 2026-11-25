// ============================================================
// PETTY RUN — LOBBY: ship, hater name, optional wallet, laser pick, mode.
// Also renders HOW TO PLAY + ITEMS (used here and in the Owner's Manual).
// ============================================================
import * as C from "./petty-levels.js";
import { getAccess, discoverWallets, connectWith, silentAccount, shortAddr, isMobile, walletDeepLinks, OWNERSHIP } from "./petty-ownership.js";

const WALLET_KEY = "objets_petty_wallet";
const LASER_KEY = "objets_petty_laser";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const HOW_TO_PLAY = [
  { em: "🎈", h: "Pop the balloons", p: "Toxic positivity floats at you wearing a fake smile. Laser pew pews pop it. Something falls out of every one." },
  { em: "🍕", h: "Fly through the lime stuff", p: "A lime ring means catch. Steer the ship straight through it and the points are yours." },
  { em: "🍌", h: "Dodge the magenta stuff", p: "A magenta ring means poison. Touch it and it comes off your $SHOTS." },
  { em: "🗝️", h: "Don't let the good stuff get away", p: "Every lime item that slips past you is a fumble. $LOLZ is watching. In a Speed Round each fumble costs 2 seconds." },
  { em: "💀", h: "Ego Death at −30", p: "Scores go negative. Hit −30 and the run is over. That is the only way to die." },
];

export function howToHTML(coarse) {
  return `<div class="howto">${HOW_TO_PLAY.map((c, i) => `<div class="stepcard"><span class="em">${c.em}</span><div class="n">${String(i + 1).padStart(2, "0")}</div><h3>${esc(c.h)}</h3><p>${esc(c.p)}</p></div>`).join("")}</div>
  <div class="perk"><h3>Controls</h3><p style="margin:0">${coarse
    ? "Left thumb on the joystick steers. Right thumb on FIRE sprays laser pew pews. Auto-fire is on by default and the pill at the top turns it off. Nudge gives you a quick burst of speed."
    : "WASD or the arrow keys steer. SPACE or hold the mouse button to fire laser pew pews. SHIFT nudges the ship faster for a beat. Forward is automatic."}</p></div>`;
}
export function itemsHTML() {
  return C.LEVELS.map((l) => `<div class="itemlvl"><h3>${esc(l.name)} <small>$SHOTS ${l.min}–${l.max}</small></h3><div class="sub">“${esc(l.subtitle)}”</div><div class="items">${
    [...l.catchItems.map((it) => [it, true]), ...l.avoidItems.map((it) => [it, false])].map(([it, good]) =>
      `<div class="itm ${good ? "good" : "bad"}"><div class="e">${it.emoji}</div><div><b>${esc(it.name)}</b><span class="v">${it.value > 0 ? "+" : ""}${it.value}</span><span class="tag">${good ? "CATCH" : "AVOID"}</span><p>${esc(it.desc)}</p></div></div>`).join("")
  }</div></div>`).join("");
}

export function createLobby(B, { launch, audio }) {
  const { $ } = B;
  const m = document.createElement("div");
  m.className = "modal"; m.id = "pettyLobby"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "plTitle");
  m.innerHTML = `<div class="sheet psheet"><button class="x" data-close aria-label="Close">&times;</button>
    <div class="plobby">
      <div><div class="carpic"><img id="plImg" alt=""></div><div class="shipname" id="plShip"></div><div class="shipsub" id="plShipSub"></div>
        <div class="btnrow" style="justify-content:center"><button class="bigbtn ghost" id="plPrev" aria-label="Previous ship">&larr;</button><button class="bigbtn ghost" id="plNext" aria-label="Next ship">&rarr;</button></div>
        <div class="perk plpitch"><h3>Hold it, and Ms. Petty plays different</h3><ul id="plPitch"></ul></div></div>
      <div>
        <div class="kicker">ILLI Motors &times; Ms. Petty &middot; Petty Run</div>
        <h2 id="plTitle">Petty Run</h2>
        <p class="lead">Shoot the toxic positivity balloons with laser pew pews. Fly through the good stuff that falls out. Dodge the poison.</p>
        <div class="tabs" role="tablist"><button role="tab" data-t="play" aria-selected="true">Play</button><button role="tab" data-t="how" aria-selected="false">How to play</button><button role="tab" data-t="items" aria-selected="false">Items</button></div>
        <div id="plBody"></div>
      </div>
    </div></div>`;
  document.body.appendChild(m);
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) B.closeModal("pettyLobby"); });

  let ship = 0, tab = "play", access = null, wallet = null, laserPick = null, notice = "", wallets = null, busyConn = false;
  try { laserPick = parseInt(localStorage.getItem(LASER_KEY), 10) || null; } catch (_) {}

  function hater() { try { return localStorage.getItem("haterName") || ""; } catch (_) { return ""; } }
  function chosenLaser() {
    if (!access || !access.lasers.length) return null;
    const ids = access.lasers.map((l) => l.id);
    return ids.includes(laserPick) ? laserPick : Math.max(...ids); // live game tiebreak: highest id
  }
  function perks() {
    const id = B.CARS[ship].id;
    const holdsShip = !!(access && access.ships.includes(id));
    const manifold = !!(access && access.manifold);
    const laser = chosenLaser();
    return {
      infinite: !!(access && access.holder),
      holdsShip, manifold, laser,
      tripleBeam: holdsShip || manifold,
      ownerBadge: holdsShip,
      hullName: holdsShip || manifold,
      fullLoadout: !!laser && (holdsShip || manifold),
    };
  }
  function greet() {
    if (access && access.ens) return "Welcome back, " + access.ens;
    if (wallet) return "Welcome back, " + shortAddr(wallet);
    const h = hater(); return h ? "Welcome back, " + h : "";
  }

  function render() {
    const car = B.CARS[ship];
    $("plImg").src = "thumbs/" + car.key + ".webp"; $("plImg").alt = car.name;
    $("plShip").textContent = car.name; $("plShipSub").textContent = car.edition + " · " + car.finish;
    $("plPitch").innerHTML = ["Infinite: no clock, fly till EGO DEATH", "Triple beam: three laser pew pews, red center, purple outer", "Owner badge on the leaderboard", "Your name painted on the hull", "Hold a laser too: its own sound. That is the full loadout"].map((x) => "<li>" + esc(x) + "</li>").join("");
    m.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.t === tab ? "true" : "false"));
    const body = $("plBody");
    if (tab === "how") { body.innerHTML = howToHTML(B.coarse); return; }
    if (tab === "items") { body.innerHTML = itemsHTML(); return; }
    const P = perks();
    const lasers = access ? access.lasers : [];
    const lockWhy = "Locked. Hold any SuperKind laser pew pew on Base, a SuperKind ship, or " + OWNERSHIP.manifold.name + " on Ethereum in the wallet you connect.";
    const chips = [];
    if (access) {
      chips.push(`<span class="${P.infinite ? "on" : ""}">${P.infinite ? "∞ Infinite unlocked" : "Speed Round only"}</span>`);
      if (P.laser) chips.push(`<span class="on">Laser: ${esc(lasers.find((l) => l.id === P.laser).name)}</span>`);
      if (P.tripleBeam) chips.push(`<span class="on">Triple beam</span>`);
      if (P.ownerBadge) chips.push(`<span class="on">Owner badge</span>`);
      if (P.manifold) chips.push(`<span class="on">${esc(OWNERSHIP.manifold.name)}</span>`);
      if (P.fullLoadout) chips.push(`<span class="on">Full loadout</span>`);
    }
    const g = greet();
    body.innerHTML = `${g ? `<p class="pgreet">${esc(g)}</p>` : ""}
      <div class="field"><label for="plName">Hater name</label><input id="plName" maxlength="20" autocomplete="nickname" placeholder="BigHater" value="${esc(hater())}"></div>
      <div class="pwallet">${wallet
        ? `<button class="bigbtn ghost" id="plDisconnect">Disconnect</button><div class="note">${esc(access && access.ens ? access.ens : shortAddr(wallet))}${notice ? " · " + esc(notice) : ""}</div>`
        : `<button class="bigbtn cream" id="plConnect"${busyConn ? " disabled" : ""}>${busyConn ? "Connecting…" : "Connect wallet"}</button><div class="note">${esc(notice || "Optional. Holders unlock Infinite and fire their own laser pew pews.")}</div>`}</div>
      ${wallets && wallets.length > 1 && !wallet ? `<div class="btnrow">${wallets.map((w, i) => `<button class="bigbtn ghost" data-w="${i}">${esc(w.info.name)}</button>`).join("")}</div>` : ""}
      ${wallets && !wallets.length && !wallet && isMobile() ? `<div class="btnrow">${walletDeepLinks(B.COLLECTION_URL + "/#play-" + car.id).map((l) => `<a class="bigbtn ghost" href="${l.href}">${esc(l.name)}</a>`).join("")}</div>` : ""}
      ${chips.length ? `<div class="pperks">${chips.join("")}</div>` : ""}
      ${lasers.length > 1 ? `<div class="kicker" style="margin-top:18px">Pick your laser</div><div class="lasers">${lasers.map((l) => `<button class="laser" data-l="${l.id}" aria-pressed="${l.id === P.laser}"><b>${esc(l.name)}</b><small>LASER OPERATED</small></button>`).join("")}</div>` : ""}
      <div class="choices">
        <button class="choice speed" id="plSpeed"><b>Speed Round</b><span>30 seconds on the clock. Catches can buy time. Every fumble costs 2 seconds. Anyone can fly any ship.</span></button>
        <button class="choice${P.infinite ? "" : " locked"}" id="plInf" aria-disabled="${!P.infinite}"><b>Infinite</b><span>No clock. The run ends at EGO DEATH or when you quit.</span>${P.infinite ? "" : `<span class="lock">🔒 ${esc(lockWhy)}</span>`}</button>
      </div>`;
    const c = $("plConnect"); if (c) c.onclick = () => connect();
    const d = $("plDisconnect"); if (d) d.onclick = () => { wallet = null; access = null; notice = ""; try { localStorage.removeItem(WALLET_KEY); } catch (_) {} render(); };
    body.querySelectorAll("[data-w]").forEach((b) => (b.onclick = () => connect(wallets[+b.dataset.w])));
    body.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => { laserPick = +b.dataset.l; try { localStorage.setItem(LASER_KEY, laserPick); } catch (_) {} render(); }));
    $("plSpeed").onclick = () => go("speed");
    $("plInf").onclick = () => { if (perks().infinite) go("infinite"); };
  }

  async function connect(chosen) {
    if (busyConn) return;
    busyConn = true; notice = ""; render();
    try {
      if (!chosen) {
        wallets = await discoverWallets();
        if (!wallets.length) { notice = isMobile() ? "No wallet in this browser. Open objets.art in your wallet app." : "No wallet found in this browser. You still play the Speed Round."; return; }
        if (wallets.length > 1) { notice = "Pick your wallet."; return; }
        chosen = wallets[0];
      }
      wallet = await connectWith(chosen.provider);
      try { localStorage.setItem(WALLET_KEY, wallet); } catch (_) {}
      notice = "Checking what you hold…"; busyConn = false; render();
      await check();
    } catch (e) {
      notice = "Wallet connect skipped. You still play the Speed Round.";
    } finally { busyConn = false; render(); }
  }
  async function check() {
    if (!wallet) return;
    const a = await getAccess(wallet);
    access = a;
    const bits = [];
    if (a.lasers.length) bits.push(a.lasers.length === 1 ? "1 laser" : a.lasers.length + " lasers");
    if (a.ships.length) bits.push("owns this ship");
    if (a.manifold) bits.push(OWNERSHIP.manifold.name);
    if (a.failed.lasers || a.failed.ships) bits.push("a chain did not answer, tap Disconnect and reconnect to retry");
    notice = bits.length ? bits.join(" · ") : "No SuperKind found. You still play free.";
    render();
  }
  async function silent() {
    let saved = null; try { saved = localStorage.getItem(WALLET_KEY); } catch (_) {}
    if (!saved || wallet) return;
    const list = await discoverWallets(250);
    for (const w of list) {
      const a = await silentAccount(w.provider);
      if (a && a.toLowerCase() === saved.toLowerCase()) { wallet = a; notice = "Checking what you hold…"; render(); check(); return; }
    }
  }

  function go(mode) {
    const name = (($("plName") && $("plName").value) || "").trim().slice(0, 20) || "BigHater";
    try { localStorage.setItem("haterName", name); } catch (_) {}
    audio.resume();
    B.closeModal("pettyLobby");
    launch({ ship, mode, name, access, laser: chosenLaser(), perks: perks(), wallet, ens: access && access.ens });
  }

  m.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => { tab = b.dataset.t; render(); }));
  $("plPrev").onclick = () => { ship = (ship + B.CARS.length - 1) % B.CARS.length; render(); };
  $("plNext").onclick = () => { ship = (ship + 1) % B.CARS.length; render(); };

  return {
    open(i) {
      if (B.D.on) return;
      ship = i == null ? (B.current >= 0 ? B.current : 0) : i; tab = "play";
      render(); B.openModal("pettyLobby"); silent();
    },
    get access() { return access; },
    get wallet() { return wallet; },
    renderManualTab(t, el) {
      el.innerHTML = (t === "petty-how" ? howToHTML(B.coarse) : itemsHTML()) +
        `<div class="btnrow"><button class="bigbtn primary" id="mPetty">Play Ms. Petty in the ${esc(B.CARS[B.current >= 0 ? B.current : 0].name)}</button></div>`;
      $("mPetty").onclick = () => { B.closeModal("manualModal"); this.open(); };
    },
  };
}
