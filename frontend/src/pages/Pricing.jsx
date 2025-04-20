import React from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { GlowButton } from "../components/ui/GlowButton";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    desc: "For founders exploring investor readiness.",
    features: ["Basic company profile", "Readiness checklist", "Email support"],
    cta: { label: "Get Started", href: "/funding" },
  },
  {
    name: "Investor",
    price: "$99/mo",
    highlight: true,
    desc: "For investors screening and comparing startups.",
    features: ["Deal dashboard", "Ranking & compare", "Risk flags", "Export tables"],
    cta: { label: "Start Trial", href: "/investors/interest" },
  },
  {
    name: "Accelerator",
    price: "Contact",
    desc: "Cohort benchmarking and pipeline tools.",
    features: ["Application scoring", "Cohort analytics", "Team onboarding"],
    cta: { label: "Talk to Sales", href: "/accelerators/interest" },
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <header className="relative mx-auto max-w-6xl px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
             style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}>
          Pricing
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Simple plans for investors and operators
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl" style={{ fontFamily: "'Space Mono', monospace" }}>
          Choose the plan that fits your workflow. Upgrade or change anytime.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <GlassCard key={p.name} className={`p-6 ${p.highlight ? "ring-1 ring-emerald-400/40" : ""}`}>
              <div className="text-sm text-white/60" style={{ fontFamily: "'Space Mono', monospace" }}>{p.name}</div>
              <div className="mt-2 text-3xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.price}</div>
              <div className="mt-1 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>{p.desc}</div>
              <ul className="mt-4 space-y-2 text-white/80 text-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
                {p.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <div className="mt-6">
                <GlowButton as="a" href={p.cta.href} className="px-6 py-2.5">
                  {p.cta.label}
                </GlowButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
}
