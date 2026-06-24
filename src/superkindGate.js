// SuperKind Toy Co. NFT gate — Base mainnet, ERC-721, no SDK (sovereign).
// Hold ANY token in the collection -> infinite gameplay.
export const SUPERKIND_CONTRACT = "0x3bd644bb69e70a9b57e4213b977257aea9ca45bf";
export const BASE_RPC = "https://mainnet.base.org";

const LASER_COLORS = { 1: "#FF3B3B", 2: "#7B2FBE" }; // 1=neon red, 2=purple
const DEFAULT_LASER = "#00FF6E"; // lime — any future token

async function rpcCall(data) {
  const res = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call",
      params: [{ to: SUPERKIND_CONTRACT, data }, "latest"] }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}
const pad32 = (h) => h.padStart(64, "0");
const addrParam = (a) => pad32(a.toLowerCase().replace(/^0x/, ""));
const uintParam = (n) => pad32(BigInt(n).toString(16));

export async function connectWallet() {
  if (!window.ethereum) throw new Error("NO_WALLET");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts || !accounts.length) throw new Error("NO_ACCOUNT");
  return accounts[0];
}
export async function isHolder(address) {
  const result = await rpcCall("0x70a08231" + addrParam(address)); // balanceOf
  return BigInt(result) > 0n;
}
// Highest token id owned (tiebreak: highest wins) → { id, color }.
// id is null when the address holds nothing.
export async function getHeldToken(address) {
  const want = address.toLowerCase();
  const supply = Number(BigInt(await rpcCall("0x18160ddd"))); // totalSupply
  let best = null;
  for (let id = 1; id <= supply; id++) {
    try {
      const ownerHex = await rpcCall("0x6352211e" + uintParam(id)); // ownerOf
      const owner = "0x" + ownerHex.slice(-40);
      if (owner.toLowerCase() === want) { if (best === null || id > best) best = id; }
    } catch (_) {}
  }
  return {
    id: best,
    color: best === null ? DEFAULT_LASER : (LASER_COLORS[best] || DEFAULT_LASER),
  };
}

export async function getLaserColor(address) {
  return (await getHeldToken(address)).color;
}
