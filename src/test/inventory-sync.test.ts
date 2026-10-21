import { describe, expect, it } from "vitest";
import { inventoryDelta } from "@/lib/inventory-sync";

describe("gift-safe inventory saves", () => {
  it("sends only gameplay changes so a server gift of any chicken survives", () => {
    const delta = inventoryDelta({ 1: 2 }, { 1: 1, 28: 1 });
    const server = { 1: 2, 28: 0, 31: 1 };
    const merged = { ...server };
    for (const [id, amount] of Object.entries(delta)) merged[Number(id) as keyof typeof merged] += amount;
    expect(merged).toEqual({ 1: 1, 28: 1, 31: 1 });
    expect(delta).toEqual({ 1: -1, 28: 1 });
  });
});