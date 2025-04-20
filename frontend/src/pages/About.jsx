import React from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { GlowButton } from "../components/ui/GlowButton";
import { Rocket, LineChart, ShieldCheck, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <header className="relative mx-auto max-w-6xl px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
             style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}>
          About Us
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Institutional-grade intelligence for startup investing
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl" style={{ fontFamily: "'Space Mono', monospace" }}>
          MATCHPoint helps investors and operators evaluate startups with consistent signals, risk checks,
          and structured insights — turning scattered information into clear decisions.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: LineChart, title: "Signal-driven", desc: "Scores built from traction, customers, and momentum — not gut feel." },
            { icon: ShieldCheck, title: "Risk-aware", desc: "Guardrails and red flags surface what could go wrong early." },
            { icon: Users, title: "Collaborative", desc: "Designed for investors and founders to align around the same data." },
          ].map(({ icon: Icon, title, desc }) => (
            <GlassCard key={title} className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="text-emerald-400" />
                <div className="text-base font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>{title}</div>
              </div>
              <div className="text-sm text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>{desc}</div>
            </GlassCard>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="text-sm text-white/60 mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>Our Mission</div>
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Make startup due diligence fast, fair, and repeatable</h2>
            <p className="text-white/70 leading-relaxed" style={{ fontFamily: "'Space Mono', monospace" }}>
              We believe investors and founders should share the same facts. Our platform structures company
              information into comparable signals and produces clear, investment-grade outputs.
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-sm text-white/60 mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>What We Do</div>
            <ul className="space-y-2 text-white/80" style={{ fontFamily: "'Space Mono', monospace" }}>
              <li>• Score and shortlist startups by traction and risk</li>
              <li>• Summarize financials and highlight gaps</li>
              <li>• Compare companies side-by-side for committees</li>
              <li>• Package investor-ready profiles and insights</li>
            </ul>
          </GlassCard>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm text-white/60 mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Get in touch</div>
              <div className="text-lg font-semibold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Ready to evaluate startups with clarity?
              </div>
            </div>
            <GlowButton as="a" href="/investors/interest" className="px-6 py-2.5">
              Talk to Us
            </GlowButton>
          </div>
        </section>
      </main>
    </div>
  );
}
