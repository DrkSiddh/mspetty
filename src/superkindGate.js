// ============================================================
// MS. PETTY — SUPERKIND ACCESS GATE (Base + Ethereum, no SDK)
// ------------------------------------------------------------
// BASE      0x3bd644bb69e70a9b57e4213b977257aea9ca45bf  ERC-721
//           any token → ∞ infinite play + token laser color/SFX
// ETHEREUM  0x378d5c126ed319db86c15ef4f6bd02885d6d0bf6  ERC-1155 (Manifold)
//           token IDs 5+ → VEHICLE MODE (player drives the car) + ∞ play
//           IDs 1–4 are the original cars and do NOT unlock vehicle mode.
//           New IDs activate automatically the moment they're minted.
// Wallets: EIP-6963 discovery (every installed wallet shows up by name/icon),
// window.ethereum fallback, and mobile deep links into wallet in-app browsers.
// Read-only checks go straight to public RPCs with raw eth_call.
// ============================================================

export const SUPERKIND_CONTRACT = "0x3bd644bb69e70a9b57e4213b977257aea9ca45bf";
export const BASE_RPC = "https://mainnet.base.org";

export const VEHICLE_CONTRACT = "0x378d5c126ed319db86c15ef4f6bd02885d6d0bf6";
export const VEHICLE_MIN_ID = 5;
export const VEHICLE_SCAN_MAX = 64; // one batched call checks IDs 5…64
const ETH_RPCS = [
  "https://ethereum-rpc.publicnode.com",
  "https://eth.llamarpc.com",
  "https://cloudflare-eth.com",
];

const LASER_COLORS = { 1: "#FF3B3B", 2: "#7B2FBE" }; // 1=neon red, 2=purple
const DEFAULT_LASER = "#00FF6E"; // lime — any future token

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
const rpcCall = (data) => ethCall(BASE_RPC, SUPERKIND_CONTRACT, data);

