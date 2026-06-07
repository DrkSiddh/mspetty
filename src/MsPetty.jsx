// deploy test 2026-06-06
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// MS. PETTY — BIG GIRLY PEW PEW · a HATER game
// SuperKind Toy Co. · v2.0
// Pop toxic positivity. Catch what's real. Dodge what's poison.
// ============================================================

// ── COLOR SYSTEM ──────────────────────────────────────────────
const LIME    = "#00FF6E";  // catch / score / "good" reveals
const MAGENTA = "#FF2D9B";  // avoid / penalty / "toxic" reveals
const PURPLE  = "#7B2FBE";  // UI chrome
const PURPLE_LT = "#B584E8";
const YELLOW  = "#FFD93D";  // leaderboard / accent
const PINK    = "#FF6B9D";  // pause / shop
const CYAN    = "#00E5FF";  // links / streaming
const BLACK   = "#000000";
const DARK    = "#0A0612";
const CARD    = "#0F0A1A";

// ── FONT STACK ────────────────────────────────────────────────
const PIXEL  = "'Press Start 2P', monospace";
const READ   = "'VT323', monospace";
const MARKER = "'Permanent Marker', cursive";

// ── LEVEL SYSTEM (range-based, all 11) ────────────────────────
const LEVELS = [
  {
    id: 1,
    name: "GENESIS",
    subtitle: "every hater starts somewhere",
    min: 0, max: 431,
    bg: "#0A0612",
    bgGradient: `radial-gradient(ellipse at 50% 80%, ${PURPLE}33 0%, ${BLACK} 70%)`,
    balloonColors: [PURPLE, PINK, YELLOW],
    catchItems: [
      { emoji: "🌹", name: "Rose",        value: 8,  desc: "Beauty without apology." },
      { emoji: "🍞", name: "Bread",       value: 10, desc: "Sustenance. The literal kind." },
      { emoji: "🧀", name: "Cheese",      value: 12, desc: "More money. Mature it well." },
      { emoji: "🍕", name: "Pizza",       value: 15, desc: "Obvious value. Don't overthink it." },
    ],
    avoidItems: [
      { emoji: "🧂", name: "Salt",        value: -8,  desc: "Bitterness drains. Shake it elsewhere." },
      { emoji: "🥜", name: "Nuts",        value: -10, desc: "Unstable individuals. Disengage." },
      { emoji: "🍌", name: "Banana",      value: -12, desc: "Slippery social trap. Step around it." },
    ],
    timeBonus: 8,
  },
  {
    id: 2,
    name: "PRIDE MODE",
    subtitle: "expression is the point",
    min: 432, max: 443,
    bg: "#1A0420",
    bgGradient: `radial-gradient(ellipse at 50% 50%, ${PINK}55 0%, #1A0420 70%)`,
    balloonColors: ["#FF0080", "#FF8C00", "#FFD700", "#00FF00", "#00BFFF", "#8A2BE2"],
    catchItems: [
      { emoji: "🌈", name: "Rainbow",     value: 27, desc: "Visibility is victory." },
      { emoji: "✨", name: "Sparkle",     value: 18, desc: "She glows on purpose." },
      { emoji: "💖", name: "Sparkly Heart", value: 22, desc: "Loud love. No apology." },
    ],
    avoidItems: [
      { emoji: "🙄", name: "Eye Roll",    value: -4, desc: "Their discomfort isn't your problem." },
    ],
    timeBonus: 10,
  },
  {
    id: 3,
    name: "AURA FIELD",
    subtitle: "soft. intentional. immaculate.",
    min: 444, max: 554,
    bg: "#001E1E",
    bgGradient: `radial-gradient(ellipse at 50% 50%, #00C9A755 0%, #001E1E 70%)`,
    balloonColors: ["#A8E6CF", "#FFB7B2", "#FFDAC1", "#E0BBE4"],
    catchItems: [
      { emoji: "🦋", name: "Butterfly",   value: 12, desc: "She transformed. Quietly. On purpose." },
      { emoji: "🌸", name: "Pink Flower", value: 9,  desc: "Pretty AND intentional." },
      { emoji: "💗", name: "Pink Heart",  value: 15, desc: "Self-love before everybody else's." },
      { emoji: "🕊️", name: "Dove",        value: 18, desc: "Peace as protest." },
    ],
    avoidItems: [
      { emoji: "🥀", name: "Wilted",      value: -8, desc: "What they did to your softness." },
    ],
    timeBonus: 12,
  },
  {
    id: 4,
    name: "SKELEVAGGIO",
    subtitle: "stripped down to what matters",
    min: 555, max: 600,
    bg: "#000000",
    bgGradient: `radial-gradient(ellipse at 50% 50%, #1A001A 0%, #000 80%)`,
    balloonColors: ["#888", "#C084FC", "#F472B6", "#666"],
    catchItems: [
      { emoji: "💀", name: "Skull",          value: 10,  desc: "Death is just an exit. Romanticize it." },
      { emoji: "🦴", name: "Bone",           value: 8,   desc: "What's left when the lies are gone." },
      { emoji: "🕯️", name: "Candle",         value: 6,   desc: "Light it for what didn't make it." },
      { emoji: "💰", name: "Bag",            value: 20,  desc: "Secured. She said what she said." },
      { emoji: "🗝️", name: "Skeleton Key", value: 108, desc: "Ultra rare. Opens what shouldn't open." },
    ],
    avoidItems: [
      { emoji: "🚬", name: "Cigarette",      value: -10, desc: "Slow burn. Of your bag." },
      { emoji: "💔", name: "Broken Heart",   value: -20, desc: "Paper hands. Paper heart." },
      { emoji: "🪦", name: "Tombstone",      value: -25, desc: "RIP your portfolio. She warned you." },
      { emoji: "🃏", name: "Joker",          value: -15, desc: "You got played. She watched." },
    ],
    timeBonus: 15,
  },
  {
    id: 5,
    name: "DAD ZONE",
    subtitle: "inheritance without instructions",
    min: 601, max: 604,
    bg: "#0A1628",
    bgGradient: `radial-gradient(ellipse at 50% 70%, #1E3A5F88 0%, #0A1628 70%)`,
    balloonColors: ["#FFD700", "#8B4513", "#D2691E", "#4A6FA5"],
    catchItems: [
      { emoji: "🍼", name: "Baby Bottle",    value: 7,  desc: "What they should've been giving." },
      { emoji: "👔", name: "Tie",            value: 10, desc: "The performance of provision." },
      { emoji: "🧢", name: "Cap",            value: 8,  desc: "Sunday morning. The one good memory." },
    ],
    avoidItems: [
      { emoji: "📢", name: "Loudspeaker",    value: -12, desc: "Unsolicited lecture incoming." },
      { emoji: "👉", name: "Pointing Finger", value: -10, desc: "Blame redirected. Catch nothing." },
      { emoji: "🤞", name: "Crossed Fingers", value: -15, desc: "Promise lied to itself." },
      { emoji: "👤", name: "Invisible Face",  value: -20, desc: "Absence wearing a costume." },
    ],
    timeBonus: 14,
  },
  {
    id: 6,
    name: "WORLD ENV",
    subtitle: "the planet is taking notes",
    min: 605, max: 618,
    bg: "#0F2027",
    bgGradient: `linear-gradient(180deg, #2C5364 0%, #0F2027 100%)`,
    balloonColors: ["#A8D8EA", "#AA96DA", "#FCBAD3", "#FFFFD2"],
    catchItems: [
      { emoji: "🌍", name: "Earth",          value: 24, desc: "Hold her gently. She's tired." },
      { emoji: "🐝", name: "Bee",            value: 11, desc: "Don't waste her work." },
      { emoji: "💖", name: "Sparkle Heart",  value: 18, desc: "Love that pulls weight." },
      { emoji: "🌳", name: "Tree",           value: 16, desc: "Old growth. Older patience." },
    ],
    avoidItems: [
      { emoji: "🩶", name: "Grey Heart",     value: -11, desc: "Apathy disguised as cool." },
      { emoji: "🛢️", name: "Oil",           value: -20, desc: "Their shortcut. Your inheritance." },
    ],
    timeBonus: 13,
  },
  {
    id: 7,
    name: "JUNETEENTH",
    subtitle: "freedom on her own time",
    min: 619, max: 620,
    bg: "#1A0F00",
    bgGradient: `radial-gradient(ellipse at 50% 50%, #4A2C00 0%, #1A0F00 80%)`,
    balloonColors: ["#8B4513", "#A0522D", "#CD853F", "#DEB887", "#5D4037"],
    catchItems: [
      { emoji: "✊🏾", name: "Power",         value: 19, desc: "Earned. Inherited. Owed." },
      { emoji: "🔴", name: "Red",            value: 10, desc: "Blood remembered." },
      { emoji: "⚫", name: "Black",          value: 10, desc: "The people. The continuum." },
      { emoji: "🟢", name: "Green",          value: 10, desc: "The land. The future." },
    ],
    avoidItems: [],
    timeBonus: 20,
  },
  {
    id: 8,
    name: "SOLSTICE",
    subtitle: "abundance is the assignment",
    min: 621, max: 665,
    bg: "#1B5E20",
    bgGradient: `linear-gradient(180deg, #FF6B9D 0%, #FFD93D 35%, #4CAF50 75%, #1B5E20 100%)`,
    balloonColors: ["#FF6B9D", "#FFD93D", "#00E5FF", "#FF8C42", "#00FF6E"],
    catchItems: [
      { emoji: "🧴", name: "Sunscreen",      value: 16, desc: "Boundaries you wear on your skin." },
      { emoji: "🍉", name: "Watermelon",     value: 14, desc: "Joy that drips down your wrist." },
      { emoji: "🍦", name: "Ice Cream",      value: 10, desc: "Reward yourself. It melts otherwise." },
      { emoji: "🥒", name: "Cucumber",       value: 8,  desc: "Cool under pressure. Crispy when needed." },
      { emoji: "🧃", name: "Juice Box",      value: 9,  desc: "Childhood that didn't get robbed." },
    ],
    avoidItems: [
      { emoji: "🥵", name: "Heat Stroke",    value: -14, desc: "Burnout dressed as ambition." },
    ],
    timeBonus: 12,
  },
  {
    id: 9,
    name: "OLAF",
    subtitle: "she bites with consent",
    min: 666, max: 776,
    bg: "#1A0000",
    bgGradient: `radial-gradient(ellipse at 50% 50%, #4A0000 0%, #1A0000 80%)`,
    balloonColors: ["#8B0000", "#DC143C", "#4A0E0E", "#2C0000"],
    catchItems: [
      { emoji: "🅰️", name: "A+ Plasma",     value: 11, desc: "Whole Foods for the undead." },
      { emoji: "🅱️", name: "B Type",        value: 9,  desc: "Not the sharpest. Still a meal." },
      { emoji: "🆎", name: "AB Type",        value: 14, desc: "Rare. Like your ex with boundaries." },
      { emoji: "🅾️", name: "O Universal",   value: 10, desc: "Universally delicious." },
      { emoji: "🌹", name: "Goth Rose",      value: 5,  desc: "Wilted but still hot." },
      { emoji: "🩸", name: "Drop",           value: 8,  desc: "You needed this. It knows." },
      { emoji: "🔥", name: "Fire",           value: 9,  desc: "Burns. But fun." },
      { emoji: "⚰️", name: "Coffin",         value: 11, desc: "Luxury nap box. Exclusive." },
    ],
    avoidItems: [
      { emoji: "🥀", name: "Ghost Rose",     value: -9, desc: "Someone ghosted then mailed apology." },
    ],
    timeBonus: 16,
  },
  {
    id: 10,
    name: "VEGAS",
    subtitle: "the house always wins. she is the house.",
    min: 777, max: 887,
    bg: "#120008",
    bgGradient: `radial-gradient(ellipse at 50% 50%, #4A0033 0%, #120008 80%)`,
    balloonColors: [YELLOW, MAGENTA, PINK, "#FF4081"],
    catchItems: [
      { emoji: "🎰", name: "Slot Machine",   value: 7,  desc: "You pulled. She owns the floor." },
      { emoji: "🍾", name: "Champagne",      value: 21, desc: "Victory tastes expensive for a reason." },
      { emoji: "🎲", name: "Dice",           value: 3,  desc: "She doesn't gamble. She calculates." },
      { emoji: "💰", name: "Bag",            value: 8,  desc: "Don't fumble it. Last warning." },
      { emoji: "🎟️", name: "VIP Ticket",    value: 6,  desc: "Access. You earned it. Barely." },
      { emoji: "🎤", name: "Microphone",     value: 13, desc: "Amplify your scorn. Broadcast truth." },
      { emoji: "🎻", name: "Violin",         value: 20, desc: "Cue the world's pity. Dramatic solo." },
    ],
    avoidItems: [
      { emoji: "🃏", name: "The Joker",      value: -77,  desc: "You got played, darling." },
      { emoji: "💸", name: "Flying Money",   value: -7,   desc: "Gone faster than his excuses." },
      { emoji: "🍸", name: "Cocktail",       value: -8,   desc: "Looks adorable. Ruins everything." },
      { emoji: "💍", name: "Ring",           value: -14,  desc: "You said I do to Trouble." },
      { emoji: "🕳️", name: "Debt Hole",     value: -777, desc: "You fell in. You're the show now." },
    ],
    timeBonus: 18,
  },
  {
    id: 11,
    name: "DRAGON",
    subtitle: "you're basically a myth at this point",
    min: 8888, max: 9999,
    bg: "#1A0000",
    bgGradient: `radial-gradient(ellipse at 50% 50%, #8B0000 0%, #1A0000 80%)`,
    balloonColors: ["#DC143C", "#FFD700", "#FF4500", "#8B0000"],
    catchItems: [
      { emoji: "❤️‍🔥", name: "Dragon Core",  value: 22,  desc: "You're playing with house fire now." },
      { emoji: "🧧", name: "Lucky Envelope",  value: 9,   desc: "Cash. Or grandma's dentures. Both?" },
      { emoji: "🥡", name: "Takeout",         value: 4,   desc: "Cold noodles. Chaotic energy." },
      { emoji: "🥠", name: "Fortune",         value: 3,   desc: "You will receive... disappointment." },
      { emoji: "🥖", name: "Baguette",        value: 5,   desc: "Totally French. Totally random. Points." },
      { emoji: "🍊", name: "Orange",          value: 18,  desc: "Symbol of luck. Also vitamin C." },
      { emoji: "🔥", name: "One Shot",        value: 888, desc: "Blink and it's mythical history." },
    ],
    avoidItems: [
      { emoji: "🐉", name: "Dragon Spawn",    value: -888, desc: "Sucks your $SHOTS like a Capri Sun." },
      { emoji: "👹", name: "Demon Intern",    value: -555, desc: "Spreads chaos and unpaid taxes." },
      { emoji: "🍘", name: "Cracker",         value: -16,  desc: "Crunchy and cursed." },
      { emoji: "🥮", name: "Mooncake",        value: -18,  desc: "Looks tasty. Isn't. Fool." },
    ],
    timeBonus: 25,
  },
];

