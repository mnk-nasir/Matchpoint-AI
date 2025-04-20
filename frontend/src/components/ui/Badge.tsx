import React from "react";

export function Badge({
  className,
  children,
  icon,
}: {
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-bold inline-flex items-center gap-2 ${className || ""}`}
    >
      {icon}
      {children}
    </span>
  );
}

