import React, { useEffect, useState } from "react";
import {
  Building2, TrendingUp, Target, ShieldAlert, BrainCircuit,
  Flame, DollarSign, Handshake, ChevronRight, Sparkles
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import StatCard from "../../components/investor/StatCard";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { investorService } from "../../services/investor";
import { watchlist } from "../../services/watchlist";
import { userService } from "../../services/user";
import { useNavigate } from "react-router-dom";

const MomentumBadge = ({ value }) => {
  const colors = {
    High: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Low: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${colors[value] || colors.Medium}`}>
      {value || "Medium"}
    </span>
  );
};

const StartupLogo = ({ logoUrl, name, size = "h-9 w-9" }) => (
  logoUrl ? (
    <img src={logoUrl} alt={name} className={`${size} object-contain rounded-xl bg-white/5 border border-white/10 p-1.5`} />
  ) : (
    <div className={`${size} rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
      <Building2 className="h-4 w-4 text-white/20" />
    </div>
  )
);

export default function InvestorDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [aiOpportunities, setAIOpportunities] = useState([]);
  const [trending, setTrending] = useState([]);
  const [fundingEvents, setFundingEvents] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        try {
          const u = await userService.me();
          setUserId(u?.id || null);
        } catch {
          setUserId(null);
        }
        const [s, r, ai, tr, fe, mm] = await Promise.all([
          investorService.getDashboardStats(),
          investorService.getRecentStartups(5),
          investorService.getAIOpportunities(),
          investorService.getTrendingStartups(6),
          investorService.getRecentFundingEvents(8),
          investorService.getMyMatches(6),
        ]);
        setStats(s || {});
        setRecent(r || []);
        setAIOpportunities(ai || []);
        setTrending(tr || []);
        setFundingEvents(fe || []);
        setMyMatches(mm || []);
      } catch (e) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const loadWatchlist = async () => {
      if (userId) {
        const list = await watchlist.load();
        setSavedIds(new Set(list.map((w) => w.startup)));
      }
    };
    loadWatchlist();
  }, [userId]);

  const toggle = async (row) => {
    if (!row?.id) return;
    const currentlySaved = savedIds.has(row.id);
    const next = new Set(savedIds);
    if (currentlySaved) {
      next.delete(row.id);
      setSavedIds(next);
      await watchlist.remove(row.id);
    } else {
      next.add(row.id);
      setSavedIds(next);
      await watchlist.add(row.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Total Startups","AI Matched","Saved","Meetings"].map(t => (
            <StatCard key={t} title={t} value="…" />
          ))}
        </div>
        <GlassCard className="p-6">
          <div className="text-white/60 text-sm">Loading dashboard…</div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Startups" value={stats?.total_startups ?? "—"} />
        <StatCard title="AI Matched Startups" value={stats?.ai_matched ?? "—"} />
        <StatCard title="Saved Startups" value={savedIds.size} />
        <StatCard title="Meeting Requests" value={stats?.meetings ?? "—"} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      )}

      {/* ─── Section 1: AI Opportunities ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AI Opportunities
            </h3>
          </div>
          <GlowButton variant="secondary" className="text-xs px-3 py-1.5" onClick={() => navigate("/investor/deals")}>
            View All <ChevronRight className="w-3 h-3 ml-1 inline" />
          </GlowButton>
        </div>
        {aiOpportunities.length === 0 ? (
          <GlassCard className="p-6 text-white/50 text-sm text-center">No AI opportunities available yet.</GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {aiOpportunities.slice(0, 3).map((match, i) => (
              <GlassCard key={i} className="p-5 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-colors" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <StartupLogo logoUrl={match.logo_url} name={match.company_name || match.name} />
                      <div>
                        <h4 className="font-semibold text-white truncate max-w-[120px]">{match.company_name || match.name || "Unknown"}</h4>
                        <p className="text-xs text-white/50">{match.industry || "General"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider mb-0.5">Opportunity</span>
                      <div className="px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        {match.opportunity_score ?? "—"}/100
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                        <Target className="w-3 h-3" /> Fit
                      </span>
                      <span className="text-xs font-medium text-emerald-400">{match.investment_fit || "Good"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Stage
                      </span>
                      <span className="text-xs font-medium text-white/90">{match.stage || "N/A"}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Risk Score
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${(match.risk_score ?? 0) <= 30 ? "text-emerald-400" : (match.risk_score ?? 0) <= 60 ? "text-amber-400" : "text-rose-400"}`}>
                          {match.risk_score ?? "—"}/100
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full ${(match.risk_score ?? 0) <= 30 ? "bg-emerald-500" : (match.risk_score ?? 0) <= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${Math.min(100, match.risk_score ?? 0)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 relative z-10 flex flex-col gap-2">
                  <GlowButton className="w-full text-xs py-2" variant="primary" onClick={() => navigate(`/investor/company/${match.id}`)}>
                    View Profile
                  </GlowButton>
                  <GlowButton className={`text-[10px] py-1.5 ${savedIds.has(match.id) ? "border-emerald-500/50 text-emerald-400" : ""}`}
                    variant="secondary" onClick={() => toggle(match)}>
                    {savedIds.has(match.id) ? "✓ Saved" : "Add to Watchlist"}
                  </GlowButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ─── Section 2: Trending Startups ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
              Trending Startups
            </h3>
          </div>
        </div>
        {trending.length === 0 ? (
          <GlassCard className="p-6 text-white/50 text-sm text-center">No trending data available yet.</GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((s, i) => (
              <GlassCard key={i} className="p-4 flex items-center gap-4 hover:border-orange-500/20 transition-colors group cursor-pointer"
                onClick={() => navigate(`/investor/company/${s.id}`)}>
                <StartupLogo logoUrl={s.logo_url} name={s.company_name} size="h-10 w-10" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate">{s.company_name}</span>
                    <MomentumBadge value={s.market_momentum} />
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{s.industry || s.stage || "General"}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-indigo-300">Score: <strong>{s.opportunity_score}</strong></span>
                    {s.news_count > 0 && (
                      <span className="text-[10px] text-orange-300">{s.news_count} news</span>
                    )}
                    {s.mentions > 0 && (
                      <span className="text-[10px] text-purple-300">{s.mentions} mentions</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ─── Section 3: Recent Funding Events ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Recent Funding Events
            </h3>
          </div>
        </div>
        <GlassCard className="p-0 overflow-hidden">
          {fundingEvents.length === 0 ? (
            <div className="p-6 text-white/50 text-sm text-center">No funding events tracked yet. The Data Enrichment Engine will populate this as it ingests news.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-white/60">
                <tr>
                  <th className="text-left p-3 pl-5">Company</th>
                  <th className="text-left p-3">Round</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Industry</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {fundingEvents.map((ev, i) => (
                  <tr key={i} className="border-t border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 pl-5 font-medium text-white">{ev.company_name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-xs border border-emerald-500/25">
                        {ev.round_name || "Unknown"}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400 font-semibold">
                      {ev.amount ? `${ev.currency} ${(ev.amount / 1_000_000).toFixed(1)}M` : "Undisclosed"}
                    </td>
                    <td className="p-3 text-white/60">{ev.industry || "—"}</td>
                    <td className="p-3 text-white/50 text-xs">
                      {ev.announced_on ? new Date(ev.announced_on).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      </section>

      {/* ─── Section 4: Investor Matches ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Your Recommended Matches
            </h3>
          </div>
        </div>
        {myMatches.length === 0 ? (
          <GlassCard className="p-6 text-white/50 text-sm text-center">
            No matches found yet. Matches are computed by the AI Match Engine based on your investor profile preferences.
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myMatches.map((m, i) => (
              <GlassCard key={i} className="p-5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StartupLogo logoUrl={m.logo_url} name={m.company_name} />
                      <div>
                        <h4 className="font-semibold text-white text-sm">{m.company_name}</h4>
                        <p className="text-xs text-white/50">{m.industry || m.stage || "General"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider mb-0.5">Match</span>
                      <div className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-sm">
                        {m.match_score}%
                      </div>
                    </div>
                  </div>
                  {m.rationale && (
                    <p className="text-xs text-white/50 italic mb-3 line-clamp-2">"{m.rationale}"</p>
                  )}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <div className="flex-1 text-center">
                      <div className="text-[10px] text-white/40 uppercase">Opportunity</div>
                      <div className="text-sm font-bold text-indigo-400">{m.opportunity_score}/100</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex-1 text-center">
                      <div className="text-[10px] text-white/40 uppercase">Risk</div>
                      <div className={`text-sm font-bold ${(m.risk_score ?? 50) <= 30 ? "text-emerald-400" : (m.risk_score ?? 50) <= 60 ? "text-amber-400" : "text-rose-400"}`}>
                        {m.risk_score}/100
                      </div>
                    </div>
                  </div>
                  <GlowButton className="w-full text-xs py-2 mt-3" variant="primary"
                    onClick={() => navigate(`/investor/company/${m.id}`)}>
                    View Startup
                  </GlowButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ─── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="text-sm font-semibold text-white/80 mb-3">Sector Distribution</div>
          <div className="flex items-center gap-6">
            <div className="relative w-40 h-40 flex-shrink-0">
              {stats?.sectors && stats.sectors.length > 0 ? (
                <PieChart width={160} height={160}>
                  <Pie data={stats.sectors} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="count" nameKey="name" stroke="none">
                    {stats.sectors.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1','#a855f7','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6'][index % 7]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60">No data</div>
                </>
              )}
            </div>
            <div className="text-xs text-white/70 space-y-2 flex-1 ml-2">
              {(stats?.sectors || []).slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: ['#6366f1','#a855f7','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6'][i % 7] }} />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <span className="text-white/80 font-bold ml-2">{s.count}</span>
                </div>
              ))}
              {!stats?.sectors && <div className="text-white/60">No data</div>}
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="text-sm font-semibold text-white/80 mb-3">Risk Distribution</div>
          <div className="space-y-2">
            {(stats?.risk_buckets || []).slice(0, 6).map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>{r.label}</span><span>{r.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(100, r.percent || 0)}%` }} />
                </div>
              </div>
            ))}
            {!stats?.risk_buckets && <div className="text-white/60 text-sm">No data</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