function getLevel(score) {
  // Find the highest level the score qualifies for
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── GAME CONSTANTS ────────────────────────────────────────────
const INITIAL_TIME = 30;
const BALLOON_INTERVAL = 1100;
const ITEM_FALL_SPEED = 2.4;
const BALLOON_RISE_BASE = 0.32;

// Sizing — BIG so people can actually tap them
const BALLOON_SIZE = 64;     // up from 42
const ITEM_SIZE = 56;        // big emoji target
const ITEM_TAP_PADDING = 18; // generous hit area

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── BALLOON COMPONENT — bigger, more visible ──────────────────
function Balloon({ color }) {
  const cleanId = color.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={BALLOON_SIZE} height={BALLOON_SIZE * 1.35} viewBox="0 0 64 86">
      <defs>
        <radialGradient id={`bg-${cleanId}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="34" rx="26" ry="30" fill={`url(#bg-${cleanId})`} />
      <ellipse cx="32" cy="34" rx="26" ry="30" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
      <polygon points="32,64 27,72 37,72" fill={color} />
      <path d="M 32 72 Q 28 78, 32 82 Q 36 86, 32 86" stroke={color} strokeWidth="2" fill="none" opacity="0.8" />
      <ellipse cx="24" cy="22" rx="6" ry="4" fill="#fff" opacity="0.4" />
    </svg>
  );
}

function PopBurst({ x, y, color }) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`, top: `${y}%`,
      width: 70, height: 70,
      borderRadius: "50%",
      border: `3px solid ${color}`,
      pointerEvents: "none",
      zIndex: 30,
      animation: "popRing 0.6s ease forwards",
      transform: "translate(-50%, -50%)",
    }} />
  );
}

// ── PIXEL HEADER COMPONENT ────────────────────────────────────
function PixelHeader({ children, color = LIME, size = 16, glow = true }) {
  return (
    <div style={{
      fontFamily: PIXEL,
      fontSize: size,
      color: color,
      letterSpacing: 2,
      lineHeight: 1.4,
      textShadow: glow ? `0 0 12px ${color}88, 0 0 24px ${color}44` : "none",
      WebkitTextStroke: "0.5px " + color,
    }}>
      {children}
    </div>
  );
}

// ============================================================
// MAIN GAME
// ============================================================
export default function MsPetty() {
  const [screen, setScreen] = useState("login");
  const [haterName, setHaterName] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [balloons, setBalloons] = useState([]);
  const [fallingItems, setFallingItems] = useState([]);
  const [flash, setFlash] = useState(null);
  const [popEffects, setPopEffects] = useState([]);
  const [levelFlash, setLevelFlash] = useState(null);
  const [totalDisrupted, setTotalDisrupted] = useState(0);
  const [earned, setEarned] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'leaderboard', 'shop', 'social', 'guide', 'how', 'lore'

  const prevLevelRef = useRef(null);
  const balloonIdRef = useRef(0);
  const itemIdRef = useRef(0);

  // Hydrate hater name from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('haterName') : null;
    if (saved) {
      setHaterName(saved);
      setScreen("intro");
    }
  }, []);

  const currentLevel = getLevel(score);

  // Level transition flash
  useEffect(() => {
    if (screen !== "game") return;
    if (prevLevelRef.current && prevLevelRef.current.id !== currentLevel.id) {
      setLevelFlash(currentLevel);
      setTimeLeft(t => Math.min(t + currentLevel.timeBonus, 99));
      setTimeout(() => setLevelFlash(null), 2800);
    }
    prevLevelRef.current = currentLevel;
  }, [currentLevel, screen]);

  // Timer
  useEffect(() => {
    if (screen !== "game" || paused) return;
    if (timeLeft <= 0) {
      // Save lifetime $SHOTS
      try {
        const lifetime = parseInt(localStorage.getItem('lifetimeShots') || '0');
        localStorage.setItem('lifetimeShots', String(lifetime + earned));
        const best = parseInt(localStorage.getItem('bestScore') || '0');
        if (score > best) localStorage.setItem('bestScore', String(score));
      } catch(e) {}
      setScreen("gameover");
      return;
    }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [screen, timeLeft, paused, earned, score]);

  // Balloon spawner
  useEffect(() => {
    if (screen !== "game" || paused) return;
    const interval = setInterval(() => {
      const id = balloonIdRef.current++;
      const x = 12 + Math.random() * 76;
      const color = randomFrom(currentLevel.balloonColors);
      setBalloons(prev => [...prev, {
        id, x, y: 105,
        color,
        speed: BALLOON_RISE_BASE + Math.random() * 0.25
      }]);
    }, BALLOON_INTERVAL);
    return () => clearInterval(interval);
  }, [screen, currentLevel, paused]);

  // Balloons rise
  useEffect(() => {
    if (screen !== "game" || paused) return;
    const raf = setInterval(() => {
      setBalloons(prev =>
        prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -15)
      );
    }, 50);
    return () => clearInterval(raf);
  }, [screen, paused]);

  // Items fall — with miss penalty for missing CATCH items
  useEffect(() => {
    if (screen !== "game" || paused) return;
    const raf = setInterval(() => {
      setFallingItems(prev => {
        const kept = [];
        let missedGood = false, missedX = 50;
        for (const item of prev) {
          const newY = item.y + ITEM_FALL_SPEED;
          if (newY >= 110) {
            if (item.value > 0) { missedGood = true; missedX = item.x; }
          } else {
            kept.push({ ...item, y: newY });
          }
        }
        if (missedGood) {
          setTimeLeft(t => Math.max(0, t - 2));
          setFlash({ text: "the smile won that round −2s", color: MAGENTA, x: missedX, y: 80 });
          setTimeout(() => setFlash(null), 1000);
        }
        return kept;
      });
    }, 50);
    return () => clearInterval(raf);
  }, [screen, paused]);

  // Pop a balloon → spawn falling consequence
  const popBalloon = useCallback((balloon) => {
    const level = getLevel(score);
    const allItems = [...level.catchItems, ...level.avoidItems];
    if (allItems.length === 0) return;

    // Weight pool slightly toward catches so it feels rewarding
    const pool = level.catchItems.length > 0
      ? [...level.catchItems, ...level.catchItems, ...level.avoidItems]
      : allItems;

    const item = randomFrom(pool);
    const id = itemIdRef.current++;

    setFallingItems(prev => [...prev, {
      id, emoji: item.emoji, value: item.value,
      x: balloon.x, y: balloon.y, name: item.name,
    }]);
    setTotalDisrupted(t => t + 1);
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));

    const popId = Date.now() + Math.random();
    setPopEffects(prev => [...prev, { id: popId, x: balloon.x, y: balloon.y, color: balloon.color }]);
    setTimeout(() => setPopEffects(prev => prev.filter(p => p.id !== popId)), 600);
  }, [score]);

  // Catch a falling item
  const catchItem = useCallback((item, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setFallingItems(prev => prev.filter(i => i.id !== item.id));
    const val = item.value;
    setScore(s => Math.max(0, s + val));
    if (val > 0) setEarned(e2 => e2 + val);

    const burstId = Date.now() + Math.random();
    setPopEffects(prev => [...prev, {
      id: burstId, x: item.x, y: item.y,
      color: val < 0 ? MAGENTA : LIME,
    }]);
    setTimeout(() => setPopEffects(prev => prev.filter(p => p.id !== burstId)), 600);

    const msgs = val > 0
      ? [`+${val} 💅`, `+${val} pew!`, `+${val} ✨`, `+${val} truth!`]
      : [`${val} oof`, `${val} chile...`, `${val} oops`, `${val} 💔`];
    setFlash({ text: randomFrom(msgs), color: val > 0 ? LIME : MAGENTA, x: item.x, y: item.y });
    setTimeout(() => setFlash(null), 800);

    if (val > 0 && Math.random() > 0.5) setTimeLeft(t => Math.min(t + 1, 99));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setBalloons([]);
    setFallingItems([]);
    setTotalDisrupted(0);
    setEarned(0);
    setPaused(false);
    setMenuOpen(false);
    setActivePanel(null);
    prevLevelRef.current = null;
    setScreen("game");
  };

  const handleLogin = (name) => {
    const finalName = name.trim() || "BigHater";
    setHaterName(finalName);
    try { localStorage.setItem('haterName', finalName); } catch(e) {}
    setScreen("intro");
  };

  // ── ROUTE TO SCREENS ────────────────────────────────────────
  if (screen === "login")    return <LoginScreen onLogin={handleLogin} />;
  if (screen === "intro")    return <IntroScreen haterName={haterName} onStart={startGame} onPanel={setActivePanel} activePanel={activePanel} />;
  if (screen === "gameover") return <GameOverScreen haterName={haterName} score={score} disrupted={totalDisrupted} earned={earned} onRestart={startGame} onMenu={() => setScreen("intro")} onPanel={setActivePanel} activePanel={activePanel} />;

  // ── GAME SCREEN ─────────────────────────────────────────────
  const timeColor = timeLeft <= 10 ? MAGENTA : timeLeft <= 20 ? YELLOW : LIME;

  return (
    <div style={{
      position: "relative", width: "100%", height: "100vh", overflow: "hidden",
      background: currentLevel.bgGradient,
      transition: "background 1.5s ease",
      fontFamily: READ,
      userSelect: "none",
    }}>
      <SparkleField />

      {/* TOP HUD — pixel font, big, spacious */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        padding: "14px 18px",
        background: "rgba(0,0,0,0.85)",
        borderBottom: `2px solid ${PURPLE}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        backdropFilter: "blur(4px)",
      }}>
        <div>
          <div style={{ fontFamily: PIXEL, fontSize: 8, color: PURPLE_LT, letterSpacing: 1, marginBottom: 4 }}>
            LEVEL {currentLevel.id}
          </div>
          <div style={{ fontFamily: PIXEL, fontSize: 11, color: LIME, letterSpacing: 1,
            textShadow: `0 0 8px ${LIME}88` }}>
            {currentLevel.name}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: PIXEL, fontSize: 8, color: PURPLE_LT, letterSpacing: 1, marginBottom: 4 }}>
            $SHOTS
          </div>
          <div style={{
            fontFamily: PIXEL, fontSize: 20, color: LIME,
            textShadow: `0 0 14px ${LIME}, 0 0 28px ${LIME}66`,
          }}>
            {score}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: PIXEL, fontSize: 8, color: PURPLE_LT, letterSpacing: 1, marginBottom: 4 }}>
            TIME
          </div>
          <div style={{
            fontFamily: PIXEL, fontSize: 20, color: timeColor,
            textShadow: timeLeft <= 10 ? `0 0 12px ${MAGENTA}` : `0 0 8px ${timeColor}66`,
          }}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* MENU TOGGLE — top right corner */}
      <button onClick={() => setMenuOpen(o => !o)} style={{
        position: "absolute", top: 80, right: 12, zIndex: 25,
        background: PURPLE, border: `2px solid ${LIME}`,
        borderRadius: 4, padding: "8px 12px",
        fontFamily: PIXEL, fontSize: 9, color: "#fff",
        cursor: "pointer", letterSpacing: 1,
        boxShadow: `3px 3px 0 ${BLACK}, 0 0 12px ${PURPLE}88`,
      }}>
        {menuOpen ? "✕" : "☰ MENU"}
      </button>

      {/* SLIDE-OUT IN-GAME MENU */}
      {menuOpen && (
        <InGameMenu
          onPause={() => { setPaused(p => !p); setMenuOpen(false); }}
          paused={paused}
          onPanel={(p) => { setActivePanel(p); setPaused(true); setMenuOpen(false); }}
          onQuit={() => setScreen("intro")}
        />
      )}

      {/* GAME FIELD */}
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
              zIndex: 10, padding: 12,
              touchAction: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Balloon color={b.color} />
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
              zIndex: 15,
              padding: ITEM_TAP_PADDING,
              borderRadius: 16,
              display: "flex", flexDirection: "column", alignItems: "center",
              touchAction: "none",
              WebkitTapHighlightColor: "transparent",
              background: item.value < 0 ? `${MAGENTA}15` : `${LIME}15`,
              border: `2px solid ${item.value < 0 ? MAGENTA : LIME}66`,
              filter: item.value < 0
                ? `drop-shadow(0 0 14px ${MAGENTA}99)`
                : `drop-shadow(0 0 14px ${LIME}99)`,
            }}
          >
            <span style={{ fontSize: ITEM_SIZE, lineHeight: 1, pointerEvents: "none" }}>{item.emoji}</span>
            <div style={{
              fontFamily: PIXEL, fontSize: 10, fontWeight: "bold", marginTop: 4,
              color: item.value < 0 ? MAGENTA : LIME,
              pointerEvents: "none",
              textShadow: `0 0 6px ${item.value < 0 ? MAGENTA : LIME}66`,
            }}>
              {item.value > 0 ? `+${item.value}` : item.value}
            </div>
          </div>
        ))}

        {popEffects.map(p => <PopBurst key={p.id} x={p.x} y={p.y} color={p.color} />)}
      </div>

      {/* SCORE FLASH POPUPS */}
      {flash && (
        <div style={{
          position: "absolute",
          left: `${flash.x || 50}%`, top: `${flash.y || 40}%`,
          transform: "translate(-50%, -50%)",
          fontFamily: PIXEL, fontSize: 14,
          color: flash.color,
          zIndex: 50,
          animation: "fadeUp 0.8s ease forwards",
          textShadow: `0 0 14px ${flash.color}`,
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          {flash.text}
        </div>
      )}

      {/* LEVEL TRANSITION SPLASH */}
      {levelFlash && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center", zIndex: 60, pointerEvents: "none",
          background: "rgba(0,0,0,0.4)",
          animation: "levelIn 2.8s ease forwards",
        }}>
          <div>
            <div style={{ fontFamily: PIXEL, fontSize: 10, color: PURPLE_LT, letterSpacing: 4, marginBottom: 12 }}>
              ENTERING
            </div>
            <div style={{
              fontFamily: PIXEL, fontSize: 26, color: LIME, letterSpacing: 4,
              textShadow: `0 0 20px ${LIME}, 0 0 40px ${LIME}66`,
              marginBottom: 16, lineHeight: 1.4,
            }}>
              {levelFlash.name}
            </div>
            <div style={{
              fontFamily: MARKER, fontSize: 18, color: MAGENTA,
              textShadow: `0 0 10px ${MAGENTA}88`,
            }}>
              "{levelFlash.subtitle}"
            </div>
            <div style={{ fontFamily: PIXEL, fontSize: 9, color: YELLOW, marginTop: 16, letterSpacing: 2 }}>
              +{levelFlash.timeBonus}s BONUS
            </div>
          </div>
        </div>
      )}

      {/* PAUSED OVERLAY */}
      {paused && !activePanel && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 70, gap: 24,
        }}>
          <div style={{ fontFamily: PIXEL, fontSize: 22, color: PINK, textShadow: `0 0 20px ${PINK}` }}>
            PAUSED
          </div>
          <div style={{ fontFamily: MARKER, fontSize: 16, color: PURPLE_LT }}>
            "she's still watching"
          </div>
          <button onClick={() => setPaused(false)} style={{
            fontFamily: PIXEL, fontSize: 12,
            background: LIME, color: BLACK, border: "none",
            padding: "16px 24px", borderRadius: 4, cursor: "pointer",
            letterSpacing: 2,
            boxShadow: `4px 4px 0 ${BLACK}`,
          }}>
            ▶ RESUME
          </button>
        </div>
      )}

      {/* TIME WARNING PULSE */}
      {timeLeft <= 10 && !paused && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          border: `4px solid ${MAGENTA}`,
          animation: "pulse 0.5s ease-in-out infinite alternate",
          zIndex: 5,
        }} />
      )}

      {/* PANEL OVERLAYS (when paused for panel) */}
      {activePanel && (
        <PanelOverlay
          panel={activePanel}
          onClose={() => { setActivePanel(null); setPaused(false); }}
          haterName={haterName}
          score={score}
        />
      )}

      <GlobalStyles />
    </div>
  );
}

