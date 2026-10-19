import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminPanel, Leaderboard, usePlayerAccess } from "@/components/player-panels";
import { FREE_PACK, drawPack } from "@/lib/pack-rules";
import { BREED_IMAGES } from "@/assets/breeds";

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

type Rarity = "common" | "rare" | "epic" | "legendary" | "ultra";
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
  { id: 13, name: "Barred Rock", emoji: "🐔", type: "Friendly", hp: 45, move: "Stripe Strike — 15", rarity: "common" },
  { id: 14, name: "Orpington", emoji: "🐤", type: "Friendly", hp: 50, move: "Buff Hug — 12", rarity: "common" },
  { id: 15, name: "Australorp", emoji: "🐦‍⬛", type: "Friendly", hp: 45, move: "Shadow Peck — 15", rarity: "common" },
  { id: 16, name: "Speckled Sussex", emoji: "🐔", type: "Friendly", hp: 40, move: "Speckle Spray — 14", rarity: "common" },
  { id: 17, name: "Welsummer", emoji: "🟤", type: "Egg", hp: 40, move: "Freckle Egg — 12", rarity: "common" },
  { id: 18, name: "Cochin", emoji: "🪶", type: "Fluff", hp: 65, move: "Feather Boots — 25", rarity: "rare" },
  { id: 19, name: "Faverolles", emoji: "🧔", type: "Friendly", hp: 60, move: "Beard Bash — 22", rarity: "rare" },
  { id: 20, name: "Silkie", emoji: "☁️", type: "Fluff", hp: 55, move: "Cotton Cloud — 20", rarity: "rare" },
  { id: 21, name: "Easter Egger", emoji: "🌈", type: "Egg", hp: 60, move: "Rainbow Lay — 28", rarity: "rare" },
  { id: 22, name: "Olive Egger", emoji: "🫒", type: "Egg", hp: 60, move: "Olive Toss — 26", rarity: "rare" },
  { id: 23, name: "Marans", emoji: "🍫", type: "Egg", hp: 85, move: "Chocolate Egg — 40", rarity: "epic" },
  { id: 24, name: "Ameraucana", emoji: "💙", type: "Egg", hp: 85, move: "Blue Shell — 42", rarity: "epic" },
  { id: 25, name: "Araucana", emoji: "🩵", type: "Egg", hp: 90, move: "Tufted Fury — 48", rarity: "epic" },
  { id: 26, name: "Cream Legbar", emoji: "🥚", type: "Mythic", hp: 140, move: "Sky Egg Storm — 90", rarity: "legendary" },
  { id: 27, name: "Isbar", emoji: "✨", type: "Mythic", hp: 160, move: "Splash Nova — 110", rarity: "legendary" },
  { id: 28, name: "Cheeky Boy", emoji: "👶", type: "Ultra", hp: 999, move: "Cheek Puff — 500", rarity: "ultra" },
];

const SELL: Record<Rarity, number> = { common: 10, rare: 30, epic: 75, legendary: 250, ultra: 1000 };
const NEXT: Partial<Record<Rarity, Rarity>> = { common: "rare", rare: "epic", epic: "legendary", legendary: "ultra" };

type PackType = { id: string; name: string; emoji: string; cost: number; cards: number; odds: [number, number, number]; blurb: string };
// odds = [legendary, epic, rare] cumulative thresholds; rest is common
const PACKS: PackType[] = [
  FREE_PACK,
  { id: "cluck", name: "Cluck Pack", emoji: "🐔", cost: 50, cards: 5, odds: [0.03, 0.13, 0.38], blurb: "The classic. 5 cards." },
  { id: "golden", name: "Golden Pack", emoji: "🌟", cost: 120, cards: 5, odds: [0.08, 0.28, 0.6], blurb: "Better odds for shiny pulls." },
  { id: "mega", name: "Mega Coop Pack", emoji: "🏆", cost: 250, cards: 10, odds: [0.1, 0.35, 0.7], blurb: "10 cards, fat odds, big coop energy." },
];

function roll(odds: [number, number, number]): Card {
  const r = Math.random();
  const rar: Rarity = Math.random() < 0.005 ? "ultra" : r < odds[0] ? "legendary" : r < odds[1] ? "epic" : r < odds[2] ? "rare" : "common";
  const pool = CARDS.filter((c) => c.rarity === rar);
  const card = pool[Math.floor(Math.random() * pool.length)];
  if (!card) throw new Error("No cards in rarity pool");
  return card;
}

const toEmail = (name: string) => `${name.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "")}@cluckpacks.app`;

function AuthForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async (mode: "in" | "up") => {
    setErr("");
    const clean = name.trim();
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(clean)) return setErr("Name: 3-20 letters, numbers, _ . -");
    if (pw.length < 6) return setErr("Password must be at least 6 characters");
    setBusy(true);
    const email = toEmail(clean);
    const { error } = mode === "up"
      ? await supabase.auth.signUp({ email, password: pw, options: { data: { username: clean } } })
      : await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(mode === "up" && /registered/i.test(error.message) ? "That name is taken" : mode === "in" ? "Wrong name or password" : error.message);
    else onDone?.();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-36 rounded-xl border-2 border-border bg-background/70 px-4 py-2 font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30" />
        <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Password" className="w-36 rounded-xl border-2 border-border bg-background/70 px-4 py-2 font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30" />
        <Button variant="ghost" disabled={busy} onClick={() => go("in")} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">Log in</Button>
        <Button variant="ghost" disabled={busy} onClick={() => go("up")} className="rounded-full border-2 border-primary px-5 py-2 font-bold text-primary transition-transform hover:scale-105 active:scale-95">Sign up</Button>
      </div>
      <p className="text-xs text-muted-foreground">{err || "Log in to save your chickens to your account"}</p>
    </div>
  );
}

function TitlePage({ loading }: { loading?: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden farm-bg flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="sunburst" aria-hidden />
      <div className="sun-disc" aria-hidden />
      <div className="cloud h-6 w-24" style={{ top: "16%", left: "-12%", animationDuration: "45s" }} aria-hidden />
      <div className="cloud h-8 w-32" style={{ top: "34%", left: "-25%", animationDuration: "70s", animationDelay: "-25s" }} aria-hidden />
      <span className="feather text-2xl" style={{ left: "12%", animationDuration: "9s" }} aria-hidden>🪶</span>
      <span className="feather text-xl" style={{ left: "82%", animationDuration: "13s", animationDelay: "-5s" }} aria-hidden>🪶</span>
      <span className="feather text-2xl" style={{ left: "45%", animationDuration: "11s", animationDelay: "-7s" }} aria-hidden>🌾</span>
      <div className="text-8xl drop-shadow-title" style={{ animation: "bob 3s ease-in-out infinite" }}>🐔</div>
      <h1 className="font-display mt-3 text-5xl md:text-7xl golden-title">Welcome to the coop</h1>
      <p className="mt-4 max-w-md text-lg font-bold text-foreground/80">
        Stay at the bottom and be a chickadee, or ride to the top to become an alpha rooster
      </p>
      <div className="relative mt-8 w-full max-w-sm rounded-2xl border-2 border-border bg-card/90 p-6 shadow-2xl backdrop-blur">
        {loading ? <p className="font-bold text-muted-foreground">waking the flock…</p> : <AuthForm />}
      </div>
    </main>
  );
}

type Tab = "shop" | "rip" | "coop" | "leaderboard";

