export const FREE_PACK = { id: "free", name: "Free Chick Pack", emoji: "🐣", cost: 0, cards: 3, odds: [0.01, 0.06, 0.21] as [number, number, number], blurb: "A little gift from the coop." };
export const ADMIN_SEQUENCE = "theroosternannypack";

export function drawPack<T>(count: number, draw: () => T): T[] {
  return Array.from({ length: count }, draw);
}

export function advanceSequence(previous: string, key: string): string {
  if (key.length !== 1) return previous;
  return (previous + key.toLowerCase()).slice(-ADMIN_SEQUENCE.length);
}