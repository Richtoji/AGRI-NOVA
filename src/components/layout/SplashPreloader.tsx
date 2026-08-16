"use client";

import React, { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

export const SplashPreloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate asset hydration progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 300);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out">
      <div className="space-y-6 flex flex-col items-center max-w-sm px-6">
        
        {/* Animated Brand Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gray-900 to-green-400 p-0.5 shadow-2xl animate-pulse">
            <div className="w-full h-full bg-dark-bg rounded-[14px] flex items-center justify-center">
              <Sprout className="w-9 h-9 text-gray-600" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gray-700/20 blur-xl animate-ping -z-10" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">AGRI-NOVA</h2>
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest animate-pulse">Growing Intelligence...</p>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
          <div
            className="h-full bg-gradient-to-r from-gray-700 to-green-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-mono text-gray-500">{progress}% Loaded</span>
      </div>
    </div>
  );
};
