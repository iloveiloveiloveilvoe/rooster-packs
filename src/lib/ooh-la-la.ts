export const OOH_LA_LA_PACK = {
  id: "ooh-la-la", name: "Ooh La La Pack", emoji: "💋", cost: 1000, cards: 5,
  odds: [0.04, 0.13, 0.28] as [number, number, number],
  blurb: "7 exclusive cards · Ooh La La: 0.01% per card",
};

export const OOH_LA_LA_CARDS = [
  { id: 29, name: "Chicken Family", emoji: "🐔", type: "Family", hp: 60, move: "Family Flock — 25", rarity: "common" as const, weight: 4000 },
  { id: 30, name: "The Grin Reaper", emoji: "😁", type: "Smile", hp: 120, move: "Mega Grin — 80", rarity: "epic" as const, weight: 900 },
  { id: 31, name: "Ooh La La", emoji: "💋", type: "Crown Jewel", hp: 1500, move: "Legendary Lip Smack — 999", rarity: "mythic" as const, weight: 1 },
  { id: 32, name: "Human Ooh La La", emoji: "💋", type: "Human", hp: 180, move: "Pout Power — 120", rarity: "legendary" as const, weight: 400 },
  { id: 33, name: "Disco Cluck", emoji: "🪩", type: "Disco", hp: 55, move: "Dancefloor Peck — 20", rarity: "common" as const, weight: 3000 },
  { id: 34, name: "Sir Fluffington", emoji: "👑", type: "Royal", hp: 85, move: "Royal Fluff — 40", rarity: "rare" as const, weight: 1500 },
  { id: 35, name: "Eggstronaut", emoji: "🚀", type: "Space", hp: 350, move: "Moon Egg Meteor — 240", rarity: "ultra" as const, weight: 199 },
];

export function isStandardCard(card: { id: number }): boolean {
  return !OOH_LA_LA_CARDS.some((exclusive) => exclusive.id === card.id);
}

export function rollOohLaLa(random: () => number = Math.random) {
  const total = OOH_LA_LA_CARDS.reduce((sum, card) => sum + card.weight, 0);
  let ticket = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * total;
  for (const card of OOH_LA_LA_CARDS) {
    if (ticket < card.weight) return card;
    ticket -= card.weight;
  }
  throw new Error("Ooh La La draw did not match a card");
}