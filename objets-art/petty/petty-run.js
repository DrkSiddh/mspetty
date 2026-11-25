// ============================================================
// PETTY RUN — Ms. Petty: Big Girly Pew Pew, in 3D, in the cosmos, in your ship.
// SuperKind Toy Co. × Ms. Petty × ILLI Motors. Mounted by objets-art/index.html.
// Canon (levels, items, values, rules) comes from petty-levels.js, which is
// generated from the Ms. Petty repo. Do not hand-edit gameplay numbers here.
// ============================================================
import * as C from "./petty-levels.js";
import { createWorld, LIME, MAGENTA } from "./petty-world.js";
import { createAudio } from "./petty-audio.js";
import { createAcid } from "./petty-acid.js";
import { createLobby } from "./petty-lobby.js";
import { createPost } from "./petty-post.js";
import { laserInfo } from "./petty-ownership.js";

// In-run heckles (fumble triggered). Edit copy here.
export const HECKLES = [
  "you dropped that like a bad habit",
  "the {name} said bye",
  "that was {value} points, sweetheart",
  "fumble. on camera.",
  "ms. petty saw that",
  "the smile won that round",
];
const HECKLE_GAP = 4;        // seconds: at most one heckle per 4s
const HECKLE_CHANCE = 0.45;  // not every fumble
const MAX_BALLOONS = 7;      // keep the corridor readable
const BASE_SPEED = 40, NUDGE_SPEED = 68;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtScore = (n) => (n < 0 ? "−" + Math.abs(n).toLocaleString() : n.toLocaleString());
export { fmtScore };

