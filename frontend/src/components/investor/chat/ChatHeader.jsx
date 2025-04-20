import React from "react";

export default function ChatHeader({ title = "DealScope AI", onToggleSize, expanded = false, analyzingName }) {
  return (
    <div className="flex items-center justify-between h-12 px-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-transparent backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-[10px] font-bold">AI</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10px] text-white/50 -mt-0.5">Investment Assistant</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-[11px] tracking-widest uppercase text-white/60">
          {analyzingName ? `Analyzing: ${analyzingName}` : "Investor"}
        </div>
        <button
          type="button"
          onClick={onToggleSize}
          className="text-[11px] rounded-full px-2.5 py-1 border border-white/15 text-white/80 hover:bg-white/10 bg-white/[0.03]"
        >
          {expanded ? "Close" : "Zoom"}
        </button>
      </div>
    </div>
  );
}
