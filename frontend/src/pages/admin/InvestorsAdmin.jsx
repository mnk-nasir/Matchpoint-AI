import React, { useEffect, useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { GlowButton } from "../../components/ui/GlowButton";
import { adminInvestorsService } from "../../services/adminInvestors";
import { Mail, UserPlus, Shield } from "lucide-react";
import { getAccessToken } from "../../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";

export default function InvestorsAdmin() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailQuery, setEmailQuery] = useState("");
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", company: "", phone: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: "", first_name: "", last_name: "", company: "", phone: "", password: "" });
  const [lead, setLead] = useState({ lead_id: "", password: "" });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminInvestorsService.list(emailQuery ? { email: emailQuery } : undefined);
      setItems(res);
    } catch (e) {
      setError(e?.message || "Failed to load investors. Ensure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      load();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminInvestorsService.create(form);
      setForm({ email: "", first_name: "", last_name: "", company: "", phone: "", password: "" });
      await load();
      alert("Investor account created.");
    } catch (e) {
      alert(e?.message || "Create failed");
    }
  };

  const createFromLead = async (e) => {
    e.preventDefault();
    try {
      await adminInvestorsService.createFromLead(Number(lead.lead_id), lead.password);
      setLead({ lead_id: "", password: "" });
      await load();
      alert("Investor created from lead.");
    } catch (e) {
      alert(e?.message || "Create-from-lead failed");
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      company: user.company || "",
      phone: user.phone || "",
      password: "" // Don't pre-fill password
    });
  };

  const update = async (e) => {
    e.preventDefault();
    try {
      // Only send password if it's actually changed
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      
      await adminInvestorsService.update(editingUser.id, payload);
      setEditingUser(null);
      await load();
      alert("Investor updated.");
    } catch (e) {
      alert(e?.message || "Update failed");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setItems([]);
    setLoading(false);
    navigate("/admin/login");
  };

  return (
    <section className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
             style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}>
          Admin – Investors
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Manage Investors
        </h1>
        <p className="mt-3 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          List, search, and create investor accounts. Admin access required.
        </p>
        {getAccessToken() && (
          <div className="mt-4 flex justify-end">
            <GlowButton variant="secondary" onClick={handleLogout}>Logout</GlowButton>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        {!getAccessToken() ? (
          <GlassCard className="p-6 mt-6">
            <div className="text-sm text-white/70">
              You must be logged in as admin to manage investors.
            </div>
            <div className="mt-3">
              <Link to="/admin/login" className="rounded-full px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] border transition-all hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                Go to Admin Login
              </Link>
            </div>
          </GlassCard>
        ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] bg-white/5">
              <Mail className="h-4 w-4" /> Search Investors
            </div>
            <div className="flex gap-3">
              <Input placeholder="email contains…" value={emailQuery} onChange={(e) => setEmailQuery(e.target.value)} />
              <GlowButton onClick={load}>Search</GlowButton>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="text-white/60 text-sm">Loading…</div>
              ) : (
                <div className="space-y-2">
                  {items.map((u) => (
                    <div key={u.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{u.email}</div>
                        <div className="text-xs text-white/60">
                          {u.first_name} {u.last_name} {u.company ? `(${u.company})` : ""} {u.phone ? `· ${u.phone}` : ""}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Joined {new Date(u.date_joined).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => startEdit(u)}
                          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors border border-white/5"
                        >
                          Edit
                        </button>
                        <div className="text-xs text-emerald-300">Investor</div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-sm text-white/60">No investors found.</div>}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            {editingUser ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 px-3 py-1 text-[10px] uppercase tracking-[0.25em] bg-emerald-500/5 text-emerald-300">
                  <UserPlus className="h-4 w-4" /> Edit Investor
                </div>
                <form onSubmit={update} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Email" type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  <Input label="New Password (Optional)" type="password" placeholder="Leave blank to keep same" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                  <Input label="First Name" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
                  <Input label="Last Name" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                  <Input label="Company" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                  <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  <div className="md:col-span-2 flex justify-between gap-3">
                    <button type="button" onClick={() => setEditingUser(null)} className="text-xs text-white/50 hover:text-white transition-colors">Cancel</button>
                    <GlowButton type="submit">Save Changes</GlowButton>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] bg-white/5">
                  <UserPlus className="h-4 w-4" /> Create Investor
                </div>
                <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <Input label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                  <Input label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                  <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <div className="md:col-span-2 flex justify-end">
                    <GlowButton type="submit">Create</GlowButton>
                  </div>
                </form>
              </>
            )}
          </GlassCard>
        </div>
        )}

        {getAccessToken() && <GlassCard className="p-6 space-y-4 mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] bg-white/5">
            <Shield className="h-4 w-4" /> Convert Lead → Investor
          </div>
          <form onSubmit={createFromLead} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Lead ID" value={lead.lead_id} onChange={(e) => setLead({ ...lead, lead_id: e.target.value })} />
            <Input label="Password" type="password" value={lead.password} onChange={(e) => setLead({ ...lead, password: e.target.value })} />
            <div className="flex items-end">
              <GlowButton type="submit">Create From Lead</GlowButton>
            </div>
          </form>
          <div className="text-xs text-white/60">
            Use the numeric ID from Investor Leads (in Django admin or via an API you expose).
          </div>
        </GlassCard>}
      </div>
    </section>
  );
}
