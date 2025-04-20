import React from "react";
import { GlassCard } from "./GlassCard";

export default function EmptyState({ title = "Nothing here yet", message = "Content coming soon." }) {
  return (
    <GlassCard className="p-6">
      <div className="space-y-1">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-white/70 text-sm">{message}</div>
      </div>
    </GlassCard>
  );
}
