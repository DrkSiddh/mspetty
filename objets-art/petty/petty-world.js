// ============================================================
// PETTY RUN — WORLD: the rail corridor, balloons, fallout items, laser pew pews
// Everything gameplay lives in rail coordinates (s, x, y):
//   s = distance along the corridor, x/y = offsets inside the steering box.
// The corridor is a gentle, endless loop through the existing cosmos scene,
// so the planets, star field and dust from the test drive stay in view.
// ============================================================

export const LIME = "#00FF6E";
export const MAGENTA = "#FF2D9B";

export function createWorld(bridge) {
  const { THREE, space } = bridge;
  const R = 1400;                      // loop radius: about 2.4 degrees of turn per second
  const UP = new THREE.Vector3(0, 1, 0);
  const _P = new THREE.Vector3(), _T = new THREE.Vector3(), _Rt = new THREE.Vector3(), _Up = new THREE.Vector3();
  const _M = new THREE.Matrix4();

  // Starts at the origin heading -Z, which is where the test drive drops you.
  function frame(s) {
    const th = s / R;
    const y = 26 * Math.sin(th * 3) + 10 * Math.sin(th * 7);
    _P.set(-R + R * Math.cos(th), y, -R * Math.sin(th));
    const dy = (78 * Math.cos(th * 3) + 70 * Math.cos(th * 7)) / R;
    _T.set(-Math.sin(th), dy, -Math.cos(th)).normalize();
    _Rt.crossVectors(_T, UP).normalize();
    _Up.crossVectors(_Rt, _T).normalize();
  }
  function railPos(s, x, y, out) {
    frame(s);
    return out.copy(_P).addScaledVector(_Rt, x).addScaledVector(_Up, y);
  }
  function railQuat(s, out) {
    frame(s);
    _M.makeBasis(_Rt, _Up, _T.clone().negate());
    return out.setFromRotationMatrix(_M);
  }
  function railBasis(s) { frame(s); return { P: _P.clone(), T: _T.clone(), Rt: _Rt.clone(), Up: _Up.clone() }; }

  // ── balloons: glossy latex, slightly stretched, knot, curly string, fake smile
  const smileTex = (() => {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 1024, 512);
    const cx = 256, cy = 250; // u = 0.25 is the side that faces the ship
    g.fillStyle = "#16060f";
    g.beginPath(); g.ellipse(cx - 46, cy - 44, 15, 24, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(cx + 46, cy - 44, 15, 24, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff";
    g.beginPath(); g.arc(cx - 41, cy - 52, 5, 0, Math.PI * 2); g.arc(cx + 51, cy - 52, 5, 0, Math.PI * 2); g.fill();
    // the too-wide smile: ear to ear, with the corners pulled up like it hurts
    g.strokeStyle = "#16060f"; g.lineCap = "round"; g.lineWidth = 15;
    g.beginPath(); g.moveTo(cx - 132, cy + 2);
    g.bezierCurveTo(cx - 92, cy + 98, cx + 92, cy + 98, cx + 132, cy + 2); g.stroke();
    g.lineWidth = 7;
    g.beginPath(); g.moveTo(cx - 98, cy + 40); g.bezierCurveTo(cx - 50, cy + 66, cx + 50, cy + 66, cx + 98, cy + 40); g.stroke();
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(cx + k * 26, cy + 52 + Math.abs(k) * -3); g.lineTo(cx + k * 26, cy + 76 - Math.abs(k) * 5); g.stroke(); }
    g.lineWidth = 9;
    g.beginPath(); g.moveTo(cx - 146, cy - 12); g.lineTo(cx - 128, cy + 10); g.stroke();
    g.beginPath(); g.moveTo(cx + 146, cy - 12); g.lineTo(cx + 128, cy + 10); g.stroke();
    g.fillStyle = "rgba(255,120,150,.35)";
    g.beginPath(); g.ellipse(cx - 92, cy + 6, 26, 14, 0, 0, Math.PI * 2); g.ellipse(cx + 92, cy + 6, 26, 14, 0, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  })();
  const bodyGeo = new THREE.SphereGeometry(1, 40, 28);
  { // a hair narrower at the bottom, like a real balloon
    const p = bodyGeo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = y < 0 ? 1 + y * 0.18 : 1; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
    bodyGeo.computeVertexNormals();
  }
  const knotGeo = new THREE.ConeGeometry(0.22, 0.34, 12); knotGeo.translate(0, -0.17, 0);
  const matCache = new Map();
  function latex(color) {
    if (matCache.has(color)) return matCache.get(color);
    const c = new THREE.Color(color);
    const m = new THREE.MeshPhysicalMaterial({ color: c, map: smileTex, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.5, sheenColor: c.clone().lerp(new THREE.Color("#ffffff"), 0.5), emissive: c.clone().multiplyScalar(0.22) });
    matCache.set(color, m);
    return m;
  }
  const STRING_N = 16;
  function makeBalloon(color, size) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, latex(color));
    body.scale.set(size, size * 1.18, size);
    body.rotation.y = 0; g.add(body);
    const knot = new THREE.Mesh(knotGeo, latex(color)); knot.position.y = -size * 1.18 * 0.98; knot.scale.setScalar(size / 1.7); g.add(knot);
    const sp = new Float32Array(STRING_N * 3);
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const str = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: 0xfff2ec, transparent: true, opacity: 0.85 }));
    g.add(str);
    g.userData = { body, str, sp, size, phase: Math.random() * 6.28, color };
    return g;
  }
  function swayString(g, t) {
    const { sp, size, phase, str } = g.userData;
    const top = -size * 1.18 * 1.18, len = size * 3.2;
    for (let i = 0; i < STRING_N; i++) {
      const k = i / (STRING_N - 1);
      sp[i * 3] = Math.sin(k * 9 + t * 2.3 + phase) * 0.22 * k + Math.sin(t * 1.1 + phase) * 0.35 * k * k;
      sp[i * 3 + 1] = top - k * len;
      sp[i * 3 + 2] = Math.cos(k * 9 + t * 2.3 + phase) * 0.22 * k;
    }
    str.geometry.attributes.position.needsUpdate = true;
  }

  // ── fallout: big emoji in a glow halo, value underneath. Readable at speed.
  const texCache = new Map();
  function itemTexture(item, good) {
    const key = item.emoji + "|" + item.value;
    if (texCache.has(key)) return texCache.get(key);
    const c = document.createElement("canvas"); c.width = 512; c.height = 660;
    const g = c.getContext("2d"), col = good ? LIME : MAGENTA;
    const halo = g.createRadialGradient(256, 256, 120, 256, 256, 250);
    halo.addColorStop(0, "rgba(10,3,9,.72)"); halo.addColorStop(0.72, "rgba(10,3,9,.55)"); halo.addColorStop(1, "rgba(10,3,9,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
    g.shadowColor = col; g.shadowBlur = 46; g.strokeStyle = col; g.lineWidth = 26;
    g.beginPath(); g.arc(256, 256, 212, 0, Math.PI * 2); g.stroke();
    g.shadowBlur = 0;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = '256px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    g.fillText(item.emoji, 256, 270);
    const txt = (item.value > 0 ? "+" : "") + item.value;
    g.font = '400 128px Anta, Unbounded, "Arial Black", sans-serif';
    g.lineWidth = 18; g.strokeStyle = "rgba(10,3,9,.9)"; g.strokeText(txt, 256, 580);
    g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 24; g.fillText(txt, 256, 580);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    texCache.set(key, t);
    return t;
  }
  function makeItem(item, good) {
    const m = new THREE.SpriteMaterial({ map: itemTexture(item, good), transparent: true, depthWrite: false });
    const s = new THREE.Sprite(m);
    s.scale.set(3.6, 3.6 * 660 / 512, 1);
    s.renderOrder = 5;
    return s;
  }

  // ── laser pew pews: hot core, short glowing streak
  const boltGeo = new THREE.CylinderGeometry(0.11, 0.11, 6, 6); boltGeo.rotateX(Math.PI / 2);
  const glowGeo = new THREE.CylinderGeometry(0.32, 0.32, 7.5, 8); glowGeo.rotateX(Math.PI / 2);
  const boltMats = new Map();
  function boltMat(color) {
    if (!boltMats.has(color)) {
      boltMats.set(color, [
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.6) }),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
      ]);
    }
    return boltMats.get(color);
  }
  function makeBolt(color) {
    const [core, glow] = boltMat(color);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(boltGeo, core)); g.add(new THREE.Mesh(glowGeo, glow));
    return g;
  }

  function add(o) { space.add(o); return o; }
  function remove(o) { space.remove(o); }

  return { R, railPos, railQuat, railBasis, makeBalloon, swayString, makeItem, itemTexture, makeBolt, add, remove, latex };
}
