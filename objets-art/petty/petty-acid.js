// ============================================================
// PETTY RUN — THE ACID LAYER. Objets.art after it ate something.
// Breathing nebula in the level's palette, kaleidoscope folds, chromatic
// aberration + grain, four-leaf clovers, a rose-gold ribbon trail, worlds.
// Budgets: pointer:coarse halves particles and swaps the kaleidoscope for a
// color flash. prefers-reduced-motion: no kaleidoscope, no shake, no strobe.
// The post pass is disabled whenever Petty Run is not flying.
// ============================================================
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

// Level worlds. Colors come from each level's bg / bgGradient / balloonColors
// in petty-levels.js plus the world notes in the brief.
const WORLDS = {
  1: { a: "#7B2FBE", b: "#3d1475", c: "#FF6B9D", dust: null },                         // GENESIS: plum + violet
  2: { a: "#FF0080", b: "#00BFFF", c: "#FFD700", rainbow: 1, dust: null },             // PRIDE MODE: full rainbow
  3: { a: "#A8E6CF", b: "#FFB7B2", c: "#E0BBE4", soft: 0.7, dust: null },              // AURA FIELD: mint + blush, soft
  4: { a: "#1A001A", b: "#C084FC", c: "#F472B6", dim: 0.55, dust: "bone" },            // SKELEVAGGIO: void, orchid rim, bone dust
  5: { a: "#1E3A5F", b: "#3b66a8", c: "#FFD700", dust: null },                         // DAD ZONE: navy + gold
  6: { a: "#2C5364", b: "#A8D8EA", c: "#00C9A7", dust: null },                         // WORLD ENV: teal + sky
  7: { a: "#4A2C00", b: "#CD853F", c: "#FFD700", dust: "tricolor" },                   // JUNETEENTH: brown + gold, red/black/green stars
  8: { a: "#FF6B9D", b: "#FFD93D", c: "#4CAF50", sunrise: 1, dust: null },             // SOLSTICE: pink → gold → green sunrise
  9: { a: "#8B0000", b: "#DC143C", c: "#4A0E0E", dust: null },                         // OLAF: blood red
  10: { a: "#FF2D9B", b: "#FFD93D", c: "#4A0033", dust: "glint" },                     // VEGAS: magenta + yellow, slot glints
  11: { a: "#DC143C", b: "#FFD700", c: "#FF4500", dust: "ember" },                     // DRAGON: crimson + gold, embers
};

const NOISE = `
float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}`;

