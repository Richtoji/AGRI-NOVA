"use client";

import React, { useState, useEffect } from "react";
import { X, Sprout, Calendar, Droplets, ShieldAlert, Leaf, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

interface CropCultivationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
  isRecommended: boolean;
  zoneName?: string;
  onStartCultivation: (cropId: string, cropName?: string, profileData?: any) => void;
}

export function CropCultivationGuideModal({ isOpen, onClose, cropName, isRecommended, zoneName, onStartCultivation }: CropCultivationGuideModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && cropName) {
      setLoading(true);
      fetch(`/api/crops/guide?cropName=${encodeURIComponent(cropName)}&t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData);
          } else {
            setError(resData.error || "Failed to load guide");
          }
        })
        .catch(() => setError("Network error"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, cropName]);

  if (!isOpen) return null;

  const profile = data?.profile;
  const guide = data?.guide;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="relative h-36 sm:h-48 bg-gray-100 rounded-t-2xl overflow-hidden shrink-0">
          {profile?.imageUrl ? (
             <SafeImage src={profile.imageUrl} alt={cropName} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200">
               <Sprout className="w-24 h-24" />
             </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{cropName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isRecommended ? (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-green-500/20 backdrop-blur-md border border-green-400/30 text-green-50 text-xs font-bold rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Recommended for {zoneName}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-amber-50 text-xs font-bold rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Not currently recommended for {zoneName || 'your region'}</span>
                </span>
              )}
              {profile?.category && (
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                  {profile.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-y-auto hidden md:block">
            <div className="p-4 space-y-1">
              {['OVERVIEW', 'LAND PREPARATION', 'PLANTING', 'MANURE & FERTILIZER', 'WATER MANAGEMENT', 'PEST & DISEASE', 'GROWTH STAGES', 'HARVESTING'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                      : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Tabs (Scrollable horizontal) */}
          <div className="w-full bg-gray-50 border-b border-gray-100 flex-shrink-0 overflow-x-auto no-scrollbar touch-scroll md:hidden p-2 flex space-x-2">
             {['OVERVIEW', 'LAND PREPARATION', 'PLANTING', 'MANURE', 'WATER', 'PESTS', 'STAGES', 'HARVEST'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.includes('MANURE') ? 'MANURE & FERTILIZER' : tab.includes('PEST') ? 'PEST & DISEASE' : tab.includes('WATER') ? 'WATER MANAGEMENT' : tab)}
                  className={`flex-shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] font-bold transition-all ${
                    activeTab.includes(tab) || (tab === 'MANURE' && activeTab === 'MANURE & FERTILIZER') || (tab === 'PESTS' && activeTab === 'PEST & DISEASE') || (tab === 'WATER' && activeTab === 'WATER MANAGEMENT')
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
          </div>

          {/* Main Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white touch-scroll">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Sprout className="w-10 h-10 mb-3 animate-pulse text-green-200" />
                <p className="text-sm font-semibold">Loading cultivation data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-red-400">
                <AlertTriangle className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Non-Recommended Warning */}
                {!isRecommended && activeTab === 'OVERVIEW' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-bold mb-1 text-amber-900">Regional Suitability Notice</h4>
                      <p className="text-xs font-medium opacity-90 leading-relaxed">
                        This crop is not currently recommended for your region according to the available AGRI-NOVA regional data. You may still choose to cultivate it. Review the crop requirements carefully before starting cultivation.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'OVERVIEW' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-2">About {cropName}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{profile?.description || "No detailed description available."}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Scientific Name</p>
                        <p className="text-sm font-bold text-gray-900">{profile?.scientificName || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expected Yield</p>
                        <p className="text-sm font-bold text-gray-900">{profile?.expectedYield || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Growing Period</p>
                        <p className="text-sm font-bold text-gray-900">{profile?.growingPeriod || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 sm:col-span-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Climate Requirements</p>
                        <p className="text-xs font-semibold text-gray-700">{profile?.climateRequirements || "Information not available."}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'LAND PREPARATION' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Land & Soil Preparation</h3>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Soil Requirements</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{profile?.soilRequirements || "N/A"}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Preparation Guide</p>
                      {guide?.landPreparation ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed space-y-2">
                           {guide.landPreparation}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific land preparation instructions available.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'PLANTING' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900">Planting Guide</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Seed Information</p>
                        <p className="text-sm text-blue-900 font-medium">{guide?.seedInformation || "N/A"}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">Recommended Spacing</p>
                        <p className="text-sm text-green-900 font-medium">{guide?.spacing || "N/A"}</p>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Planting Method (Step-by-step)</p>
                       {guide?.plantingMethod ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                           {guide.plantingMethod}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific planting instructions available.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'MANURE & FERTILIZER' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900">Nutrition Management</h3>
                    
                    {guide?.manureFertilizers?.length > 0 ? (
                      <div className="space-y-4">
                        {guide.manureFertilizers.map((item: any) => (
                          <div key={item.id} className={`p-4 rounded-xl border ${item.isOrganic ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block ${item.isOrganic ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>
                                  {item.isOrganic ? 'ORGANIC MANURE' : 'FERTILIZER'}
                                </span>
                                <h4 className="font-bold text-gray-900">{item.inputName}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-gray-900">{item.quantity} {item.unit}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div><strong className="text-gray-500">Stage:</strong> {item.applicationStage || 'N/A'}</div>
                              <div><strong className="text-gray-500">Frequency:</strong> {item.frequency || 'Once'}</div>
                              <div className="col-span-2"><strong className="text-gray-500">Method:</strong> {item.applicationMethod || 'N/A'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                        <p className="text-sm text-gray-500 italic">No detailed fertilizer schedule configured for this crop.</p>
                        <p className="text-xs text-gray-400 mt-2">General guidance: {profile?.fertilizer || "N/A"}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'WATER MANAGEMENT' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900">Irrigation Schedule</h3>
                    
                    {guide?.wateringSchedules?.length > 0 ? (
                      <div className="space-y-4">
                        {guide.wateringSchedules.map((item: any) => (
                          <div key={item.id} className="p-4 rounded-xl border bg-sky-50 border-sky-100 relative overflow-hidden">
                            <Droplets className="absolute -right-4 -bottom-4 w-24 h-24 text-sky-500/10" />
                            <h4 className="font-bold text-sky-900 mb-2 relative z-10">{item.growthStage} Stage</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
                              <div className="bg-white/60 p-2 rounded-lg">
                                <span className="block text-[9px] font-bold text-sky-600 uppercase mb-0.5">Frequency</span>
                                <span className="font-semibold text-gray-900">{item.frequency}</span>
                              </div>
                              <div className="bg-white/60 p-2 rounded-lg">
                                <span className="block text-[9px] font-bold text-sky-600 uppercase mb-0.5">Method</span>
                                <span className="font-semibold text-gray-900">{item.irrigationMethod || 'Standard'}</span>
                              </div>
                            </div>
                            {item.specialInstructions && (
                              <p className="mt-3 text-xs text-sky-800 bg-sky-100/50 p-2 rounded-lg relative z-10">
                                <strong className="font-bold">Instructions: </strong>{item.specialInstructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                        <p className="text-sm text-gray-500 italic">No detailed watering schedule configured for this crop.</p>
                        <p className="text-xs text-gray-400 mt-2">Relative Water Requirement: {profile?.waterRequirement}/5</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'PEST & DISEASE' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900">Health & Protection</h3>
                    
                    {guide?.pestDiseases?.length > 0 ? (
                      <div className="space-y-4">
                        {guide.pestDiseases.map((item: any) => (
                          <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.problemType.toLowerCase() === 'disease' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                                {item.problemType.toUpperCase()}
                              </span>
                              <h4 className="font-bold text-gray-900">{item.problemName}</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              {item.symptoms && <div><span className="font-semibold text-gray-700">Symptoms: </span><span className="text-gray-600">{item.symptoms}</span></div>}
                              {item.prevention && <div><span className="font-semibold text-gray-700">Prevention: </span><span className="text-gray-600">{item.prevention}</span></div>}
                              {item.treatment && <div className="bg-green-50 p-2 rounded-lg border border-green-100 text-green-800"><span className="font-bold">Treatment: </span>{item.treatment}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                        <p className="text-sm text-gray-500 italic">No pest or disease management information has been configured for this crop yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'GROWTH STAGES' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Crop Lifecycle</h3>
                    
                    {guide?.cultivationStages?.length > 0 ? (
                      <div className="relative border-l-2 border-green-200 ml-4 space-y-8 pb-4">
                        {guide.cultivationStages.sort((a:any,b:any)=>a.stageOrder - b.stageOrder).map((item: any, idx: number) => (
                          <div key={item.id} className="relative pl-6">
                            <div className="absolute w-4 h-4 rounded-full bg-green-500 border-4 border-white -left-[9px] top-1 shadow-sm"></div>
                            <h4 className="font-bold text-gray-900 mb-1">{item.stageName}</h4>
                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2">Day {item.startDay} {item.endDay ? `- ${item.endDay}` : 'onwards'}</p>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            
                            {(item.waterReq || item.manureReq || item.careInstructions) && (
                              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1.5 border border-gray-100">
                                {item.waterReq && <div><strong className="text-gray-700">Water:</strong> {item.waterReq}</div>}
                                {item.manureReq && <div><strong className="text-gray-700">Nutrition:</strong> {item.manureReq}</div>}
                                {item.careInstructions && <div><strong className="text-gray-700">Care:</strong> {item.careInstructions}</div>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                        <p className="text-sm text-gray-500 italic">No specific growth stages have been configured.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'HARVESTING' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900">Harvesting & Post-Harvest</h3>
                    
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Harvesting Guidelines</p>
                      {guide?.harvesting ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed space-y-2">
                           {guide.harvesting}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific harvesting instructions available.</p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Post-Harvest Handling</p>
                      {guide?.postHarvest ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed space-y-2">
                           {guide.postHarvest}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific post-harvest instructions available.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center shrink-0">
          <p className="text-xs text-gray-500 hidden sm:block">Cultivation information managed by AGRI-NOVA Agricultural Experts.</p>
          <div className="flex w-full sm:w-auto space-x-2.5 sm:space-x-3">
             <button onClick={onClose} className="flex-1 sm:flex-initial px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
               Close Guide
             </button>
             <button 
               onClick={() => {
                 onStartCultivation(profile?.id || cropName, cropName, profile);
                 onClose();
               }} 
               className="flex-1 sm:flex-initial px-4 py-2 sm:px-6 sm:py-2.5 text-xs font-black text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
             >
               START CULTIVATION
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
