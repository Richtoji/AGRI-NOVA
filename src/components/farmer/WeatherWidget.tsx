"use client";

import React from "react";
import { CloudSun, Wind, Droplets, Thermometer, AlertTriangle, Eye, Navigation } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const WeatherWidget: React.FC = () => {
  const forecast = [
    { day: "Today", temp: "28°C", condition: "Sunny", rain: "10%", wind: "12 km/h" },
    { day: "Mon", temp: "26°C", condition: "Light Rain", rain: "65%", wind: "18 km/h" },
    { day: "Tue", temp: "27°C", condition: "Partly Cloudy", rain: "20%", wind: "14 km/h" },
    { day: "Wed", temp: "29°C", condition: "Sunny", rain: "0%", wind: "10 km/h" },
    { day: "Thu", temp: "25°C", condition: "Heavy Rain", rain: "85%", wind: "24 km/h" },
    { day: "Fri", temp: "27°C", condition: "Cloudy", rain: "30%", wind: "15 km/h" },
    { day: "Sat", temp: "30°C", condition: "Clear Sky", rain: "5%", wind: "11 km/h" },
  ];

  return (
    <Card className="space-y-6">
      
      {/* Alert Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5 text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="font-semibold">Weather Advisory: Light rain expected on Monday. Hold pesticide spraying till Tuesday.</span>
        </div>
        <span className="text-[10px] font-mono text-amber-300 shrink-0 hidden sm:inline">IMD Satellite Alert</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Current Weather Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-gray-900 border border-gray-700/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center font-semibold text-gray-600">
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Punjab Farm #4 - GIS Radar
            </span>
            <span className="font-mono text-[10px] text-gray-500">Live IoT</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-4xl font-black text-white tracking-tight">28°C</div>
              <div className="text-xs font-semibold text-gray-600 mt-1">Optimal Crop Conditions</div>
            </div>
            <CloudSun className="w-14 h-14 text-amber-400" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-300 border-t border-gray-800">
            <div>
              <div className="text-gray-500">Humidity</div>
              <div className="font-bold flex items-center"><Droplets className="w-3 h-3 text-blue-400 mr-1" /> 68%</div>
            </div>
            <div>
              <div className="text-gray-500">Wind</div>
              <div className="font-bold flex items-center"><Wind className="w-3 h-3 text-teal-400 mr-1" /> 12 km/h</div>
            </div>
            <div>
              <div className="text-gray-500">Soil Temp</div>
              <div className="font-bold flex items-center"><Thermometer className="w-3 h-3 text-rose-400 mr-1" /> 22°C</div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast Strip */}
        <div className="md:col-span-2 space-y-2">
          <div className="text-xs uppercase font-bold text-gray-400 flex items-center justify-between">
            <span>7-Day Agricultural Forecast</span>
            <span className="text-[10px] text-gray-600 font-mono">Updated 5 mins ago</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {forecast.map((f, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/60 text-center space-y-1">
                <div className="text-[10px] font-bold text-gray-300">{f.day}</div>
                <div className="text-xs font-black text-white">{f.temp}</div>
                <div className="text-[9px] text-gray-600 font-semibold">{f.condition}</div>
                <div className="text-[9px] text-gray-400">{f.rain} Rain</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </Card>
  );
};