// ── SPARKLE BACKGROUND ────────────────────────────────────────
function SparkleField() {
  const sparks = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    size: Math.random() * 2 + 1,
    color: [LIME, YELLOW, PURPLE_LT, "#fff"][Math.floor(Math.random() * 4)],
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

// ── LOGIN MODAL ───────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  return (
    <div style={{
      minHeight: "100vh", background: BLACK,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: READ, position: "relative", overflow: "hidden",
    }}>
      <SparkleField />
      <div style={{
        position: "relative", zIndex: 2,
        background: `linear-gradient(135deg, ${PURPLE}22, ${BLACK})`,
        border: `2px solid ${PURPLE}`,
        borderRadius: 8, padding: "32px 24px",
        maxWidth: 400, width: "100%",
        boxShadow: `0 0 40px ${PURPLE}66`,
      }}>
        <PixelHeader color={PURPLE_LT} size={20}>HATER LOGIN</PixelHeader>
        <div style={{ fontFamily: READ, fontSize: 22, color: "#fff", margin: "20px 0", lineHeight: 1.4 }}>
          Enter your name to save your progress, $SHOTS, and appear on the leaderboard!
        </div>
        <div style={{ fontFamily: PIXEL, fontSize: 10, color: PURPLE_LT, letterSpacing: 2, marginBottom: 8 }}>
          HATER NAME
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onLogin(name)}
          placeholder="BigHater"
          maxLength={20}
          style={{
            width: "100%", background: BLACK, color: "#fff",
            border: `2px solid ${YELLOW}`, borderRadius: 4,
            padding: "14px 16px", fontFamily: READ, fontSize: 22,
            outline: "none", marginBottom: 20,
          }}
          autoFocus
        />
        <button onClick={() => onLogin(name)} style={{
          width: "100%", background: PURPLE,
          color: "#fff", border: `2px solid ${LIME}`,
          borderRadius: 4, padding: "16px",
          fontFamily: PIXEL, fontSize: 13, letterSpacing: 3,
          cursor: "pointer",
          boxShadow: `4px 4px 0 ${BLACK}`,
        }}>
          START HATING
        </button>
        <div style={{ fontFamily: READ, fontSize: 16, color: "#666", textAlign: "center", marginTop: 16, lineHeight: 1.4 }}>
          No account or password needed.<br/>Your progress is saved locally.
        </div>
      </div>
    </div>
  );
}

