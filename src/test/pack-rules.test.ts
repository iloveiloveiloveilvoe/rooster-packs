import { describe, expect, it } from "vitest";
import { ADMIN_SEQUENCE, FREE_PACK, advanceSequence, drawPack } from "@/lib/pack-rules";

describe("pack and panel rules", () => {
  it("offers a free pack for zero coins", () => {
    expect(FREE_PACK.cost).toBe(0);
    expect(drawPack(FREE_PACK.cards, () => "chick")).toHaveLength(3);
  });
  it("preserves random draw order instead of sorting rarity", () => {
    const drawn = ["legendary", "common", "epic", "rare", "common"];
    let index = 0;
    expect(drawPack(5, () => drawn[index++])).toEqual(["legendary", "common", "epic", "rare", "common"]);
  });
  it("recognizes only the complete requested sequence", () => {
    expect("theroosternannypack".split("").reduce(advanceSequence, "")).toBe(ADMIN_SEQUENCE);
    expect("theroosternannypac".split("").reduce(advanceSequence, "")).not.toBe(ADMIN_SEQUENCE);
    expect("unrelatedtyping".split("").reduce(advanceSequence, "")).not.toBe(ADMIN_SEQUENCE);
  });
});