import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "amber";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700/40 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-forest-600 hover:bg-forest-500 text-white border border-forest-500/30 shadow-md shadow-forest-950/40 active:scale-[0.98]",
    secondary: "bg-dark-card hover:bg-dark-hover text-gray-200 border border-white/10 active:scale-[0.98]",
    outline: "bg-transparent border border-forest-500/40 text-gray-600 hover:bg-forest-900/40 active:scale-[0.98]",
    ghost: "bg-transparent text-gray-300 hover:bg-white/5 hover:text-white",
    danger: "bg-rose-700 hover:bg-rose-600 text-white border border-rose-600/30 shadow-sm active:scale-[0.98]",
    amber: "bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/30 shadow-sm active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-xs gap-2",
    lg: "px-5 py-3 text-sm gap-2",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
