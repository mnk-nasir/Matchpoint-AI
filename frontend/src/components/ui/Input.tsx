import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const id = (props as any).id as string | undefined;
    const isRequired = !!(props as any).required;
    const describedBy = error && id ? `${id}-error` : undefined;
    return (
      <div className="relative space-y-2">
        {label && (
          <label
            className="text-sm font-medium text-white/70"
            htmlFor={id}
          >
            {label}
            {isRequired && (
              <span aria-hidden="true" className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none backdrop-blur-sm transition-all duration-200 focus:border-web3-primary/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
              icon && "pl-10",
              error && "border-red-500/50 focus:border-red-500",
              className
            )}
            aria-describedby={describedBy}
            onKeyDown={(e) => {
              if (props.onKeyDown) props.onKeyDown(e);
              if (e.key === 'Enter') {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (!form) return;
                const elements = Array.from(form.elements) as HTMLElement[];
                const index = elements.indexOf(e.currentTarget);
                
                // Find next focusable input/button that isn't hidden or disabled
                for (let i = index + 1; i < elements.length; i++) {
                  const nextEl = elements[i];
                  if (nextEl.tabIndex >= 0 && !nextEl.hasAttribute('disabled')) {
                    nextEl.focus();
                    break;
                  }
                }
              }
            }}
            {...props}
          />
          {props.type === "number" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                className="flex items-center justify-center h-7 w-7 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                onClick={(e) => {
                  const el = e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement;
                  if (el) {
                    el.stepDown();
                    const tracker = (el as any)._valueTracker;
                    if (tracker) tracker.setValue(el.value);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }}
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-7 w-7 rounded-md bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                onClick={(e) => {
                  const el = e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement;
                  if (el) {
                    el.stepUp();
                    const tracker = (el as any)._valueTracker;
                    if (tracker) tracker.setValue(el.value);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        {error && (
          <p id={describedBy} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);
