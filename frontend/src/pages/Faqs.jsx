import React, { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";

const QA = [
  {
    q: "What is MATCHPoint?",
    a: "MATCHPoint is an investment intelligence platform that structures startup data into comparable signals, risk checks, and investor‑grade summaries.",
  },
  {
    q: "Where does the data come from?",
    a: "Data is sourced from company inputs on the platform and structured fields such as MRR, users, paying customers, and stage.",
  },
  {
    q: "Can I compare multiple startups?",
    a: "Yes. Use the investor view to rank by score and compare startups side‑by‑side by stage, score, MRR, country, and rating.",
  },
  {
    q: "Do you show valuations?",
    a: "If valuation data is not available in platform records, the system explicitly states it is unavailable rather than guessing.",
  },
  {
    q: "How do I get access?",
    a: "Investors can request access via the interest form. Founders can start with the funding application to create a profile.",
  },
];

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <header className="relative mx-auto max-w-6xl px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
             style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}>
          FAQs
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-white/70 max-w-3xl" style={{ fontFamily: "'Space Mono', monospace" }}>
          Quick answers about how MATCHPoint helps investors and founders.
        </p>
      </header>
      <main className="mx-auto max-w-4xl px-6 pb-20 space-y-3">
        {QA.map((item, i) => (
          <GlassCard key={item.q} className="p-0 overflow-hidden">
            <button
              className="w-full text-left px-5 py-4 flex items-center justify-between"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            >
              <span className="text-sm font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>{item.q}</span>
              <span className="text-white/60 text-xl">{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-white/80 text-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
                {item.a}
              </div>
            )}
          </GlassCard>
        ))}
      </main>
    </div>
  );
}
