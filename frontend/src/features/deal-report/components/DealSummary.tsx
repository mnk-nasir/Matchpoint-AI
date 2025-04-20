import React from "react";
import SectionHeader from "./SectionHeader";

export default function DealSummary({
  strengths = [],
  weaknesses = [],
}: {
  strengths?: string[];
  weaknesses?: string[];
}) {
  const left = strengths.slice(0, 6);
  const right = weaknesses.slice(0, 6);
  return (
    <div>
      <SectionHeader title="HIGHLIGHTS" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="px-3 py-2 text-xs font-semibold tracking-wide text-white/80">Possible Highlights</div>
          <div className="divide-y divide-white/10">
            {left.length ? (
              left.map((s, i) => (
                <div key={i} className="px-3 py-2 flex items-start justify-between text-sm">
                  <span className="text-white/80">{s}</span>
                  <span className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] text-white/70">
                    L{Math.max(1, 6 - i)}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-white/50">—</div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="px-3 py-2 text-xs font-semibold tracking-wide text-white/80">Possible Weak Points</div>
          <div className="divide-y divide-white/10">
            {right.length ? (
              right.map((s, i) => (
                <div key={i} className="px-3 py-2 flex items-start justify-between text-sm">
                  <span className="text-white/80">{s}</span>
                  <span className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] text-white/70">
                    L{Math.max(1, 6 - i)}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-white/50">—</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
