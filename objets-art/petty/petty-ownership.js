// ============================================================
// PETTY RUN — OWNERSHIP (port of the Ms. Petty gate, src/superkindGate.js on
// branch claude/ms-petty-2d-update-9jh1k7). Raw EIP-1193 + raw eth_call over
// free public RPCs. No SDK. Every address and token id lives in OWNERSHIP.
// Each source fails soft: a dead RPC never blocks a Speed Round.
// ============================================================

export const OWNERSHIP = {
  // 1) LASER PEW PEWS — Base mainnet, Transient Labs (lab.transient.xyz contract 2737).
  //    Holding ANY token = laser holder. Every minted id is checked (totalSupply → ownerOf).
  lasers: {
    chain: "Base",
    rpcs: ["https://mainnet.base.org"],
    contract: "0x3bd644bb69e70a9b57e4213b977257aea9ca45bf",
    // Names read from each token's Transient Labs page on 2026-11-25. A token minted
    // after that shows as "PEW PEW #id" until it is added here.
    names: {
      1: "Big Phat Red", 2: "Super Blaum T3", 3: "Commish T50", 4: "The Disruptor Disruptor 9000",
      5: "Freq Ray", 6: "Big Mouth T3", 7: "Point Guard T4", 8: "UpSynchronizer T10",
      9: "Golden Snubnose Piru T57", 10: "Enlightner Blasto T14", 11: "Alien Plasma T51",
    },
    // Live game colors: 1 = neon red, 2 = purple. The live game paints every other
    // token lime; here lime means "catch", so other tokens fire gold. (assumption)
    colors: { 1: "#FF3B3B", 2: "#7B2FBE" },
    otherColor: "#F0C869",
    sound: (id) => `sounds/laser-token${id}.mp3`, // the live game's map (playPew)
  },
  // 2) SHIPS — Ethereum mainnet, Manifold "ILLI$T X MAXXIMILLIAN" (ERC-1155).
  //    Ship tokens are ids 5 and up. Ids 1–4 are the original ILLI$T cars.
  ships: {
    chain: "Ethereum",
    rpcs: ["https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://cloudflare-eth.com"],
    contract: "0x378d5c126ed319db86c15ef4f6bd02885d6d0bf6",
    minId: 5,
    scanMax: 64,
    // token id → Objets ship id. Usually leave this EMPTY: every minted id from
    // minId up is found on chain and matched to a ship by its metadata name
    // (discoverShipTokens below). Only fill it in to override a match, e.g.
    // { 5: "star-drift" }. On 2026-11-26 no id from 5 up was minted yet.
    byTokenId: {},
  },
  // 3) MANIFOLD TOKEN — manifold.xyz/@maxximillian/id/1948145904
  //    Resolved via apps.api.manifoldxyz.dev: "The Phaedra Solar Supercharger",
  //    Ethereum, same ILLI$T contract as the ships, token id 4, 99 editions.
  //    It is not one of the six Objets ships, so it maps to no ship.
  manifold: {
    instanceId: 1948145904,
    name: "The Phaedra Solar Supercharger",
    chain: "Ethereum",
    contract: "0x378d5c126ed319db86c15ef4f6bd02885d6d0bf6",
    tokenId: 4,
    url: "https://manifold.xyz/@maxximillian/id/1948145904",
    ship: null,
  },
};

const IFACE_1155 = "0xd9b67a26";

// ── raw JSON-RPC ─────────────────────────────────────────────
async function ethCall(rpcUrl, to, data) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}
// One HTTP request for many eth_calls (JSON-RPC batch), with a short backoff on 429.
async function ethBatch(rpcUrl, to, datas) {
  const body = JSON.stringify(datas.map((data, i) => ({ jsonrpc: "2.0", id: i, method: "eth_call", params: [{ to, data }, "latest"] })));
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(rpcUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (res.status === 429) { await new Promise((r) => setTimeout(r, 600 * (attempt + 1))); continue; }
    const json = await res.json();
    if (!Array.isArray(json)) throw new Error("batch unsupported");
    const out = new Array(datas.length).fill(null);
    for (const r of json) if (r && !r.error && typeof r.id === "number") out[r.id] = r.result;
    return out;
  }
  throw new Error("rate limited");
}
async function callAny(src, data) {
  let lastErr;
  for (const url of src.rpcs) { try { return await ethCall(url, src.contract, data); } catch (e) { lastErr = e; } }
  throw lastErr || new Error("RPC unavailable");
}
const pad32 = (h) => h.padStart(64, "0");
const addrParam = (a) => pad32(a.toLowerCase().replace(/^0x/, ""));
const uintParam = (n) => pad32(BigInt(n).toString(16));
const words = (hex) => (hex.replace(/^0x/, "").match(/.{64}/g) || []);
export const isValidAddress = (a) => /^0x[0-9a-fA-F]{40}$/.test(a || "");
export const shortAddr = (a) => (a ? a.slice(0, 6) + "…" + a.slice(-4) : "");

