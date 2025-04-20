import React from "react";

export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
      <div className="text-xs text-white/60 uppercase tracking-wider">{title}</div>
      <div className="text-3xl font-bold text-white mt-1">{value}</div>
      {subtitle && <div className="text-xs text-white/50 mt-2">{subtitle}</div>}
    </div>
  );
}

