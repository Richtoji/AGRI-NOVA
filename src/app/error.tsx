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
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught an error:", error);
  }, [error]);

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
          Something went wrong
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We apologize for the inconvenience. An unexpected error occurred while processing your request. Our technical team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-green hover:bg-brand-lime text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
          >
            <RefreshCcw className="h-5 w-5" />
            Try again
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
