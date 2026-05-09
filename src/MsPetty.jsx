import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// MS. PETTY — BIG GIRLY PEW PEW
// a HATER game · SuperKind Toy Co. · Bitcoin Edition
// ============================================================

const PURPLE    = "#7B2FBE";
const PURPLE_LT = "#9B59D0";
const PURPLE_DK = "#3D0D6B";
const GOLD      = "#D4A843";
const GOLD_LT   = "#F0CC6A";
const ROSE      = "#E8478A";
const MAGENTA   = "#FF2D9B";
const BLACK     = "#08050F";
const CARD      = "#0F0A1A";

function RayGun({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 120 90" style={{
      filter: `drop-shadow(0 0 12px ${MAGENTA}88)`,
      animation: animate ? "gunFloat 3s ease-in-out infinite" : undefined,
    }}>
      <ellipse cx="68" cy="38" rx="36" ry="22" fill={PURPLE} />
      <ellipse cx="82" cy="38" rx="22" ry="18" fill={GOLD} />
      <rect x="8" y="34" width="32" height="8" rx="4" fill={PURPLE_DK} />
      <circle cx="10" cy="38" r="5" fill={PURPLE_LT} opacity="0.6" />
      <path d="M52 56 L46 78 L62 78 L60 56Z" fill={PURPLE_DK} />
      <rect x="47" y="60" width="13" height="14" rx="3" fill={GOLD} opacity="0.7" />
      <path d="M55 56 Q58 62 55 68" stroke={GOLD_LT} strokeWidth="2.5" fill="none" />
      <circle cx="58" cy="38" r="4" fill={MAGENTA} />
      <circle cx="58" cy="38" r="2" fill="#fff" opacity="0.5" />
      <circle cx="72" cy="32" r="3" fill={ROSE} />
      <polygon points="70,16 78,28 62,28" fill={PURPLE_LT} opacity="0.8" />
      <ellipse cx="75" cy="30" rx="8" ry="5" fill="#fff" opacity="0.15" transform="rotate(-20 75 30)" />
    </svg>
  );
}

function SuperKindStamp({ size = "small" }) {
  const fs = size === "small" ? 7 : 9;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      border: `1px solid ${GOLD}55`,
      borderRadius: 3, padding: "2px 7px",
      background: `${GOLD}0a`,
    }}>
      <span style={{ fontSize: fs + 2 }}>🔫</span>
      <span style={{
        color: GOLD, fontSize: fs, letterSpacing: 2,
        fontFamily: "'Courier New', monospace", fontWeight: "bold",
      }}>
        SUPERKIND TOY CO.
      </span>
    </div>
  );
}

