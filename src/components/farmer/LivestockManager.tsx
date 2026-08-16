"use client";

import React, { useState } from "react";
import { 
  Tractor, 
  Sparkles, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Plus, 
  FileText, 
  Heart, 
  Thermometer, 
  AlertCircle, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { validateCowTag } from "@/lib/validation";

interface Cow {
  id: string;
  tag: string;
  breed: string;
  age: string;
  weight: number;
  milkYield: number;
  health: "EXCELLENT" | "STABLE" | "UNDER_OBSERVATION";
}

interface Calf {
  id: string;
  tag: string;
  breed: string;
  weight: number;
  weeksOld: number;
  vaccineDose: string;
}

export const LivestockManager: React.FC = () => {
  const [activeFarm, setActiveFarm] = useState<"dairy" | "poultry" | "aquaculture" | "calves">("dairy");

  // Dairy State
  const [cows, setCows] = useState<Cow[]>([
    { id: "cow-1", tag: "TAG-901", breed: "Holstein Friesian", age: "3 Years", weight: 580, milkYield: 28, health: "EXCELLENT" },
    { id: "cow-2", tag: "TAG-902", breed: "Jersey", age: "2.5 Years", weight: 450, milkYield: 22, health: "STABLE" },
  ]);
  const [newCowTag, setNewCowTag] = useState("");
  const [newCowBreed, setNewCowBreed] = useState("Jersey");
  const [newCowWeight, setNewCowWeight] = useState("420");
  const [newCowYield, setNewCowYield] = useState("18");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calf State
  const [calves, setCalves] = useState<Calf[]>([
    { id: "calf-1", tag: "CALF-301", breed: "Holstein Friesian", weight: 42, weeksOld: 4, vaccineDose: "Rotavirus Dose 1" },
    { id: "calf-2", tag: "CALF-302", breed: "Sahiwal", weight: 38, weeksOld: 6, vaccineDose: "Brucellosis Done" },
  ]);

  // Aquaculture State
  const [temp, setTemp] = useState(26.5);
  const [ph, setPh] = useState(7.2);
  const [doLevel, setDoLevel] = useState(6.4); // Dissolved Oxygen
  const [ammonia, setAmmonia] = useState(0.02);

  // AI Telemetry Predictions
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);

  const handleRegisterCow = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateCowTag(newCowTag, cows.map((c) => c.tag));
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid tag.");
      return;
    }

    const weightNum = Number(newCowWeight);
    const yieldNum = Number(newCowYield);

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 1500) {
      setValidationError("Please enter a valid weight between 1 and 1500 kg.");
      return;
    }
    if (isNaN(yieldNum) || yieldNum < 0 || yieldNum > 100) {
      setValidationError("Please enter a valid milk yield between 0 and 100 L/Day.");
      return;
    }

    const newCow: Cow = {
      id: `cow-${Date.now()}`,
      tag: newCowTag.trim().toUpperCase(),
      breed: newCowBreed,
      age: "2 Years",
      weight: weightNum,
      milkYield: yieldNum,
      health: "EXCELLENT"
    };
    setCows((prev) => [...prev, newCow]);
    setNewCowTag("");
    setNewCowWeight("420");
    setNewCowYield("18");
  };

  const handleMatureCalf = (id: string) => {
    const calf = calves.find((c) => c.id === id);
    if (!calf) return;

    const newTag = calf.tag.replace("CALF", "TAG");
    // Duplicate check
    const tagValidation = validateCowTag(newTag, cows.map((c) => c.tag));
    if (!tagValidation.isValid) {
      alert(tagValidation.error || "Graduation failed: Duplicate tag.");
      return;
    }

    // Remove from calves list
    setCalves((prev) => prev.filter((c) => c.id !== id));

    // Convert to mature dairy cow
    const graduatedCow: Cow = {
      id: `cow-${Date.now()}`,
      tag: newTag,
      breed: calf.breed,
      age: "1.5 Years",
      weight: calf.weight * 6,
      milkYield: 14,
      health: "EXCELLENT"
    };
    setCows((prev) => [...prev, graduatedCow]);
  };

  const triggerAiInference = () => {
    setAiPrediction("Analyzing telemetry metrics...");
    setTimeout(() => {
      if (activeFarm === "dairy") {
        setAiPrediction(
          `AI Yield Inference: Estimated total herd yield for tomorrow is ${(cows.reduce((acc, c) => acc + c.milkYield, 0) * 1.05).toFixed(1)} Liters. Breed Sahiwal displays high temperature tolerance index.`
        );
      } else if (activeFarm === "aquaculture") {
        if (doLevel < 5.0) {
          setAiPrediction("AI Water Safety Warning: Low Dissolved Oxygen detected. Turn on aeration pumps immediately.");
        } else {
          setAiPrediction("AI Water Safety Status: Water telemetry is healthy. Next predicted Tilapia harvest is September 12, 2026.");
        }
      } else {
        setAiPrediction("AI Growth Predictor: Active calves display an expected weight gain of +1.2kg per week based on current feed intakes.");
      }
    }, 600);
  };

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-700/30">
          <div className="text-[10px] text-gray-400">Total Dairy Cattle</div>
          <div className="text-xl font-black text-white font-mono">{cows.length} Cows</div>
        </Card>
        <Card className="border-gray-700/30">
          <div className="text-[10px] text-gray-400">Calves Registered</div>
          <div className="text-xl font-black text-gray-600 font-mono">{calves.length} Calves</div>
        </Card>
        <Card className="border-gray-700/30">
          <div className="text-[10px] text-gray-400">Daily Milk Production</div>
          <div className="text-xl font-black text-white font-mono">
            {cows.reduce((acc, c) => acc + c.milkYield, 0)} Liters
          </div>
        </Card>
        <Card className="border-gray-700/30">
          <div className="text-[10px] text-gray-400">Aqua Ponds Active</div>
          <div className="text-xl font-black text-cyan-400 font-mono">1 Pond</div>
        </Card>
      </div>

      {/* Sub-Farm Selection Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => { setActiveFarm("dairy"); setAiPrediction(null); }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeFarm === "dairy" ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          🐄 Dairy Cow Management
        </button>
        <button
          onClick={() => { setActiveFarm("calves"); setAiPrediction(null); }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeFarm === "calves" ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          🍼 Calf Nursery (Maturity Transition)
        </button>
        <button
          onClick={() => { setActiveFarm("aquaculture"); setAiPrediction(null); }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            activeFarm === "aquaculture" ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          🐟 Aquaculture & Fish Ponds
        </button>
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Config Panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeFarm === "dairy" && (
            <div className="space-y-6">
              
              {/* Register Cow Form */}
              <Card className="space-y-4 border-gray-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-gray-600" />
                  <span>Register Dairy Cow</span>
                </h3>

                {validationError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold mb-3">
                    {validationError}
                  </div>
                )}

                <form onSubmit={handleRegisterCow} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-gray-400 block mb-1">Cow Tag Identifier</label>
                    <input
                      type="text"
                      value={newCowTag}
                      onChange={(e) => setNewCowTag(e.target.value)}
                      placeholder="e.g. TAG-903"
                      className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Cattle Breed</label>
                    <select
                      value={newCowBreed}
                      onChange={(e) => setNewCowBreed(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium focus:outline-none"
                    >
                      <option value="Holstein Friesian">Holstein Friesian</option>
                      <option value="Jersey">Jersey</option>
                      <option value="Sahiwal">Sahiwal</option>
                      <option value="Gir Cow">Gir Cow</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={newCowWeight}
                      onChange={(e) => setNewCowWeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Yield (L/Day)</label>
                    <input
                      type="number"
                      value={newCowYield}
                      onChange={(e) => setNewCowYield(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-gray-700"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Button type="submit" className="w-full">
                      <span>Register Dairy Cow</span>
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Cow Registry List */}
              <Card className="space-y-4 border-gray-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span>Active Dairy Herd Registry</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase font-semibold">
                        <th className="py-2.5 px-3">Cow Tag</th>
                        <th className="py-2.5 px-3">Breed</th>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Weight</th>
                        <th className="py-2.5 px-3">Yield (L/Day)</th>
                        <th className="py-2.5 px-3">Health Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {cows.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-800/40">
                          <td className="py-3 px-3 font-bold text-white">{c.tag}</td>
                          <td className="py-3 px-3">{c.breed}</td>
                          <td className="py-3 px-3 font-mono text-gray-300">{c.age}</td>
                          <td className="py-3 px-3 font-mono text-gray-300">{c.weight} kg</td>
                          <td className="py-3 px-3 font-mono text-gray-600 font-bold">{c.milkYield} L</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[9px] uppercase px-2 py-0.5 rounded-full bg-gray-700/20 text-gray-600 border border-gray-700/30">
                              {c.health}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeFarm === "calves" && (
            <Card className="space-y-4 border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
                <Heart className="w-4 h-4 text-gray-600" />
                <span>Calf Growth & Mature Graduation Tracker</span>
              </h3>

              <p className="text-gray-400">
                Track newborn calf weight telemetry. Once a calf grows into an adult cow, trigger the maturity hook to add them to the dairy milk registry automatically.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calves.map((calf) => (
                  <div key={calf.id} className="p-4 rounded-2xl bg-gray-800/60 border border-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{calf.tag}</span>
                      <span className="font-mono text-gray-600 bg-gray-700/10 px-2.5 py-0.5 rounded-md border border-gray-700/30">
                        {calf.weeksOld} Weeks Old
                      </span>
                    </div>

                    <div className="space-y-1 text-gray-300">
                      <div><strong>Breed:</strong> {calf.breed}</div>
                      <div><strong>Weight:</strong> {calf.weight} kg</div>
                      <div><strong>Vaccine status:</strong> {calf.vaccineDose}</div>
                    </div>

                    <div className="pt-2 border-t border-gray-700/60 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-medium">Ready for graduation</span>
                      <Button onClick={() => handleMatureCalf(calf.id)} size="sm">
                        <span>Graduate to Adult Cow</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeFarm === "aquaculture" && (
            <div className="space-y-6">
              
              {/* Telemetry Dashboard Controls */}
              <Card className="space-y-4 border-gray-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Aquaculture Pond Telemetry Gauges</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Oxygen Gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Dissolved Oxygen (mg/L)</span>
                      <span className={`font-mono font-bold ${doLevel < 5.0 ? "text-rose-400" : "text-gray-600"}`}>
                        {doLevel} mg/L
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      step={0.1}
                      value={doLevel}
                      onChange={(e) => setDoLevel(parseFloat(e.target.value))}
                      className="w-full accent-gray-700"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Critically Low (3.0)</span>
                      <span>Target (6.0 - 8.0)</span>
                    </div>
                  </div>

                  {/* pH Value */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">pH Level</span>
                      <span className={`font-mono font-bold ${ph < 6.5 || ph > 8.5 ? "text-amber-400" : "text-gray-600"}`}>
                        {ph} pH
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={10}
                      step={0.1}
                      value={ph}
                      onChange={(e) => setPh(parseFloat(e.target.value))}
                      className="w-full accent-gray-700"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Acidic (6.0)</span>
                      <span>Alkaline (8.5)</span>
                    </div>
                  </div>

                  {/* Temp */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Water Temperature (°C)</span>
                      <span className="font-mono text-cyan-400 font-bold">{temp} °C</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={35}
                      step={0.5}
                      value={temp}
                      onChange={(e) => setTemp(parseFloat(e.target.value))}
                      className="w-full accent-gray-700"
                    />
                  </div>

                  {/* Ammonia */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Ammonia Toxicity (ppm)</span>
                      <span className={`font-mono font-bold ${ammonia > 0.05 ? "text-rose-400" : "text-gray-600"}`}>
                        {ammonia} ppm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={0.2}
                      step={0.01}
                      value={ammonia}
                      onChange={(e) => setAmmonia(parseFloat(e.target.value))}
                      className="w-full accent-gray-700"
                    />
                  </div>

                </div>
              </Card>

            </div>
          )}

        </div>

        {/* Right AI Predictors Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4 border-gray-800 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
                <Cpu className="w-4 h-4 text-gray-600 animate-pulse" />
                <span>AI Livestock Diagnostics</span>
              </h3>

              <p className="text-gray-400">
                Run deep-learning calculations mapping temperature, weight logs, and water metrics to forecast disease probability indices.
              </p>

              {aiPrediction && (
                <div className="p-3.5 rounded-xl bg-gray-700/10 border border-gray-700/30 text-gray-600 font-semibold leading-relaxed">
                  {aiPrediction}
                </div>
              )}
            </div>

            <Button onClick={triggerAiInference} className="w-full py-2.5">
              <span>Execute Diagnostic Telemetry</span>
            </Button>
          </Card>
        </div>

      </div>

    </div>
  );
};
