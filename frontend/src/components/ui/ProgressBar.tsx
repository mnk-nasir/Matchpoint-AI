import React from "react";

export function ProgressBar({
  percent,
  animate = true,
  className,
}: {
  percent: number;
  animate?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const width = `${clamped}%`;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const animatedWidth = animate ? (mounted ? width : "0%") : width;
  return (
    <div className={`relative h-2 w-full rounded-full bg-white/10 overflow-visible ${className || ""}`}>
      <div
        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
        style={{ width: animatedWidth }}
      />
      <div
        className="absolute -top-[2px] h-3 w-3 rounded-full bg-white shadow ring-1 ring-white/60 transition-all duration-700 ease-out"
        style={{ left: `calc(${animatedWidth} - 6px)` }}
        aria-hidden="true"
      />
    </div>
  );
}

