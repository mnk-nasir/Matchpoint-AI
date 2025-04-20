import React from "react";
import { sumTotals, computeTotalsFromItemFallback } from "../lib/scoring";
import { countOrDash } from "../lib/format";

type Item = {
  label: string;
  stage: string;
  // Prefer numeric sub-structure: max and score; keep count for backward compatibility
  subs: Array<{ label: string; count?: number; max?: number; score?: number }>;
  // Fallback totals when subs lack numeric data
  scoreOutOf: number;
  value: number;
};

export default function LeftRail({ items }: { items: Item[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        // Compute totals from subs if numeric data is provided; otherwise fallback to item.value / item.scoreOutOf
        const hasNumericSubs = Array.isArray(item.subs) && item.subs.some(s => typeof s.max === "number");
        const { totalAchieved, totalMax, pct } = hasNumericSubs
          ? sumTotals(item.subs.map(s => ({ max: s.max, score: s.score })))
          : computeTotalsFromItemFallback(item.value, item.scoreOutOf);
        return (
          <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <div className="font-semibold">{item.label}</div>
              <div className="text-xs text-white/50">{item.stage}</div>
            </div>
            <div className="text-xs text-white/70 grid grid-cols-1 gap-1 mb-2">
              {item.subs.map((s, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <span className="break-words leading-tight">{s.label}</span>
                  <span className="text-white/40 whitespace-nowrap shrink-0 mt-0.5">
                    {typeof s.max === "number"
                      ? `${Math.max(0, Math.min(Number(s.score ?? 0), Number(s.max)))} / ${s.max}`
                      : countOrDash(s.count)}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-white/50 flex items-center justify-between">
              <span>Score</span>
              <span className="text-white/70">{totalAchieved}/{totalMax}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
