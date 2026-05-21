import { useState, useEffect } from “react”;

const MOCK_LEADERS = [
{ rank: 1, handle: “@blaqqat”, score: 8880, shots: 420, level: “VEGAS”, badge: “👑” },
{ rank: 2, handle: “@skelevaggio”, score: 7770, shots: 310, level: “SKELEVAGGIO”, badge: “💀” },
{ rank: 3, handle: “@aurafield”, score: 6610, shots: 280, level: “DAD ZONE”, badge: “🦋” },
{ rank: 4, handle: “@cinemarage”, score: 5550, shots: 201, level: “CINEMATIC”, badge: “🎬” },
{ rank: 5, handle: “@sugarcrash”, score: 4440, shots: 180, level: “CANDY CHAOS”, badge: “🍬” },
{ rank: 6, handle: “@pridemode”, score: 4320, shots: 155, level: “PRIDE MODE”, badge: “🌈” },
{ rank: 7, handle: “@hatemaster”, score: 3210, shots: 120, level: “AURA FIELD”, badge: “✨” },
{ rank: 8, handle: “@extractorx”, score: 2220, shots: 99, level: “DREAMLIKE”, badge: “💙” },
];

const MOCK_SPONSORS = [
{ name: “$LOLZ”, tier: “PLATINUM”, amount: “$500”, status: “ACTIVE”, logo: “🪙” },
{ name: “Gato Society”, tier: “GOLD”, amount: “$250”, status: “ACTIVE”, logo: “🐱” },
{ name: “ENDODECA”, tier: “SILVER”, amount: “$100”, status: “ACTIVE”, logo: “🎵” },
{ name: “Farcaster”, tier: “BRONZE”, amount: “$50”, status: “PENDING”, logo: “🌐” },
];

const MOCK_FEED = [
{ platform: “X”, handle: “@blaqqat”, content: “Just hit 8880 on HATER. VEGAS mode is unhinged 🃏💸”, time: “2m ago”, likes: 47 },
{ platform: “FC”, handle: “@skelevaggio”, content: “Skeleton key drop = 108 points. I’m in my bag.”, time: “8m ago”, likes: 23 },
{ platform: “X”, handle: “@aurafield”, content: “Dad Zone got me in my feelings. -20 broken heart almost ended the run”, time: “15m ago”, likes: 31 },
{ platform: “TT”, handle: “@cinemarage”, content: “HATER is the most unhinged game on the internet right now”, time: “22m ago”, likes: 89 },
{ platform: “FC”, handle: “@hatemaster”, content: “Staked 200 $SHOTS into ATTN. Let’s see if it compounds 👀”, time: “1h ago”, likes: 12 },
];

const LEVEL_COLORS = {
“VEGAS”: “#FFD700”,
“SKELEVAGGIO”: “#C084FC”,
“DAD ZONE”: “#60A5FA”,
“CINEMATIC”: “#F97316”,
“CANDY CHAOS”: “#F472B6”,
“PRIDE MODE”: “#A855F7”,
“AURA FIELD”: “#67E8F9”,
“DREAMLIKE”: “#86EFAC”,
};

const TIER_COLORS = {
“PLATINUM”: “#E5E7EB”,
“GOLD”: “#FFD700”,
“SILVER”: “#9CA3AF”,
“BRONZE”: “#D97706”,
};

const PLATFORM_COLORS = {
“X”: “#1A1A1A”,
“FC”: “#8B5CF6”,
“TT”: “#FF0050”,
};