export function Index() {
  const [tab, setTab] = useState<Tab>("shop");
  const [pack, setPack] = useState<{ cards: Card[]; type: PackType } | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [ripping, setRipping] = useState(false);
  const [owned, setOwned] = useState<Record<number, number>>({});
  const [opened, setOpened] = useState(0);
  const [coins, setCoins] = useState(100);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState("");
  const signedOut = loaded && !user;
  const access = usePlayerAccess(user?.id);
  useEffect(() => {
    if (user && access.data && !access.data.active) {
      setPack(null);
      setToast(access.data.banned ? "Your account has been banned." : "You were kicked. Log in again to return.");
      void supabase.auth.signOut();
    }
  }, [user, access.data]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setLoaded(false);
    if (!user) {
      const s = localStorage.getItem("cluck");
      const d = s ? JSON.parse(s) : {};
      setOwned(d.owned || {}); setOpened(d.opened || 0); setCoins(d.coins ?? 100); setUsername(""); setLoaded(true);
      return;
    }
    supabase.from("profiles").select("username, owned, opened, coins").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setOwned((data.owned as Record<number, number>) || {}); setOpened(data.opened); setCoins(data.coins); setUsername(data.username); }
      setLoaded(true);
    });
  }, [user]);

  useEffect(() => {
    if (!loaded || (user && !access.data?.active)) return;
    if (user) supabase.from("profiles").update({ owned, opened, coins, updated_at: new Date().toISOString() }).eq("id", user.id).then();
    else localStorage.setItem("cluck", JSON.stringify({ owned, opened, coins }));
  }, [owned, opened, coins, loaded, user, access.data?.active]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const buy = (p: PackType) => {
    if (ripping || !user || !access.data?.active) return;
    if (coins < p.cost) return setToast("Not enough coins — sell some cards!");
    setCoins((c) => c - p.cost);
    setRipping(true);
    setTab("rip");
    setPack(null);
    setTimeout(() => {
      const cards = drawPack(p.cards, () => roll(p.odds));
      setPack({ cards, type: p }); setRevealed(0); setRipping(false); setOpened((o) => o + 1);
      setOwned((o) => { const n = { ...o }; cards.forEach((c) => (n[c.id] = (n[c.id] || 0) + 1)); return n; });
    }, 700);
  };

  const combine = (c: Card) => {
    const next = NEXT[c.rarity];
    if (!next || (owned[c.id] ?? 0) < 3) return;
    const pool = CARDS.filter((x) => x.rarity === next);
    const got = pool[Math.floor(Math.random() * pool.length)];
    if (!got) return;
    setOwned((o) => { const n = { ...o }; n[c.id] = (n[c.id] ?? 0) - 3; if (n[c.id]! <= 0) delete n[c.id]; n[got.id] = (n[got.id] || 0) + 1; return n; });
    setToast(`Combined 3 ${c.name} into ${got.name}! ✨`);
  };

  const sell = (c: Card) => {
    if (!owned[c.id]) return;
    setOwned((o) => { const n = { ...o }; n[c.id] = (n[c.id] ?? 1) - 1; if (!n[c.id]) delete n[c.id]; return n; });
    setCoins((v) => v + SELL[c.rarity]);
    setToast(`Sold ${c.name} for ${SELL[c.rarity]} coins 🪙`);
  };

  const done = pack && revealed >= pack.cards.length;
  const count = Object.keys(owned).length;
  if (!loaded) return <TitlePage loading />;
  if (signedOut) return <><TitlePage />{toast && <p role="alert" className="fixed bottom-4 left-4 right-4 bg-card p-3 text-center font-bold text-destructive">{toast}</p>}</>;
  if (user && access.isPending) return <TitlePage loading />;
  if (user && (access.isError || !access.data?.active)) return <main className="farm-bg flex min-h-screen flex-col items-center justify-center gap-4"><p role="alert">{access.data?.banned ? "Your account has been banned." : "Checking your access failed. Please try again."}</p><Button onClick={() => access.refetch()}>Try again</Button><Button variant="outline" onClick={() => supabase.auth.signOut()}>Log out</Button></main>;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 farm-bg">
      {user && <AdminPanel key={user.id} userId={user.id} isAdmin={access.data?.admin ?? false} />}
      <div className="sunburst" aria-hidden />
      <div className="sun-disc" aria-hidden />
      <div className="cloud h-7 w-28" style={{ top: "12%", left: "-15%", animationDuration: "60s" }} aria-hidden />
      <header className="relative text-center mb-6">
        <h1 className="font-display text-5xl md:text-7xl golden-title">Cluck Packs</h1>
        <p className="mt-2 text-muted-foreground font-bold">
          🪙 {coins} coins · Packs opened: {opened} · Collection {count}/{CARDS.length}
        </p>
        {user && (
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            🐔 {username} ·{" "}
            <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="underline">Log out</Button>
          </p>
        )}
        <nav className="mt-4 inline-flex max-w-full flex-wrap justify-center rounded-full border-2 border-border bg-card/80 p-1 shadow-lg backdrop-blur">
          {([["shop", "🛒 Pack Shop"], ["rip", "📦 Rip Zone"], ["coop", "🐔 Your Coop"], ["leaderboard", "🏆 Leaderboard"]] as [Tab, string][]).map(([t, label]) => (
            <Button variant="ghost" key={t} onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-black transition-all ${tab === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </Button>
          ))}
        </nav>
        {toast && <p className="mt-3 inline-block rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground shadow-lg">{toast}</p>}
      </header>

      {tab === "shop" && (
        <section className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl golden-title mb-1 text-center">Pick your pack</h2>
          <p className="mb-6 text-center text-sm font-bold text-muted-foreground">Buy here, then rip in the Rip Zone. Sell cards in Your Coop to earn coins.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mx-auto max-w-6xl">
            {PACKS.map((p) => (
              <div key={p.id} className="flex flex-col items-center rounded-2xl border-2 border-border bg-card/90 p-5 shadow-xl backdrop-blur">
                <button type="button" onClick={() => buy(p)} disabled={ripping} aria-label={`Open ${p.name}`} className={`pack cursor-pointer max-w-full whitespace-normal ${ripping ? "pack-rip" : "pack-idle"}`}>
                  <span className="text-6xl">{p.emoji}</span>
                  <span className="font-display text-xl mt-2">{p.name.toUpperCase()}</span>
                  <span className="text-xs font-bold opacity-80">{p.cards} cards · tap to buy & rip</span>
                </button>
                <p className="mt-3 text-center text-xs font-bold text-muted-foreground">{p.blurb}</p>
                <p className={`mt-1 font-black ${coins >= p.cost ? "text-foreground" : "text-destructive"}`}>{p.cost === 0 ? "FREE" : `🪙 ${p.cost}`}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "rip" && (
        <section className="flex flex-col items-center min-h-[460px]">
          <h2 className="font-display text-3xl golden-title mb-6">Rip Zone</h2>
          {ripping ? (
            <div className="pack pack-rip"><span className="text-6xl">🐔</span><span className="font-display text-2xl mt-2">RIPPING…</span></div>
          ) : !pack ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-7xl" style={{ animation: "bob 3s ease-in-out infinite" }}>📦</div>
              <p className="font-bold text-muted-foreground">Nothing to rip yet — grab a pack from the Pack Shop!</p>
              <Button variant="ghost" onClick={() => setTab("shop")} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">Go to the shop</Button>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-4xl">
                {pack.cards.map((c, i) => <div key={i} className="w-44"><TCard c={c} small /></div>)}
              </div>
              <Button variant="ghost" onClick={() => setTab("shop")} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">Buy another pack</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="font-black text-muted-foreground">{pack.type.name}</p>
              <button type="button" onClick={() => setRevealed((r) => r + 1)} className="card-pop cursor-pointer rounded-none border-0 bg-transparent p-0" key={revealed}>
                {pack.cards[revealed] && <TCard c={pack.cards[revealed]} />}
              </button>
              <p className="font-bold text-muted-foreground">Tap card · {revealed + 1}/{pack.cards.length}</p>
            </div>
          )}
        </section>
      )}

      {tab === "coop" && (
        <section className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl golden-title mb-1">Your Coop</h2>
          <p className="mb-4 text-sm font-bold text-muted-foreground">Tap a card to sell one copy — common 🪙10 · rare 🪙30 · epic 🪙75 · legendary 🪙250 · ultra 🪙1000.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {CARDS.map((c) => owned[c.id] ? (
              <button key={c.id} type="button" onClick={() => sell(c)} title={`Sell for ${SELL[c.rarity]} coins`} className="relative cursor-pointer rounded-none border-0 bg-transparent p-0 transition-transform hover:scale-105 active:scale-95">
                <TCard c={c} small />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full px-2 text-xs font-bold">x{owned[c.id]}</span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-card border border-border px-2 text-[10px] font-black shadow">🪙{SELL[c.rarity]}</span>
              </button>
            ) : (
              <div key={c.id} className="aspect-[5/7] rounded-xl border-2 border-dashed border-border bg-card/40 flex items-center justify-center text-3xl text-muted-foreground shadow-inner">?</div>
            ))}
          </div>
        </section>
      )}

      {tab === "combine" && (
        <section className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl golden-title mb-1">Combine Lab</h2>
          <p className="mb-2 text-center text-sm font-bold text-muted-foreground">Trade in 3 copies of a card for 1 random card of the next rarity.</p>
          <p className="mb-6 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">common → rare → epic → legendary → ultra</p>
          {combos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-7xl" style={{ animation: "bob 3s ease-in-out infinite" }}>⚗️</div>
              <p className="font-bold text-muted-foreground">Nothing to combine yet — rip packs until you hold 3 of the same card.</p>
              <Button variant="ghost" onClick={() => setTab("shop")} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">Go to the shop</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {combos.map((c) => {
                const have = owned[c.id] ?? 0;
                const ready = have >= 3;
                return (
                  <div key={c.id} className="flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card/90 p-5 shadow-xl backdrop-blur">
                    <TCard c={c} small />
                    <p className="text-xs font-black text-muted-foreground">{have}/3 copies · makes a random {NEXT[c.rarity]}</p>
                    <Button size="sm" disabled={!ready} onClick={() => combine(c)} className={`rounded-full font-black ${ready ? "bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95" : ""}`}>{ready ? `⚗️ Combine 3 → ${NEXT[c.rarity]}` : `Need ${3 - have} more`}</Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
      {tab === "leaderboard" && user && <Leaderboard userId={user.id} />}
    </main>
  );
}


function TCard({ c, small }: { c: Card; small?: boolean }) {
  return (
    <div className={`tcard r-${c.rarity} ${small ? "w-full text-[11px]" : "w-64 text-sm"}`}>
      <div className="flex justify-between font-bold"><span className="truncate">{c.name}</span><span>{c.hp}HP</span></div>
      <div className="tcard-art overflow-hidden">{BREED_IMAGES[c.id] ? <img src={BREED_IMAGES[c.id]} alt={c.name} className="h-full w-full object-cover" loading="lazy" /> : <span className={small ? "text-6xl" : "text-8xl"}>{c.emoji}</span>}</div>
      {!small && <div className="text-xs font-bold opacity-80">{c.type} type</div>}
      <div className="tcard-move">{c.move}</div>
      <div className="uppercase font-black tracking-widest text-center">{c.rarity}</div>
    </div>
  );
}
