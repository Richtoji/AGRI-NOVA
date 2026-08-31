"use client";

import React, { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SplashPreloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Speed up splash screen to feel immediate
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsVisible(false);
          return 100;
        }
        return prev + 25;
      });
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center"
        >
          <div className="space-y-8 flex flex-col items-center max-w-sm px-6">
            
            {/* Animated Brand Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-green to-brand-lime p-0.5 shadow-2xl"
              >
                <div className="w-full h-full bg-gray-900 rounded-[22px] flex items-center justify-center">
                  <Sprout className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <div className="absolute inset-0 rounded-3xl bg-brand-green/30 blur-2xl animate-pulse -z-10" />
            </motion.div>

            {/* Text */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center space-y-2"
            >
              <h2 className="text-3xl font-black tracking-tighter text-white">AGRI-NOVA</h2>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-[0.2em]">Growing Intelligence</p>
            </motion.div>

            {/* Custom Progress Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-56 h-1.5 bg-gray-800 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-brand-green to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.1 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