async function ethMainnetCall(data) {
  let lastErr;
  for (const url of ETH_RPCS) {
    try { return await ethCall(url, VEHICLE_CONTRACT, data); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("ETH RPC unavailable");
}

const pad32 = (h) => h.padStart(64, "0");
const addrParam = (a) => pad32(a.toLowerCase().replace(/^0x/, ""));
const uintParam = (n) => pad32(BigInt(n).toString(16));
const words = (hex) => (hex.replace(/^0x/, "").match(/.{64}/g) || []);

function decodeString(hex) {
  const h = hex.replace(/^0x/, "");
  const offset = parseInt(h.slice(0, 64), 16) * 2;
  const len = parseInt(h.slice(offset, offset + 64), 16);
  const bytes = h.slice(offset + 64, offset + 64 + len * 2);
  const arr = new Uint8Array(bytes.match(/.{2}/g)?.map((b) => parseInt(b, 16)) || []);
  return new TextDecoder().decode(arr);
}

export const isValidAddress = (a) => /^0x[0-9a-fA-F]{40}$/.test(a || "");

// ── BASE (ERC-721) — unchanged behavior ──────────────────────
export async function isHolder(address) {
  const result = await rpcCall("0x70a08231" + addrParam(address)); // balanceOf
  return BigInt(result) > 0n;
}

// Highest token id owned (tiebreak: highest wins) → { id, color }.
export async function getHeldToken(address) {
  const want = address.toLowerCase();
  const supply = Number(BigInt(await rpcCall("0x18160ddd"))); // totalSupply
  const ids = Array.from({ length: supply }, (_, i) => i + 1);
  const owners = await Promise.all(ids.map(async (id) => {
    try {
      const ownerHex = await rpcCall("0x6352211e" + uintParam(id)); // ownerOf
      return "0x" + ownerHex.slice(-40).toLowerCase();
    } catch (_) { return null; }
  }));
  let best = null;
  owners.forEach((o, i) => { if (o === want) best = ids[i]; });
  return {
    id: best,
    color: best === null ? DEFAULT_LASER : (LASER_COLORS[best] || DEFAULT_LASER),
  };
}

export async function getLaserColor(address) {
  return (await getHeldToken(address)).color;
}

// ── ETHEREUM (ERC-1155) — vehicles, IDs 5+ ───────────────────
// balanceOfBatch(address[] accounts, uint256[] ids) — one call for all IDs.
export async function getVehicleIds(address) {
  const ids = [];
  for (let i = VEHICLE_MIN_ID; i <= VEHICLE_SCAN_MAX; i++) ids.push(i);
  const n = ids.length;
  const head = uintParam(64) + uintParam(64 + 32 * (n + 1));
  const accounts = uintParam(n) + ids.map(() => addrParam(address)).join("");
  const idArr = uintParam(n) + ids.map(uintParam).join("");
  const result = await ethMainnetCall("0x4e1273f4" + head + accounts + idArr);
  const w = words(result); // [offset, length, ...balances]
  const balances = w.slice(2, 2 + n).map((x) => BigInt("0x" + x));
  return ids.filter((_, i) => balances[i] > 0n);
}

const gatewayURL = (u) => (u || "")
  .replace(/^ar:\/\//, "https://arweave.net/")
  .replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");

// Token metadata → { id, name, image, animation } (image = the car sprite).
export async function getVehicleMeta(id) {
  try {
    const raw = decodeString(await ethMainnetCall("0x0e89341c" + uintParam(id))); // uri(id)
    const url = gatewayURL(raw.replace("{id}", uintParam(id)));
    const meta = await (await fetch(url)).json();
    return {
      id,
      name: meta.name || `SuperKind Vehicle #${id}`,
      image: gatewayURL(meta.image) || null,
      animation: gatewayURL(meta.animation_url) || null,
    };
  } catch (_) {
    return { id, name: `SuperKind Vehicle #${id}`, image: null, animation: null };
  }
}

// ── ENS (cosmetic only) ──────────────────────────────────────
export async function resolveENS(address) {
  try {
    const r = await (await fetch(`https://api.ensideas.com/ens/resolve/${address}`)).json();
    return r && r.name ? { name: r.name, avatar: r.avatar || null } : null;
  } catch (_) { return null; }
}

// ── ONE CALL: everything a wallet unlocks ────────────────────
// Each chain fails soft — a dead RPC never blocks play.
export async function getAccess(address) {
  const [base, vehicles, ens] = await Promise.all([
    getHeldToken(address).catch(() => ({ id: null, color: DEFAULT_LASER })),
    getVehicleIds(address).catch(() => []),
    resolveENS(address),
  ]);
  const vehicleId = vehicles.length ? Math.max(...vehicles) : null;
  const vehicle = vehicleId ? await getVehicleMeta(vehicleId) : null;
  return {
    address,
    ens: ens ? ens.name : null,
    avatar: ens ? ens.avatar : null,
    baseHolder: base.id !== null,
    baseTokenId: base.id,
    laserColor: base.color,
    vehicles,
    vehicleId,
    vehicle,
    infinite: base.id !== null || vehicles.length > 0,
  };
}

// ── WALLET DISCOVERY + CONNECT ───────────────────────────────
// EIP-6963: every installed wallet announces itself (name + icon).
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
      if (!list.length && window.ethereum) {
        list.push({ info: { uuid: "injected", name: "Browser Wallet", icon: null, rdns: "injected" }, provider: window.ethereum });
      }
      resolve(list);
    }, timeoutMs);
  });
}

export async function connectWith(provider) {
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || !accounts.length) throw new Error("NO_ACCOUNT");
  return accounts[0];
}

// Back-compat: first available wallet.
export async function connectWallet() {
  const list = await discoverWallets();
  if (!list.length) throw new Error("NO_WALLET");
  return connectWith(list[0].provider);
}

// Phones without an injected wallet: reopen the game inside the wallet app.
export const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
export function walletDeepLinks(siteUrl = "https://mspetty.blaqqat.games") {
  const host = siteUrl.replace(/^https?:\/\//, "");
  const enc = encodeURIComponent(siteUrl);
  return [
    { name: "Coinbase Wallet", href: `https://go.cb-w.com/dapp?cb_url=${enc}` },
    { name: "MetaMask", href: `https://metamask.app.link/dapp/${host}` },
    { name: "Trust Wallet", href: `https://link.trustwallet.com/open_url?coin_id=60&url=${enc}` },
  ];
}
