import React from "react";
import Donut from "../dashboard/Donut";

export default function DealReport({
  company,
  metaItems,
  sectionBreakdown,
  strengths,
  weaknesses,
  percentage,
  historyPoints,
}: {
  company: any;
  metaItems: Array<{ label: string; value: string }>;
  sectionBreakdown: Array<{ key: string; label: string; score: number; outOf: number }>;
  strengths: string[];
  weaknesses: string[];
  percentage: number;
  historyPoints: Array<{ x: number; y: number }>;
}) {
  const leftItems = [
    { label: "Market Validation", stage: "(Stage 1)", subs: ["Identification (3)", "Interact (3)", "Results (3)"] },
    { label: "Progress & Execution", stage: "(Stage 2)", subs: ["LOI / Pre-Orders (3)", "Product Development (5)", "Financial Tests (2)", "External Cash (5)", "Setup (4)"] },
    { label: "People", stage: "(Stage 3)", subs: ["Founder Skills Mix (6)", "Advisor / Mentor (6)", "Team Members (5)", "Board / Chair (1)"] },
    { label: "Founders", stage: "(Stage 4)", subs: ["Previous Startup (12)", "Personal Investment (8)", "Bootstrapped (3)"] },
    { label: "ROI Predicted", stage: "(Stage 5)", subs: ["0-2x", "3-4x", "4-7x", "7-10x", "10x+"] },
    { label: "Exit", stage: "(Stage 6)", subs: ["Exit Acquirers (2)", "Exit Dialogue (3)", "Exit Event (3)"] },
    { label: "Business Case", stage: "(Stage 7)", subs: ["Tone Check (1)", "Pitch Statement (2)", "Benchmarks (5)", "Go-To-Market (3)"] },
  ];
  const byLabel: Record<string, { score: number; outOf: number }> = {};
  sectionBreakdown.forEach((s) => (byLabel[s.label.toLowerCase()] = { score: s.score, outOf: s.outOf }));
  const pctFor = (name: string) => {
    const k = name.toLowerCase();
    const found = byLabel[k] || { score: 0, outOf: 1 };
    return Math.round((found.score / found.outOf) * 100);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
      {/* Top header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-extrabold tracking-[0.25em] text-white/80">Deal Intelligence Report</div>
          <div className="h-6 px-3 rounded-md border border-white/10 bg-white/5 text-[11px] text-white/70 flex items-center">MATCHPoint</div>
        </div>
        <div className="text-xs text-white/60 text-right">
          <div>Profile Date: {new Date().toLocaleDateString()}</div>
          <div>Currency: {company?.currency || "—"}</div>
          <div>Location: {company?.country || "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left rail */}
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-lg bg-[#0B2B6B] text-white p-3 text-sm font-semibold tracking-wide">Smart Investment Score</div>
          <div className="space-y-3">
            {leftItems.map((item, idx) => {
              const pct = Math.min(100, Math.max(0, pctFor(item.label)));
              return (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-white/50">{item.stage}</div>
                  </div>
                  {item.subs && (
                    <div className="text-xs text-white/70 grid grid-cols-1 gap-1 mb-2">
                      {item.subs.slice(0, 5).map((s) => (
                        <div key={s} className="flex items-start justify-between gap-2">
                          <span className="break-words leading-tight">{s}</span>
                          <span className="text-white/40 whitespace-nowrap shrink-0 mt-0.5">1</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-white/50">Score (Out of {byLabel[item.label.toLowerCase()]?.outOf || "—"})</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-8 space-y-6">
          {/* Header / Company */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{company?.companyName || "—"}</div>
              <div className="text-white/60">{company?.contactEmail || ""}</div>
            </div>
            <div className="text-right text-xs text-white/60 space-y-1">
              <div>First Data: {new Date().toLocaleDateString()}</div>
              <div>Sector: {company?.sector || "—"}</div>
            </div>
          </div>

          <div className="rounded-lg bg-[#0B2B6B] text-white p-3 text-sm font-semibold tracking-wide">
            COMPANY DETAILS
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {metaItems.map((m) => (
              <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">{m.label}</div>
                <div className="font-semibold text-white">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Snapshot */}
          <div>
            <div className="rounded-lg bg-[#0B2B6B] text-white p-3 text-sm font-semibold tracking-wide mb-3">
              HIGHLIGHTS
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold text-white/80 mb-2">Possible Highlights</div>
                <ol className="list-decimal pl-5 text-sm text-white/80 space-y-2">
                  {(strengths && strengths.length ? strengths : ["—"]).slice(0, 6).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/70">L{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold text-white/80 mb-2">Possible Weak Points</div>
                <ol className="list-decimal pl-5 text-sm text-white/80 space-y-2">
                  {(weaknesses && weaknesses.length ? weaknesses : ["—"]).slice(0, 6).map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/70">L{i + 1}</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Configurator */}
          <div>
            <div className="rounded-lg bg-[#0B2B6B] text-white p-3 text-sm font-semibold tracking-wide mb-3">
              CONFIGURATOR
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Shares Offered", company?.sharesOffered ?? "—"],
                ["Investment Needed (₤)", company?.investmentNeeded ?? "—"],
                ["Exit / Sale Event (x)", company?.exitMultiple ?? "—"],
                ["Desired Valuation - Pre (₤)", company?.desiredValuationPre ?? "—"],
                ["Desired Valuation - Post (₤)", company?.desiredValuationPost ?? "—"],
                ["Investor Exit Return (x)", company?.investorReturn ?? "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/60">{k}</div>
                  <div className="font-semibold text-white">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Readiness + Valuator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-1">
              <div className="rounded-lg bg-[#0B2B6B] text-white p-2 text-xs font-semibold tracking-wide mb-3">
                INVESTMENT READINESS
              </div>
              <div className="flex items-center justify-center py-2">
                <Donut percent={percentage} />
              </div>
              <div className="text-center text-xs text-white/60 mt-1">RMD TOTAL</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <div className="rounded-lg bg-[#0B2B6B] text-white p-2 text-xs font-semibold tracking-wide mb-3">
                VALUATOR
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                {(sectionBreakdown || []).map((s) => (
                  <div key={s.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <span>{s.label}</span>
                    <span className="text-white/60">{s.score}/{s.outOf}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] text-white/50 rounded-lg border border-white/10 bg-white/5 p-3">
            Disclaimer: This material does not constitute investment advice. Benchmarks and valuations are indicative only
            and do not suggest advice for a company’s valuation or exit position.
          </div>
        </div>
      </div>
    </div>
  );
}