// ── INTRO SCREEN ──────────────────────────────────────────────
function IntroScreen({ haterName, onStart, onPanel, activePanel }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 50%, ${PURPLE}33 0%, ${BLACK} 70%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: READ, position: "relative", overflow: "hidden",
    }}>
      <SparkleField />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 420, width: "100%" }}>
        {/* Studio stamp */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          border: `1px solid ${YELLOW}66`, padding: "4px 10px",
          borderRadius: 3, background: `${YELLOW}11`,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 12 }}>🔫</span>
          <span style={{ fontFamily: PIXEL, fontSize: 8, color: YELLOW, letterSpacing: 2 }}>
            SUPERKIND TOY CO.
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: PIXEL, fontSize: 36, color: LIME,
          letterSpacing: 4, lineHeight: 1.4,
          textShadow: `0 0 20px ${LIME}, 0 0 40px ${LIME}66, 4px 4px 0 ${BLACK}`,
          marginBottom: 12,
        }}>
          MS.<br/>PETTY
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: PIXEL, fontSize: 12, color: MAGENTA,
          letterSpacing: 3, marginBottom: 8,
          textShadow: `0 0 14px ${MAGENTA}88`,
        }}>
          BIG GIRLY PEW PEW
        </div>

        <div style={{ fontFamily: MARKER, fontSize: 18, color: PURPLE_LT, marginBottom: 28 }}>
          "a HATER game"
        </div>

        {/* Welcome */}
        {haterName && (
          <div style={{
            fontFamily: PIXEL, fontSize: 11, color: YELLOW,
            letterSpacing: 1, marginBottom: 24, lineHeight: 1.6,
          }}>
            WELCOME BACK,<br/>
            <span style={{ color: LIME, fontSize: 14 }}>{haterName.toUpperCase()}</span>
          </div>
        )}

        {/* Big play button */}
        <button onClick={onStart} style={{
          width: "100%", background: PURPLE,
          color: "#fff", border: `3px solid ${LIME}`,
          borderRadius: 4, padding: "20px",
          fontFamily: PIXEL, fontSize: 16, letterSpacing: 3,
          cursor: "pointer", marginBottom: 16,
          boxShadow: `5px 5px 0 ${BLACK}, 0 0 28px ${PURPLE}88`,
        }}>
          🔫 PEW PEW LET'S GO
        </button>

        {/* Menu buttons grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <MenuButton color={YELLOW} onClick={() => onPanel('leaderboard')}>🏆 LEADERBOARD</MenuButton>
          <MenuButton color={PINK} onClick={() => onPanel('shop')}>🛒 SHOP</MenuButton>
          <MenuButton color={PURPLE_LT} onClick={() => onPanel('social')}>🌐 SOCIAL</MenuButton>
          <MenuButton color={LIME} onClick={() => onPanel('guide')}>📖 ITEMS</MenuButton>
          <MenuButton color={LIME} onClick={() => onPanel('how')}>❓ HOW TO PLAY</MenuButton>
          <MenuButton color={LIME} onClick={() => onPanel('lore')}>📜 LORE</MenuButton>
        </div>

        {/* Footer */}
        <div style={{ fontFamily: PIXEL, fontSize: 7, color: "#444", letterSpacing: 1, marginTop: 24, lineHeight: 2 }}>
          POP TOXIC POSITIVITY · CATCH WHAT'S REAL · DODGE WHAT'S POISON<br/>
          <span style={{ color: "#222" }}>SHE'S WATCHING THOUGH</span>
        </div>
      </div>

      {activePanel && (
        <PanelOverlay panel={activePanel} onClose={() => onPanel(null)} haterName={haterName} score={0} />
      )}

      <GlobalStyles />
    </div>
  );
}

