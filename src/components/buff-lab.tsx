import { useState, type ReactNode } from "react";
import { Layers, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { buffRecipe, type Buff, type BuffKind, type Rarity } from "@/lib/combine-rules";

type Chicken = { id: number; name: string; rarity: Rarity };
export function BuffLab({ cards, owned, onCraft, renderCard }: {
  cards: Chicken[]; owned: Record<number, number>;
  onCraft: (selection: Record<number, number>, kind: BuffKind) => void;
  renderCard: (id: number) => ReactNode;
}) {
  const [kind, setKind] = useState<BuffKind>("cards");
  const [selection, setSelection] = useState<Record<number, number>>({});
  const available = cards.filter(c => (owned[c.id] ?? 0) > 0);
  const ingredients = available.map(c => ({ ...c, count: Math.min(selection[c.id] ?? 0, owned[c.id] ?? 0) }));
  const recipe = buffRecipe(ingredients);
  return <div className="mt-6">
    <div className="flex justify-center gap-2" role="group" aria-label="Buff type">
      <Button variant={kind === "cards" ? "default" : "outline"} onClick={() => setKind("cards")} aria-pressed={kind === "cards"}><Layers />Extra cards</Button>
      <Button variant={kind === "sell" ? "default" : "outline"} onClick={() => setKind("sell")} aria-pressed={kind === "sell"}><Coins />Sell bonus</Button>
    </div>
    <div className="my-6 border-y-2 border-border py-5 text-center">
      <p className="font-display text-2xl">{recipe.multiplier.toFixed(2)}× {kind === "cards" ? "cards per pack" : "sell value"}</p>
      <p className="font-bold text-muted-foreground">{recipe.count} chickens · {Math.round(recipe.durationMs / 60000)} minutes</p>
      <p className="my-2 text-sm text-muted-foreground">At least 3 copies from 2 different chickens · Selected copies are consumed</p>
      <Button disabled={!recipe.valid} onClick={() => {
        if (!window.confirm(`Consume ${recipe.count} chickens for a ${recipe.multiplier.toFixed(2)}× ${kind === "cards" ? "extra-card" : "sell"} buff lasting ${Math.round(recipe.durationMs / 60000)} minutes? This replaces your existing buff of this type.`)) return;
        onCraft(Object.fromEntries(ingredients.filter(c => c.count > 0).map(c => [c.id, c.count])), kind);
        setSelection({});
      }}><Sparkles />Craft buff</Button>
    </div>
    {available.length === 0 ? <p className="text-center font-bold text-muted-foreground">No chickens to sacrifice yet.</p> : <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {ingredients.map(c => <div key={c.id} className="min-w-0">
        {renderCard(c.id)}
        <div className="py-4">
          <label className="mb-3 block text-xs font-bold" id={`buff-label-${c.id}`}>{c.name}: {c.count}/{owned[c.id]}</label>
          <Slider aria-labelledby={`buff-label-${c.id}`} aria-label={`${c.name} copies`} min={0} max={owned[c.id] ?? 0} step={1} value={[c.count]} onValueChange={([count]) => setSelection(s => ({ ...s, [c.id]: count ?? 0 }))} />
        </div>
      </div>)}
    </div>}
  </div>;
}

export function ActiveBuffs({ buffs, now }: { buffs: Buff[]; now: number }) {
  const active = buffs.filter(b => b.expiresAt > now);
  if (!active.length) return null;
  return <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-3" aria-label="Active buffs">
    {active.map(b => <div key={b.kind} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold">
      {b.kind === "cards" ? <Layers className="size-4" /> : <Coins className="size-4" />}
      <span>{b.multiplier.toFixed(2)}× {b.kind === "cards" ? "cards" : "sell"} · {Math.floor((b.expiresAt-now)/60000)}:{String(Math.floor((b.expiresAt-now)%60000/1000)).padStart(2,"0")}</span>
    </div>)}
  </div>;
}