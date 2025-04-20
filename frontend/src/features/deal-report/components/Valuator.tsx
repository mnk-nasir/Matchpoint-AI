import React from "react";
import SectionHeader from "./SectionHeader";
import { countOrDash } from "../lib/format";

type Entry = { label: string; count: number };

export default function Valuator({ entries = [] as Entry[] }: { entries?: Entry[] }) {
  const list = entries.length
    ? entries
    : [
        { label: "Market Validation (5)", count: 0 },
        { label: "Progress (3)", count: 0 },
        { label: "Founders (5)", count: 0 },
        { label: "Idea Potential (3)", count: 0 },
        { label: "Sales / Traction (4)", count: 0 },
        { label: "Sales Pipeline (3)", count: 0 },
      ];
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionHeader title="VALUATOR" className="mb-3" />
      <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
        {list.map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span>{e.label}</span>
            <span className="text-white/60">{countOrDash(e.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
