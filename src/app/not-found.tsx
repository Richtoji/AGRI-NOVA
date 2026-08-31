import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-gray-900 p-4">
      <div className="agri-card-elevated max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="h-24 w-24 bg-brand-green/10 dark:bg-brand-green/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Compass className="h-12 w-12 text-brand-green" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">
          We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-green hover:bg-brand-lime text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
