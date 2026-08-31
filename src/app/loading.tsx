import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-brand-green animate-spin" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide animate-pulse">
          Loading Agri-Nova...
        </p>
      </div>
    </div>
  );
}
