import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
      <div className="flex-1">
        {label && <div className="text-sm font-medium text-white">{label}</div>}
        {description && (
          <div className="mt-1 text-xs text-white/50">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 rounded-full border border-white/10 bg-black/40 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-web3-primary/50",
          checked && "bg-web3-primary/20 border-web3-primary/50"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md",
            checked && "bg-web3-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          )}
          style={{ left: checked ? "calc(100% - 1.5rem)" : "0.25rem" }}
        />
      </button>
    </div>
  );
}
