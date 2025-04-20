import React from "react";
import { GlassCard } from "./GlassCard";

type CardProps = React.ComponentProps<typeof GlassCard>;

export function Card({ className, children, ...props }: CardProps) {
  const depth =
    "rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300";
  return (
    <GlassCard className={`${depth} ${className || ""}`} {...props}>
      {children}
    </GlassCard>
  );
}

