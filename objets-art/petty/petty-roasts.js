// ============================================================
// PETTY RUN — THE ROAST. Edit copy here; logic never needs to change.
// Rules are checked top to bottom: the first match wins, so the most
// specific lines sit at the top. {tokens} fill from the run.
// ============================================================

export const ROASTS = [
  { id: "skeleton_key", when: (r) => r.ledger.some((f) => f.name === "Skeleton Key"),
    line: "You let the Skeleton Key go. 108 points. Ultra rare. Put that in your memoir, chapter titled 'Why.'" },
  { id: "flew_into_it", when: (r) => r.caughtNames.includes("Debt Hole") || r.caughtNames.includes("Dragon Spawn"),
    line: "You flew directly into the {poisonEmoji} {poisonName}. On purpose? With your whole chest? Iconic. Expensive." },
  { id: "top10_today", when: (r) => r.rankToday != null && r.rankToday <= 10,
    line: "Top 10 today. Don't let it go to your head. Too late, it's already in there redecorating." },
  { id: "big_fumble", when: (r) => r.biggestFumble && r.biggestFumble.value >= 100,
    line: "You popped the balloon. The {emoji} {name} fell out. Worth {value}. And you just watched it go by like it owed you money." },
  { id: "ego_death", when: (r) => r.ended === "ego_death",
    line: "Ego Death at {score}. She's not mad. She's taking notes." },
  { id: "poison_lifestyle", when: (r) => r.poison >= 5,
    line: "{poison} poison items, swallowed. At this point it's not an accident, it's a lifestyle." },
  { id: "l_streak", when: (r) => r.worstChain >= 4,
    line: "{worst} bad catches in a row. Consistency is a virtue. Just not this one." },
  { id: "custody_battle", when: (r) => r.fumbles > r.catches,
    line: "{fumbles} rewards released. {fumbles} rewards abandoned. That's not a run, that's a custody battle." },
  { id: "floor_won", when: (r) => r.lolz > r.score,
    line: "You let {lolz} in good stuff hit the floor. The floor had a better night than you." },
  { id: "vegas_plus", when: (r) => r.levelReachedIdx >= r.vegasIdx,
    line: "You made it to {level}. The house always wins. Tonight, briefly, you were the house." },
  { id: "clean", when: (r) => r.fumbles === 0 && r.score > 0,
    line: "Zero fumbles. Clean. Surgical. Who hurt you? Because it worked." },
  { id: "rental", when: (r) => r.score >= 0 && r.score <= 50 && r.balloons < 15,
    line: "{balloons} balloons. In a ship this nice. ILLI Motors would like to discuss the rental agreement." },
  { id: "fallback", when: () => true,
    line: "She saw what you almost did." },
];

export function pickRoast(r) {
  const rule = ROASTS.find((x) => { try { return x.when(r); } catch (_) { return false; } }) || ROASTS[ROASTS.length - 1];
  const f = r.biggestFumble || {};
  const poison = r.flewInto || {};
  const vals = {
    emoji: f.emoji || "", name: f.name || "", value: f.value != null ? f.value : "",
    poisonEmoji: poison.emoji || "", poisonName: poison.name || "",
    fumbles: r.fumbles, lolz: r.lolz, score: r.score, poison: r.poison, worst: r.worstChain,
    level: r.levelReached, balloons: r.balloons,
  };
  return { id: rule.id, line: rule.line.replace(/\{(\w+)\}/g, (_, k) => (vals[k] != null ? vals[k] : "")) };
}
