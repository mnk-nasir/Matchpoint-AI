import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  gradient = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-visible rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md",
        gradient &&
          "bg-gradient-to-b from-white/10 to-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)]",
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