function MenuButton({ children, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: BLACK, color: color,
      border: `2px solid ${color}`,
      borderRadius: 3, padding: "12px 8px",
      fontFamily: PIXEL, fontSize: 9, letterSpacing: 1,
      cursor: "pointer",
      boxShadow: `3px 3px 0 ${color}33`,
      lineHeight: 1.4,
    }}>
      {children}
    </button>
  );
}

// ── IN-GAME SLIDE-OUT MENU ────────────────────────────────────
function InGameMenu({ onPause, paused, onPanel, onQuit }) {
  return (
    <div style={{
      position: "absolute", top: 130, right: 12, zIndex: 24,
      display: "flex", flexDirection: "column", gap: 8,
      animation: "slideIn 0.3s ease forwards",
    }}>
      <SideButton color={PINK} onClick={onPause}>{paused ? "▶ RESUME" : "⏸ PAUSE"}</SideButton>
      <SideButton color={YELLOW} onClick={() => onPanel('leaderboard')}>🏆 BOARD</SideButton>
      <SideButton color={PINK} onClick={() => onPanel('shop')}>🛒 SHOP</SideButton>
      <SideButton color={PURPLE_LT} onClick={() => onPanel('social')}>🌐 SOCIAL</SideButton>
      <SideButton color={LIME} onClick={() => onPanel('guide')}>📖 ITEMS</SideButton>
      <SideButton color={LIME} onClick={() => onPanel('how')}>❓ HELP</SideButton>
      <SideButton color={LIME} onClick={() => onPanel('lore')}>📜 LORE</SideButton>
      <SideButton color={MAGENTA} onClick={onQuit}>✕ QUIT</SideButton>
    </div>
  );
}

