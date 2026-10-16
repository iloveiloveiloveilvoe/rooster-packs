import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cluck Packs — Rip Chicken Trading Card Packs" },
      { name: "description", content: "Rip open booster packs of chicken trading cards and collect every rare hen." },
      { property: "og:title", content: "Cluck Packs — Chicken TCG Pack Rip" },
      { property: "og:description", content: "Rip packs, pull legendary chickens, build your coop collection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Rarity = "common" | "rare" | "epic" | "legendary";
type Card = { id: number; name: string; emoji: string; type: string; hp: number; move: string; rarity: Rarity };

const CARDS: Card[] = [
  { id: 1, name: "Barnyard Hen", emoji: "🐔", type: "Farm", hp: 40, move: "Peck — 10", rarity: "common" },
  { id: 2, name: "Little Chick", emoji: "🐤", type: "Farm", hp: 20, move: "Cheep — 5", rarity: "common" },
  { id: 3, name: "Hatchling", emoji: "🐣", type: "Egg", hp: 15, move: "Crack Out — 8", rarity: "common" },
  { id: 4, name: "Egg", emoji: "🥚", type: "Egg", hp: 10, move: "Wobble — 0", rarity: "common" },
  { id: 5, name: "Corn Scratcher", emoji: "🌽", type: "Farm", hp: 35, move: "Scratch — 15", rarity: "common" },
  { id: 6, name: "Rooster Rex", emoji: "🐓", type: "Dawn", hp: 70, move: "Wake-Up Crow — 30", rarity: "rare" },
  { id: 7, name: "Silkie Puff", emoji: "☁️", type: "Fluff", hp: 60, move: "Fluff Bomb — 25", rarity: "rare" },
  { id: 8, name: "Fried Fury", emoji: "🍗", type: "Fire", hp: 65, move: "Deep Fry — 35", rarity: "rare" },
  { id: 9, name: "Turkey Titan", emoji: "🦃", type: "Feast", hp: 90, move: "Gobble — 45", rarity: "epic" },
  { id: 10, name: "Thunder Cockatrice", emoji: "⚡", type: "Storm", hp: 100, move: "Bolt Peck — 60", rarity: "epic" },
  { id: 11, name: "Golden Egg Layer", emoji: "🌟", type: "Mythic", hp: 150, move: "Midas Lay — 99", rarity: "legendary" },
  { id: 12, name: "Phoenix Cluck", emoji: "🔥", type: "Mythic", hp: 180, move: "Rebirth Blaze — 120", rarity: "legendary" },
];

function roll(): Card {
  const r = Math.random();
  const rar: Rarity = r < 0.03 ? "legendary" : r < 0.13 ? "epic" : r < 0.38 ? "rare" : "common";
  const pool = CARDS.filter((c) => c.rarity === rar);
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function Index() {
  const [pack, setPack] = useState<Card[] | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [ripping, setRipping] = useState(false);
  const [owned, setOwned] = useState<Record<number, number>>({});
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    const s = localStorage.getItem("cluck");
    if (s) { const d = JSON.parse(s); setOwned(d.owned || {}); setOpened(d.opened || 0); }
  }, []);
  useEffect(() => { localStorage.setItem("cluck", JSON.stringify({ owned, opened })); }, [owned, opened]);

  const rip = () => {
    setRipping(true);
    setTimeout(() => {
      const cards = Array.from({ length: 5 }, roll).sort((a, b) => order(a) - order(b));
      setPack(cards); setRevealed(0); setRipping(false); setOpened((o) => o + 1);
      setOwned((o) => { const n = { ...o }; cards.forEach((c) => (n[c.id] = (n[c.id] || 0) + 1)); return n; });
    }, 700);
  };

  const done = pack && revealed >= pack.length;
  const count = Object.keys(owned).length;

  return (
    <main className="min-h-screen px-4 py-8 farm-bg">
      <header className="text-center mb-8">
        <h1 className="font-display text-5xl md:text-7xl text-primary drop-shadow-title">Cluck Packs</h1>
        <p className="mt-2 text-muted-foreground font-bold">Packs opened: {opened} · Collection {count}/{CARDS.length}</p>
      </header>

      <section className="flex flex-col items-center min-h-[460px]">
        {!pack || done ? (
          <>
            {done && (
              <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-4xl">
                {pack!.map((c, i) => <TCard key={i} c={c} small />)}
              </div>
            )}
            <button onClick={rip} disabled={ripping} className={`pack ${ripping ? "pack-rip" : "pack-idle"}`}>
              <span className="text-6xl">🐔</span>
              <span className="font-display text-2xl mt-2">CLUCK PACK</span>
              <span className="text-xs font-bold opacity-80">5 cards · tap to rip</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => setRevealed((r) => r + 1)} className="card-pop" key={revealed}>
              <TCard c={pack[revealed]!} />
            </button>
            <p className="font-bold text-muted-foreground">Tap card · {revealed + 1}/{pack.length}</p>
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto mt-12">
        <h2 className="font-display text-3xl text-primary mb-4">Your Coop</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CARDS.map((c) => owned[c.id] ? (
            <div key={c.id} className="relative"><TCard c={c} small />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 text-xs font-bold">x{owned[c.id]}</span></div>
          ) : (
            <div key={c.id} className="aspect-[5/7] rounded-xl border-2 border-dashed border-border flex items-center justify-center text-3xl text-muted-foreground">?</div>
          ))}
        </div>
      </section>
    </main>
  );
}

const order = (c: Card) => ["common", "rare", "epic", "legendary"].indexOf(c.rarity);

function TCard({ c, small }: { c: Card; small?: boolean }) {
  return (
    <div className={`tcard r-${c.rarity} ${small ? "w-24 text-[8px]" : "w-64 text-sm"}`}>
      <div className="flex justify-between font-bold"><span className="truncate">{c.name}</span><span>{c.hp}HP</span></div>
      <div className="tcard-art"><span className={small ? "text-3xl" : "text-8xl"}>{c.emoji}</span></div>
      {!small && <div className="text-xs font-bold opacity-80">{c.type} type</div>}
      <div className="tcard-move">{c.move}</div>
      <div className="uppercase font-black tracking-widest text-center">{c.rarity}</div>
    </div>
  );
}
