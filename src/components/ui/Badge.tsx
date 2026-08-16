import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "category";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = "success", dot = false, ...props }) => {
  const variants = {
    success: "bg-gray-700/10 text-gray-500 border-gray-700/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    neutral: "bg-white/5 text-gray-300 border-white/10",
    category: "bg-forest-900/60 text-gray-600 border-gray-700/20",
  };

  const dotColors = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-sky-400",
    neutral: "bg-gray-400",
    category: "bg-emerald-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};
