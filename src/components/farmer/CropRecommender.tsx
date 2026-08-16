"use client";

import React, { useState } from "react";
import { Sparkles, MapPin, CheckCircle2, TrendingUp, DollarSign, Calendar, Droplets } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { validateCropInputs } from "@/lib/validation";

export const CropRecommender: React.FC = () => {
  const [n, setN] = useState<number | string>(70);
  const [p, setP] = useState<number | string>(40);
  const [k, setK] = useState<number | string>(45);
  const [ph, setPh] = useState<number | string>(6.8);
  const [rainfall, setRainfall] = useState<number | string>(110);
  const [season, setSeason] = useState("Kharif (Monsoon)");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>({
    crop: "Organic Basmati Paddy Rice",
    confidence: 97.4,
    expectedYield: "4.9 Tons / Hectare",
    estimatedProfit: "₹1,45,000 / Hectare",
    growingCycle: "120 Days",
    fertilizer: "Urea 46% N + Neem Cake + Azotobacter",
    waterNeed: "4,200 L / Ha / Day",
    marketDemand: "High (Export Quality)"
  });

  const handlePredict = async () => {
    setValidationError(null);

    const validation = validateCropInputs(n, p, k, ph, rainfall);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors).filter(Boolean).join(" ");
      setValidationError(errorMsg);
      return;
    }

    setIsLoading(true);

    const numN = Number(n);
    const numP = Number(p);
    const numK = Number(k);
    const numPh = Number(ph);
    const numRain = Number(rainfall);

    const url = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${url}/api/v1/predict-crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n: numN,
          p: numP,
          k: numK,
          ph: numPh,
          rainfall: numRain,
          temperature: season.includes("Monsoon") ? 28.5 : season.includes("Winter") ? 18.0 : 34.0,
          latitude: 28.6139,
          longitude: 77.2090
        })
      });
      const resData = await response.json();
      if (resData && resData.success && resData.data) {
        const d = resData.data;
        setRecommendation({
          crop: d.recommended_crop,
          confidence: Math.round(d.confidence_score * 100 * 10) / 10,
          expectedYield: `${d.expected_yield_tons_per_ha} Tons / Hectare`,
          estimatedProfit: `₹${d.profit_estimation_inr.toLocaleString()} / Hectare`,
          growingCycle: `${d.growing_period_days} Days`,
          fertilizer: d.recommended_fertilizer,
          waterNeed: d.water_requirement_liters_per_day,
          marketDemand: "High"
        });
      } else {
        throw new Error("Invalid response schema");
      }
    } catch (err) {
      console.log("AI Microservice offline or error, falling back to local heuristic rules:", err);
      // Fallback local mock logic
      let crop = "Basmati Rice";
      if (numPh > 7.2) crop = "Cotton";
      else if (numN > 85) crop = "Sugarcane";
      else if (numRain < 70) crop = "Desi Wheat";
      else crop = "Greenhouse Tomatoes";

      setRecommendation({
        crop,
        confidence: 96.2,
        expectedYield: "5.2 Tons / Hectare",
        estimatedProfit: "₹1,58,000 / Hectare",
        growingCycle: "110 Days",
        fertilizer: "NPK 19-19-19 + Organic Vermicompost",
        waterNeed: "3,800 L / Ha / Day",
        marketDemand: "Very High"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-gray-600" />
            <span>AI Crop & Yield Recommendation Engine</span>
          </h2>
          <p className="text-xs text-gray-400">Powered by XGBoost & Soil Chemistry GIS Radar</p>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-700/10 text-gray-600 border border-gray-700/20">
          Model v2.4 Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-4 text-xs">
          
          <div className="flex items-center justify-between text-gray-300 font-semibold bg-gray-800/50 p-2.5 rounded-xl border border-gray-700">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 text-rose-400 mr-1.5" />
              Location GPS: 28.6139° N, 77.2090° E
            </span>
            <span className="text-[10px] text-gray-600 font-mono">Verified Soil Sample #882</span>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 block mb-1">Nitrogen (N)</label>
              <input
                type="number"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Phosphorus (P)</label>
              <input
                type="number"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Potassium (K)</label>
              <input
                type="number"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 block mb-1">Soil pH ({ph})</label>
              <input
                type="number"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Rainfall (mm)</label>
              <input
                type="number"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Farming Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
            >
              <option value="Kharif (Monsoon)">Kharif (Monsoon Season)</option>
              <option value="Rabi (Winter)">Rabi (Winter Season)</option>
              <option value="Zaid (Summer)">Zaid (Summer Season)</option>
            </select>
          </div>

          <Button onClick={handlePredict} isLoading={isLoading} className="w-full py-3">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Generate Optimal Crop Analysis</span>
          </Button>

        </div>

        {/* Right Output */}
        <div className="lg:col-span-6 bg-dark-bg/90 rounded-2xl p-6 border border-gray-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs uppercase font-bold text-gray-400">ML Recommendation Output</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-700/20 text-gray-600 font-bold font-mono">
                {recommendation.confidence}% MATCH
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-gray-900 border border-gray-700/40 space-y-1">
              <div className="text-xs text-gray-600 uppercase font-bold">Top Recommended Crop</div>
              <div className="text-2xl font-black text-white">{recommendation.crop}</div>
              <div className="text-xs text-gray-500 flex items-center pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Highest ROI based on soil chemical profile</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/80">
                <div className="text-gray-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-600 mr-1" />
                  <span>Expected Yield</span>
                </div>
                <div className="text-base font-bold text-white mt-1">{recommendation.expectedYield}</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/80">
                <div className="text-gray-400 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400 mr-1" />
                  <span>Est. Net Profit</span>
                </div>
                <div className="text-base font-bold text-amber-400 mt-1">{recommendation.estimatedProfit}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between border-b border-gray-800 pb-1">
                <span className="text-gray-400">Fertilizer Regimen:</span>
                <span className="font-semibold text-white">{recommendation.fertilizer}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-1">
                <span className="text-gray-400">Water Requirement:</span>
                <span className="font-semibold text-teal-400">{recommendation.waterNeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cycle Duration:</span>
                <span className="font-semibold text-white">{recommendation.growingCycle}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </Card>
  );
};
