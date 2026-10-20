import { describe, expect, it } from "vitest";
import { OOH_LA_LA_CARDS, OOH_LA_LA_PACK, isStandardCard, rollOohLaLa } from "@/lib/ooh-la-la";

describe("Ooh La La pack", () => {
  it("includes all four requested photo cards", () => {
    expect(OOH_LA_LA_CARDS.filter((c) => c.id <= 32).map((c) => c.name)).toEqual([
      "Chicken Family", "The Grin Reaper", "Ooh La La", "Human Ooh La La",
    ]);
  });
  it("adds three original cards to a five-card pack", () => {
    expect(OOH_LA_LA_CARDS.filter((c) => c.id >= 33)).toHaveLength(3);
    expect(OOH_LA_LA_PACK.cards).toBe(5);
    expect(OOH_LA_LA_PACK.cost).toBe(100);
  });
  it("makes the big-lipped chicken uniquely rarest at exactly one in ten thousand", () => {
    const crown = OOH_LA_LA_CARDS.find((c) => c.id === 31);
    const total = OOH_LA_LA_CARDS.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBe(10000);
    expect(crown?.weight).toBe(1);
    expect(OOH_LA_LA_CARDS.filter((c) => c.id !== 31).every((c) => c.weight > (crown?.weight ?? Infinity))).toBe(true);
  });
  it("draws each card for exactly its configured number of tickets", () => {
    const counts: Record<number, number> = {};
    for (let i = 0; i < 10000; i++) {
      const card = rollOohLaLa(() => (i + 0.5) / 10000);
      counts[card.id] = (counts[card.id] ?? 0) + 1;
    }
    for (const card of OOH_LA_LA_CARDS) expect(counts[card.id]).toBe(card.weight);
  });
  it("keeps exclusive cards out of standard pack and combining reward pools", () => {
    expect(OOH_LA_LA_CARDS.every((c) => !isStandardCard(c))).toBe(true);
    expect(isStandardCard({ id: 28 })).toBe(true);
  });
});