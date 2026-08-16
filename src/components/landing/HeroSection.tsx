"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sprout, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "/images/slide1.png",
    "/images/slide2.png",
    "/images/slide3.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Storytelling & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Context Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-800 text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5 text-gray-900" />
              <span>Smart Farming & Agri-Commerce Platform</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
              Grow Smarter.<br />
              Farm Better.<br />
              <span className="text-gray-900">Sell with Confidence.</span>
            </h1>

            {/* Humanized Subtitle */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Get crop recommendations tailored to your soil, location, and weather. Buy and sell farm produce, access machinery rentals, manage livestock, and stay updated on government agricultural schemes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/marketplace">
                <Button size="lg" className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white">
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard/farmer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50">
                  <span>Try Crop Recommender</span>
                </Button>
              </Link>
            </div>

            {/* Realistic Feature Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-gray-900" />
                <span>Verified Produce Sellers</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Live Kerala Prices</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sprout className="w-4 h-4 text-sky-500" />
                <span>Soil & AI Diagnostics</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Image Slideshow */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 overflow-hidden shadow-xl">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] group border border-gray-100 bg-gray-50">
                
                {/* Images */}
                {slides.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Slideshow Image ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      currentSlide === idx ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent pointer-events-none" />

                {/* Navigation Arrows (visible on hover) */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        currentSlide === idx ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