function SideButton({ children, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: BLACK, color: color,
      border: `2px solid ${color}`, borderRadius: 3,
      padding: "10px 12px",
      fontFamily: PIXEL, fontSize: 9, letterSpacing: 1,
      cursor: "pointer",
      minWidth: 130, textAlign: "left",
      boxShadow: `3px 3px 0 ${color}33`,
    }}>
      {children}
    </button>
  );
}

// ── PANEL OVERLAY (handles all sub-panels) ────────────────────
function PanelOverlay({ panel, onClose, haterName, score }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.92)",
      overflowY: "auto", padding: 16,
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ maxWidth: 500, margin: "0 auto", paddingBottom: 40 }}>
        <button onClick={onClose} style={{
          background: BLACK, color: PINK,
          border: `2px solid ${PINK}`, borderRadius: 3,
          padding: "8px 14px", fontFamily: PIXEL, fontSize: 9,
          cursor: "pointer", marginBottom: 20,
          boxShadow: `3px 3px 0 ${BLACK}`,
        }}>
          ← BACK
        </button>

        {panel === 'guide'       && <ItemGuidePanel />}
        {panel === 'how'         && <HowToPlayPanel />}
        {panel === 'lore'        && <LorePanel />}
        {panel === 'leaderboard' && <LeaderboardPanel haterName={haterName} score={score} />}
        {panel === 'shop'        && <ShopPanel />}
        {panel === 'social'      && <SocialPanel haterName={haterName} score={score} />}
      </div>
    </div>
  );
}

