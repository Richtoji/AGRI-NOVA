import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "circle" | "image";
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = "text", ...props }) => {
  const variantStyles = {
    text: "h-3.5 w-full rounded-md",
    card: "h-48 w-full rounded-2xl",
    circle: "h-10 w-10 rounded-full shrink-0",
    image: "h-40 w-full rounded-xl",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-white/10",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};