function SparkleField() {
  const sparks = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    size: Math.random() * 3 + 1,
    color: [MAGENTA, GOLD_LT, PURPLE_LT, "#fff"][Math.floor(Math.random() * 4)],
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      {sparks.map(s => (
        <div key={s.id} style={{
          position: "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: "50%",
          background: s.color,
          opacity: 0.4,
          animation: `sparkle ${2 + s.delay}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

const LEVELS = [
  {
    id: 0,
    name: "GENESIS BLOCK",
    subtitle: "where it all began, honey",
    min: 0, max: 431,
    bg: BLACK,
    balloonColors: [PURPLE, GOLD, ROSE],
    catchItems: [
      { emoji: "₿", name: "Bitcoin",      value: 21, desc: "Hard money. Harder attitude." },
      { emoji: "🔑", name: "Private Key", value: 15, desc: "Your keys. Your coins. Your business." },
      { emoji: "📊", name: "The Chart",   value: 8,  desc: "Number go up. She planned that." },
      { emoji: "🪙", name: "Satoshi",     value: 5,  desc: "Smallest unit. Biggest vision." },
    ],
    avoidItems: [
      { emoji: "🏦", name: "The Bank",    value: -20, desc: "Fractional reserve and absolutely not." },
      { emoji: "📉", name: "The Dump",    value: -15, desc: "Liquidated. She saw that coming." },
      { emoji: "🐻", name: "Bear Energy", value: -12, desc: "Bear market. Bear people. Same thing." },
    ],
    timeBonus: 8,
  },
  {
    id: 1,
    name: "AURA FIELD",
    subtitle: "soft. lethal. immaculate.",
    min: 432, max: 554,
    bg: "#0A0518",
    balloonColors: ["#C084FC", "#F9A8D4", "#DDA0DD"],
    catchItems: [
      { emoji: "🦋", name: "Butterfly",   value: 12, desc: "She transformed. You missed it." },
      { emoji: "🌸", name: "Pink Flower", value: 9,  desc: "Pretty and intentional." },
      { emoji: "💗", name: "Pink Heart",  value: 15, desc: "She loves herself first. Period." },
    ],
    avoidItems: [],
    timeBonus: 10,
  },
  {
    id: 2,
    name: "SKELEVAGGIO",
    subtitle: "stripped down to what matters",
    min: 555, max: 776,
    bg: "#050008",
    balloonColors: ["#888", "#C084FC", "#F472B6"],
    catchItems: [
      { emoji: "💀", name: "The Skull",     value: 10,  desc: "Death is just an exit liquidity event." },
      { emoji: "💰", name: "The Bag",       value: 20,  desc: "Secured. She said what she said." },
      { emoji: "🗝️", name: "Skeleton Key", value: 108, desc: "Ultra rare. Changes everything. That's Ms. Petty." },
      { emoji: "🦴", name: "The Bone",      value: 8,   desc: "What's left after the rug pull." },
    ],
    avoidItems: [
      { emoji: "🚬", name: "Cigarette",    value: -10, desc: "Burning your bag. Literally." },
      { emoji: "💔", name: "Broken Heart", value: -20, desc: "Paper hands, paper heart." },
      { emoji: "🪦", name: "Tombstone",    value: -25, desc: "RIP your portfolio. She warned you." },
      { emoji: "🃏", name: "Joker Card",   value: -15, desc: "You got played. She watched." },
    ],
    timeBonus: 15,
  },
  {
    id: 3,
    name: "VEGAS, BABY",
    subtitle: "the house always wins. she is the house.",
    min: 777, max: 888,
    bg: "#120008",
    balloonColors: [GOLD_LT, MAGENTA, ROSE],
    catchItems: [
      { emoji: "🎰", name: "Slot Machine", value: 7,  desc: "You pulled the handle. She owns the casino." },
      { emoji: "🍾", name: "Champagne",    value: 21, desc: "Victory tastes expensive for a reason." },
      { emoji: "🎲", name: "The Dice",     value: 3,  desc: "She doesn't gamble. She calculates." },
      { emoji: "💰", name: "The Bag",      value: 8,  desc: "There it is. Don't fumble it." },
      { emoji: "🎟️", name: "Ticket",      value: 6,  desc: "VIP access. You earned it, barely." },
    ],
    avoidItems: [
      { emoji: "🃏", name: "The Joker",     value: -77,  desc: "Joker's wild. You just got played, darling." },
      { emoji: "💸", name: "Flying Money",  value: -7,   desc: "Gone faster than his excuses." },
      { emoji: "🍸", name: "Cocktail",      value: -8,   desc: "Neon poison. Looks adorable. Ruins everything." },
      { emoji: "💍", name: "The Ring",      value: -14,  desc: "You said I do to Trouble. No takebacks." },
      { emoji: "🕳️", name: "The Debt Hole", value: -777, desc: "The pit. You fell in. You're the entertainment now." },
    ],
    timeBonus: 20,
  },
];

function getLevel(score) {
  if (score >= 777 && score <= 888) return LEVELS[3];
  for (let i = LEVELS.length - 2; i >= 0; i--) {
    if (score >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

const INITIAL_TIME = 30;
const BALLOON_INTERVAL = 1200;
const ITEM_FALL_SPEED = 3;
const BASE_SATS = 5000;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function PettyBalloon({ color }) {
  return (
    <svg width="42" height="56" viewBox="0 0 42 56">
      <defs>
        <radialGradient id={`bg-${color.replace('#','')}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <ellipse cx="21" cy="22" rx="17" ry="20" fill={`url(#bg-${color.replace('#','')})`} />
      <ellipse cx="21" cy="22" rx="17" ry="20" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.4" />
      <polygon points="21,42 18,46 24,46" fill={color} />
      <line x1="21" y1="46" x2="21" y2="56" stroke={color} strokeWidth="1.5" opacity="0.6" strokeDasharray="2,2" />
      <circle cx="21" cy="18" r="3" fill={GOLD_LT} opacity="0.6" />
    </svg>
  );
}

function PopBurst({ x, y, color }) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`, top: `${y}%`,
      width: 50, height: 50,
      borderRadius: "50%",
      border: `2px solid ${color}`,
      pointerEvents: "none",
      zIndex: 30,
      animation: "popRing 0.6s ease forwards",
      transform: "translate(-50%, -50%)",
    }} />
  );
}

// ── NeonLounge illustration ───────────────────────────────────
function NeonLounge() {
  return (
    <svg viewBox="0 0 340 200" width="100%" style={{ maxWidth: 340, display: "block" }}>
      <defs>
        <filter id="glow-cyan"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-magenta"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow-gold"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {[40,80,120,160,200,240,280,320].map(x => (
        <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#00ffcc" strokeWidth="0.2" opacity="0.12" />
      ))}
      {[40,80,120,160].map(y => (
        <line key={`hg${y}`} x1="0" y1={y} x2="340" y2={y} stroke="#00ffcc" strokeWidth="0.2" opacity="0.12" />
      ))}
      {[[10,10],[330,10],[10,190],[330,190]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="7" fill="none" stroke="#00ffcc" strokeWidth="0.8" opacity="0.4" />
          <circle cx={cx} cy={cy} r="2" fill="none" stroke="#00ffcc" strokeWidth="0.8" opacity="0.4" />
          <line x1={cx-11} y1={cy} x2={cx+11} y2={cy} stroke="#00ffcc" strokeWidth="0.5" opacity="0.3" />
          <line x1={cx} y1={cy-11} x2={cx} y2={cy+11} stroke="#00ffcc" strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}
      <g filter="url(#glow-cyan)" stroke="#00ffcc" strokeWidth="1.5" fill="none" opacity="0.85">
        <line x1="48" y1="185" x2="55" y2="100" />
        <line x1="55" y1="100" x2="52" y2="80" />
        <path d="M52,82 Q30,65 18,55" />
        <path d="M52,82 Q42,60 48,45" />
        <path d="M52,82 Q68,62 80,58" />
        <path d="M52,82 Q72,75 85,78" />
        <circle cx="46" cy="88" r="3" />
        <circle cx="58" cy="90" r="3" />
      </g>
      <g filter="url(#glow-magenta)" stroke="#FF2D9B" strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M22,155 L35,130 L48,155 Z" />
        <line x1="35" y1="155" x2="35" y2="175" />
        <line x1="27" y1="175" x2="43" y2="175" />
        <line x1="35" y1="130" x2="24" y2="118" />
        <path d="M22,118 Q28,113 35,118 Q41,113 47,118" stroke="#FF2D9B" />
        <line x1="40" y1="133" x2="46" y2="115" stroke="#00ffcc" strokeWidth="1" />
      </g>
      <g filter="url(#glow-gold)" stroke={GOLD_LT} strokeWidth="1.6" fill="none" opacity="0.95">
        <ellipse cx="170" cy="52" rx="52" ry="8" />
        <path d="M130,52 Q148,35 170,32 Q192,35 210,52" />
        <ellipse cx="170" cy="62" rx="14" ry="16" />
        <path d="M157,66 Q153,70 156,74 Q159,78 156,82" strokeWidth="1" stroke="#00ffcc" />
        <path d="M165,72 Q170,76 175,72" stroke={MAGENTA} strokeWidth="1.8" />
        <line x1="170" y1="78" x2="170" y2="90" />
        <path d="M155,90 Q148,100 150,115 Q152,125 160,128" />
        <path d="M185,90 Q192,100 190,115 Q188,125 180,128" />
        <path d="M160,128 Q165,138 190,142 Q215,145 235,140" />
        <path d="M180,128 Q185,145 195,155 Q205,162 220,158" />
        <path d="M233,140 L240,138 L238,145" strokeWidth="1.2" />
        <path d="M218,157 L226,158 L222,165" strokeWidth="1.2" />
        <path d="M155,95 Q140,100 132,95 Q125,88 128,80" />
        <path d="M185,95 Q200,85 215,75" />
      </g>
      <g filter="url(#glow-magenta)" stroke="#FF2D9B" strokeWidth="1.4" fill="none" opacity="0.95">
        <path d="M210,60 L228,82 L246,60 Z" />
        <line x1="228" y1="82" x2="228" y2="98" />
        <line x1="220" y1="98" x2="236" y2="98" />
        <circle cx="225" cy="68" r="3" stroke="#00ffcc" />
        <line x1="221" y1="63" x2="225" y2="68" stroke="#00ffcc" strokeWidth="1" />
      </g>
      <g filter="url(#glow-magenta)" opacity="0.9">
        <rect x="282" y="130" width="16" height="45" rx="2" stroke="#00ffcc" strokeWidth="1.2" fill="none" />
        <line x1="278" y1="130" x2="302" y2="130" stroke="#00ffcc" strokeWidth="1.2" />
        <path d="M290,128 Q278,108 284,90 Q288,78 290,65 Q292,78 298,88 Q305,102 290,128Z" stroke={MAGENTA} strokeWidth="1.5" fill="none" />
        <path d="M290,120 Q283,108 287,98 Q290,90 290,82 Q292,90 295,98 Q298,108 290,120Z" stroke={ROSE} strokeWidth="1" fill="none" opacity="0.7" />
      </g>
      <g filter="url(#glow-cyan)" stroke="#00ffcc" strokeWidth="1.2" fill="none" opacity="0.75">
        <ellipse cx="318" cy="158" rx="14" ry="18" />
        <ellipse cx="318" cy="138" rx="9" ry="11" />
        <line x1="318" y1="127" x2="318" y2="95" />
        <line x1="318" y1="95" x2="310" y2="90" />
        <line x1="318" y1="95" x2="326" y2="90" />
        <circle cx="318" cy="158" r="5" />
        <line x1="316" y1="127" x2="314" y2="176" strokeWidth="0.6" />
        <line x1="318" y1="127" x2="318" y2="176" strokeWidth="0.6" />
        <line x1="320" y1="127" x2="322" y2="176" strokeWidth="0.6" />
      </g>
      <g filter="url(#glow-gold)" opacity="0.7">
        {[0,8,16,24,32,40,48].map((x, i) => {
          const h = [18,28,14,35,22,30,16][i];
          return <rect key={i} x={148+x} y={180-h} width="5" height={h} fill="none" stroke={GOLD} strokeWidth="1" rx="1" />;
        })}
      </g>
      <g filter="url(#glow-magenta)" opacity="0.7">
        <circle cx="82" cy="168" r="14" stroke={PURPLE_LT} strokeWidth="1.2" fill="none" />
        <circle cx="82" cy="168" r="5" stroke={MAGENTA} strokeWidth="1" fill="none" />
        <circle cx="82" cy="168" r="2" stroke={MAGENTA} strokeWidth="1" fill="none" />
      </g>
      <g stroke="#00ffcc" strokeWidth="1" fill="none" opacity="0.6">
        <path d="M108,185 L108,162 Q108,155 112,150 L112,143 L116,143 L116,150 Q120,155 120,162 L120,185 Z" />
        <line x1="108" y1="170" x2="120" y2="170" />
      </g>
      <g filter="url(#glow-cyan)" opacity="0.5">
        <circle cx="258" cy="28" r="16" stroke="#00ffcc" strokeWidth="1" fill="none" />
        <circle cx="258" cy="28" r="4" stroke="#00ffcc" strokeWidth="1" fill="none" />
        <line x1="242" y1="28" x2="274" y2="28" stroke="#00ffcc" strokeWidth="0.8" />
        <line x1="258" y1="12" x2="258" y2="44" stroke="#00ffcc" strokeWidth="0.8" />
      </g>
      <g filter="url(#glow-magenta)" opacity="0.85" transform="translate(195, 78) rotate(-25)">
        <ellipse cx="18" cy="8" rx="18" ry="9" stroke={PURPLE_LT} strokeWidth="1.3" fill="none" />
        <ellipse cx="26" cy="8" rx="10" ry="7" stroke={GOLD} strokeWidth="1.2" fill="none" />
        <rect x="-8" y="5" width="12" height="4" rx="2" stroke={PURPLE_LT} strokeWidth="1" fill="none" />
        <path d="M12,17 L10,26 L20,26 L18,17Z" stroke={PURPLE_LT} strokeWidth="1" fill="none" />
        <circle cx="16" cy="8" r="2.5" stroke={MAGENTA} strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
}

// ── MAIN GAME ─────────────────────────────────────────────────
export default function MsPetty() {
  const [screen, setScreen] = useState("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [balloons, setBalloons] = useState([]);
  const [fallingItems, setFallingItems] = useState([]);
  const [flash, setFlash] = useState(null);
  const [popEffects, setPopEffects] = useState([]);
  const [levelFlash, setLevelFlash] = useState(null);
  const [totalBusted, setTotalBusted] = useState(0);
  const [earned, setEarned] = useState(0);
  const prevLevelRef = useRef(null);
  const balloonIdRef = useRef(0);
  const itemIdRef = useRef(0);

  const currentLevel = getLevel(score);

  useEffect(() => {
    if (screen !== "game") return;
    if (prevLevelRef.current && prevLevelRef.current.id !== currentLevel.id) {
      setLevelFlash(currentLevel.name);
      setTimeLeft(t => Math.min(t + currentLevel.timeBonus, 99));
      setTimeout(() => setLevelFlash(null), 2500);
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel, screen]);

  useEffect(() => {
    if (screen !== "game") return;
    if (timeLeft <= 0) { setScreen("gameover"); return; }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [screen, timeLeft]);

  useEffect(() => {
    if (screen !== "game") return;
    const interval = setInterval(() => {
      const id = balloonIdRef.current++;
      const x = 8 + Math.random() * 84;
      const color = randomFrom(currentLevel.balloonColors);
      setBalloons(prev => [...prev, { id, x, y: 96, color, speed: 0.35 + Math.random() * 0.35 }]);
    }, BALLOON_INTERVAL);
    return () => clearInterval(interval);
  }, [screen, currentLevel]);

  useEffect(() => {
    if (screen !== "game") return;
    const raf = setInterval(() => {
      setBalloons(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -12));
    }, 50);
    return () => clearInterval(raf);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    const raf = setInterval(() => {
      setFallingItems(prev => {
        const kept = [];
        let missedGood = false, missedX = 50;
        for (const item of prev) {
          const newY = item.y + ITEM_FALL_SPEED;
          if (newY >= 108) {
            if (item.value > 0) { missedGood = true; missedX = item.x; }
          } else {
            kept.push({ ...item, y: newY });
          }
        }
        if (missedGood) {
          setTimeLeft(t => Math.max(0, t - 2));
          setFlash({ text: "she's disappointed −2s", color: ROSE, x: missedX, y: 82 });
          setTimeout(() => setFlash(null), 900);
        }
        return kept;
      });
    }, 50);
    return () => clearInterval(raf);
  }, [screen]);

  const popBalloon = useCallback((balloon) => {
    const level = getLevel(score);
    const allItems = [...level.catchItems, ...level.avoidItems];
    if (allItems.length === 0) return;

    const pool = level.catchItems.length > 0
      ? [...level.catchItems, ...level.catchItems, ...level.catchItems, ...level.avoidItems]
      : allItems;

    const item = randomFrom(pool);
    const id = itemIdRef.current++;

    setFallingItems(prev => [...prev, {
      id, emoji: item.emoji, value: item.value,
      x: balloon.x, y: balloon.y, name: item.name,
    }]);
    setTotalBusted(t => t + 1);
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));

    const popId = Date.now() + Math.random();
    setPopEffects(prev => [...prev, { id: popId, x: balloon.x, y: balloon.y, color: balloon.color }]);
    setTimeout(() => setPopEffects(prev => prev.filter(p => p.id !== popId)), 600);
  }, [score]);

  const catchItem = useCallback((item, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setFallingItems(prev => prev.filter(i => i.id !== item.id));
    const val = item.value;
    setScore(s => Math.max(0, s + val));
    if (val > 0) setEarned(e2 => e2 + val);

    const burstId = Date.now() + Math.random();
    setPopEffects(prev => [...prev, {
      id: burstId, x: item.x, y: item.y,
      color: val < 0 ? ROSE : GOLD_LT,
    }]);
    setTimeout(() => setPopEffects(prev => prev.filter(p => p.id !== burstId)), 600);

    const msgs = val > 0
      ? [`+${val} 💅`, `+${val} pew!`, `+${val} ✨`]
      : [`${val} oops`, `${val} chile...`, `${val} 💔`];
    setFlash({ text: randomFrom(msgs), color: val > 0 ? GOLD_LT : ROSE, x: item.x, y: item.y });
    setTimeout(() => setFlash(null), 700);

    if (val > 0 && Math.random() > 0.5) setTimeLeft(t => Math.min(t + 1, 99));
  }, []);

  const startGame = () => {
    setScore(0); setTimeLeft(INITIAL_TIME);
    setBalloons([]); setFallingItems([]);
    setTotalBusted(0); setEarned(0);
    prevLevelRef.current = null;
    setScreen("game");
  };

  if (screen === "intro")     return <IntroScreen onStart={startGame} onGuide={() => setScreen("itemguide")} />;
  if (screen === "itemguide") return <ItemGuideScreen onBack={() => setScreen("intro")} />;
  if (screen === "gameover")  return <GameOverScreen score={score} busted={totalBusted} earned={earned} onRestart={startGame} />;

  const timeColor = timeLeft <= 10 ? ROSE : timeLeft <= 20 ? GOLD : "#88ffcc";

  return (
    <div style={{
      position: "relative", width: "100%", height: "100vh", overflow: "hidden",
      background: currentLevel.bg,
      transition: "background 1.2s ease",
      fontFamily: "'Courier New', monospace",
      userSelect: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse at 50% 100%, ${PURPLE}33 0%, transparent 70%)`,
      }} />
      <SparkleField />

      {/* HUD */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        padding: "8px 14px",
        background: "rgba(8,5,15,0.88)",
        borderBottom: `1px solid ${PURPLE}66`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ color: PURPLE_LT, fontSize: 8, letterSpacing: 2 }}>ZONE</div>
          <div style={{ color: GOLD, fontSize: 10, fontWeight: "bold", maxWidth: 90, lineHeight: 1.2 }}>
            {currentLevel.name}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: PURPLE_LT, fontSize: 8, letterSpacing: 1 }}>PETTY POINTS</div>
          <div style={{
            color: GOLD_LT, fontSize: 24, fontWeight: "bold", lineHeight: 1,
            textShadow: `0 0 12px ${GOLD}88`,
          }}>{score}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: PURPLE_LT, fontSize: 8, letterSpacing: 1 }}>TIME</div>
          <div style={{
            color: timeColor, fontSize: 24, fontWeight: "bold", lineHeight: 1,
            transition: "color 0.3s",
            textShadow: timeLeft <= 10 ? `0 0 10px ${ROSE}` : "none",
          }}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Game area */}
      <div style={{ position: "absolute", inset: 0 }}>
        {balloons.map(b => (
          <div
            key={b.id}
            onPointerDown={e => { e.stopPropagation(); popBalloon(b); }}
            style={{
              position: "absolute",
              left: `${b.x}%`, top: `${b.y}%`,
              transform: "translate(-50%, -50%)",
              cursor: "crosshair",
              zIndex: 10, padding: 8,
              touchAction: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <PettyBalloon color={b.color} />
          </div>
        ))}

        {fallingItems.map(item => (
          <div
            key={item.id}
            onPointerDown={e => catchItem(item, e)}
            style={{
              position: "absolute",
              left: `${item.x}%`, top: `${item.y}%`,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              zIndex: 15, padding: "16px 14px",
              borderRadius: 14,
              display: "flex", flexDirection: "column", alignItems: "center",
              touchAction: "none",
              WebkitTapHighlightColor: "transparent",
              background: item.value < 0 ? `${ROSE}09` : `${GOLD}09`,
              border: `1px solid ${item.value < 0 ? ROSE : GOLD}33`,
              filter: item.value < 0
                ? `drop-shadow(0 0 8px ${ROSE}66)`
                : `drop-shadow(0 0 8px ${GOLD}66)`,
            }}
          >
            <span style={{ fontSize: 32, lineHeight: 1, pointerEvents: "none" }}>{item.emoji}</span>
            <div style={{
              fontSize: 9, textAlign: "center", fontWeight: "bold", marginTop: 2,
              color: item.value < 0 ? ROSE : GOLD_LT,
              pointerEvents: "none",
            }}>
              {item.value > 0 ? `+${item.value}` : item.value}
            </div>
          </div>
        ))}

        {popEffects.map(p => <PopBurst key={p.id} x={p.x} y={p.y} color={p.color} />)}
      </div>

      {flash && (
        <div style={{
          position: "absolute",
          left: `${flash.x || 50}%`, top: `${flash.y || 40}%`,
          transform: "translate(-50%, -50%)",
          fontSize: 18, fontWeight: "bold",
          color: flash.color, zIndex: 50,
          animation: "fadeUp 0.7s ease forwards",
          textShadow: `0 0 14px ${flash.color}`,
          pointerEvents: "none", whiteSpace: "nowrap",
          fontFamily: "'Courier New', monospace",
        }}>
          {flash.text}
        </div>
      )}

      {levelFlash && (
        <div style={{
          position: "absolute", top: "32%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", zIndex: 60, pointerEvents: "none",
        }}>
          <div style={{ color: PURPLE_LT, fontSize: 9, letterSpacing: 4, marginBottom: 2 }}>ENTERING</div>
          <div style={{ color: GOLD_LT, fontSize: 18, fontWeight: "bold", letterSpacing: 3,
            textShadow: `0 0 20px ${GOLD}` }}>
            {levelFlash}
          </div>
          <div style={{ color: ROSE, fontSize: 8, marginTop: 4, letterSpacing: 2 }}>
            {currentLevel.subtitle}
          </div>
        </div>
      )}

      {timeLeft <= 10 && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          border: `3px solid ${ROSE}55`,
          animation: "pulse 0.4s ease-in-out infinite alternate",
          zIndex: 5,
        }} />
      )}

      <div style={{
        position: "absolute", bottom: 8, left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20, opacity: 0.3,
      }}>
        <SuperKindStamp />
      </div>

      <style>{`
        @keyframes fadeUp {
          0%   { opacity:1; transform:translate(-50%,-50%) scale(1.1); }
          100% { opacity:0; transform:translate(-50%,-80%) scale(0.85); }
        }
        @keyframes pulse {
          from { border-color: ${ROSE}22; }
          to   { border-color: ${ROSE}99; }
        }
        @keyframes popRing {
          0%   { transform:translate(-50%,-50%) scale(0.4); opacity:1; }
          100% { transform:translate(-50%,-50%) scale(2.8); opacity:0; }
        }
        @keyframes sparkle {
          0%,100% { opacity:0.2; transform:scale(1); }
          50%     { opacity:0.9; transform:scale(1.4); }
        }
        @keyframes gunFloat {
          0%,100% { transform:translateY(0) rotate(-3deg); }
          50%     { transform:translateY(-8px) rotate(3deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// ── INTRO ─────────────────────────────────────────────────────
function IntroScreen({ onStart, onGuide }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 30% 60%, ${PURPLE_DK} 0%, ${BLACK} 55%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start",
      fontFamily: "'Courier New', monospace",
      color: "#fff", overflow: "hidden", position: "relative",
    }}>
      <SparkleField />
      <div style={{
        width: "100%", position: "relative", zIndex: 2,
        background: `linear-gradient(180deg, #0a0014 0%, #08050F 100%)`,
        borderBottom: `1px solid ${PURPLE}44`,
        padding: "12px 0 0",
      }}>
        <NeonLounge />
        <div style={{
          position: "absolute", bottom: 10, left: 0, right: 0,
          display: "flex", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#00ffcc", opacity: 0.5, fontFamily: "'Courier New', monospace" }}>
            MUSIC FOR VILLAINS
          </div>
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: 360,
        padding: "20px 24px 32px",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
          <SuperKindStamp size="large" />
        </div>
        <div style={{ color: "#333", fontSize: 8, letterSpacing: 3, marginBottom: 8 }}>
          GADGETS FOR VILLAINS · ₿ BITCOIN EDITION
        </div>
        <div style={{
          fontSize: 52, fontWeight: "bold", letterSpacing: 5,
          background: `linear-gradient(135deg, ${GOLD_LT} 0%, ${GOLD} 30%, ${ROSE} 60%, ${GOLD_LT} 100%)`,
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
          lineHeight: 1, marginBottom: 4,
        }}>
          MS. PETTY
        </div>
        <div style={{
          fontSize: 12, letterSpacing: 4, color: MAGENTA,
          fontWeight: "bold", marginBottom: 16,
          textShadow: `0 0 16px ${MAGENTA}99`,
        }}>
          BIG GIRLY PEW PEW
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${PURPLE}66)` }} />
          <div style={{ color: "#2a1a3a", fontSize: 9, letterSpacing: 2 }}>a HATER game</div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${PURPLE}66, transparent)` }} />
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${PURPLE_DK}88, #0a0518)`,
          border: `1px solid ${PURPLE}55`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#444", fontSize: 8, letterSpacing: 2, marginBottom: 2 }}>ENTRY FEE</div>
            <div style={{ color: GOLD_LT, fontSize: 20, fontWeight: "bold", lineHeight: 1 }}>
              ⚡ {BASE_SATS.toLocaleString()} sats
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#2a1a3a", fontSize: 8, lineHeight: 1.5 }}>
              she doesn't<br />work for free
            </div>
          </div>
        </div>
        <button onClick={onStart} style={{
          width: "100%",
          background: `linear-gradient(135deg, ${PURPLE_DK}, ${PURPLE}, ${ROSE})`,
          border: `1px solid ${ROSE}66`,
          borderRadius: 8, padding: "15px",
          fontSize: 15, fontWeight: "bold", cursor: "pointer",
          color: "#fff", letterSpacing: 4,
          boxShadow: `0 0 28px ${PURPLE}88, 0 0 56px ${ROSE}33`,
          marginBottom: 10,
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}>
          🔫 PEW PEW LET'S GO
        </button>
        <button onClick={onGuide} style={{
          width: "100%", background: "transparent",
          border: `1px solid ${PURPLE}44`,
          borderRadius: 8, padding: "10px",
          fontSize: 11, cursor: "pointer",
          color: PURPLE_LT, letterSpacing: 2,
          marginBottom: 4,
        }}>
          ITEM GUIDE
        </button>
        <div style={{ color: "#1a1a2a", fontSize: 8, marginTop: 14, letterSpacing: 1, lineHeight: 2 }}>
          BETA MODE · SATS NOT ACTUALLY CHARGED<br />
          SUPERKIND TOY CO. · GADGETS FOR VILLAINS<br />
          <span style={{ color: "#111" }}>she's watching though</span>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// ── ITEM GUIDE ────────────────────────────────────────────────
function ItemGuideScreen({ onBack }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 0%, ${PURPLE_DK}88 0%, ${BLACK} 50%)`,
      fontFamily: "'Courier New', monospace", color: "#fff",
      padding: "16px", overflowY: "auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <button onClick={onBack} style={{
          background: "transparent", border: `1px solid ${PURPLE}55`,
          color: PURPLE_LT, padding: "6px 14px", cursor: "pointer",
          fontSize: 11, borderRadius: 4,
        }}>← BACK</button>
        <SuperKindStamp />
      </div>
      <div style={{ textAlign: "center", marginBottom: 20, marginTop: 10 }}>
        <div style={{ color: GOLD_LT, fontSize: 16, fontWeight: "bold", letterSpacing: 4 }}>ITEM GUIDE</div>
        <div style={{ color: ROSE, fontSize: 9, letterSpacing: 2, marginTop: 2 }}>know what you're catching, darling</div>
      </div>
      {LEVELS.map(level => (
        <div key={level.id} style={{ marginBottom: 28 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            borderBottom: `1px solid ${PURPLE}44`, paddingBottom: 6, marginBottom: 10,
          }}>
            <div style={{ color: GOLD, fontSize: 11, fontWeight: "bold", letterSpacing: 2 }}>{level.name}</div>
            <div style={{ color: "#333", fontSize: 9 }}>{level.min}–{level.max} pts</div>
          </div>
          <div style={{ color: PURPLE_LT, fontSize: 9, letterSpacing: 1, marginBottom: 8, fontStyle: "italic" }}>
            "{level.subtitle}"
          </div>
          {[...level.catchItems, ...level.avoidItems].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: CARD,
              border: `1px solid ${item.value < 0 ? ROSE + "33" : PURPLE + "33"}`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 8,
            }}>
              <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "#fff", marginBottom: 1 }}>{item.name}</div>
                <div style={{ fontSize: 11, fontWeight: "bold", marginBottom: 3, color: item.value < 0 ? ROSE : GOLD_LT }}>
                  {item.value > 0 ? `+${item.value}` : item.value} pts
                  <span style={{ color: "#333", fontWeight: "normal", marginLeft: 6 }}>
                    {item.value > 0 ? "· catch it" : "· dodge it"}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#555", lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div style={{ textAlign: "center", color: "#333", fontSize: 9, letterSpacing: 2, paddingBottom: 24, lineHeight: 1.8 }}>
        🔫 BIG GIRLY PEW PEW<br />SUPERKIND TOY CO. · BITCOIN EDITION
      </div>
    </div>
  );
}

// ── GAME OVER ─────────────────────────────────────────────────
const PETTY_OUTRO_LINES = [
  "she's not mad. she's just disappointed.",
  "you played. that's enough for now.",
  "ms. petty saw everything. she always does.",
  "the balloon wins this round. regroup.",
  "every hater gets a second chance. this is yours.",
];

function GameOverScreen({ score, busted, earned, onRestart }) {
  const satsEarned = Math.floor(earned * 2.38);
  const outro = PETTY_OUTRO_LINES[Math.floor(Math.random() * PETTY_OUTRO_LINES.length)];
  const rank =
    score >= 1500 ? { title: "APEX PETTY 💅",        color: GOLD_LT   } :
    score >= 1000 ? { title: "CERTIFIED PETTY 🔫",   color: ROSE      } :
    score >= 500  ? { title: "EMERGING PETTY 💜",    color: PURPLE_LT } :
                    { title: "PETTY IN TRAINING 🍼",  color: "#666"    };

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 100%, ${PURPLE_DK}88 0%, ${BLACK} 60%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      padding: 24, textAlign: "center", color: "#fff",
      position: "relative", overflow: "hidden",
    }}>
      <SparkleField />
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 320 }}>
        <RayGun size={70} />
        <div style={{ color: ROSE, fontSize: 10, letterSpacing: 4, margin: "12px 0 2px" }}>GAME OVER</div>
        <div style={{ color: GOLD_LT, fontSize: 32, fontWeight: "bold", letterSpacing: 3, lineHeight: 1, marginBottom: 4 }}>
          MS. PETTY
        </div>
        <div style={{ color: "#444", fontSize: 10, fontStyle: "italic", marginBottom: 20, letterSpacing: 1 }}>
          {outro}
        </div>
        <div style={{
          background: `${PURPLE}22`, border: `1px solid ${rank.color}55`,
          borderRadius: 8, padding: "8px 16px", display: "inline-block", marginBottom: 16,
        }}>
          <div style={{ color: rank.color, fontSize: 13, fontWeight: "bold", letterSpacing: 2 }}>{rank.title}</div>
        </div>
        <div style={{
          background: CARD, border: `1px solid ${PURPLE}44`,
          borderRadius: 12, padding: 18, marginBottom: 18, textAlign: "left",
        }}>
          <StatRow label="PETTY POINTS"         value={score}  color={GOLD_LT} big />
          <StatRow label="HIGH VIBES DESTROYED" value={busted} color={ROSE} />
          <StatRow label="VALUE EXTRACTED"      value={earned} color="#88ffcc" />
          <div style={{ borderTop: `1px solid ${PURPLE}33`, marginTop: 12, paddingTop: 12 }}>
            <StatRow label="⚡ $SHOTS EARNED" value={`${satsEarned.toLocaleString()} sats`} color={GOLD} />
            <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 3 }}>stakeable 1:1 → attention token</div>
          </div>
        </div>
        <button onClick={onRestart} style={{
          width: "100%",
          background: `linear-gradient(135deg, ${PURPLE}, ${ROSE}, ${GOLD})`,
          backgroundSize: "200% auto",
          border: "none", borderRadius: 8, padding: "15px",
          fontSize: 13, fontWeight: "bold", cursor: "pointer",
          color: "#fff", letterSpacing: 3,
          boxShadow: `0 0 24px ${PURPLE}66`, marginBottom: 10,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}>
          🔫 PEW PEW AGAIN
        </button>
        <div style={{ color: "#222", fontSize: 9, letterSpacing: 2, lineHeight: 1.8 }}>
          SHARE · STAKE · STAY PETTY<br />
          <span style={{ color: "#1a0a2a" }}>SUPERKIND TOY CO.</span>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ color: "#444", fontSize: 9, letterSpacing: 1 }}>{label}</div>
      <div style={{ color, fontSize: big ? 22 : 14, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