// ── ITEM GUIDE — green-bordered cards, poetry ─────────────────
function ItemGuidePanel() {
  return (
    <div style={{ fontFamily: READ, color: "#fff" }}>
      <PixelHeader color={LIME} size={18}>ITEM GUIDE</PixelHeader>
      <div style={{ fontFamily: MARKER, fontSize: 16, color: MAGENTA, marginTop: 8, marginBottom: 28 }}>
        "know what you're catching, darling"
      </div>

      {LEVELS.map(level => (
        <div key={level.id} style={{ marginBottom: 36 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            borderBottom: `2px solid ${PURPLE}`, paddingBottom: 8, marginBottom: 12,
          }}>
            <div style={{ fontFamily: PIXEL, fontSize: 11, color: LIME, letterSpacing: 2 }}>
              LV{level.id} · {level.name}
            </div>
            <div style={{ fontFamily: PIXEL, fontSize: 9, color: "#555" }}>
              {level.min}–{level.max}
            </div>
          </div>

          <div style={{
            fontFamily: MARKER, fontSize: 15, color: PURPLE_LT,
            marginBottom: 14,
          }}>
            "{level.subtitle}"
          </div>

          {[...level.catchItems, ...level.avoidItems].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              background: BLACK,
              border: `2px solid ${item.value < 0 ? MAGENTA : LIME}`,
              borderRadius: 6, padding: "14px 16px", marginBottom: 10,
            }}>
              <div style={{ fontSize: 38, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: READ, fontSize: 22, fontWeight: "bold", color: "#fff",
                  marginBottom: 2, lineHeight: 1.2,
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontFamily: PIXEL, fontSize: 11,
                  color: item.value < 0 ? MAGENTA : LIME,
                  marginBottom: 6, letterSpacing: 1,
                  textShadow: `0 0 6px ${item.value < 0 ? MAGENTA : LIME}66`,
                }}>
                  {item.value > 0 ? `+${item.value}` : item.value} POINTS
                  <span style={{ color: "#555", marginLeft: 10, fontSize: 9 }}>
                    {item.value > 0 ? "· CATCH" : "· AVOID"}
                  </span>
                </div>
                <div style={{ fontFamily: READ, fontSize: 17, color: "#aaa", lineHeight: 1.3 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{
        fontFamily: READ, fontSize: 18, color: PURPLE_LT,
        textAlign: "center", lineHeight: 1.5,
        padding: "20px", border: `1px dashed ${PURPLE}`,
        borderRadius: 6, marginTop: 20,
        fontStyle: "italic",
      }}>
        Master this list, Hater, and your crusade will shine brighter than any forced grin.
        Pop with precision, catch with purpose — and let the toxic positivity fall away.
      </div>
    </div>
  );
}

// ── HOW TO PLAY ───────────────────────────────────────────────
function HowToPlayPanel() {
  const rules = [
    { emoji: "🎈", title: "POP THE BALLOONS", body: "Tap rising balloons to pop them. Each one releases a consequence." },
    { emoji: "✨", title: "CATCH WHAT'S REAL", body: "Green-glow items are points (+). Catch them before they hit the ground." },
    { emoji: "💀", title: "DODGE THE POISON", body: "Magenta-glow items are penalties (−). Let them fall. Don't touch." },
    { emoji: "⏱️", title: "BEAT THE CLOCK", body: "Time is everything. New levels add bonus seconds. Missing a green item costs 2." },
    { emoji: "📈", title: "LEVEL UP BY SCORE", body: "Hit a score threshold, the world transforms. 11 levels. Each one different." },
    { emoji: "💰", title: "$SHOTS = SCORE", body: "Every point you earn is a $SHOT. Lifetime $SHOTS save automatically." },
  ];
  return (
    <div style={{ fontFamily: READ, color: "#fff" }}>
      <PixelHeader color={LIME} size={18}>HOW TO PLAY</PixelHeader>
      <div style={{ fontFamily: MARKER, fontSize: 16, color: MAGENTA, marginTop: 8, marginBottom: 28 }}>
        "the game teaches you. you don't read it."
      </div>
      {rules.map((r, i) => (
        <div key={i} style={{
          background: BLACK, border: `2px solid ${LIME}`,
          borderRadius: 6, padding: 16, marginBottom: 12,
          display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <div style={{ fontSize: 36 }}>{r.emoji}</div>
          <div>
            <div style={{ fontFamily: PIXEL, fontSize: 11, color: LIME, letterSpacing: 1, marginBottom: 6 }}>
              {r.title}
            </div>
            <div style={{ fontFamily: READ, fontSize: 19, color: "#ccc", lineHeight: 1.4 }}>
              {r.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LORE ──────────────────────────────────────────────────────
function LorePanel() {
  return (
    <div style={{ fontFamily: READ, color: "#fff" }}>
      <PixelHeader color={MAGENTA} size={18}>LORE</PixelHeader>
      <div style={{ fontFamily: MARKER, fontSize: 16, color: PURPLE_LT, marginTop: 8, marginBottom: 28 }}>
        "where the petty came from"
      </div>

      <div style={{
        background: BLACK, border: `2px solid ${PURPLE}`,
        borderRadius: 6, padding: 24,
        fontFamily: READ, fontSize: 20, lineHeight: 1.5, color: "#ccc",
      }}>
        <p style={{ marginBottom: 18 }}>
          <span style={{ color: LIME, fontWeight: "bold" }}>Ms. Petty</span> wasn't born petty.
          She was made petty. By a thousand fake smiles, performative niceties, and "bless your hearts"
          that meant the opposite.
        </p>
        <p style={{ marginBottom: 18 }}>
          One day she stopped pretending. She picked up a glittery toy gun from
          <span style={{ color: YELLOW }}> SuperKind Toy Co.</span> and started popping every
          floating illusion in sight.
        </p>
        <p style={{ marginBottom: 18 }}>
          What fell out wasn't always pretty — but it was <span style={{ color: MAGENTA, fontStyle: "italic" }}>real</span>.
          Champagne and microphones for the truth-tellers. Cigarettes and broken hearts for the frauds.
        </p>
        <p style={{ marginBottom: 18 }}>
          She figured: better to know what's behind the smile than to choke on it.
        </p>
        <p style={{ color: LIME, fontStyle: "italic", textAlign: "center", marginTop: 24 }}>
          You are her now. Pop with precision.<br/>
          Catch with purpose.
        </p>
      </div>
    </div>
  );
}

// ── LEADERBOARD (local for now) ───────────────────────────────
function LeaderboardPanel({ haterName, score }) {
  const [bestScore, setBest] = useState(0);
  const [lifetime, setLifetime] = useState(0);

  useEffect(() => {
    try {
      setBest(parseInt(localStorage.getItem('bestScore') || '0'));
      setLifetime(parseInt(localStorage.getItem('lifetimeShots') || '0'));
    } catch(e) {}
  }, []);

  return (
    <div style={{ fontFamily: READ, color: "#fff" }}>
      <PixelHeader color={YELLOW} size={18}>LEADERBOARD</PixelHeader>
      <div style={{ fontFamily: MARKER, fontSize: 16, color: PURPLE_LT, marginTop: 8, marginBottom: 28 }}>
        "global board coming. local for now."
      </div>

      <div style={{
        background: BLACK, border: `2px solid ${YELLOW}`,
        borderRadius: 6, padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontFamily: PIXEL, fontSize: 9, color: PURPLE_LT, letterSpacing: 2, marginBottom: 8 }}>
          YOUR HATER
        </div>
        <div style={{ fontFamily: PIXEL, fontSize: 18, color: LIME, marginBottom: 20 }}>
          {haterName?.toUpperCase() || "BIGHATER"}
        </div>

        <Stat label="BEST SCORE" value={bestScore} color={YELLOW} />
        <Stat label="LIFETIME $SHOTS" value={lifetime.toLocaleString()} color={LIME} />
        <Stat label="CURRENT RUN" value={score} color={MAGENTA} />
      </div>

      <div style={{
        textAlign: "center", padding: 20,
        border: `1px dashed ${PURPLE}`, borderRadius: 6,
        fontFamily: READ, fontSize: 17, color: "#777", lineHeight: 1.4,
      }}>
        Global leaderboard ships in v3.<br/>
        Your $SHOTS save on this device.
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: `1px solid ${PURPLE}33`,
    }}>
      <div style={{ fontFamily: PIXEL, fontSize: 9, color: "#666", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: PIXEL, fontSize: 14, color }}>{value}</div>
    </div>
  );
}

// ── SHOP ──────────────────────────────────────────────────────
function ShopPanel() {
  const items = [
    { emoji: "🔫", name: "GLITTER RAY GUN", cost: 500, desc: "Bigger pew. More glitter." },
    { emoji: "💖", name: "EXTRA LIFE",      cost: 250, desc: "One more chance, one more crusade." },
    { emoji: "⏱️", name: "TIME FREEZE",     cost: 400, desc: "10 seconds of stopped clock." },
    { emoji: "✨", name: "DOUBLE $SHOTS",   cost: 800, desc: "30 seconds. Everything counts twice." },
    { emoji: "🪄", name: "AUTO-CATCHER",    cost: 600, desc: "Misses become catches. Briefly." },
  ];
  return (
    <div style={{ fontFamily: READ, color: "#fff" }}>
      <PixelHeader color={PINK} size={18}>SHOP</PixelHeader>
      <div style={{ fontFamily: MARKER, fontSize: 16, color: PURPLE_LT, marginTop: 8, marginBottom: 28 }}>
        "spend your $SHOTS, level up your hate"
      </div>

      {items.map((it, i) => (
        <div key={i} style={{
          background: BLACK, border: `2px solid ${PINK}`,
          borderRadius: 6, padding: 16, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ fontSize: 38 }}>{it.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PIXEL, fontSize: 10, color: PINK, letterSpacing: 1, marginBottom: 4 }}>
              {it.name}
            </div>
            <div style={{ fontFamily: READ, fontSize: 16, color: "#999" }}>{it.desc}</div>
          </div>
          <button disabled style={{
            background: PURPLE, color: "#fff",
            border: `2px solid ${LIME}`, borderRadius: 3,
            padding: "8px 12px", fontFamily: PIXEL, fontSize: 9,
            opacity: 0.5, cursor: "not-allowed",
          }}>
            {it.cost} $S
          </button>
        </div>
      ))}

      <div style={{
        textAlign: "center", padding: 16, marginTop: 16,
        fontFamily: READ, fontSize: 17, color: "#666",
        border: `1px dashed ${PINK}`, borderRadius: 6,
      }}>
        🚧 Shop opens in v3. Items locked for now.
      </div>
    </div>
  );
}

// ── SOCIAL ────────────────────────────────────────────────────
function SocialPanel({ haterName, score }) {
  const shareText = encodeURIComponent(`Just popped ${score} $SHOTS in MS. PETTY 🔫 a HATER game. https://mspetty.blaqqat.games`);
  const farcasterURL = `https://warpcast.com/~/compose?text=${shareText}`;
  const xURL = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div style={{ fontFamily: READ, color: "#fff" }}>
      <PixelHeader color={PURPLE_LT} size={18}>SOCIAL</PixelHeader>
      <div style={{ fontFamily: MARKER, fontSize: 16, color: MAGENTA, marginTop: 8, marginBottom: 28 }}>
        "make them watch"
      </div>

      <PixelHeader color={MAGENTA} size={11}>SHARE YOUR SCORE</PixelHeader>
      <div style={{ fontFamily: READ, fontSize: 17, color: "#ccc", margin: "10px 0 16px" }}>
        Let the world know about your hating achievements!
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
        <SocialButton color={PURPLE} icon="●" label="FARCASTER" sub="Share with the community" href={farcasterURL} />
        <SocialButton color={"#fff"} icon="𝕏" label="X" sub="Tweet your score" href={xURL} />
      </div>

      <PixelHeader color={MAGENTA} size={11}>STREAM YOUR GAMEPLAY</PixelHeader>
      <div style={{ fontFamily: READ, fontSize: 17, color: "#ccc", margin: "10px 0 16px" }}>
        Become a content creator. Share live.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
        <SocialButton color={PURPLE_LT} icon="📺" label="TWITCH" sub="Stream live" href="https://twitch.tv" />
        <SocialButton color={CYAN} icon="📱" label="TIKTOK" sub="Viral content" href="https://tiktok.com" />
      </div>

      <PixelHeader color={MAGENTA} size={11}>HATE ON THE DEVELOPER</PixelHeader>
      <div style={{ fontFamily: READ, fontSize: 17, color: "#ccc", margin: "10px 0 16px" }}>
        Connect with the creator. Join the Gato Society.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SocialButton color={PURPLE} icon="●" label="FARCASTER" sub="@blaqqat" href="https://warpcast.com/blaqqat" />
        <SocialButton color={CYAN} icon="✈" label="TELEGRAM" sub="Gato Society" href="https://t.me/gatosociety" />
      </div>
    </div>
  );
}

function SocialButton({ color, icon, label, sub, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      background: BLACK, border: `2px solid ${color}`,
      borderRadius: 6, padding: "16px 12px", textAlign: "center",
      textDecoration: "none", color: "#fff",
      display: "block",
      boxShadow: `3px 3px 0 ${color}33`,
    }}>
      <div style={{ fontSize: 28, color, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: PIXEL, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: READ, fontSize: 14, color: "#888" }}>{sub}</div>
    </a>
  );
}

// ── GAME OVER ─────────────────────────────────────────────────
const OUTRO_LINES = [
  "she's not mad. just disappointed.",
  "the smiles regrouped this round.",
  "every hater gets to try again.",
  "ms. petty saw what you almost did.",
  "the toxic positivity won't be that lucky next time.",
  "you played. the smile played back.",
];

function GameOverScreen({ haterName, score, disrupted, earned, onRestart, onMenu, onPanel, activePanel }) {
  const outro = OUTRO_LINES[Math.floor(Math.random() * OUTRO_LINES.length)];
  const rank =
    score >= 1500 ? { title: "APEX PETTY 💅",       color: LIME }    :
    score >= 1000 ? { title: "CERTIFIED PETTY 🔫",   color: YELLOW }  :
    score >= 500  ? { title: "EMERGING PETTY 💜",    color: PURPLE_LT } :
    score >= 200  ? { title: "GETTING WARMER 🌶",     color: PINK }    :
                    { title: "PETTY IN TRAINING 🍼", color: "#777" };

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 50%, ${PURPLE}33 0%, ${BLACK} 70%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: READ, color: "#fff",
      position: "relative", overflow: "hidden",
    }}>
      <SparkleField />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{
          fontFamily: PIXEL, fontSize: 11, color: MAGENTA,
          letterSpacing: 4, marginBottom: 14,
        }}>
          THAT'S ENOUGH FOR NOW
        </div>

        <div style={{
          fontFamily: PIXEL, fontSize: 28, color: LIME,
          letterSpacing: 4, lineHeight: 1.4, marginBottom: 8,
          textShadow: `0 0 20px ${LIME}, 4px 4px 0 ${BLACK}`,
        }}>
          MS. PETTY
        </div>

        <div style={{ fontFamily: MARKER, fontSize: 16, color: PURPLE_LT, marginBottom: 24 }}>
          "{outro}"
        </div>

        {/* Rank */}
        <div style={{
          display: "inline-block",
          background: BLACK,
          border: `2px solid ${rank.color}`, borderRadius: 4,
          padding: "10px 18px", marginBottom: 20,
          boxShadow: `3px 3px 0 ${BLACK}`,
        }}>
          <div style={{
            fontFamily: PIXEL, fontSize: 11, letterSpacing: 2, color: rank.color,
          }}>
            {rank.title}
          </div>
        </div>

        {/* Stats card */}
        <div style={{
          background: BLACK, border: `2px solid ${PURPLE}`,
          borderRadius: 6, padding: 20, marginBottom: 20,
          textAlign: "left",
        }}>
          <BigStat label="$SHOTS THIS RUN"        value={score}                        color={LIME} big />
          <BigStat label="TOXIC POSITIVITY DISRUPTED" value={disrupted}              color={MAGENTA} />
          <BigStat label="TRUTH EXTRACTED"       value={earned}                       color={YELLOW} />
        </div>

        {/* CTAs */}
        <button onClick={onRestart} style={{
          width: "100%", background: PURPLE,
          color: "#fff", border: `3px solid ${LIME}`,
          borderRadius: 4, padding: "18px",
          fontFamily: PIXEL, fontSize: 14, letterSpacing: 3,
          cursor: "pointer", marginBottom: 10,
          boxShadow: `4px 4px 0 ${BLACK}, 0 0 24px ${PURPLE}88`,
        }}>
          🔫 PEW PEW AGAIN
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <button onClick={() => onPanel('shop')} style={{
            background: BLACK, color: PINK,
            border: `2px solid ${PINK}`, borderRadius: 3,
            padding: "12px", fontFamily: PIXEL, fontSize: 9,
            letterSpacing: 1, cursor: "pointer",
          }}>🛒 SHOP</button>
          <button onClick={() => onPanel('social')} style={{
            background: BLACK, color: PURPLE_LT,
            border: `2px solid ${PURPLE_LT}`, borderRadius: 3,
            padding: "12px", fontFamily: PIXEL, fontSize: 9,
            letterSpacing: 1, cursor: "pointer",
          }}>🌐 SHARE</button>
        </div>

        <button onClick={onMenu} style={{
          width: "100%", background: "transparent",
          color: "#666", border: `1px solid #333`,
          borderRadius: 3, padding: "10px",
          fontFamily: PIXEL, fontSize: 8, letterSpacing: 2,
          cursor: "pointer", marginTop: 8,
        }}>
          ← MAIN MENU
        </button>
      </div>

      {activePanel && (
        <PanelOverlay panel={activePanel} onClose={() => onPanel(null)} haterName={haterName} score={score} />
      )}

      <GlobalStyles />
    </div>
  );
}

function BigStat({ label, value, color, big }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0",
      borderBottom: `1px solid ${PURPLE}33`,
    }}>
      <div style={{ fontFamily: PIXEL, fontSize: 8, color: "#666", letterSpacing: 1 }}>{label}</div>
      <div style={{
        fontFamily: PIXEL, fontSize: big ? 22 : 14, color,
        textShadow: big ? `0 0 12px ${color}88` : "none",
      }}>{value}</div>
    </div>
  );
}

// ── GLOBAL CSS ────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeUp {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -90%) scale(0.9); }
      }
      @keyframes fadeIn {
        0%   { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes pulse {
        from { border-color: ${MAGENTA}33; }
        to   { border-color: ${MAGENTA}; }
      }
      @keyframes popRing {
        0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50%      { opacity: 0.9; transform: scale(1.6); }
      }
      @keyframes slideIn {
        from { transform: translateX(20px); opacity: 0; }
        to   { transform: translateX(0); opacity: 1; }
      }
      @keyframes levelIn {
        0%   { opacity: 0; transform: scale(0.85); }
        15%  { opacity: 1; transform: scale(1); }
        85%  { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(1.05); }
      }
    `}</style>
  );
}
