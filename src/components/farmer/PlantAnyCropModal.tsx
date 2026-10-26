"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Leaf, Sprout, ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

interface PlantAnyCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCrop: (cropName: string) => void;
  onPlantCrop?: (crop: any) => void;
}

export function PlantAnyCropModal({ isOpen, onClose, onSelectCrop, onPlantCrop }: PlantAnyCropModalProps) {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Crops");

  const fetchCrops = () => {
    setLoading(true);
    fetch(`/api/crops?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.crops)) {
          const cropDict: Record<string, any> = {};
          for (const c of data.crops) {
            const key = (c.name || '').toLowerCase().trim();
            if (key && !cropDict[key]) {
              cropDict[key] = c;
            }
          }
          setCrops(Object.values(cropDict));
        }
      })
      .catch(err => console.error("Failed to load crops:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchCrops();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      if (isOpen) fetchCrops();
    };
    window.addEventListener("crop-data-updated", handleUpdate);
    return () => window.removeEventListener("crop-data-updated", handleUpdate);
  }, [isOpen]);


  const categories = useMemo(() => {
    const cats = new Set(crops.map(c => c.category || "Uncategorized"));
    return ["All Crops", ...Array.from(cats)].sort();
  }, [crops]);

  const filteredCrops = useMemo(() => {
    return crops.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All Crops" || (c.category || "Uncategorized") === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [crops, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] relative z-10 border border-gray-100">
        
        <div className="p-3.5 sm:p-5 flex items-start justify-between border-b border-gray-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-green-600" />
              Choose a Crop to Plant
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Select any crop and AGRI-NOVA will provide a cultivation guide.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search crops..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-green-500"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 touch-scroll">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Sprout className="w-8 h-8 mb-3 animate-pulse text-green-200" />
                <p className="text-xs font-semibold">Loading available crops...</p>
             </div>
          ) : filteredCrops.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center">
                <Leaf className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-semibold">No crops found</p>
                <p className="text-xs mt-1">Try adjusting your search or category filter.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCrops.map(crop => (
                <div 
                  key={crop.id}
                  className="flex flex-col p-3 rounded-2xl border border-gray-200 bg-white hover:border-green-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center text-left mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 mr-3 flex-shrink-0 overflow-hidden border border-gray-200">
                      {crop.imageUrl ? (
                        <SafeImage src={crop.imageUrl} alt={crop.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50"><Leaf className="w-5 h-5"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{crop.name}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{crop.category || "General Crop"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (onPlantCrop) {
                          onPlantCrop(crop);
                        } else {
                          onSelectCrop(crop.name);
                        }
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <Sprout className="w-3.5 h-3.5" />
                      <span>Plant Crop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCrop(crop.name);
                        onClose();
                      }}
                      className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold rounded-xl transition-colors cursor-pointer"
                      title="View Cultivation Guide"
                    >
                      Guide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
