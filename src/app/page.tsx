import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { MarketTicker } from "@/components/landing/MarketTicker";
import { AIDemoSandbox } from "@/components/landing/AIDemoSandbox";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar />
        <MarketTicker />
        <main>
          <HeroSection />
          <AIDemoSandbox />
          <FeaturesGrid />
        </main>
      </div>
      <Footer />
    </div>
  );
}