// ERC-1155 or ERC-721? supportsInterface(0xd9b67a26).
async function standardOf(src) {
  if (src._std) return src._std;
  try {
    const r = await callAny(src, "0x01ffc9a7" + IFACE_1155.slice(2).padEnd(64, "0"));
    src._std = BigInt(r) === 1n ? "1155" : "721";
  } catch (_) { src._std = "721"; }
  return src._std;
}
async function balancesOf1155(src, address, ids) {
  const n = ids.length;
  const head = uintParam(64) + uintParam(64 + 32 * (n + 1));
  const accounts = uintParam(n) + ids.map(() => addrParam(address)).join("");
  const idArr = uintParam(n) + ids.map(uintParam).join("");
  const w = words(await callAny(src, "0x4e1273f4" + head + accounts + idArr)); // balanceOfBatch
  return w.slice(2, 2 + n).map((x) => BigInt("0x" + x));
}
async function owned721(src, address) {
  const want = address.toLowerCase();
  const supply = Number(BigInt(await callAny(src, "0x18160ddd"))); // totalSupply: every minted id
  const ids = Array.from({ length: supply }, (_, i) => i + 1);
  const datas = ids.map((id) => "0x6352211e" + uintParam(id)); // ownerOf
  let raw = null;
  for (const url of src.rpcs) { try { raw = await ethBatch(url, src.contract, datas); break; } catch (_) {} }
  if (!raw) raw = await Promise.all(datas.map((d) => callAny(src, d).catch(() => null))); // RPC without batch support
  const owners = raw.map((h) => (h && h.length >= 42 ? "0x" + h.slice(-40).toLowerCase() : null));
  return ids.filter((_, i) => owners[i] === want);
}

// Every laser token the wallet holds → [{ id, name, color, sound }]
export async function getLasers(address) {
  const L = OWNERSHIP.lasers;
  const std = await standardOf(L);
  let ids;
  if (std === "1155") {
    const scan = Array.from({ length: 64 }, (_, i) => i + 1);
    const bal = await balancesOf1155(L, address, scan);
    ids = scan.filter((_, i) => bal[i] > 0n);
  } else ids = await owned721(L, address);
  return ids.map(laserInfo);
}
export function laserInfo(id) {
  const L = OWNERSHIP.lasers;
  return { id, name: (L.names[id] || `Pew Pew #${id}`).toUpperCase(), color: L.colors[id] || L.otherColor, sound: L.sound(id) };
}