export function initPettyRun(B) {
  const { THREE, D, $ } = B;
  const world = createWorld(B);
  const audio = createAudio(B);
  const acid = createAcid(B, world);
  const debug = /[?&]pettydebug=1\b/.test(location.search);
  const api = { shareActive: false };
  const G = { phase: "idle" };
  let active = false;
  let autoFirePref = B.coarse;
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler();

  // ── HUD ────────────────────────────────────────────────────
  const hud = document.createElement("div");
  hud.className = "phud"; hud.id = "pettyHud"; hud.setAttribute("aria-live", "polite");
  hud.innerHTML = `
  <div class="ph-top">
    <div class="ph-left">
      <div class="ph-badge ph-glass"><i class="rec"></i><b id="pShip">Ship</b><span class="ph-chip" id="pMode">SPEED ROUND</span></div>
      <div class="ph-laser ph-glass" id="pLaser" hidden><i id="pLaserDot"></i><span id="pLaserName"></span></div>
    </div>
    <div class="ph-score ph-glass"><small>$SHOTS</small><strong id="pScore">0</strong>
      <div class="ph-sub"><span class="ph-lolz">$LOLZ <b id="pLolz">0</b></span><span class="ph-level" id="pLevel">GENESIS</span></div></div>
    <div class="ph-right">
      <div class="ph-time ph-glass" id="pTimeBox"><small id="pTimeLbl">TIME</small><strong id="pTime">30</strong></div>
      <div class="ph-pills">
        <button class="pill" id="pRadio" aria-label="Play or pause the radio"><span class="dot"></span><span class="lbl" id="pRadioLbl">Play radio</span></button>
        <button class="pill" id="pStation" aria-label="Switch radio station"><span class="lbl" id="pStationLbl">ArtVision Radio</span></button>
        <button class="pill" id="pAuto" aria-pressed="false"><span class="dot"></span><span class="lbl">Auto-fire</span></button>
        <button class="pill" id="pQuit"><span class="lbl">Quit</span></button>
      </div>
    </div>
  </div>
  <div class="ph-keys ph-glass" id="pKeys">WASD or arrows steer &middot; SPACE or hold click fires laser pew pews &middot; SHIFT nudge</div>
  <div class="ph-heckle" id="pHeckle"></div>
  <div id="pFlashes"></div>
  <div class="ph-splash" id="pSplash"></div>
  <div class="ph-ego" id="pEgo"><div><h2>EGO DEATH</h2><p id="pEgoSub"></p></div></div>`;
  document.body.appendChild(hud);
  $("pRadio").onclick = () => B.radioToggle();
  $("pStation").onclick = () => B.switchStation();
  $("pAuto").onclick = () => { G.autoFire = autoFirePref = !G.autoFire; $("pAuto").setAttribute("aria-pressed", G.autoFire ? "true" : "false"); };
  $("pQuit").onclick = () => { if (active && G.phase === "fly") endRun("quit"); };
  // touch FIRE button doubles as the SHIFT nudge partner: relabel Boost → Nudge while flying
  const boostBtn = $("tBoost");

  const last = {};
  function setText(id, v) { if (last[id] !== v) { last[id] = v; $(id).textContent = v; } }
  function hudTick() {
    setText("pScore", fmtScore(G.score));
    $("pScore").classList.toggle("neg", G.score < 0);
    setText("pLolz", G.lolz.toLocaleString());
    setText("pLevel", C.getLevel(G.score).name);
    if (G.mode === "speed") setText("pTime", String(Math.max(0, Math.ceil(G.timeLeft))));
    $("pTimeBox").classList.toggle("low", G.mode === "speed" && G.timeLeft <= 5 && G.phase === "fly");
  }
  function bump() { const el = $("pScore"); el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); setTimeout(() => el.classList.remove("bump"), 160); }

  function screenOf(worldPos) {
    _v.copy(worldPos).project(B.camera);
    return { x: (_v.x * 0.5 + 0.5) * innerWidth, y: (-_v.y * 0.5 + 0.5) * innerHeight, front: _v.z < 1 };
  }
  function flashText(text, color, worldPos, big) {
    const el = document.createElement("div");
    el.className = "ph-flash" + (big ? " big" : "");
    el.textContent = text; el.style.color = color;
    let p = worldPos ? screenOf(worldPos) : { x: innerWidth / 2, y: innerHeight * 0.45 };
    el.style.left = clamp(p.x, 90, innerWidth - 90) + "px";
    el.style.top = clamp(p.y, 160, innerHeight - 160) + "px";
    $("pFlashes").appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  function flashLine(text) {
    const el = document.createElement("div");
    el.className = "ph-flash line"; el.textContent = text;
    el.style.left = "50%"; el.style.top = (innerWidth < 760 ? 62 : 70) + "%";
    $("pFlashes").appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  let heckleT = 0;
  function heckle(text) {
    const el = $("pHeckle"); el.textContent = text;
    const sp = screenOf(B.rig.position);
    el.style.bottom = "auto";
    el.style.top = clamp(sp.y - (innerWidth < 760 ? 150 : 170), innerHeight * 0.3, innerHeight * 0.75) + "px";
    el.classList.add("on");
    clearTimeout(heckleT); heckleT = setTimeout(() => el.classList.remove("on"), 2200);
  }
  let splashT = 0;
  function splash(html, ms = 2800) {
    const el = $("pSplash"); el.innerHTML = html; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
    clearTimeout(splashT); splashT = setTimeout(() => el.classList.remove("on"), ms);
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ── ship FX: catch/poison ring that flashes around the ship ──
  const ringGeo = new THREE.TorusGeometry(2.6, 0.13, 8, 64);
  const rings = [];
  function ringFlash(color) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.4), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(0, -0.2, -0.6); B.rig.add(m); rings.push({ m, life: 0.45 });
  }
  // tractor beam for the EGO DEATH tow
  let beam = null;
  function makeBeam() {
    const g = new THREE.CylinderGeometry(0.9, 2.6, 1, 24, 1, true); g.rotateX(Math.PI / 2); g.translate(0, 0, 0.5);
    beam = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5fb4").multiplyScalar(1.8), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    B.space.add(beam);
  }
  // ship lights: die on EGO DEATH, come back in the showroom
  const lightStore = [];
  function lightsOut() {
    B.driveCar.traverse((o) => {
      if (!o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.emissiveIntensity === undefined || lightStore.some((s) => s.m === m)) return;
        lightStore.push({ m, v: m.emissiveIntensity }); m.emissiveIntensity = 0.02;
      });
    });
  }
  function lightsOn() { lightStore.splice(0).forEach((s) => { s.m.emissiveIntensity = s.v; }); }

  // ── run lifecycle ──────────────────────────────────────────
  let lobby, post;
  const portalHome = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), saved: false };

  async function launch(opts) {
    // opts: { ship, mode, name, access, laser, perks }
    if (D.on || B.busy) return;
    if (B.current !== opts.ship) {
      B.pick(opts.ship);
      for (let k = 0; k < 60 && (B.current !== opts.ship || B.busy); k++) await B.sleep(80);
      await B.sleep(300);
    }
    audio.resume();
    const laser = opts.laser ? laserInfo(opts.laser) : null;
    audio.setLaser(laser ? laser.id : null);
    newRun(opts, laser);
    $("pShip").textContent = B.CARS[opts.ship].name;
    $("pMode").textContent = opts.mode === "speed" ? "SPEED ROUND" : "INFINITE";
    $("pTimeBox").classList.toggle("inf", opts.mode !== "speed");
    $("pTimeLbl").textContent = opts.mode === "speed" ? "TIME" : "CLOCK";
    setText("pTime", opts.mode === "speed" ? String(C.INITIAL_TIME) : "∞");
    $("pLaser").hidden = !laser;
    if (laser) { $("pLaserName").textContent = (G.perks.tripleBeam ? "TRIPLE BEAM · " : "") + laser.name; $("pLaserDot").style.background = laser.color; $("pLaserDot").style.boxShadow = "0 0 12px " + laser.color; }
    else if (G.perks.tripleBeam) { $("pLaser").hidden = false; $("pLaserName").textContent = "TRIPLE BEAM"; $("pLaserDot").style.background = "#FF3B3B"; }
    $("pAuto").setAttribute("aria-pressed", G.autoFire ? "true" : "false");
    $("pKeys").classList.remove("off"); setTimeout(() => $("pKeys").classList.add("off"), 9000);
    if (boostBtn) { G.boostLabel = boostBtn.textContent; boostBtn.textContent = "Nudge"; }
    hudTick();
    active = true;
    B.startDrive(false, { petty: true, onCosmos });
    audio.tapRecording();
    acid.onLaunch(G);
  }

  function newRun(opts, laser) {
    for (const k of Object.keys(G)) delete G[k];
    Object.assign(G, {
      phase: "launch", opts, ship: opts.ship, mode: opts.mode, name: opts.name, laser, perks: opts.perks || {},
      t: 0, timeScale: 1, targetScale: 1,
      s: 0, x: 0, y: 0, vx: 0, vy: 0, speed: BASE_SPEED, nudge: 0, nudgeCool: 0, shake: 0,
      score: 0, lolz: 0, earned: 0, balloons: 0, catches: 0, poison: 0, poisonCost: 0, fumbles: 0,
      ledger: [], poisonLog: {}, chain: 0, negChain: 0, bestChain: 0, worstChain: 0,
      levelId: C.getLevel(0).id, highestIdx: 0, timeLeft: C.INITIAL_TIME,
      ended: null, itemCounts: {}, bestCatch: null, worstPenalty: null,
      spawnAcc: 0, fireCool: 0, autoFire: autoFirePref, lastHeckle: -99, snapNextAt: 1, snapEvery: 5,
      bal: [], itm: [], bol: [], startedAt: Date.now(), sacred: { 444: false, 888: false },
    });
  }

  function onCosmos() {
    // the test drive course (gates + rocks) stays parked while Petty Run flies
    B.gates.forEach((g) => { g.mesh.visible = false; });
    B.rocks.forEach((r) => { r.mesh.visible = false; });
    portalHome.pos.copy(B.portal.position); portalHome.quat.copy(B.portal.quaternion); portalHome.saved = true;
    B.portal.visible = false;
    D.snaps = [];
    G.phase = "fly";
    acid.onCosmos(G);
    placeShip(0);
    placeCamera(0, true);
    for (let k = 0; k < 3; k++) spawnBalloon(70 + k * 42);
    const lvl = C.getLevel(0);
    splash(`<div class="k">ENTERING</div><h2>${esc(lvl.name)}</h2><p>“${esc(lvl.subtitle)}”</p>`, 2600);
    B.msg(G.mode === "speed" ? "Speed round<small>30 seconds. Pop the balloons. Fly through the lime stuff.</small>" : "Infinite<small>No clock. EGO DEATH at −30 is the only way out. Or quit.</small>", 3000);
    if (debug) debugPanel();
  }

  function box() {
    const a = B.camera.aspect;
    return { BX: clamp(2.2 + 4.6 * a, 3.8, 9.5), BY: a < 1 ? 3.6 : 4.6, f: a < 1 ? 0.8 : 0.62, back: a < 1 ? 10.5 : 7.6, up: a < 1 ? 2.5 : 2.0 };
  }

  function spawnBalloon(ahead) {
    if (G.bal.length >= MAX_BALLOONS) return;
    const { BX, BY } = box();
    const lvl = C.getLevel(G.score);
    const color = pick(lvl.balloonColors);
    const size = 1.75;
    const mesh = world.add(world.makeBalloon(color, size));
    const b = { s: G.s + (ahead != null ? ahead : rand(130, 185)), x: rand(-1.15, 1.15) * BX, y: rand(-0.85, 1.05) * BY, vx: rand(-1, 1) * 1.5, vs: -2.5, color, mesh, size, phase: Math.random() * 6.28, by: 0 };
    G.bal.push(b);
    positionBalloon(b);
  }
  function positionBalloon(b) {
    b.by = b.y + Math.sin(G.t * 1.3 + b.phase) * 0.55;
    world.railPos(b.s, b.x, b.by, b.mesh.position);
    world.railQuat(b.s, b.mesh.quaternion);
    b.mesh.rotateY(Math.sin(G.t * 0.7 + b.phase) * 0.28);
    b.mesh.rotateZ(Math.sin(G.t * 0.9 + b.phase) * 0.06);
  }

  // aimTarget(), the drive's aim assist: cone toward the nearest balloon
  function aimTarget(maxD, minDot) {
    let best = null, bs = -1;
    for (const b of G.bal) {
      const ds = b.s - G.s, dx = b.x - G.x, dy = b.by - G.y, d = Math.hypot(ds, dx, dy);
      if (d < 6 || d > maxD) continue;
      const dot = ds / d;
      if (dot > minDot && dot - d / 4000 > bs) { bs = dot - d / 4000; best = b; }
    }
    return best;
  }

  function fire() {
    if (G.fireCool > 0) return;
    G.fireCool = 0.14;
    const tgt = aimTarget(240, 0.93);
    const triple = !!G.perks.tripleBeam;
    // triple beam: three triangulated laser pew pews, red center, purple outer
    const beams = triple
      ? [{ ox: 0, oy: 0.55, c: "#FF3B3B" }, { ox: -1.25, oy: -0.45, c: "#7B2FBE" }, { ox: 1.25, oy: -0.45, c: "#7B2FBE" }]
      : [{ ox: (G.barrel = (G.barrel ? 0 : 1)) ? 0.9 : -0.9, oy: -0.3, c: G.laser ? G.laser.color : "#ff4fb0" }];
    for (const bm of beams) {
      const os = G.s + 2.5, ox = G.x + bm.ox, oy = G.y + bm.oy;
      let ds = 1, dx = 0, dy = 0;
      if (tgt) { ds = tgt.s - os; dx = tgt.x - ox; dy = tgt.by - oy; const d = Math.hypot(ds, dx, dy); ds /= d; dx /= d; dy /= d; }
      const mesh = world.add(world.makeBolt(bm.c));
      G.bol.push({ s: os, x: ox, y: oy, ds, dx, dy, v: G.speed + 260, life: 1.0, mesh });
    }
    audio.pew(beams.length);
  }

  function pop(b, i) {
    G.bal.splice(i, 1);
    world.remove(b.mesh);
    G.balloons++;
    B.burst(b.mesh.position.clone(), b.color);
    audio.pop();
    acid.onPop(b);
    const lvl = C.getLevel(G.score);
    const pool = C.itemPool(lvl);
    if (!pool.length) return;
    const it = pool[Math.floor(Math.random() * pool.length)];
    const good = it.value > 0;
    const { BX, BY } = box();
    const sprite = world.add(world.makeItem(it, good));
    const tx = rand(-0.85, 0.85) * BX, ty = rand(-0.8, 0.8) * BY;
    const vs = -rand(4, 9);
    const T = Math.max(0.9, (b.s - G.s) / (G.speed - vs));
    G.itm.push({ s: b.s, x: b.x, y: b.by, vs, vx: (tx - b.x) / T, vy: (ty - b.by) / T, ix: rand(-3, 3), iy: rand(1, 4), it, good, sprite, spin: rand(1.2, 2.4), age: 0, lvl: lvl.name });
  }

  function catchItem(o, i) {
    G.itm.splice(i, 1);
    world.remove(o.sprite);
    const val = o.it.value;
    G.score += val; // no floor at 0: scores go negative, EGO DEATH at ≤ −30
    G.itemCounts[o.it.emoji] = (G.itemCounts[o.it.emoji] || 0) + 1;
    if (val > 0) {
      G.earned += val; G.catches++;
      G.chain++; G.negChain = 0; G.bestChain = Math.max(G.bestChain, G.chain);
      if (!G.bestCatch || val > G.bestCatch.value) G.bestCatch = { name: o.it.name, emoji: o.it.emoji, value: val };
      if (G.mode === "speed" && Math.random() > C.CATCH_TIME_CHANCE) G.timeLeft = Math.min(G.timeLeft + C.CATCH_TIME_BONUS, C.TIME_CAP);
      ringFlash(LIME); audio.catchGood(val);
    } else if (val < 0) {
      G.poison++; G.poisonCost += val;
      G.poisonLog[o.it.name] = { emoji: o.it.emoji, name: o.it.name, value: val };
      G.negChain++; G.chain = 0; G.worstChain = Math.max(G.worstChain, G.negChain);
      if (!G.worstPenalty || val < G.worstPenalty.value) G.worstPenalty = { name: o.it.name, emoji: o.it.emoji, value: val };
      ringFlash(MAGENTA); audio.catchBad();
      if (!B.reduce) G.shake = 0.6;
    }
    flashText(pick(C.flashMessages(val)), val > 0 ? LIME : MAGENTA, o.sprite.position, Math.abs(val) >= 20);
    acid.onCatch(val, o, G);
    bump();
    afterScore();
  }

  function fumble(o, i) {
    G.itm.splice(i, 1);
    world.remove(o.sprite);
    const v = o.it.value;
    G.lolz += v; G.fumbles++;
    G.ledger.push({ emoji: o.it.emoji, name: o.it.name, value: v, level: o.lvl, ts: Date.now() });
    audio.fumble();
    if (G.mode === "speed") {
      G.timeLeft = Math.max(0, G.timeLeft - C.FUMBLE_TIME_PENALTY);
      flashLine(C.FUMBLE_LINE);
      const tb = $("pTimeBox"); tb.classList.remove("hit"); void tb.offsetWidth; tb.classList.add("hit");
    }
    if (G.t - G.lastHeckle >= HECKLE_GAP && Math.random() < HECKLE_CHANCE) {
      G.lastHeckle = G.t;
      heckle(pick(HECKLES).replace("{name}", o.it.name.toLowerCase()).replace("{value}", v));
    }
  }

  function afterScore() {
    hudTick();
    if (G.score <= C.EGO_DEATH_AT) { endRun("ego_death"); return; }
    const lvl = C.getLevel(G.score);
    if (lvl.id !== G.levelId) {
      G.levelId = lvl.id;
      G.highestIdx = Math.max(G.highestIdx, C.LEVELS.indexOf(lvl));
      let bonus = "";
      if (G.mode === "speed") { G.timeLeft = Math.min(G.timeLeft + lvl.timeBonus, C.TIME_CAP); bonus = `<span class="b">+${lvl.timeBonus}s BONUS</span>`; }
      splash(`<div class="k">ENTERING</div><h2>${esc(lvl.name)}</h2><p>“${esc(lvl.subtitle)}”</p>${bonus}`);
      audio.level();
      acid.onLevel(lvl, G);
      D.snapNext = true;
    }
    for (const n of [444, 888]) {
      if (!G.sacred[n] && G.score >= n) { G.sacred[n] = true; acid.onSacred(n, G); }
      if (G.score < n) G.sacred[n] = false;
    }
  }

  function endRun(reason) {
    if (G.ended) return;
    G.ended = reason; G.endT = G.t; G.phase = "ending";
    setTimeout(() => { if (D.phase === "petty") D.snapNext = true; }, reason === "ego_death" ? 700 : 300);
    D.fire = false;
    if (reason === "ego_death") {
      G.targetScale = B.reduce ? 1 : 0.22;
      $("pEgoSub").textContent = "She's not mad. She's taking notes.";
      $("pEgo").classList.add("on");
      lightsOut();
      audio.egoDeath();
      acid.onEgoDeath(G);
      setTimeout(startReturn, 2800);
    } else {
      splash(`<div class="k">${reason === "time" ? "SPEED ROUND" : "YOU QUIT"}</div><h2>${reason === "time" ? "TIME'S UP" : "QUIT"}</h2><p>ILLI Motors has the receipts.</p>`, 2000);
      setTimeout(startReturn, 1700);
    }
  }

  function startReturn() {
    if (!active) return;
    G.phase = "return"; G.targetScale = 1;
    setTimeout(() => $("pEgo").classList.remove("on"), 900);
    for (const b of G.bal) world.remove(b.mesh);
    for (const o of G.itm) world.remove(o.sprite);
    G.bal.length = 0; G.itm.length = 0;
    const ps = G.s + (G.ended === "ego_death" ? 170 : 240);
    G.portalS = ps;
    world.railPos(ps, 0, 0, B.portal.position);
    world.railQuat(ps, B.portal.quaternion);
    B.portal.visible = true;
    if (G.ended === "ego_death") { makeBeam(); B.msg("ILLI Motors is towing you home<small>Ship powered down. Pink tractor beam engaged.</small>", 4200); }
    else B.msg("ILLI Motors has the wheel<small>Back through the portal to the dealership</small>", 4200);
  }

  // ── frame ──────────────────────────────────────────────────
  function update(dt, t) {
    B.spaceBg.position.copy(B.camera.position); B.farStars.position.copy(B.camera.position);
    acid.frame(dt, t, G);
    if (!active || D.phase !== "petty") return;
    G.timeScale += (G.targetScale - G.timeScale) * Math.min(1, dt * 3);
    const gdt = dt * G.timeScale;
    G.t += gdt;
    const { BX, BY } = box();
    const k = D.keys;

    // clock
    if (G.phase === "fly" && G.mode === "speed") {
      G.timeLeft -= gdt;
      if (G.timeLeft <= 0) { G.timeLeft = 0; hudTick(); endRun("time"); }
    }

    // steering inside the screen-space box; forward motion is automatic
    let ix = ((k.d || k.arrowright) ? 1 : 0) - ((k.a || k.arrowleft) ? 1 : 0) + D.joy.x;
    let iy = ((k.w || k.arrowup) ? 1 : 0) - ((k.s || k.arrowdown) ? 1 : 0) - D.joy.y;
    if (G.phase !== "fly") { ix = -G.x * 0.5; iy = -G.y * 0.5; }
    G.vx += (clamp(ix, -1, 1) * BX * 1.7 - G.vx) * Math.min(1, gdt * 7);
    G.vy += (clamp(iy, -1, 1) * BY * 1.7 - G.vy) * Math.min(1, gdt * 7);
    G.x = clamp(G.x + G.vx * gdt, -BX, BX);
    G.y = clamp(G.y + G.vy * gdt, -BY, BY);

    // SHIFT (or the touch Nudge button) nudges the ship faster for a beat
    G.nudgeCool = Math.max(0, G.nudgeCool - gdt); G.nudge = Math.max(0, G.nudge - gdt);
    if ((k.shift || D.boost) && G.nudgeCool <= 0 && G.phase === "fly") { G.nudge = 1.1; G.nudgeCool = 2.4; acid.onNudge(); }
    const vT = G.phase === "return" ? (G.ended === "ego_death" ? 58 : 92) : G.nudge > 0 ? NUDGE_SPEED : BASE_SPEED;
    G.speed += (vT - G.speed) * Math.min(1, gdt * 2.2);
    G.s += G.speed * gdt;

    // balloons: canon cadence (BALLOON_INTERVAL), capped so the screen never crowds
    if (G.phase === "fly") {
      G.spawnAcc += gdt * 1000;
      while (G.spawnAcc >= C.BALLOON_INTERVAL) { G.spawnAcc -= C.BALLOON_INTERVAL; spawnBalloon(); }
    }
    for (let i = G.bal.length - 1; i >= 0; i--) {
      const b = G.bal[i];
      b.s += b.vs * gdt; b.x += b.vx * gdt;
      if (Math.abs(b.x) > BX * 1.3) b.vx = -b.vx;
      positionBalloon(b); world.swayString(b.mesh, G.t);
      if (b.s < G.s - 6) { G.bal.splice(i, 1); world.remove(b.mesh); }
    }

    // laser pew pews
    G.fireCool = Math.max(0, G.fireCool - gdt);
    if (G.phase === "fly") {
      if (k[" "] || D.fire) fire();
      else if (G.autoFire && G.fireCool <= 0 && aimTarget(200, 0.95)) { fire(); G.fireCool = 0.2; }
    }
    for (let i = G.bol.length - 1; i >= 0; i--) {
      const L = G.bol[i];
      const step = L.v * gdt;
      let hit = false;
      for (let sub = 0; sub < 2 && !hit; sub++) {
        L.s += L.ds * step / 2; L.x += L.dx * step / 2; L.y += L.dy * step / 2;
        for (let j = G.bal.length - 1; j >= 0; j--) {
          const b = G.bal[j];
          if (Math.hypot(L.s - b.s, L.x - b.x, L.y - b.by) < b.size * 1.3 + 0.6) { pop(b, j); hit = true; break; }
        }
      }
      L.life -= gdt;
      world.railPos(L.s, L.x, L.y, L.mesh.position);
      world.railPos(L.s + L.ds, L.x + L.dx, L.y + L.dy, _w); L.mesh.lookAt(_w);
      if (hit || L.life <= 0) { world.remove(L.mesh); G.bol.splice(i, 1); }
    }

    // fallout: tumble out of the pop, drift back past the ship
    for (let i = G.itm.length - 1; i >= 0; i--) {
      const o = G.itm[i];
      o.age += gdt;
      o.s += o.vs * gdt;
      o.x += (o.vx + o.ix) * gdt; o.y += (o.vy + o.iy) * gdt;
      const decay = Math.exp(-3 * gdt); o.ix *= decay; o.iy *= decay;
      const ds = o.s - G.s, lat = Math.hypot(o.x - G.x, o.y - G.y);
      // generous magnet: the 3D version of ITEM_TAP_PADDING
      if (o.good && G.phase === "fly" && ds > -2 && ds < 16 && lat < 5.4) {
        const pull = Math.min(1, gdt * 5.5);
        o.x += (G.x - o.x) * pull; o.y += (G.y - o.y) * pull;
      }
      world.railPos(o.s, o.x, o.y, o.sprite.position);
      const grow = Math.min(1, o.age / 0.25);
      o.sprite.scale.set(3.6 * grow, 3.6 * 660 / 512 * grow, 1);
      o.sprite.material.rotation = Math.sin(G.t * o.spin + i) * 0.3;
      if (G.phase === "fly" && Math.abs(ds) < 2.6 && lat < (o.good ? 3.1 : 2.3)) { catchItem(o, i); continue; }
      if (o.s < G.s - 4) {
        if (o.good && G.phase === "fly") fumble(o, i);
        else { G.itm.splice(i, 1); world.remove(o.sprite); }
      }
    }
    if (G.ended && G.phase === "ending") { /* hold the frame, let slow-mo breathe */ }

    // FX that ride the ship
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.life -= dt; const p = 1 - r.life / 0.45;
      r.m.scale.setScalar(1 + p * 1.6); r.m.material.opacity = Math.max(0, 1 - p);
      if (r.life <= 0) { B.rig.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); }
    }
    B.stepBursts(dt);

    // dust wraps around the ship for a sense of speed (same as the drive)
    const rp = B.rig.position, dp = B.dustPos;
    for (let q = 0; q < B.DUST; q++) for (let a = 0; a < 3; a++) { const c = rp.getComponent(a); let v = dp[q * 3 + a]; if (v - c > 120) v -= 240; else if (v - c < -120) v += 240; dp[q * 3 + a] = v; }
    B.dustGeo.attributes.position.needsUpdate = true;

    placeShip(gdt);
    placeCamera(dt, false);

    // return: fly through the OBJETS.ART portal, then land at the dealership
    if (G.phase === "return") {
      B.portal.userData.lbl.lookAt(B.camera.position); B.portal.rotation.z += dt * 0.2;
      if (beam) { // the tow: pink beam from the portal to the ship
        _w.copy(B.portal.position); beam.position.copy(B.rig.position); beam.lookAt(_w);
        beam.scale.set(1, 1, B.rig.position.distanceTo(_w)); beam.material.opacity = 0.32 + Math.sin(t * 9) * 0.1;
      }
      if (G.s >= G.portalS - 1) { G.phase = "landing"; B.landHome(); }
    }

    // a few frames for the Petty Report
    if (G.t >= G.snapNextAt && G.phase === "fly") {
      D.snapNext = true; G.snapNextAt += G.snapEvery;
      if (D.snaps.length >= 9) { D.snaps = D.snaps.filter((_, j) => j % 2 === 0); G.snapEvery *= 2; }
    }
    hudTick();
  }

  function placeShip(gdt) {
    world.railPos(G.s, G.x, G.y, B.rig.position);
    world.railQuat(G.s, B.rig.quaternion);
    const dead = G.ended === "ego_death";
    _e.set(G.vy * 0.03 + (dead ? -0.12 : 0), 0, -G.vx * 0.05 + (dead ? Math.sin(G.t * 1.7) * 0.25 : 0));
    _q.setFromEuler(_e); B.rig.quaternion.multiply(_q);
  }
  function placeCamera(dt, snap) {
    const b = box();
    const sp = (G.speed - BASE_SPEED) / (NUDGE_SPEED - BASE_SPEED);
    world.railPos(G.s - b.back - sp * 2.5, G.x * b.f, G.y * b.f + b.up, _v);
    if (G.shake > 0) { _v.x += rand(-1, 1) * G.shake; _v.y += rand(-1, 1) * G.shake; G.shake = Math.max(0, G.shake - dt * 2.2); }
    if (snap) B.camera.position.copy(_v); else B.camera.position.lerp(_v, Math.min(1, dt * 10));
    B.camera.up.copy(world.railBasis(G.s).Up);
    world.railPos(G.s + 26, G.x * 0.45, G.y * 0.45 + 0.8, _w);
    B.camera.lookAt(_w);
    const fovT = (B.camera.aspect < 1 ? 64 : 58) + clamp(sp, 0, 1) * 10;
    if (Math.abs(B.camera.fov - fovT) > 0.1) { B.camera.fov += (fovT - B.camera.fov) * Math.min(1, dt * 2); B.camera.updateProjectionMatrix(); B.placeWm(); }
  }

  // ── landing → receipts ─────────────────────────────────────
  function onLanded(rec) {
    active = false;
    G.phase = "done";
    lightsOn();
    if (beam) { B.space.remove(beam); beam = null; }
    if (portalHome.saved) { B.portal.position.copy(portalHome.pos); B.portal.quaternion.copy(portalHome.quat); }
    B.portal.visible = true;
    B.gates.forEach((g) => { g.mesh.visible = true; });
    B.rocks.forEach((r) => { r.mesh.visible = r.alive; });
    for (const L of G.bol) world.remove(L.mesh);
    G.bol.length = 0;
    $("pEgo").classList.remove("on"); $("pSplash").classList.remove("on"); $("pHeckle").classList.remove("on"); $("pFlashes").innerHTML = "";
    if (boostBtn && G.boostLabel) boostBtn.textContent = G.boostLabel;
    acid.onLanded();
    post.open(summary(rec));
  }

  function summary(rec) {
    const lvlTop = C.LEVELS[G.highestIdx];
    const ledger = G.ledger.slice().sort((a, b) => b.value - a.value);
    return {
      shipIdx: G.ship, ship: B.CARS[G.ship], mode: G.mode, name: G.name, opts: G.opts, laser: G.laser, perks: G.perks,
      score: G.score, lolz: G.lolz, earned: G.earned, balloons: G.balloons, catches: G.catches,
      poison: G.poison, poisonCost: G.poisonCost, fumbles: G.fumbles, ledger,
      biggestFumble: ledger[0] || null, bestChain: G.bestChain, worstChain: G.worstChain,
      levelReached: lvlTop.name, levelReachedIdx: G.highestIdx, finalLevel: C.getLevel(G.score).name,
      ended: G.ended || "quit", duration: Math.max(1, Math.round(G.t)), itemCounts: { ...G.itemCounts },
      bestCatch: G.bestCatch, worstPenalty: G.worstPenalty, poisonLog: { ...G.poisonLog },
      video: rec.video, videoExt: rec.videoExt, snaps: rec.snaps || [], at: new Date(),
    };
  }

  // ── debug (off unless ?pettydebug=1, linked nowhere) ───────
  function debugPanel() {
    if ($("pettyDebug")) return;
    const d = document.createElement("div");
    d.id = "pettyDebug";
    d.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:60;background:rgba(10,3,9,.9);border:1.5px solid #f0c869;border-radius:18px;padding:12px;display:flex;gap:8px;flex-wrap:wrap;max-width:560px;font:700 16px/1 'JetBrains Mono',monospace;color:#fff2ec";
    d.innerHTML = `<span style="width:100%">PETTY DEBUG</span><input id="pdScore" type="number" value="-25" style="width:110px;font:700 17px 'JetBrains Mono';padding:8px;border-radius:10px;border:0">
      <button data-a="set">SET SCORE</button><select id="pdLvl">${C.LEVELS.map((l) => `<option value="${l.min}">${l.name} (${l.min})</option>`).join("")}</select><button data-a="lvl">JUMP</button>
      <button data-a="fumble">FORCE FUMBLE</button><button data-a="ego">FORCE EGO DEATH</button><button data-a="time">TIME = 1s</button>`;
    d.querySelectorAll("button").forEach((b) => { b.style.cssText = "font:800 16px 'Manrope';padding:10px 12px;border-radius:999px;border:0;background:#fff2ec;color:#1a0814;cursor:pointer"; });
    d.addEventListener("click", (e) => {
      const a = e.target.dataset && e.target.dataset.a; if (!a || !active) return;
      if (a === "set") { G.score = parseInt($("pdScore").value, 10) || 0; afterScore(); }
      if (a === "lvl") { G.score = parseInt($("pdLvl").value, 10); afterScore(); }
      if (a === "fumble") forceFumble();
      if (a === "ego") { G.score = C.EGO_DEATH_AT; afterScore(); }
      if (a === "time") G.timeLeft = 1;
    });
    document.body.appendChild(d);
  }
  function forceFumble() {
    const lvl = C.getLevel(G.score);
    const it = lvl.catchItems[0];
    const sprite = world.add(world.makeItem(it, true));
    G.itm.push({ s: G.s - 5, x: G.x + 20, y: G.y, vs: 0, vx: 0, vy: 0, ix: 0, iy: 0, it, good: true, sprite, spin: 1, age: 1, lvl: lvl.name });
  }
  if (debug) {
    window.__petty = {
      get state() { return G; }, C, endRun, afterScore, forceFumble,
      setScore(n) { G.score = n; afterScore(); },
      catchValue(v) { const lvl = C.getLevel(G.score); const it = [...lvl.catchItems, ...lvl.avoidItems].find((x) => x.value === v) || { emoji: "🧪", name: "Debug", value: v }; const sprite = world.add(world.makeItem(it, v > 0)); G.itm.push({ s: G.s, x: G.x, y: G.y, vs: 0, vx: 0, vy: 0, ix: 0, iy: 0, it, good: v > 0, sprite, spin: 1, age: 1, lvl: lvl.name }); },
    };
  }

  // ── public surface for index.html ──────────────────────────
  lobby = createLobby(B, { launch, audio, debug });
  post = createPost(B, { api, lobby, launch: (o) => launch(o), fmtScore });
  Object.assign(api, {
    update, onLanded,
    openLobby: (i) => lobby.open(i),
    radioUI(stName, playing) { setText("pStationLbl", stName); setText("pRadioLbl", playing ? "Pause radio" : "Play radio"); $("pRadio").setAttribute("aria-pressed", playing ? "true" : "false"); },
    renderManualTab: (tab, el) => lobby.renderManualTab(tab, el),
    buildSocials: () => post.buildSocials(),
    nativeShare: () => post.nativeShare(),
    get running() { return active; },
  });
  // deep link: objets.art/#play-<ship-id> opens straight into the lobby
  function fromHash() {
    const m = location.hash.match(/^#play-(.+)$/);
    if (!m) return;
    const i = B.CARS.findIndex((c) => c.id === m[1]);
    if (i < 0 || D.on) return;
    const go = () => { if (document.getElementById("loader").classList.contains("done")) setTimeout(() => lobby.open(i), 900); else setTimeout(go, 300); };
    go();
  }
  addEventListener("hashchange", fromHash);
  fromHash();
  return api;
}
