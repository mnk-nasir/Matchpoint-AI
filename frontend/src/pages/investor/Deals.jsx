import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { investorService } from "../../services/investor";
import { watchlist } from "../../services/watchlist";
import { userService } from "../../services/user";
import CompanyProfileModal from "../../components/investor/CompanyProfileModal";

export default function DealsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [userId, setUserId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    userService.me().then((u) => setUserId(u?.id || null)).catch(() => setUserId(null));
    investorService
      .getRecentStartups(20)
      .then((data) => {
        if (!active) return;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e?.message || "Failed to load deals"))
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const loadWatchlist = async () => {
      const list = await watchlist.load();
      setSavedIds(new Set(list.map((w) => w.startup)));
    };
    loadWatchlist();
  }, [userId]);

  const toggle = async (row) => {
    if (!row?.id) return;
    const isSaved = savedIds.has(row.id);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(row.id);
      setSavedIds(next);
      await watchlist.remove(row.id);
    } else {
      next.add(row.id);
      setSavedIds(next);
      await watchlist.add(row.id);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Deals</h2>
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-white/60 text-sm">Loading deals…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-white/60 text-sm">No deals available.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-white/70">
              <tr>
                <th className="text-left p-3 w-12">Logo</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Industry</th>
                <th className="text-left p-3">Funding Ask</th>
                <th className="text-left p-3">Risk Score</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={i} className="border-t border-white/10 hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    {s.logo_url ? (
                      <img 
                        src={s.logo_url} 
                        alt={s.name} 
                        className="h-8 w-8 object-contain rounded-lg bg-white/5 border border-white/10 p-1"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white/20" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium text-white">{s.name || "—"}</td>
                  <td className="p-3 text-white/60">{s.industry || "—"}</td>
                  <td className="p-3 text-white/60">{s.funding_ask ? `$${s.funding_ask}` : "—"}</td>
                  <td className="p-3">
                    <span className={`font-semibold ${
                      s.risk_score >= 150 ? "text-emerald-400" : 
                      s.risk_score >= 80 ? "text-amber-400" : 
                      "text-red-400"
                    }`}>
                      {s.risk_score ?? "—"}/200
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDetailId(s.id)}
                        className="text-xs rounded-lg px-3 py-1.5 border border-white/15 text-white/80 hover:bg-white/10 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => toggle(s)}
                        className={`text-xs rounded-lg px-3 py-1.5 border transition-all duration-300 ${
                          savedIds.has(s.id)
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "border-white/15 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {savedIds.has(s.id) ? "Unselect" : "Select Profile"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
      {detailId && <CompanyProfileModal id={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
}
