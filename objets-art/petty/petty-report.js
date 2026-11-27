// ============================================================
// PETTY RUN — THE PETTY REPORT: 1080×1350 share card, built on the brochure
// pipeline (makeBrochure's loadImg / cover / rr / fitFont + qrcode).
// ============================================================
const LIME = "#00FF6E", MAGENTA = "#FF2D9B";
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function wrap(g, text, maxW, maxLines) {
  const words = String(text).split(/\s+/), lines = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"; }
  return lines;
}

export async function makePettyReport(B, run, roast, fmtScore) {
  const { loadImg, cover, rr, fitFont } = B;
  try { await Promise.all(["400 80px Anta", "900 40px Unbounded", '700 20px "JetBrains Mono"', "800 20px Manrope"].map((f) => document.fonts.load(f))); } catch (_) {}
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#2b0f25"); bg.addColorStop(1, "#12070f");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);

  // three frames captured mid-run, spread across the run
  const all = [];
  for (const s of run.snaps) { try { all.push(await loadImg(s)); } catch (_) {} }
  let pick3 = all.length <= 3 ? all : [all[0], all[Math.floor(all.length / 2)], all[all.length - 1]];
  if (pick3.length && pick3.length < 3) pick3 = [0, 1, 2].map((i) => pick3[i % pick3.length]);
  let thumb = null; try { thumb = await loadImg("thumbs/" + run.ship.key + ".webp"); } catch (_) {}
  const hero = pick3[Math.min(1, pick3.length - 1)];
  if (hero) {
    cover(g, hero, 0, 0, W, 520);
    const sh = g.createLinearGradient(0, 200, 0, 520); sh.addColorStop(0, "rgba(18,7,15,0)"); sh.addColorStop(1, "rgba(18,7,15,1)");
    g.fillStyle = sh; g.fillRect(0, 200, W, 320);
  }
  if (!hero) { const rg = g.createRadialGradient(W * 0.7, 300, 40, W * 0.7, 300, 620); rg.addColorStop(0, "rgba(255,62,165,.45)"); rg.addColorStop(1, "rgba(255,62,165,0)"); g.fillStyle = rg; g.fillRect(0, 0, W, 560); }
  if (thumb) { const w = 500, h = w * thumb.height / thumb.width; g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 40; g.drawImage(thumb, W - w - 30, 270, w, h); g.shadowBlur = 0; }

  // header lockup
  g.fillStyle = "#fff2ec"; g.font = "900 46px Unbounded, Arial Black, sans-serif"; g.fillText("OBJETS", 52, 92);
  const ow = g.measureText("OBJETS").width; g.fillStyle = "#ff3ea5"; g.fillText(".ART", 52 + ow, 92);
  g.fillStyle = "#f6c2b0"; g.font = '700 22px "JetBrains Mono", monospace';
  g.fillText("SUPERKIND TOY CO. × MS. PETTY · ILLI MOTORS", 54, 132);

  // the number
  g.fillStyle = "#f0c869"; g.font = '700 22px "JetBrains Mono", monospace';
  g.fillText(("THE PETTY REPORT · " + run.ship.name + " · " + (run.mode === "speed" ? "SPEED ROUND" : "INFINITE")).toUpperCase(), 52, 566);
  g.fillStyle = "#f6c2b0"; g.font = '700 22px "JetBrains Mono", monospace'; g.fillText("$SHOTS", 52, 612);
  const sc = fmtScore(run.score);
  fitFont(g, sc, "400 {s}px Anta, Unbounded, sans-serif", 168, 60, 580);
  g.fillStyle = run.score < 0 ? MAGENTA : LIME; g.shadowColor = g.fillStyle; g.shadowBlur = 30; g.fillText(sc, 46, 760); g.shadowBlur = 0;
  // $LOLZ + FUMBLES
  const col = [["$LOLZ", run.lolz.toLocaleString()], ["FUMBLES", String(run.fumbles)]];
  col.forEach((c, i) => {
    const y = 612 + i * 104;
    g.fillStyle = "#f6c2b0"; g.font = '700 22px "JetBrains Mono", monospace'; g.fillText(c[0], 690, y);
    g.fillStyle = MAGENTA; fitFont(g, c[1], "400 {s}px Anta, Unbounded, sans-serif", 70, 30, 340); g.fillText(c[1], 688, y + 66);
  });

  // filmstrip
  const fy = 800, fw = 312, fh = 160;
  for (let i = 0; i < 3; i++) {
    const x = 52 + i * (fw + 20);
    rr(g, x, fy, fw, fh, 18); g.save(); g.clip();
    if (pick3[i]) cover(g, pick3[i], x, fy, fw, fh);
    else { const gr = g.createLinearGradient(x, fy, x + fw, fy + fh); gr.addColorStop(0, "#4a1538"); gr.addColorStop(1, "#1a0814"); g.fillStyle = gr; g.fillRect(x, fy, fw, fh); if (thumb) { const tw = fw * 0.8, th2 = tw * thumb.height / thumb.width; g.drawImage(thumb, x + (fw - tw) / 2, fy + (fh - th2) / 2, tw, th2); } }
    g.restore(); rr(g, x, fy, fw, fh, 18); g.lineWidth = 4; g.strokeStyle = "#e7a28f"; g.stroke();
  }

  // the roast
  const RW = W - 104 - 300;
  g.fillStyle = "#fff2ec"; g.font = "400 36px Anta, Unbounded, sans-serif";
  wrap(g, roast, RW, 3).forEach((l, i) => g.fillText(l, 52, 1022 + i * 44));

  // the one that got away, struck through
  const bf = run.biggestFumble;
  const fy2 = 1196;
  g.fillStyle = "#f0c869"; g.font = '700 20px "JetBrains Mono", monospace';
  g.fillText(bf ? "THE ONE THAT GOT AWAY" : "THE ONES THAT GOT AWAY", 52, fy2 - 26);
  if (bf) {
    g.font = "84px " + EMOJI_FONT; g.fillText(bf.emoji, 50, fy2 + 62);
    g.strokeStyle = MAGENTA; g.lineWidth = 9; g.lineCap = "round";
    g.beginPath(); g.moveTo(44, fy2 + 46); g.lineTo(148, fy2 - 2); g.stroke();
    g.fillStyle = "#fff2ec"; g.font = "800 30px Manrope, sans-serif"; g.fillText(bf.name, 170, fy2 + 18);
    const vt = "+" + bf.value; g.font = "400 40px Anta, Unbounded, sans-serif"; g.fillStyle = MAGENTA; g.fillText(vt, 170, fy2 + 64);
    const vw = g.measureText(vt).width; g.fillRect(166, fy2 + 50, vw + 8, 5);
  } else { g.fillStyle = LIME; g.font = "400 40px Anta, Unbounded, sans-serif"; g.fillText("ZERO FUMBLES", 52, fy2 + 40); }
  g.fillStyle = "#f0c869"; g.font = "400 30px Anta, Unbounded, sans-serif";
  g.textAlign = "right"; g.fillText(run.rank.title, W - 52 - 300, fy2 + 64); g.textAlign = "left";

  // QR back to this ship's lobby
  const url = B.COLLECTION_URL + "/#play-" + run.ship.id;
  const qx = W - 52 - 270, qy = 990;
  rr(g, qx, qy, 270, 270, 24); g.fillStyle = "#fff2ec"; g.fill();
  if (window.qrcode) {
    const q = window.qrcode(0, "M"); q.addData(url); q.make();
    const n = q.getModuleCount(), cell = Math.floor(234 / n), off = qx + (270 - cell * n) / 2, offy = qy + (270 - cell * n) / 2;
    g.fillStyle = "#1a0814";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(off + c * cell, offy + r * cell, cell, cell);
  }
  g.fillStyle = "#fff2ec"; g.font = "800 21px Manrope, sans-serif"; g.textAlign = "right"; g.fillText("SCAN TO PLAY THIS SHIP", W - 52, 1296); g.textAlign = "left";
  g.fillStyle = "#f6c2b0"; g.font = '700 20px "JetBrains Mono", monospace'; g.fillText(url.replace(/^https?:\/\//, ""), 52, 1318);
  g.fillStyle = "#f0c869"; g.font = '700 18px "JetBrains Mono", monospace';
  g.fillText(((run.ens || run.name) + " · " + run.at.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })).toUpperCase(), 52, 1290);
  return await new Promise((r) => cv.toBlob((b) => r(b), "image/png"));
}
