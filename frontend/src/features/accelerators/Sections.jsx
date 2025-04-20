import React from "react";
import { Layers, ClipboardList, Users, Rocket, LineChart, CalendarClock } from "lucide-react";

export function FeatureCards() {
  return (
    <section id="features" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <Layers className="text-sky-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Cohort Benchmarking</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Compare startups on the same signals to prioritize support and intros.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <ClipboardList className="text-emerald-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Signal‑Based Shortlisting</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Filter applications by traction, LOIs, market fit, and founder signals.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <Users className="text-pink-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Mentor & Advisor Mapping</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Spot gaps in skills and map mentors to each startup’s needs.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <Rocket className="text-amber-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Demo Day Prep</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Auto‑generate concise deal reports and investor‑ready summaries.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <LineChart className="text-violet-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Readiness & Valuation</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Track investment readiness and benchmark valuations with the DRI tools.
        </p>
      </div>
      <div className="rounded-2xl border bg-white/[0.04] p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <CalendarClock className="text-lime-400" />
          <h3 className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>Program Analytics</h3>
        </div>
        <p className="mt-3 text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Measure uplift across the cohort: revenue, users, pipeline, and ROI bands.
        </p>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <div className="mt-12 flex items-center justify-center">
      <a
        href="/accelerators/interest"
        className="rounded-full px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(167,139,250,0.25)] transition-all"
        style={{
          fontFamily: "'Space Mono', monospace",
          backgroundImage: "linear-gradient(90deg,#a78bfa,#00aaff)",
          color: "#050a12",
          border: "1px solid rgba(255,255,255,0.12)"
        }}
      >
        Register Program Interest
      </a>
    </div>
  );
}
