// ============================================================
// PETTY RUN — AUDIO
// Laser pew pews: a laser holder fires laser-token{id}.mp3 (the live game's
// sound map: src/MsPetty.jsx playPew). Balloon burst plays on every pop for
// every player (live game rule). No laser held → a WebAudio synth pew and a
// pink-noise pop stand in. PLACEHOLDER: replace the synth with a real file
// when one exists (see DEFAULT_PEW below).
// Everything runs through the radio's AudioContext when it exists, so the
// run video records the pew pews and the radio together.
// ============================================================

const SFX_VOL = 0.55; // live game volume

export function createAudio(bridge) {
  const { radio, D } = bridge;
  let ctx = null, master = null, recTap = null;
  const buffers = new Map();
  let laserVoice = null, lastLaser = 0, laserUrl = null;

  function ensure() {
    if (ctx) return ctx;
    try { bridge.ensureAudio(); bridge.ensureAnalyser(); } catch (_) {}
    ctx = radio.ctx;
    if (!ctx) {
      try { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC(); } catch (_) { return null; }
    }
    master = ctx.createGain();
    master.gain.value = SFX_VOL;
    master.connect(ctx.destination);
    return ctx;
  }
  function resume() { if (ensure() && ctx.state === "suspended") ctx.resume().catch(() => {}); }

  // The run video taps radio.an into D.audioDest (startRecording). Tap ours in too.
  function tapRecording() {
    if (!master || recTap === D.audioDest) return;
    if (recTap) { try { master.disconnect(recTap); } catch (_) {} recTap = null; }
    if (D.audioDest && D.audioDest.context === ctx) { try { master.connect(D.audioDest); recTap = D.audioDest; } catch (_) {} }
  }

  async function load(url) {
    if (!ensure()) return null;
    if (buffers.has(url)) return buffers.get(url);
    const p = fetch(url).then((r) => r.arrayBuffer()).then((b) => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej))).catch(() => null);
    buffers.set(url, p);
    return p;
  }
  async function playUrl(url, vol = 1, rate = 1) {
    const buf = await load(url);
    if (!buf) return null;
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(master); src.start();
    return { src, g };
  }

  // DEFAULT_PEW — placeholder synth: short pitch-dropping square/saw blip.
  function synthPew(pitch = 1) {
    if (!ensure()) return;
    const t = ctx.currentTime;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o1.type = "square"; o2.type = "sawtooth";
    o1.frequency.setValueAtTime(1500 * pitch, t); o1.frequency.exponentialRampToValueAtTime(170 * pitch, t + 0.13);
    o2.frequency.setValueAtTime(1520 * pitch, t); o2.frequency.exponentialRampToValueAtTime(160 * pitch, t + 0.14);
    f.type = "lowpass"; f.frequency.value = 3200;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(master);
    o1.start(t); o2.start(t); o1.stop(t + 0.16); o2.stop(t + 0.16);
  }
  let pinkBuf = null;
  function pink() {
    if (pinkBuf) return pinkBuf;
    const n = Math.floor(ctx.sampleRate * 0.4), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    }
    return (pinkBuf = b);
  }
  // DEFAULT_EXPLOSION — placeholder: pink-noise pop with a falling lowpass.
  function synthPop(big = false) {
    if (!ensure()) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = pink(); f.type = "lowpass";
    f.frequency.setValueAtTime(big ? 5200 : 4200, t); f.frequency.exponentialRampToValueAtTime(260, t + (big ? 0.35 : 0.2));
    g.gain.setValueAtTime(big ? 0.9 : 0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.38 : 0.22));
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.4);
  }
  function tone(freqs, dur, type = "triangle", vol = 0.22) {
    if (!ensure()) return;
    const t = ctx.currentTime;
    freqs.forEach((fq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type;
      const at = t + i * 0.055;
      o.frequency.setValueAtTime(fq, at);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + 0.02);
    });
  }

  return {
    resume,
    tapRecording,
    setLaser(tokenId) {
      laserUrl = tokenId ? `sounds/laser-token${tokenId}.mp3` : null;
      if (laserUrl) load(laserUrl);
      load("sounds/balloon-burst.mp3");
    },
    // One laser voice, retriggered: each shot restarts the clip so a 3s file
    // still reads as a pew pew at full fire rate.
    pew(beams = 1) {
      if (!ensure()) return;
      const now = ctx.currentTime;
      if (now - lastLaser < 0.12) return;
      lastLaser = now;
      if (!laserUrl) { synthPew(1); if (beams > 1) synthPew(1.26); return; }
      if (laserVoice) { const v = laserVoice; try { v.g.gain.setTargetAtTime(0.0001, now, 0.012); v.src.stop(now + 0.06); } catch (_) {} }
      laserVoice = null;
      playUrl(laserUrl, 0.9).then((v) => { laserVoice = v; });
    },
    pop(big = false) {
      playUrl("sounds/balloon-burst.mp3", 0.85, 0.96 + Math.random() * 0.1);
      if (!laserUrl) synthPop(big);
    },
    catchGood(val) { tone(val >= 20 ? [784, 988, 1319, 1568] : [880, 1319], val >= 20 ? 0.28 : 0.18, "triangle", 0.2); },
    catchBad() { tone([196, 147], 0.26, "sawtooth", 0.16); },
    fumble() { tone([392, 330, 262], 0.22, "square", 0.08); },
    level() { tone([523, 659, 784, 1047, 1319], 0.32, "triangle", 0.18); },
    egoDeath() { tone([220, 185, 147, 110, 82], 0.9, "sawtooth", 0.2); },
  };
}
