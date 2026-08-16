import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-gray-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full bg-dark-card border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 transition-colors focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500/30 disabled:opacity-50",
            error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-dark-card text-white">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-[11px] font-medium text-rose-400">❌ {error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
