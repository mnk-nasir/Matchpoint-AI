import React, { useEffect, useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { investorService } from "../../services/investor";
import { Building2, TrendingUp, Users, Star, RefreshCw, Search, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CompanyProfileModal from "../../components/investor/CompanyProfileModal";
import AdminStartupEditModal from "../../components/admin/AdminStartupEditModal";
import { adminStartupsService } from "../../services/adminStartups";


function StatCard({ title, value, icon: Icon, color = "indigo" }) {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
    amber:   "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amberald-400",
    rose:    "from-rose-500/20 to-rose-600/10 border-rose-500/20 text-rose-400",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/50 text-sm">{title}</p>
        {Icon && <Icon className="h-5 w-5 opacity-60" />}
      </div>
      <p className="text-3xl font-bold text-white">{value ?? "—"}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [editingStartup, setEditingStartup] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await investorService.getRecentStartups(200);
      setStartups(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminStartupsService.remove(id);
      load();
    } catch (e) {
      alert("Failed to delete startup: " + (e?.message || ""));
    }
  };

  const filtered = startups.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.name || "").toLowerCase().includes(q) ||
      (s.industry || "").toLowerCase().includes(q)
    );
  });

  const highPotential = startups.filter((s) => (s.risk_score || 0) >= 150).length;
  const moderate = startups.filter((s) => (s.risk_score || 0) >= 80 && (s.risk_score || 0) < 150).length;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">All startup submissions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-white/70"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            onClick={() => navigate("/admin/investors")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition text-sm text-indigo-300"
          >
            <Users className="h-4 w-4" /> Manage Investors
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Startups" value={startups.length} icon={Building2} color="indigo" />
        <StatCard title="High Potential" value={highPotential} icon={Star} color="emerald" />
        <StatCard title="Moderate Risk" value={moderate} icon={TrendingUp} color="amber" />
        <StatCard title="High Risk" value={startups.length - highPotential - moderate} icon={Users} color="rose" />
      </div>

      {/* Startup Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-base font-semibold">Startup List</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search name or industry…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition w-64"
            />
          </div>
        </div>
        {loading ? (
          <div className="p-6 text-white/50 text-sm">Loading startups…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-white/50 text-sm">No startups found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-white/60">
                <tr>
                  <th className="text-left p-3 w-12">Logo</th>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Company</th>
                  <th className="text-left p-3">Industry</th>
                  <th className="text-left p-3">Funding Ask</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const score = s.risk_score ?? null;
                  const scoreColor =
                    score >= 150 ? "text-emerald-400" :
                    score >= 80  ? "text-amber-400" :
                    "text-rose-400";
                  return (
                    <tr key={s.id || i} className="border-t border-white/10 hover:bg-white/[0.03] transition-colors">
                      <td className="p-3">
                        {s.logo_url ? (
                          <img
                            src={s.logo_url}
                            alt={s.name}
                            className="h-9 w-9 object-contain rounded-xl bg-white/5 border border-white/10 p-1"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-white/20" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-white/40">{i + 1}</td>
                      <td className="p-3 font-semibold text-white">{s.name || "—"}</td>
                      <td className="p-3">
                        {s.industry ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            {s.industry}
                          </span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="p-3 text-white/60">
                        {s.funding_ask ? `$${Number(s.funding_ask).toLocaleString()}` : "—"}
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${scoreColor}`}>
                          {score !== null ? `${score}/200` : "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          score >= 150
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                            : score >= 80
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                        }`}>
                          {score >= 150 ? "High Potential" : score >= 80 ? "Moderate" : "High Risk"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          title="Edit"
                          onClick={() => setEditingStartup(s)}
                          className="text-xs p-1.5 rounded-lg border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(s.id, s.name)}
                          className="text-xs p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          title="View Report"
                          onClick={() => setDetailId(s.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 hover:text-white transition"
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Company Detail Modal */}
      {detailId && (
        <CompanyProfileModal id={detailId} onClose={() => setDetailId(null)} />
      )}

      {/* Edit Startup Modal */}
      {editingStartup && (
        <AdminStartupEditModal 
          startup={editingStartup} 
          onClose={() => setEditingStartup(null)} 
          onUpdated={() => {
            setEditingStartup(null);
            load();
          }} 
        />
      )}
    </div>
  );
}
