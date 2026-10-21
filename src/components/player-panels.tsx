import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, X, RefreshCw, LogOut, Ban, Check, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ADMIN_SEQUENCE, advanceSequence } from "@/lib/pack-rules";

export function usePlayerAccess(userId?: string) {
  return useQuery({
    queryKey: ["game-access", userId], enabled: Boolean(userId), refetchInterval: 3000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("game_access");
      if (error) throw error;
      return data as { active: boolean; banned: boolean; admin: boolean };
    },
  });
}

export function Leaderboard({ userId }: { userId: string }) {
  const players = useQuery({
    queryKey: ["leaderboard", userId], refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("coins_leaderboard");
      if (error) throw error;
      return data;
    },
  });
  return <section className="relative mx-auto max-w-3xl">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="font-display text-3xl golden-title">Flock Leaderboard</h2>
      <Button variant="outline" size="icon" aria-label="Refresh leaderboard" title="Refresh leaderboard" onClick={() => players.refetch()}><RefreshCw /></Button>
    </div>
    {players.isPending ? <p>Gathering the flock…</p> : players.isError ? <p role="alert">Couldn’t load players. Please try again.</p> : <div className="overflow-x-auto">
      <table className="w-full text-left"><thead><tr className="border-b-2 border-border text-muted-foreground"><th className="p-3">Rank</th><th className="p-3">Player</th><th className="p-3 text-right">Coins</th></tr></thead>
        <tbody>{players.data?.map((p, i) => <tr key={p.username} className="border-b border-border bg-card/60 font-bold"><td className="p-3">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td><td className="p-3 break-all">{p.username}</td><td className="p-3 text-right tabular-nums">🪙 {p.coins.toLocaleString()}</td></tr>)}</tbody>
      </table>
    </div>}
  </section>;
}

export function AdminPanel({ userId, isAdmin, cards, onGift }: { userId: string; isAdmin: boolean; cards: { id: number; name: string; rarity: string }[]; onGift: (target: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  useEffect(() => {
    let typed = "";
    const listener = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      typed = advanceSequence(typed, e.key);
      if (typed === ADMIN_SEQUENCE && isAdmin) { setVisible(true); setOpen(true); typed = ""; }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [isAdmin]);
  const players = useQuery({
    queryKey: ["admin-players", userId], enabled: isAdmin && open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_players");
      if (error) throw error;
      return data;
    },
  });
  const moderate = async (id: string, name: string, action: "kick" | "ban" | "unban") => {
    if (!window.confirm(`${action === "unban" ? "Unban" : action === "ban" ? "Ban" : "Kick"} ${name}?`)) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.rpc("moderate_player", { target: id, action });
    setMessage(error ? "Action failed. Please try again." : `${name} ${action === "kick" ? "kicked" : action === "ban" ? "banned" : "unbanned"}.`);
    setBusy(false);
    await queryClient.invalidateQueries({ queryKey: ["admin-players", userId] });
  };
  const gift = async (id: string, name: string) => {
    const card = cards.find(c => String(c.id) === selected[id]);
    if (!card || busy) return;
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.rpc("admin_gift_chicken", { target: id, chicken_id: card.id });
      if (error) throw error;
      setMessage(`Gave ${name} one ${card.name}.`);
      onGift(id);
    } catch {
      setMessage("Gift failed. Please try again.");
    } finally { setBusy(false); }
  };
  if (!visible || !isAdmin) return null;
  return <>
    <Button className="fixed left-3 top-3 z-30" size="icon" aria-label="Open admin panel" title="Admin panel" onClick={() => setOpen(true)}><Shield /></Button>
    {open && <div className="fixed inset-0 z-40 bg-background/80" onClick={() => setOpen(false)}>
      <aside role="dialog" aria-modal="true" aria-labelledby="admin-heading" className="absolute left-0 top-0 h-full w-full max-w-md overflow-y-auto border-r-2 border-border bg-card p-5 shadow-xl" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") setOpen(false); }}>
        <div className="flex items-center justify-between"><h2 id="admin-heading" className="font-display text-2xl">Coop Admin</h2><Button variant="ghost" size="icon" aria-label="Close admin panel" onClick={() => setOpen(false)}><X /></Button></div>
        <input aria-label="Find player" placeholder="Find player…" value={search} onChange={e => setSearch(e.target.value)} className="my-4 w-full rounded-md border border-border bg-background p-3" />
        <p role="status" className="mb-3 text-sm">{message}</p>
        {players.isPending ? <p>Loading players…</p> : players.isError ? <p role="alert">Couldn’t load players.</p> : players.data?.filter(p => p.username.toLowerCase().includes(search.toLowerCase())).map(p => <div key={p.id} className="border-b border-border py-3">
          <div className="flex items-center justify-between gap-2">
          <div className="min-w-0"><p className="break-all font-bold">{p.username}{p.id === userId ? " (you)" : ""}</p><p className="text-xs text-muted-foreground">🪙 {p.coins} {p.banned ? "· Banned" : ""}</p></div>
          {p.id !== userId && <div className="flex shrink-0 gap-1"><Button variant="outline" size="icon" disabled={busy || p.banned} title={`Kick ${p.username}`} aria-label={`Kick ${p.username}`} onClick={() => moderate(p.id, p.username, "kick")}><LogOut /></Button><Button variant={p.banned ? "outline" : "destructive"} size="icon" disabled={busy} title={`${p.banned ? "Unban" : "Ban"} ${p.username}`} aria-label={`${p.banned ? "Unban" : "Ban"} ${p.username}`} onClick={() => moderate(p.id, p.username, p.banned ? "unban" : "ban")}>{p.banned ? <Check /> : <Ban />}</Button></div>}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <select aria-label={`Chicken for ${p.username}`} value={selected[p.id] ?? ""} onChange={e => setSelected(s => ({ ...s, [p.id]: e.target.value }))} disabled={busy} className="min-w-0 flex-1 rounded-md border border-border bg-background p-2 text-sm">
              <option value="">Choose chicken…</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.name} · {c.rarity}</option>)}
            </select>
            <Button size="icon" disabled={busy || !selected[p.id]} aria-label={`Give chicken to ${p.username}`} title={`Give chicken to ${p.username}`} onClick={() => gift(p.id, p.username)}><Gift /></Button>
          </div>
        </div>)}
      </aside>
    </div>}
  </>;
}