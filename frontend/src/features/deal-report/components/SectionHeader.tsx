import React from "react";

export default function SectionHeader({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div className={`rounded-lg bg-[#0B2B6B] text-white p-3 text-sm font-semibold tracking-wide ${className}`}>
      {title}
    </div>
  );
}
