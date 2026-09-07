"use client";

import React from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

export const MarketTicker: React.FC = () => {
  const tickerItems = [
    { crop: "Palakkadan Matta Rice", price: "₹60 / kg", change: "+2.4%", isUp: true },
    { crop: "Nendran Banana (Wayanad)", price: "₹55 / kg", change: "+4.8%", isUp: true },
    { crop: "Wayanad Black Pepper", price: "₹640 / kg", change: "+1.5%", isUp: true },
    { crop: "Idukki Green Cardamom", price: "₹1,900 / kg", change: "-0.8%", isUp: false },
    { crop: "Natural Rubber Sheets", price: "₹175 / kg", change: "+3.2%", isUp: true },
    { crop: "Fresh Dehusked Coconut", price: "₹24 / pc", change: "+1.0%", isUp: true },
    { crop: "Karimeen Pearlspot", price: "₹380 / kg", change: "+5.0%", isUp: true },
    { crop: "Cold-Pressed Coconut Oil", price: "₹220 / Ltr", change: "-0.5%", isUp: false },
  ];

  return (
    <div className="w-full bg-gray-50 border-y border-gray-100 py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-800 uppercase tracking-wider shrink-0 pr-4 border-r border-gray-200">
          <RefreshCw className="w-3.5 h-3.5 text-gray-900 animate-spin shrink-0" />
          <span className="whitespace-nowrap">Live Kerala Prices</span>
        </div>

        <div className="flex items-center space-x-8 overflow-x-auto whitespace-nowrap text-xs text-gray-600 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full pl-4">
          {tickerItems.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 font-medium">
              <span className="text-gray-500 font-semibold">{item.crop}:</span>
              <span className="font-bold text-gray-900 font-mono">{item.price}</span>
              <span
                className={`inline-flex items-center text-[11px] font-bold ${
                  item.isUp ? "text-gray-900" : "text-rose-600"
                }`}
              >
                {item.isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {item.change}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
