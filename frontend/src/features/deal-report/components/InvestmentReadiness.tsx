import React from "react";
import SectionHeader from "./SectionHeader";
import Donut from "./Donut";

export default function InvestmentReadiness({ percent }: { percent: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <SectionHeader title="INVESTMENT READINESS" className="mb-3" />
      <div className="flex items-center justify-center">
        <Donut percent={percent} size={120} />
      </div>
    </div>
  );
}
