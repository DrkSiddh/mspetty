// ============================================================
// PETTY RUN — LEVEL + ITEM CANON (GENERATED FILE, DO NOT EDIT)
// ------------------------------------------------------------
// Source of truth: the Ms. Petty repo (DrkSiddh/mspetty)
//   src/MsPetty.jsx   LEVELS, getLevel, game constants, flash banks,
//                     fumble line, EGO DEATH rule, Pew Pew Arsenal shop
//   src/pettyStats.js getRank
// Generated from repo commit 5a384aa by objets-art/tools/gen-petty-levels.mjs.
// The repo wins. To change canon, change the repo and regenerate.
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

// ── GAME CONSTANTS (verbatim) ────────────────────────────────
const INITIAL_TIME = 30;
const BALLOON_INTERVAL = 1100;
const ITEM_FALL_SPEED = 2.4;
const BALLOON_RISE_BASE = 0.32;
const BALLOON_SIZE = 64;     // up from 42
const ITEM_SIZE = 56;        // big emoji target
const ITEM_TAP_PADDING = 18; // generous hit area

// ── RULES LIFTED FROM THE GAME LOOP ──────────────────────────
export const EGO_DEATH_AT = -30;              // run ends when score <= this
export const TIME_CAP = 99;                  // timer never exceeds this (level bonus + catch bonus)
export const CATCH_TIME_CHANCE = 0.5;        // catch: Math.random() > this → +1s
export const CATCH_TIME_BONUS = 1;
export const FUMBLE_TIME_PENALTY = 2;  // timed rounds only
export const FUMBLE_LINE = "the smile won that round −2s";
export const flashMessages = (val) => val > 0
  ? [`+${val} 💅`, `+${val} pew!`, `+${val} ✨`, `+${val} truth!`]
  : [`${val} oof`, `${val} chile...`, `${val} oops`, `${val} 💔`];
// Item pick weighting from popBalloon(): catch items twice + avoid items once.
export function itemPool(level) {
  const allItems = [...level.catchItems, ...level.avoidItems];
  return level.catchItems.length > 0
    ? [...level.catchItems, ...level.catchItems, ...level.avoidItems]
    : allItems;
}

// ── RANK (src/pettyStats.js) ─────────────────────────────────
export function getRank(score) {
  if (score >= 4444) return { title: "APEX PETTY",        emoji: "💅", color: "#FFD93D" };
  if (score >= 888)  return { title: "CERTIFIED PETTY",   emoji: "🔫", color: "#FF2D9B" };
  if (score >= 444)  return { title: "EMERGING PETTY",    emoji: "💜", color: "#B584E8" };
  return               { title: "PETTY IN TRAINING",  emoji: "🍼", color: "#888888" };
}
export const LIVE_DOSSIER_KEY = "mspetty_dossier_v1";

// ── PEW PEW ARSENAL (hardcoded shop, verbatim) ───────────────
const PEW_GIFS = {
  upsynch:      "https://qycdhyhhxruoibsxrxfq.supabase.co/storage/v1/object/public/Game%20Experience%20Assets/Laser%20Pew%20Pews/ToyCo%20UpSynch%20T10.gif",
  spacemaker:   "https://qycdhyhhxruoibsxrxfq.supabase.co/storage/v1/object/public/Game%20Experience%20Assets/Laser%20Pew%20Pews/ToyCo%20Spacemaker%20T99_2.gif",
  doubletrouble:"https://qycdhyhhxruoibsxrxfq.supabase.co/storage/v1/object/public/Game%20Experience%20Assets/Laser%20Pew%20Pews/Double%20Trouble%20Ray%20Ray.gif",
};
const TRANSIENT_CONTRACT = "0x3bd644bb69e70a9b57e4213b977257aea9ca45bf";
const transientToken = (id) => `https://www.transient.xyz/nfts/base/${TRANSIENT_CONTRACT}/${id}`;
const ONCHAIN_PEWS = [
  { id: 5, name: "FREQ RAY",                     art: PEW_GIFS.upsynch,       animated: true },
  { id: 6, name: "BIG MOUTH T3",                 art: PEW_GIFS.spacemaker,    animated: true },
  { id: 7, name: "POINT GUARD T4",               art: PEW_GIFS.doubletrouble, animated: true },
  // token 4 name fetched from Transient ("The Disruptor Disruptor 9000"); fallback "SUPERKIND PEW PEW".
  // TODO(confirm): no 4th GIF supplied — using the Transient static (og-image) art for the remainder.
  { id: 4, name: "THE DISRUPTOR DISRUPTOR 9000", art: `${transientToken(4)}/og-image`, animated: false },
];
const LINK_CASH_ENDODECA = "https://cash.app/$Endodeca";
const LINK_CASH_BLAQQAT  = "https://cash.app/$BlaqqatBuilds";
export const TIP_JAR_LABEL = "BUY THE DEV A SHOT 🔫";
export const SHOP_TAGLINE = "own a pew pew. play forever.";

export {
  LIME, MAGENTA, PURPLE, PURPLE_LT, YELLOW, PINK, CYAN, BLACK, DARK, CARD,
  LEVELS, getLevel,
  INITIAL_TIME, BALLOON_INTERVAL, ITEM_FALL_SPEED, BALLOON_RISE_BASE, BALLOON_SIZE, ITEM_SIZE, ITEM_TAP_PADDING,
  PEW_GIFS, TRANSIENT_CONTRACT, transientToken, ONCHAIN_PEWS, LINK_CASH_ENDODECA, LINK_CASH_BLAQQAT,
};
