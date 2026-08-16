import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: "default" | "elevated" | "subtle";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  variant = "default",
  ...props
}) => {
  const variantStyles = {
    default: "bg-white border border-gray-100 rounded-2xl p-5",
    elevated: "bg-white border border-gray-100 rounded-2xl-elevated p-5",
    subtle: "bg-white/[0.03] border border-white/5 rounded-xl p-5",
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        hoverEffect && "hover:border-gray-700/30 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
