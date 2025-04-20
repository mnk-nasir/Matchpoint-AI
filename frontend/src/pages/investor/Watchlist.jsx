import React, { useEffect, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import { GlassCard } from "../../components/ui/GlassCard";
import { watchlist } from "../../services/watchlist";

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const list = await watchlist.load();
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const remove = async (startupId) => {
    await watchlist.remove(startupId);
    setItems((prev) => prev.filter((w) => w.startup !== startupId));
  };

  const clear = async () => {
    // Remove all one by one
    const ids = items.map((w) => w.startup);
    await Promise.all(ids.map((id) => watchlist.remove(id)));
    setItems([]);
  };

  if (loading) return <div className="p-6 text-white/60 text-sm">Loading watchlist…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Watchlist</h2>
      {items.length === 0 ? (
        <EmptyState title="Watchlist" message="You haven't saved any startups yet." />
      ) : (
        <>
          <div className="flex justify-end">
            <button onClick={clear} className="text-xs underline text-white/60 hover:text-white">Clear all</button>
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-white/70">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Industry</th>
                  <th className="text-left p-3">Funding Ask</th>
                  <th className="text-left p-3">Risk Score</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s, i) => (
                  <tr key={s.id || i} className="border-t border-white/10">
                    <td className="p-3">{s.startup_name || "—"}</td>
                    <td className="p-3">{s.startup_industry || "—"}</td>
                    <td className="p-3">{s.startup_funding_ask ? `$${s.startup_funding_ask}` : "—"}</td>
                    <td className="p-3">{s.startup_risk_score ?? "—"}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => remove(s.startup)}
                        className="text-xs rounded-lg px-3 py-1 border border-white/15 text-white/80 hover:bg-white/10"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </>
      )}
    </div>
  );
}
