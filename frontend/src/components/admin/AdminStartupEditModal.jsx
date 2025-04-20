import React, { useState } from "react";
import { X } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Input } from "../ui/Input";
import { GlowButton } from "../ui/GlowButton";
import { Select } from "../ui/Select";
import { adminStartupsService } from "../../services/adminStartups";

const RATINGS = [
  { value: "STRONG", label: "Strong" },
  { value: "HIGH_POTENTIAL", label: "High Potential" },
  { value: "MODERATE", label: "Moderate" },
  { value: "HIGH_RISK", label: "High Risk" },
];

export default function AdminStartupEditModal({ startup, onClose, onUpdated }) {
  const [form, setForm] = useState({
    company_name: startup.name || "",
    industry: startup.industry || "",
    total_score: startup.risk_score ?? "",
    rating: startup.rating || "MODERATE",
    funding_ask: startup.funding_ask || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        company_name: form.company_name,
        industry: form.industry,
        total_score: parseInt(form.total_score, 10) || 0,
        rating: form.rating,
        funding_ask: form.funding_ask ? Number(form.funding_ask) : null,
      };
      await adminStartupsService.update(startup.id, payload);
      onUpdated();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <GlassCard className="relative w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">Edit Startup</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            required
          />
          <Input
            label="Industry / Sector"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Score (0-200)"
              type="number"
              value={form.total_score}
              onChange={(e) => setForm({ ...form, total_score: e.target.value })}
              required
            />
            <Select
              label="Rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              options={RATINGS}
              required
            />
          </div>
          <Input
            label="Funding Ask (USD)"
            type="number"
            value={form.funding_ask}
            onChange={(e) => setForm({ ...form, funding_ask: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <GlowButton type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </GlowButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
