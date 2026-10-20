"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError = Boolean(
    error?.message && (
      error.message.includes("Loading chunk") || 
      error.message.includes("ChunkLoadError") ||
      error.message.includes("failed to fetch dynamically imported module")
    )
  );

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught an error:", error);

    // If chunk loading failed because a new bundle was deployed / recompiled, reload once to fetch new chunks
    if (isChunkError && typeof window !== "undefined") {
      const reloaded = sessionStorage.getItem("chunk_error_reloaded");
      if (!reloaded) {
        sessionStorage.setItem("chunk_error_reloaded", "true");
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  const handleReset = () => {
    if (isChunkError && typeof window !== "undefined") {
      sessionStorage.removeItem("chunk_error_reloaded");
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-gray-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="agri-card-elevated max-w-lg w-full p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-inner">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {isChunkError ? "App Updated" : "Something went wrong"}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {isChunkError 
            ? "New updates were deployed. Please refresh the page to load the latest version."
            : "We apologize for the inconvenience. An unexpected error occurred while processing your request."}
        </p>

        {error?.message && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3 text-left text-xs text-red-700 dark:text-red-300 mb-6 max-h-40 overflow-auto font-mono">
            <p className="font-bold mb-1">Error Details:</p>
            <p className="break-words">{error.message}</p>
            {error.digest && <p className="text-gray-400 dark:text-gray-500 mt-1">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-green hover:bg-brand-lime text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-brand-green cursor-pointer"
          >
            <RefreshCcw className="h-5 w-5" />
            {isChunkError ? "Refresh Page" : "Try again"}
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow"
          >
            Go to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