// ── ship tokens: found on chain as they mint ─────────────────
// Every id from minId up with a non-zero supply is a ship. Its metadata name
// is matched to one of the six Objets ships, so a new mint needs no code change.
function decodeString(hex) {
  const h = hex.replace(/^0x/, "");
  const offset = parseInt(h.slice(0, 64), 16) * 2;
  const len = parseInt(h.slice(offset, offset + 64), 16);
  const bytes = h.slice(offset + 64, offset + 64 + len * 2);
  return new TextDecoder().decode(new Uint8Array(bytes.match(/.{2}/g)?.map((b) => parseInt(b, 16)) || []));
}
const gatewayURL = (u) => (u || "").replace(/^ar:\/\//, "https://arweave.net/").replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// "Star Drift · Series 01 #5" → star-drift. Longest names first, so a longer
// ship name always wins over a shorter one it contains.
export function matchShip(name, cars) {
  const n = " " + norm(name) + " ";
  return [...cars].sort((a, b) => b.name.length - a.name.length).find((c) => n.includes(" " + norm(c.name) + " ")) || null;
}
const SHIP_CACHE = "objets_petty_ship_tokens_v1";
let shipMapP = null;
// → { "star-drift": 5, ... } for every ship that has a minted token
export function discoverShipTokens(cars) {
  if (shipMapP) return shipMapP;
  shipMapP = (async () => {
    const S = OWNERSHIP.ships;
    const manual = {};
    for (const [id, shipId] of Object.entries(S.byTokenId)) manual[shipId] = +id;
    try {
      const c = JSON.parse(sessionStorage.getItem(SHIP_CACHE) || "null");
      if (c && Date.now() - c.at < 3 * 3600e3) return { ...c.map, ...manual };
    } catch (_) {}
    const ids = [];
    for (let i = S.minId; i <= S.scanMax; i++) ids.push(i);
    let supply = null;
    for (const url of S.rpcs) { try { supply = await ethBatch(url, S.contract, ids.map((id) => "0xbd85b039" + uintParam(id))); break; } catch (_) {} } // totalSupply(id)
    if (!supply) { shipMapP = null; return manual; }
    const minted = ids.filter((_, i) => supply[i] && BigInt(supply[i]) > 0n);
    const found = {};
    await Promise.all(minted.map(async (id) => {
      try {
        const raw = decodeString(await callAny(S, "0x0e89341c" + uintParam(id))); // uri(id)
        const meta = await (await fetch(gatewayURL(raw.replace("{id}", uintParam(id))))).json();
        const car = matchShip(meta.name, cars);
        if (car && !(car.id in found)) found[car.id] = id;
      } catch (_) {}
    }));
    try { sessionStorage.setItem(SHIP_CACHE, JSON.stringify({ at: Date.now(), map: found })); } catch (_) {}
    return { ...found, ...manual };
  })();
  return shipMapP;
}
export const shipTokenURL = (tokenId) => `https://opensea.io/assets/ethereum/${OWNERSHIP.ships.contract}/${tokenId}`;

// Ship tokens (ids ≥ minId) + the Manifold token, one batched call.
export async function getShipHoldings(address, cars = []) {
  const S = OWNERSHIP.ships, M = OWNERSHIP.manifold;
  const std = await standardOf(S);
  const ids = [M.tokenId];
  for (let i = S.minId; i <= S.scanMax; i++) ids.push(i);
  let held;
  if (std === "1155") { const bal = await balancesOf1155(S, address, ids); held = ids.filter((_, i) => bal[i] > 0n); }
  else held = await owned721(S, address);
  const shipTokens = held.filter((id) => id >= S.minId);
  const map = shipTokens.length ? await discoverShipTokens(cars) : {};
  const byToken = {};
  for (const [shipId, tokenId] of Object.entries(map)) byToken[tokenId] = shipId;
  const ships = [...new Set(shipTokens.map((id) => byToken[id]).filter(Boolean))];
  return {
    shipTokens,
    ships,
    unmatchedShip: shipTokens.some((id) => !byToken[id]), // a ship whose name we could not match yet
    manifold: held.includes(M.tokenId),
  };
}

// ── ENS (cosmetic) ───────────────────────────────────────────
export async function resolveENS(address) {
  try {
    const r = await (await fetch(`https://api.ensideas.com/ens/resolve/${address}`)).json();
    return r && r.name ? r.name : null;
  } catch (_) { return null; }
}

// ── ONE CALL: everything a wallet unlocks (parallel) ─────────
export async function getAccess(address, cars = []) {
  const [lasers, ships, ens] = await Promise.all([
    getLasers(address).catch(() => null),
    getShipHoldings(address, cars).catch(() => null),
    resolveENS(address),
  ]);
  const shipIds = ships ? ships.ships : [];
  if (ships && ships.manifold && OWNERSHIP.manifold.ship) shipIds.push(OWNERSHIP.manifold.ship);
  return {
    address,
    ens,
    lasers: lasers || [],
    shipTokens: ships ? ships.shipTokens : [],
    ships: [...new Set(shipIds)],
    manifold: !!(ships && ships.manifold),
    unmatchedShip: !!(ships && ships.unmatchedShip),
    failed: { lasers: lasers === null, ships: ships === null },
    holder: (lasers && lasers.length > 0) || (ships && (ships.shipTokens.length > 0 || ships.manifold)),
  };
}

// ── WALLET DISCOVERY + CONNECT (EIP-6963, window.ethereum fallback) ──
export function discoverWallets(timeoutMs = 400) {
  return new Promise((resolve) => {
    const found = new Map();
    const onAnnounce = (e) => {
      const { info, provider } = e.detail || {};
      if (info && provider && !found.has(info.uuid)) found.set(info.uuid, { info, provider });
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      const list = [...found.values()];
      if (!list.length && window.ethereum) list.push({ info: { uuid: "injected", name: "Browser Wallet", icon: null, rdns: "injected" }, provider: window.ethereum });
      resolve(list);
    }, timeoutMs);
  });
}
export async function connectWith(provider) {
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || !accounts.length) throw new Error("NO_ACCOUNT");
  return accounts[0];
}
export async function silentAccount(provider) {
  try { const a = await provider.request({ method: "eth_accounts" }); return a && a[0] ? a[0] : null; } catch (_) { return null; }
}
export const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
export function walletDeepLinks(siteUrl) {
  const host = siteUrl.replace(/^https?:\/\//, "");
  const enc = encodeURIComponent(siteUrl);
  return [
    { name: "Coinbase Wallet", href: `https://go.cb-w.com/dapp?cb_url=${enc}` },
    { name: "MetaMask", href: `https://metamask.app.link/dapp/${host}` },
    { name: "Trust Wallet", href: `https://link.trustwallet.com/open_url?coin_id=60&url=${enc}` },
  ];
}