export function createAcid(B, world) {
  const { THREE } = B;
  const lowPower = B.coarse, still = B.reduce;
  const kaleidoOK = !lowPower && !still;
  let on = false, levelColor = new THREE.Color("#7B2FBE");

  // ── breathing nebula (the drive's fbm nebula, domain-warped over time) ──
  const U = {
    t: { value: 0 }, cA: { value: new THREE.Color() }, cB: { value: new THREE.Color() }, cC: { value: new THREE.Color() },
    rainbow: { value: 0 }, sunrise: { value: 0 }, gain: { value: 1 }, aura: { value: 0 }, orchid: { value: 0 },
  };
  const neb = new THREE.Mesh(new THREE.SphereGeometry(3800, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: U, defines: lowPower ? { LOW: 1 } : {},
    vertexShader: "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: `varying vec3 vP;uniform float t,rainbow,sunrise,gain,aura,orchid;uniform vec3 cA,cB,cC;${NOISE}
    void main(){vec3 d=normalize(vP);vec3 p=d*2.4;
      #ifdef LOW
      float q1=fbm(p+vec3(0.,t*.035,t*.01)),q2=q1*.8+.1;
      #else
      float q1=fbm(p+vec3(0.,t*.035,t*.01)),q2=fbm(p+vec3(5.2,1.3,-t*.03));
      #endif
      vec3 w=p+vec3(q1,q2,q1*q2)*(1.7+.35*sin(t*.21));
      float a=fbm(w+t*.02),b=fbm(w*1.9+3.1-t*.025);
      #ifdef LOW
      float e=a*b*1.6;
      #else
      float e=fbm(w*1.3+7.0+t*.015);
      #endif
      float breathe=.86+.14*sin(t*.5);
      vec3 c=vec3(.02,.008,.03);
      c+=cA*pow(a,3.0)*1.8*breathe;c+=cB*pow(b,2.8)*1.45;c+=cC*pow(e,4.6)*1.9;
      if(rainbow>0.){vec3 hue=.5+.5*cos(6.2831*(d.y*.55+a*1.3+t*.05+vec3(0.,.33,.67)));c=mix(c,hue*pow(a,1.7)*1.5+c*.25,rainbow);}
      if(sunrise>0.){float y=smoothstep(-.6,.7,d.y);vec3 s=mix(cC,mix(cB,cA,smoothstep(.45,1.,y)),smoothstep(0.,.55,y));c=mix(c,c*.5+s*pow(a,2.2)*1.3,sunrise);}
      c+=vec3(.75,.52,.98)*orchid*pow(1.-abs(dot(d,vec3(0.,0.,1.))),3.)*.9;
      c+=cA*aura*.45*pow(a,1.5);
      gl_FragColor=vec4(c*gain,1.0);}`,
  }));
  neb.visible = false; neb.renderOrder = -1; B.space.add(neb);
  const cur = { a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), rainbow: 0, sunrise: 0, gain: 1 };
  const tgt = { a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color(), rainbow: 0, sunrise: 0, gain: 1 };
  function setWorld(id, instant) {
    const W = WORLDS[id] || WORLDS[1];
    tgt.a.set(W.a); tgt.b.set(W.b); tgt.c.set(W.c);
    tgt.rainbow = W.rainbow || 0; tgt.sunrise = W.sunrise || 0; tgt.gain = W.soft || W.dim || 1;
    if (instant) { cur.a.copy(tgt.a); cur.b.copy(tgt.b); cur.c.copy(tgt.c); cur.rainbow = tgt.rainbow; cur.sunrise = tgt.sunrise; cur.gain = tgt.gain; }
    levelColor.set(W.a === "#1A001A" ? W.b : W.a);
    setDust(W.dust);
  }

  // ── sprites: clover + soft dot ──
  function tex(draw) { const c = document.createElement("canvas"); c.width = c.height = 128; draw(c.getContext("2d")); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const cloverTex = tex((g) => {
    g.translate(64, 64); g.fillStyle = "#fff";
    for (let k = 0; k < 4; k++) { g.save(); g.rotate(k * Math.PI / 2 + Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-34, -18, -30, -58, 0, -40); g.bezierCurveTo(30, -58, 34, -18, 0, 0); g.fill(); g.restore(); }
    g.fillRect(-3, 6, 6, 44);
  });
  const dotTex = B.sparkTex;

  // corridor-wrapped particle field: positions in rail space around the ship
  function field(count, texture, size, blending) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: texture, vertexColors: true, transparent: true, depthWrite: false, blending: blending || THREE.AdditiveBlending, sizeAttenuation: true }));
    pts.frustumCulled = false; pts.visible = false; B.space.add(pts);
    const rail = Array.from({ length: count }, () => ({ s: Math.random() * 220 - 40, x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 34, vs: 0, vy: 0, ph: Math.random() * 6.28 }));
    return { pts, geo, pos, col, rail, count };
  }
  const CLOVERS = lowPower ? 60 : 120;
  const clovers = field(CLOVERS, cloverTex, 1.3);
  const GOLD = new THREE.Color("#F0C869"), LIMEC = new THREE.Color("#00FF6E");
  clovers.rail.forEach((r, i) => { const c = i % 3 ? GOLD : LIMEC; clovers.col.set([c.r, c.g, c.b], i * 3); r.vs = -2 - Math.random() * 4; r.spin = Math.random(); });
  const DUSTN = lowPower ? 260 : 520;
  const wdust = field(DUSTN, dotTex, 0.6);
  let dustKind = null;
  function setDust(kind) {
    dustKind = kind;
    wdust.pts.visible = on && !!kind;
    if (!kind) return;
    const pal = kind === "bone" ? ["#f4ecd8", "#e6dcc6", "#fffaf0"] : kind === "tricolor" ? ["#e31b23", "#00843D", "#FFD700", "#3a2a1a"] : kind === "glint" ? ["#FFD93D", "#fff6c8", "#FFD93D"] : ["#FF4500", "#FFB347", "#FFD700"];
    wdust.pts.material.size = kind === "bone" ? 0.9 : kind === "glint" ? 1.1 : 0.7;
    wdust.pts.material.blending = kind === "tricolor" ? THREE.NormalBlending : THREE.AdditiveBlending;
    wdust.pts.material.needsUpdate = true;
    const c = new THREE.Color();
    wdust.rail.forEach((r, i) => { c.set(pal[i % pal.length]); wdust.col.set([c.r, c.g, c.b], i * 3); r.vy = kind === "ember" ? 2 + Math.random() * 5 : kind === "bone" ? -0.4 : 0; r.vs = kind === "bone" ? -1 : 0; });
    wdust.geo.attributes.color.needsUpdate = true;
  }
  const _p = new THREE.Vector3();
  function stepField(F, G, dt, t, twinkle) {
    for (let i = 0; i < F.count; i++) {
      const r = F.rail[i];
      r.s += r.vs * dt; r.y += r.vy * dt;
      if (r.s < G.s - 30) { r.s += 250; r.x = (Math.random() - 0.5) * 60; r.y = (Math.random() - 0.5) * 34; }
      if (r.s > G.s + 220) r.s -= 250;
      if (r.y > 20) r.y -= 40; if (r.y < -20) r.y += 40;
      world.railPos(r.s, r.x + (twinkle ? 0 : Math.sin(t * 0.6 + r.ph) * 0.6), r.y, _p);
      F.pos[i * 3] = _p.x; F.pos[i * 3 + 1] = _p.y; F.pos[i * 3 + 2] = _p.z;
    }
    F.geo.attributes.position.needsUpdate = true;
  }
  // clover bursts out of big catches
  const pops = [];
  function cloverBurst(at, n) {
    n = lowPower ? Math.ceil(n / 2) : n;
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { pos.set([at.x, at.y, at.z], i * 3); const c = i % 2 ? GOLD : LIMEC; col.set([c.r, c.g, c.b], i * 3); v.push(new THREE.Vector3().randomDirection().multiplyScalar(9 + Math.random() * 14)); }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.6, map: cloverTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    B.space.add(p); pops.push({ p, v, life: 1.2 });
  }

  // ── ribbon trail: rose gold at the ship, level color at the tail ──
  const TN = 44, trailGeo = new THREE.BufferGeometry();
  const tPos = new Float32Array(TN * 2 * 3), tCol = new Float32Array(TN * 2 * 3), hist = [];
  trailGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3)); trailGeo.setAttribute("color", new THREE.BufferAttribute(tCol, 3));
  const idx = []; for (let i = 0; i < TN - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } trailGeo.setIndex(idx);
  const trail = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  trail.frustumCulled = false; trail.visible = false; B.space.add(trail);
  const ROSE = new THREE.Color("#e7a28f").multiplyScalar(1.1), _c = new THREE.Color(), _r = new THREE.Vector3();
  const TRAIL_LEN = 4.6; // world units behind the ship: always in front of the chase cam
  function stepTrail(G) {
    hist.unshift({ s: G.s, x: G.x, y: G.y - 0.2 });
    while (hist.length > 2 && hist[hist.length - 1].s < G.s - TRAIL_LEN) hist.pop();
    if (hist.length > 240) hist.length = 240;
    let j = 0;
    for (let i = 0; i < TN; i++) {
      const k = i / (TN - 1), ts = G.s - 0.6 - k * TRAIL_LEN;
      while (j < hist.length - 1 && hist[j + 1].s >= ts) j++;
      const h = hist[j];
      world.railPos(ts, h.x, h.y, _r);
      const b = world.railBasis(ts), w = 0.17 * (1 - k) + 0.01;
      tPos.set([_r.x - b.Rt.x * w, _r.y - b.Rt.y * w, _r.z - b.Rt.z * w, _r.x + b.Rt.x * w, _r.y + b.Rt.y * w, _r.z + b.Rt.z * w], i * 6);
      _c.copy(ROSE).lerp(levelColor, Math.min(1, k * 1.6)).multiplyScalar(Math.pow(1 - k, 2.2) * 0.75);
      tCol.set([_c.r, _c.g, _c.b, _c.r, _c.g, _c.b], i * 6);
    }
    trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true;
  }

  // ── post: kaleidoscope fold + chromatic aberration + grain + saturation ──
  const post = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uCA: { value: 0.0025 }, uGrain: { value: 0.035 }, uKal: { value: 0 }, uSat: { value: 1 }, uFlash: { value: 0 }, uFlashC: { value: new THREE.Color() }, uAspect: { value: 1 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uT,uCA,uGrain,uKal,uSat,uFlash,uAspect;uniform vec3 uFlashC;varying vec2 vUv;
      vec2 kal(vec2 uv){vec2 p=(uv-.5)*vec2(uAspect,1.);float r=length(p),a=atan(p.y,p.x)+uT*.25;float seg=6.2831853/8.;a=mod(a,seg);a=abs(a-seg*.5);vec2 q=r*vec2(cos(a),sin(a));return q/vec2(uAspect,1.)+.5;}
      void main(){vec2 uv=vUv;if(uKal>0.001)uv=mix(uv,kal(uv),uKal);
        vec2 dir=uv-.5;float ca=uCA*(.35+length(dir)*1.6);
        vec3 c=vec3(texture2D(tDiffuse,uv+dir*ca).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-dir*ca).b);
        float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,uSat);
        float g=fract(sin(dot(vUv*vec2(1733.,977.)+fract(uT*7.3)*91.,vec2(12.9898,78.233)))*43758.5453);c+=(g-.5)*uGrain*(.4+l);
        c=mix(c,uFlashC,uFlash);gl_FragColor=vec4(c,1.);}`,
  });
  post.enabled = false;
  B.composer.insertPass(post, B.composer.passes.length - 1); // before OutputPass
  const P = post.uniforms;
  const fx = { ca: 0, kal: 0, kalT: 0, flash: 0, sat: 1, satT: 1, aura: 0, orchid: 0 };
  let bloomRest = B.bloom.strength;

  function kaleido(color) {
    if (kaleidoOK) { fx.kalT = 1.2; return; }
    // coarse or reduced motion: a soft color flash instead (no strobe)
    P.uFlashC.value.set(color || levelColor); fx.flash = still ? 0.1 : 0.22;
  }

  return {
    onLaunch() {},
    onCosmos(G) {
      on = true;
      B.spaceBg.visible = false; neb.visible = true;
      setWorld(1, true);
      clovers.pts.visible = true; trail.visible = true; hist.length = 0;
      post.enabled = true; fx.sat = fx.satT = 1; fx.ca = 0; fx.kal = 0; fx.kalT = 0; fx.flash = 0;
      bloomRest = B.bloom.strength; B.bloom.strength = 0.62;
    },
    frame(dt, t, G) {
      if (!on) return;
      neb.position.copy(B.camera.position);
      const k = Math.min(1, dt / 1.5 * 3); // ~1.5s crossfade
      cur.a.lerp(tgt.a, k); cur.b.lerp(tgt.b, k); cur.c.lerp(tgt.c, k);
      cur.rainbow += (tgt.rainbow - cur.rainbow) * k; cur.sunrise += (tgt.sunrise - cur.sunrise) * k; cur.gain += (tgt.gain - cur.gain) * k;
      // hue drifts within the palette
      U.cA.value.copy(cur.a).offsetHSL(Math.sin(t * 0.07) * 0.025, 0, 0); U.cB.value.copy(cur.b).offsetHSL(Math.sin(t * 0.05 + 2) * 0.03, 0, 0); U.cC.value.copy(cur.c);
      U.rainbow.value = cur.rainbow; U.sunrise.value = cur.sunrise; U.gain.value = cur.gain; U.t.value = t;
      fx.aura = Math.max(0, fx.aura - dt * 0.5); U.aura.value = fx.aura;
      fx.orchid = Math.max(0, fx.orchid - dt * 0.8); U.orchid.value = fx.orchid + (WORLDS[G.levelId] && WORLDS[G.levelId].dust === "bone" ? 0.35 : 0);
      if (G.s !== undefined && G.phase !== "launch") {
        stepField(clovers, G, dt, t);
        clovers.pts.material.rotation = t * 0.4;
        if (dustKind) { stepField(wdust, G, dt, t, dustKind === "glint"); if (dustKind === "glint") wdust.pts.material.opacity = 0.55 + 0.45 * Math.abs(Math.sin(t * 6)); }
        stepTrail(G);
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const q = pops[i]; q.life -= dt; const a = q.p.geometry.attributes.position;
        for (let j = 0; j < q.v.length; j++) { a.array[j * 3] += q.v[j].x * dt; a.array[j * 3 + 1] += q.v[j].y * dt; a.array[j * 3 + 2] += q.v[j].z * dt; q.v[j].multiplyScalar(0.97); }
        a.needsUpdate = true; q.p.material.opacity = Math.max(0, q.life / 1.2); q.p.material.rotation += dt * 3;
        if (q.life <= 0) { B.space.remove(q.p); q.p.geometry.dispose(); q.p.material.dispose(); pops.splice(i, 1); }
      }
      // post
      fx.ca = Math.max(0, fx.ca - dt * 0.06);
      if (fx.kalT > 0) { fx.kalT = Math.max(0, fx.kalT - dt); fx.kal = Math.sin((1 - fx.kalT / 1.2) * Math.PI); } else fx.kal = 0;
      fx.flash = Math.max(0, fx.flash - dt * (still ? 0.4 : 1.2));
      fx.sat += (fx.satT - fx.sat) * Math.min(1, dt * 2.2);
      P.uT.value = t; P.uCA.value = 0.0025 + fx.ca; P.uKal.value = fx.kal; P.uFlash.value = fx.flash; P.uSat.value = fx.sat;
      P.uGrain.value = 0.035 + fx.ca * 1.6; P.uAspect.value = B.camera.aspect;
    },
    onPop() {},
    onCatch(val, o) {
      if (val < 0) { fx.ca = Math.min(0.045, fx.ca + (still ? 0.008 : 0.03)); if (!kaleidoOK) { P.uFlashC.value.set("#FF2D9B"); fx.flash = still ? 0.06 : 0.16; } return; }
      if (val >= 20) { kaleido("#00FF6E"); cloverBurst(B.rig.position, 26); }
    },
    onLevel(lvl) { setWorld(lvl.id, false); kaleido(); },
    onSacred(n) {
      if (n === 444) { fx.aura = 1; cloverBurst(B.rig.position, 18); P.uFlashC.value.set("#A8E6CF"); fx.flash = still ? 0.06 : 0.18; }
      if (n === 888) { fx.orchid = 1.4; P.uFlashC.value.set("#C084FC"); fx.flash = still ? 0.08 : 0.32; skullFlash(); }
    },
    onNudge() { fx.ca = Math.min(0.03, fx.ca + 0.01); },
    onEgoDeath() { fx.satT = 0; fx.ca = still ? 0.01 : 0.04; B.bloom.strength = 0.3; },
    onLanded() {
      on = false;
      neb.visible = false; B.spaceBg.visible = true;
      clovers.pts.visible = false; wdust.pts.visible = false; trail.visible = false;
      post.enabled = false; B.bloom.strength = bloomRest;
      pops.splice(0).forEach((q) => B.space.remove(q.p));
      if (skull) skull.visible = false;
    },
  };

  // 888: a Skelevaggio skull flashes out of the void. Cosmetic only.
  var skull;
  function skullFlash() {
    if (!skull) {
      const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
      g.shadowColor = "#C084FC"; g.shadowBlur = 60; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = '380px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.fillText("💀", 256, 280);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      skull = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      B.space.add(skull);
    }
    skull.visible = true; skull.material.opacity = 1;
    const G0 = performance.now();
    const tick = () => {
      const p = (performance.now() - G0) / 1400;
      if (p >= 1 || !on) { skull.visible = false; return; }
      const b = B.camera.getWorldDirection(new THREE.Vector3());
      skull.position.copy(B.camera.position).addScaledVector(b, 60);
      skull.scale.setScalar(26 + p * 14); skull.material.opacity = Math.sin(p * Math.PI) * 0.9;
      requestAnimationFrame(tick);
    };
    tick();
  }
}