export default function HaterDashboard() {
const [activeTab, setActiveTab] = useState(“LEADERBOARD”);
const [totalExtracted, setTotalExtracted] = useState(0);
const [liveScore, setLiveScore] = useState(8880);
const [pulse, setPulse] = useState(false);

useEffect(() => {
const total = MOCK_LEADERS.reduce((s, l) => s + l.score, 0);
let count = 0;
const interval = setInterval(() => {
count += Math.floor(total / 60);
if (count >= total) { setTotalExtracted(total); clearInterval(interval); }
else setTotalExtracted(count);
}, 16);
return () => clearInterval(interval);
}, []);

useEffect(() => {
const interval = setInterval(() => {
setLiveScore(s => s + Math.floor(Math.random() * 7));
setPulse(true);
setTimeout(() => setPulse(false), 300);
}, 2000);
return () => clearInterval(interval);
}, []);

const tabs = [“LEADERBOARD”, “SPONSORS”, “COMMUNITY”, “STATS”];

return (
<div style={{
minHeight: “100vh”,
background: “#07010F”,
fontFamily: “‘Courier New’, monospace”,
color: “#F0E6FF”,
position: “relative”,
overflow: “hidden”,
}}>
{/* Background grain + grid */}
<div style={{
position: “fixed”, inset: 0, pointerEvents: “none”, zIndex: 0,
backgroundImage: `radial-gradient(ellipse 80% 50% at 20% 20%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255,215,0,0.06) 0%, transparent 60%), linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)`,
backgroundSize: “100% 100%, 100% 100%, 40px 40px, 40px 40px”,
}} />

```
  <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 16px 40px" }}>

    {/* Header */}
    <div style={{ paddingTop: 32, marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#A855F7", marginBottom: 4, textTransform: "uppercase" }}>
            COMMUNITY CONTROL ROOM
          </div>
          <div style={{
            fontSize: 42, fontWeight: 900, letterSpacing: -1,
            background: "linear-gradient(135deg, #FFD700 0%, #F97316 40%, #A855F7 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}>
            HATER.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 3, marginBottom: 4 }}>LIVE SCORE LEADER</div>
          <div style={{
            fontSize: 28, fontWeight: 900, color: pulse ? "#FFD700" : "#F0E6FF",
            transition: "color 0.15s",
            fontVariantNumeric: "tabular-nums",
          }}>
            {liveScore.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#A855F7", letterSpacing: 2 }}>@blaqqat ● VEGAS</div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1, marginTop: 24,
        background: "rgba(168,85,247,0.15)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: 8, overflow: "hidden",
      }}>
        {[
          { label: "TOTAL EXTRACTED", val: totalExtracted.toLocaleString(), accent: "#FFD700" },
          { label: "ACTIVE HATERS", val: "1,204", accent: "#F472B6" },
          { label: "$SHOTS STAKED", val: "44,400", accent: "#A855F7" },
          { label: "SPONSORS LIVE", val: MOCK_SPONSORS.filter(s => s.status === "ACTIVE").length, accent: "#67E8F9" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "14px 12px", textAlign: "center",
            background: "rgba(7,1,15,0.6)",
            borderRight: i < 3 ? "1px solid rgba(168,85,247,0.15)" : "none",
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.accent, fontVariantNumeric: "tabular-nums" }}>{s.val}</div>
            <div style={{ fontSize: 9, color: "#6B7280", letterSpacing: 2, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Tabs */}
    <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
      {tabs.map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{
          flex: 1, padding: "10px 4px", fontSize: 11, fontWeight: 700,
          letterSpacing: 2, fontFamily: "'Courier New', monospace",
          border: "1px solid",
          borderColor: activeTab === tab ? "#A855F7" : "rgba(168,85,247,0.2)",
          background: activeTab === tab ? "rgba(168,85,247,0.2)" : "transparent",
          color: activeTab === tab ? "#F0E6FF" : "#6B7280",
          cursor: "pointer", borderRadius: 4,
          transition: "all 0.15s",
        }}>
          {tab}
        </button>
      ))}
    </div>

    {/* LEADERBOARD */}
    {activeTab === "LEADERBOARD" && (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 3 }}>GLOBAL RANKINGS — ALL TIME</div>
          <div style={{ fontSize: 9, color: "#A855F7", letterSpacing: 2 }}>● LIVE</div>
        </div>
        {MOCK_LEADERS.map((player, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", marginBottom: 4,
            background: i === 0 ? "rgba(255,215,0,0.06)" : "rgba(168,85,247,0.04)",
            border: "1px solid",
            borderColor: i === 0 ? "rgba(255,215,0,0.2)" : "rgba(168,85,247,0.1)",
            borderRadius: 6,
            transition: "all 0.15s",
          }}>
            <div style={{ width: 28, textAlign: "center" }}>
              {i < 3 ? (
                <span style={{ fontSize: 18 }}>{["🥇","🥈","🥉"][i]}</span>
              ) : (
                <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 700 }}>#{player.rank}</span>
              )}
            </div>
            <span style={{ fontSize: 16 }}>{player.badge}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F0E6FF" }}>{player.handle}</div>
              <div style={{ fontSize: 10, color: LEVEL_COLORS[player.level] || "#6B7280", letterSpacing: 2, marginTop: 2 }}>
                {player.level}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? "#FFD700" : "#F0E6FF" }}>
                {player.score.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: "#A855F7", marginTop: 2 }}>
                {player.shots} $SHOTS
              </div>
            </div>
          </div>
        ))}
        <div style={{
          marginTop: 16, padding: "12px 16px",
          border: "1px dashed rgba(168,85,247,0.2)", borderRadius: 6,
          fontSize: 11, color: "#6B7280", textAlign: "center", letterSpacing: 2,
        }}>
          CONNECT WALLET OR LOGIN TO CLAIM YOUR RANK
        </div>
      </div>
    )}

    {/* SPONSORS */}
    {activeTab === "SPONSORS" && (
      <div>
        <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 3, marginBottom: 16 }}>SPONSOR INTAKE — ACTIVE PARTNERS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {MOCK_SPONSORS.map((s, i) => (
            <div key={i} style={{
              padding: 16,
              background: "rgba(168,85,247,0.04)",
              border: `1px solid ${s.status === "ACTIVE" ? "rgba(168,85,247,0.25)" : "rgba(168,85,247,0.1)"}`,
              borderRadius: 8,
              opacity: s.status === "PENDING" ? 0.6 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{s.logo}</span>
                <span style={{
                  fontSize: 9, padding: "3px 8px", borderRadius: 20, fontWeight: 700, letterSpacing: 2,
                  background: s.status === "ACTIVE" ? "rgba(134,239,172,0.1)" : "rgba(251,191,36,0.1)",
                  color: s.status === "ACTIVE" ? "#86EFAC" : "#FBB F24",
                  border: `1px solid ${s.status === "ACTIVE" ? "rgba(134,239,172,0.3)" : "rgba(251,191,36,0.3)"}`,
                }}>
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: TIER_COLORS[s.tier], letterSpacing: 2 }}>{s.tier}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700", marginTop: 8 }}>{s.amount}</div>
            </div>
          ))}
        </div>

        {/* Sponsor intake form */}
        <div style={{
          padding: 20, border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: 8, background: "rgba(255,215,0,0.03)",
        }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#FFD700", marginBottom: 16 }}>BECOME A SPONSOR</div>
          {["BRAND / PROJECT NAME", "CONTACT OR WALLET", "SPONSORSHIP TIER"].map((placeholder, i) => (
            <input key={i} placeholder={placeholder} style={{
              display: "block", width: "100%", marginBottom: 8,
              padding: "10px 12px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,215,0,0.15)", borderRadius: 4,
              color: "#F0E6FF", fontSize: 11, letterSpacing: 2,
              fontFamily: "'Courier New', monospace",
              outline: "none", boxSizing: "border-box",
            }} />
          ))}
          <button style={{
            width: "100%", marginTop: 8, padding: "12px",
            background: "linear-gradient(135deg, #FFD700, #F97316)",
            border: "none", borderRadius: 4,
            color: "#07010F", fontSize: 12, fontWeight: 900,
            letterSpacing: 3, cursor: "pointer",
            fontFamily: "'Courier New', monospace",
          }}>
            SUBMIT APPLICATION →
          </button>
        </div>
      </div>
    )}

    {/* COMMUNITY */}
    {activeTab === "COMMUNITY" && (
      <div>
        <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 3, marginBottom: 16 }}>LIVE FEED — X · FARCASTER · TIKTOK</div>
        {MOCK_FEED.map((post, i) => (
          <div key={i} style={{
            padding: "14px 16px", marginBottom: 6,
            background: "rgba(168,85,247,0.04)",
            border: "1px solid rgba(168,85,247,0.1)",
            borderRadius: 6,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 9, padding: "2px 8px", borderRadius: 3, fontWeight: 700, letterSpacing: 2,
                background: PLATFORM_COLORS[post.platform] || "#333",
                color: "#fff",
              }}>
                {post.platform}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#A855F7" }}>{post.handle}</span>
              <span style={{ fontSize: 10, color: "#4B5563", marginLeft: "auto" }}>{post.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "#D1D5DB", lineHeight: 1.5 }}>{post.content}</div>
            <div style={{ fontSize: 10, color: "#6B7280", marginTop: 8 }}>♥ {post.likes}</div>
          </div>
        ))}
        <div style={{
          marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
        }}>
          {[
            { label: "SHARE ON X", icon: "𝕏", color: "#F0E6FF" },
            { label: "CAST ON FC", icon: "🌐", color: "#8B5CF6" },
          ].map((b, i) => (
            <button key={i} style={{
              padding: "12px", border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: 6, background: "transparent",
              color: b.color, fontSize: 12, fontWeight: 700,
              letterSpacing: 2, cursor: "pointer",
              fontFamily: "'Courier New', monospace",
            }}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* STATS */}
    {activeTab === "STATS" && (
      <div>
        <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 3, marginBottom: 16 }}>GLOBAL ACTIVITY STATS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "TOTAL RUNS", val: "12,440", icon: "🎯" },
            { label: "AVG SCORE", val: "3,210", icon: "📊" },
            { label: "ITEMS CAUGHT", val: "889K", icon: "✅" },
            { label: "ITEMS AVOIDED", val: "441K", icon: "❌" },
            { label: "SHOTS EARNED", val: "88,800", icon: "💰" },
            { label: "CHAOS EVENTS", val: "7,770", icon: "🃏" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "16px", textAlign: "center",
              background: "rgba(168,85,247,0.04)",
              border: "1px solid rgba(168,85,247,0.1)",
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FFD700" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#6B7280", letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Level distribution bar */}
        <div style={{ padding: 16, border: "1px solid rgba(168,85,247,0.15)", borderRadius: 6 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#6B7280", marginBottom: 12 }}>LEVEL REACH DISTRIBUTION</div>
          {[
            { level: "DREAMLIKE", pct: 100, color: "#86EFAC" },
            { level: "AURA FIELD", pct: 71, color: "#67E8F9" },
            { level: "SKELEVAGGIO", pct: 54, color: "#C084FC" },
            { level: "DAD ZONE", pct: 38, color: "#60A5FA" },
            { level: "CINEMATIC", pct: 27, color: "#F97316" },
            { level: "VEGAS", pct: 14, color: "#FFD700" },
          ].map((l, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: l.color, letterSpacing: 2, marginBottom: 3 }}>
                <span>{l.level}</span><span>{l.pct}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${l.pct}%`, background: l.color, borderRadius: 2, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Footer */}
    <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid rgba(168,85,247,0.1)", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4B5563", letterSpacing: 2 }}>
      <span>HATER © 2025</span>
      <span>@blaqqat · GATO SOCIETY</span>
    </div>
  </div>
</div>
```

);
}
