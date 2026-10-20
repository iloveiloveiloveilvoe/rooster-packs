import { describe, expect, it } from "vitest";
import { COMBINE_COST, buffRecipe, buffMultiplier, buffedCards, buffedSell, combinePool, parseBuffs } from "@/lib/combine-rules";
import { OOH_LA_LA_CARDS } from "@/lib/ooh-la-la";
describe("combining and buffs", () => {
  it("increases costs to thirty legendary copies", () => {
    expect([COMBINE_COST.common, COMBINE_COST.rare, COMBINE_COST.epic, COMBINE_COST.legendary]).toEqual([3, 8, 15, 30]);
  });
  it("awards only Cheeky Boy for an ultra combine", () => {
    expect(combinePool([{ id: 28, rarity: "ultra" }, ...OOH_LA_LA_CARDS], "legendary").map(c => c.id)).toEqual([28]);
  });
  it("never combines into Ooh La La", () => {
    for (const rarity of ["common", "rare", "epic", "legendary", "ultra", "mythic"] as const) expect(combinePool(OOH_LA_LA_CARDS, rarity).map(c => c.id)).not.toContain(31);
  });
  it("requires at least three copies from two different chickens", () => {
    expect(buffRecipe([{ id: 1, rarity: "common", count: 3 }]).valid).toBe(false);
    expect(buffRecipe([{ id: 1, rarity: "common", count: 1 }, { id: 2, rarity: "common", count: 1 }]).valid).toBe(false);
    expect(buffRecipe([{ id: 1, rarity: "common", count: 2 }, { id: 2, rarity: "common", count: 1 }]).valid).toBe(true);
  });
  it("increases both time and multiplier with more chickens", () => {
    const recipe = (count: number) => buffRecipe([{ id: 1, rarity: "common", count }, { id: 2, rarity: "common", count: 1 }]);
    expect(recipe(2).durationMs).toBe(180000);
    expect(recipe(5).durationMs).toBeGreaterThan(recipe(2).durationMs);
    expect(recipe(5).multiplier).toBeGreaterThan(recipe(2).multiplier);
  });
  it("increases time and multiplier with rarer chickens", () => {
    const common = buffRecipe([{ id: 1, rarity: "common", count: 2 }, { id: 2, rarity: "common", count: 1 }]);
    const rare = buffRecipe([{ id: 1, rarity: "rare", count: 2 }, { id: 2, rarity: "common", count: 1 }]);
    expect(rare.durationMs).toBe(420000);
    expect(rare.multiplier).toBeGreaterThan(common.multiplier);
  });
  it("applies cards and sell buffs independently and expires at the deadline", () => {
    const buffs = [{ kind: "cards" as const, multiplier: 2, expiresAt: 1000 }, { kind: "sell" as const, multiplier: 1.5, expiresAt: 2000 }];
    expect(buffedCards(5, buffs, 999)).toBe(10);
    expect(buffedSell(10, buffs, 999)).toBe(15);
    expect(buffedCards(5, buffs, 1000)).toBe(5);
    expect(buffedSell(10, buffs, 2000)).toBe(10);
    expect(buffMultiplier([...buffs, { kind: "cards", multiplier: 3, expiresAt: 1000 }], "cards", 999)).toBe(3);
  });
  it("round-trips stored buffs and rejects invalid ones", () => {
    const buffs = [{ kind: "sell", multiplier: 2, expiresAt: 2000 }];
    expect(parseBuffs(JSON.parse(JSON.stringify(buffs)))).toEqual(buffs);
    expect(parseBuffs([null, { kind: "bad", multiplier: 2, expiresAt: 2000 }])).toEqual([]);
  });
});