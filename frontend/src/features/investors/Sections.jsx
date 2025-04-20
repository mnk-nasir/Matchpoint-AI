import React from "react";
import { FileBarChart2, ListChecks, TrendingUp, ClipboardList, Layers, BarChart3 } from "lucide-react";

export function FeatureCards() {
  return (
    <section id="features" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <FileBarChart2 className="text-violet-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>DRI 1‑Page Deal Reports</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Concise, shareable investment snapshots for startups/companies.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <ListChecks className="text-sky-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Highlights & Lowlights</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Summarised strengths, risks, and missing signals for quick diligence.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <TrendingUp className="text-emerald-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>ROI & Exit Insights</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Key signals reveal expected ROI band and exit intentions.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <BarChart3 className="text-amber-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Dashboard & Archive</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Track past and current deal opportunities with analytics.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <ClipboardList className="text-lime-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Valuation Benchmarking</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Use the DRI Valuator to compare and justify valuation ranges.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <Layers className="text-pink-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Cohort / Portfolio Analysis</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Benchmark startups for monitoring, comparison, and investment uplift.
        </p>
      </div>
    </section>
  );
}

export function BenefitBlock() {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div
        className="rounded-2xl border bg-cover bg-center min-h-[240px]"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60')",
          filter: "grayscale(10%)",
        }}
        aria-hidden="true"
      />
      <div className="rounded-2xl border bg-white/[0.06] p-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Deal Reports Highlight Strengths and Weaknesses in Seconds
        </h3>
        <p className="mt-3 text-sm text-white/80" style={{ fontFamily: "'Space Mono', monospace" }}>
          Our DRI deal reports pinpoint what matters: traction evidence, gaps to close, ROI band,
          and exit posture. Details that often get omitted from decks surface immediately,
          helping investors start sharper conversations and save time.
        </p>
        <p className="mt-3 text-sm text-white/60" style={{ fontFamily: "'Space Mono', monospace" }}>
          Build investment discussions around consistent signals, intelligence, and analysis.
        </p>
      </div>
    </div>
  );
}
