import { isStandardCard } from "./ooh-la-la";

export type Rarity = "common" | "rare" | "epic" | "legendary" | "ultra" | "mythic";
export const NEXT: Partial<Record<Rarity, Rarity>> = { common: "rare", rare: "epic", epic: "legendary", legendary: "ultra" };
export const COMBINE_COST: Record<Rarity, number> = { common: 3, rare: 8, epic: 15, legendary: 30, ultra: 0, mythic: 0 };
export function combinePool<T extends { id: number; rarity: Rarity }>(cards: T[], rarity: Rarity): T[] {
  const next = NEXT[rarity];
  return cards.filter((c) => next === "ultra" ? c.id === 28 : !!next && c.rarity === next && isStandardCard(c));
}
export type BuffKind = "cards" | "sell";
export type Buff = { kind: BuffKind; multiplier: number; expiresAt: number };
export type Ingredient = { id: number; rarity: Rarity; count: number };
const POWER: Record<Rarity, number> = { common: 1, rare: 3, epic: 6, legendary: 12, ultra: 24, mythic: 48 };
export function buffRecipe(ingredients: Ingredient[]) {
  const count = ingredients.reduce((sum, c) => sum + c.count, 0);
  const power = ingredients.reduce((sum, c) => sum + c.count * POWER[c.rarity], 0);
  const valid = new Set(ingredients.filter((c) => c.count > 0).map((c) => c.id)).size >= 2 && count >= 3 && ingredients.every((c) => Number.isInteger(c.count) && c.count >= 0);
  return { valid, count, durationMs: power * 60_000, multiplier: Math.round((1 + Math.sqrt(power) / 10) * 100) / 100 };
}
export function buffMultiplier(buffs: Buff[], kind: BuffKind, now: number): number {
  return Math.max(1, ...buffs.filter((b) => b.kind === kind && b.expiresAt > now).map((b) => b.multiplier));
}
export function buffedCards(base: number, buffs: Buff[], now: number) {
  return Math.floor(base * buffMultiplier(buffs, "cards", now));
}
export function buffedSell(base: number, buffs: Buff[], now: number) {
  return Math.floor(base * buffMultiplier(buffs, "sell", now));
}
export function parseBuffs(value: unknown): Buff[] {
  if (!Array.isArray(value)) return [];
  return value.filter((b): b is Buff => !!b && typeof b === "object" && (b.kind === "cards" || b.kind === "sell") && Number.isFinite(b.multiplier) && b.multiplier > 1 && Number.isFinite(b.expiresAt));
}