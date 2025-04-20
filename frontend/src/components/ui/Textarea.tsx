import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const id = (props as any).id as string | undefined;
    const isRequired = !!(props as any).required;
    const describedBy = error && id ? `${id}-error` : undefined;
    return (
      <div className="relative space-y-2">
        {label && (
          <label className="text-sm font-medium text-white/70" htmlFor={id}>
            {label}
            {isRequired && (
              <span aria-hidden="true" className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        <motion.textarea
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none backdrop-blur-sm transition-all duration-200 focus:border-web3-primary/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
            error && "border-red-500/50 focus:border-red-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />
        {error && (
          <p id={describedBy} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);
