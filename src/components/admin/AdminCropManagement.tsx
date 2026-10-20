"use client";

import React, { useState, useEffect } from "react";
import { Sprout, Edit, Trash2, Plus, X, Search, Map, Leaf, Layers, Droplets, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export function AdminCropManagement() {
  const [zones, setZones] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ZONES" | "CROPS">("ZONES");
  const [searchQuery, setSearchQuery] = useState("");

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [zoneForm, setZoneForm] = useState({
    name: "", minElevation: "", maxElevation: "", landform: "", majorCrops: ""
  });
  const [cropForm, setCropForm] = useState({
    name: "", expectedYield: "", growingPeriod: "", waterRequirement: "", fertilizer: "", pesticide: "", imageUrl: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zonesRes, cropsRes] = await Promise.all([
        fetch("/api/admin/zones"),
        fetch("/api/admin/crops")
      ]);

      if (zonesRes.ok) {
        const zData = await zonesRes.json();
        const rawZones = zData.zones || zData;
        const rawList = Array.isArray(rawZones) ? rawZones : Object.values(rawZones || {});
        
        const normalizedZones = rawList.map((z: any, idx: number) => ({
          ...z,
          id: z.id || idx + 1,
          name: z.name || `Region ${idx + 1}`,
          minElevation: z.minElevation ?? 0,
          maxElevation: z.maxElevation ?? 100,
          landform: z.landform || "Agricultural plain",
          majorCrops: Array.isArray(z.majorCrops)
            ? z.majorCrops
            : typeof z.majorCrops === "string"
            ? z.majorCrops.split(",").map((c: string) => c.trim()).filter(Boolean)
            : []
        }));
        setZones(normalizedZones);
      }

      if (cropsRes.ok) {
        const cData = await cropsRes.json();
        const rawCrops = cData.crops || cData;
        let cropList: any[] = [];

        if (Array.isArray(rawCrops)) {
          cropList = rawCrops;
        } else if (rawCrops && typeof rawCrops === "object") {
          cropList = Object.entries(rawCrops).map(([name, val]: [string, any], idx) => ({
            id: val.id || `crop-${idx + 1}`,
            name: val.name || name,
            expectedYield: val.expectedYield || "Standard Yield",
            growingPeriod: val.growingPeriod || "Seasonal",
            waterRequirement: val.waterRequirement || 3,
            fertilizer: val.fertilizer || "Organic Compost",
            pesticide: val.pesticide || "Organic Biopesticides",
            imageUrl: val.imageUrl || `/images/crops/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`
          }));
        }

        const normalizedCrops = cropList.map((c: any, idx: number) => ({
          ...c,
          id: c.id || `crop-${idx + 1}`,
          name: c.name || `Crop ${idx + 1}`,
          expectedYield: c.expectedYield || "Standard Yield",
          growingPeriod: c.growingPeriod || "Seasonal",
          waterRequirement: c.waterRequirement || 3,
          fertilizer: c.fertilizer || "Organic Compost",
          pesticide: c.pesticide || "Organic Biopesticides",
          imageUrl: c.imageUrl || ""
        }));
        setCrops(normalizedCrops);
      }
    } catch (err) {
      console.error("Failed to fetch crop management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleZoneChange = (e: any) => setZoneForm({ ...zoneForm, [e.target.name]: e.target.value });
  const handleCropChange = (e: any) => setCropForm({ ...cropForm, [e.target.name]: e.target.value });

  const openZoneModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      setZoneForm({
        name: item.name || "",
        minElevation: (item.minElevation ?? "").toString(),
        maxElevation: (item.maxElevation ?? "").toString(),
        landform: item.landform || "",
        majorCrops: Array.isArray(item.majorCrops) ? item.majorCrops.join(", ") : (item.majorCrops || "")
      });
    } else {
      setZoneForm({ name: "", minElevation: "", maxElevation: "", landform: "", majorCrops: "" });
    }
    setIsZoneModalOpen(true);
  };

  const openCropModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      setCropForm({
        name: item.name || "",
        expectedYield: item.expectedYield || "",
        growingPeriod: item.growingPeriod || "",
        waterRequirement: (item.waterRequirement ?? "3").toString(),
        fertilizer: item.fertilizer || "",
        pesticide: item.pesticide || "",
        imageUrl: item.imageUrl || ""
      });
    } else {
      setCropForm({ name: "", expectedYield: "", growingPeriod: "", waterRequirement: "3", fertilizer: "", pesticide: "", imageUrl: "" });
    }
    setIsCropModalOpen(true);
  };

  const deleteItem = async (type: "zones" | "crops", id: string) => {
    if (!confirm(`Delete this ${type === "zones" ? "region" : "crop"}?`)) return;
    const res = await fetch(`/api/admin/${type}?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const saveZone = async (e: any) => {
    e.preventDefault();
    const payload = {
      ...zoneForm,
      minElevation: parseFloat(zoneForm.minElevation) || 0,
      maxElevation: parseFloat(zoneForm.maxElevation) || 0,
      majorCrops: zoneForm.majorCrops.split(",").map((c: string) => c.trim()).filter(Boolean)
    };
    
    if (editingItem) {
      await fetch(`/api/admin/zones`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingItem.id, ...payload }) 
      });
    } else {
      await fetch(`/api/admin/zones`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    setIsZoneModalOpen(false);
    fetchData();
  };

  const saveCrop = async (e: any) => {
    e.preventDefault();
    let finalImageUrl = cropForm.imageUrl;
    
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalImageUrl = url;
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    const payload = {
      ...cropForm,
      imageUrl: finalImageUrl,
      waterRequirement: parseFloat(cropForm.waterRequirement) || 3
    };
    
    if (editingItem) {
      await fetch(`/api/admin/crops`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingItem.id, ...payload }) 
      });
    } else {
      await fetch(`/api/admin/crops`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    setIsCropModalOpen(false);
    fetchData();
  };

  // Safe arrays for filtering
  const safeZones = Array.isArray(zones) ? zones : [];
  const safeCrops = Array.isArray(crops) ? crops : [];

  const filteredZones = safeZones.filter(z => 
    (z?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(z?.majorCrops) ? z.majorCrops.join(" ") : "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (z?.landform || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCrops = safeCrops.filter(c => 
    (c?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c?.growingPeriod || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c?.fertilizer || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Sprout className="w-5 h-5 mr-2 text-emerald-600" />
            Stock &amp; AI Crop Profile Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage agro-climatic region standards, agricultural crop profiles, and cultivation inputs.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search regions or crops..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>
          <button 
            type="button"
            onClick={() => activeTab === 'ZONES' ? openZoneModal() : openCropModal()}
            className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add {activeTab === 'ZONES' ? 'Region' : 'Crop'}
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Agro-Climatic Regions</span>
          <div className="text-xl font-black text-gray-900 mt-0.5">{safeZones.length}</div>
        </div>
        <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Crop Varieties in Stock</span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{safeCrops.length}</div>
        </div>
        <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Perennial Crops</span>
          <div className="text-xl font-black text-gray-900 mt-0.5">
            {safeCrops.filter(c => (c.growingPeriod || '').toLowerCase().includes('perennial')).length}
          </div>
        </div>
        <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Seasonal &amp; Annual</span>
          <div className="text-xl font-black text-gray-900 mt-0.5">
            {safeCrops.filter(c => !(c.growingPeriod || '').toLowerCase().includes('perennial')).length}
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex space-x-4 border-b border-gray-100 mb-4">
        <button 
          type="button"
          onClick={() => setActiveTab("ZONES")} 
          className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === "ZONES" 
              ? "border-emerald-800 text-emerald-900" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center"><Map className="w-3.5 h-3.5 mr-1"/> Agro-Climatic Regions ({safeZones.length})</span>
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("CROPS")} 
          className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === "CROPS" 
              ? "border-emerald-800 text-emerald-900" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center"><Leaf className="w-3.5 h-3.5 mr-1"/> Crop Profiles ({safeCrops.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500 animate-pulse">Loading agricultural data...</div>
      ) : activeTab === "ZONES" ? (
        <div className="overflow-x-auto">
          {filteredZones.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400">No regions match your search query.</div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Region Name</th>
                  <th className="px-4 py-3">Elevation (m)</th>
                  <th className="px-4 py-3">Landform</th>
                  <th className="px-4 py-3">Major Suitable Crops</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredZones.map(z => (
                  <tr key={z.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900">{z.name}</td>
                    <td className="px-4 py-3.5 font-mono text-gray-600">{z.minElevation}m - {z.maxElevation}m</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">{z.landform}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {(Array.isArray(z.majorCrops) ? z.majorCrops : []).map((crop: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-semibold">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        type="button" 
                        onClick={() => openZoneModal(z)} 
                        className="p-1.5 text-gray-400 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Edit Region"
                      >
                        <Edit className="w-3.5 h-3.5"/>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => deleteItem("zones", z.id)} 
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                        title="Delete Region"
                      >
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredCrops.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400">No crops match your search query.</div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Crop Name</th>
                  <th className="px-4 py-3">Expected Yield</th>
                  <th className="px-4 py-3">Growing Period</th>
                  <th className="px-4 py-3">Water / Inputs</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCrops.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      <div className="flex items-center space-x-2.5">
                        {c.imageUrl ? (
                          <SafeImage src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Leaf className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{c.expectedYield}</td>
                    <td className="px-4 py-3.5 text-gray-600">{c.growingPeriod}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span>Water: {c.waterRequirement}/5</span>
                      </div>
                      <div className="truncate max-w-xs text-gray-400 mt-0.5">
                        Fert: {c.fertilizer}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        type="button" 
                        onClick={() => openCropModal(c)} 
                        className="p-1.5 text-gray-400 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Edit Crop"
                      >
                        <Edit className="w-3.5 h-3.5"/>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => deleteItem("crops", c.id)} 
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                        title="Delete Crop"
                      >
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form onSubmit={saveZone} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase text-gray-900">{editingItem ? "Edit Agro-Climatic Region" : "Add Agro-Climatic Region"}</h3>
              <button type="button" onClick={() => setIsZoneModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700">Region Name</label>
                <input required name="name" value={zoneForm.name} onChange={handleZoneChange} placeholder="e.g. Wayanad Plateau" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700">Min Elevation (m)</label>
                  <input required type="number" step="0.1" name="minElevation" value={zoneForm.minElevation} onChange={handleZoneChange} placeholder="0" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700">Max Elevation (m)</label>
                  <input required type="number" step="0.1" name="maxElevation" value={zoneForm.maxElevation} onChange={handleZoneChange} placeholder="100" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700">Landform Description</label>
                <input required name="landform" value={zoneForm.landform} onChange={handleZoneChange} placeholder="Undulating plains, valleys..." className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700">Major Crops (comma-separated)</label>
                <input required name="majorCrops" value={zoneForm.majorCrops} onChange={handleZoneChange} placeholder="Coconut, Paddy, Banana, Pepper" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
            </div>
            <div className="flex justify-end mt-5 space-x-2">
              <button type="button" onClick={() => setIsZoneModalOpen(false)} className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold cursor-pointer transition-colors">Save Region</button>
            </div>
          </form>
        </div>
      )}

      {/* Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form onSubmit={saveCrop} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase text-gray-900">{editingItem ? "Edit Crop Profile" : "Add Crop Profile"}</h3>
              <button type="button" onClick={() => setIsCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700">Crop Name</label>
                <input required name="name" value={cropForm.name} onChange={handleCropChange} placeholder="e.g. Cardamom" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Crop Photo</label>
                <div className="flex items-center space-x-3">
                  {cropForm.imageUrl && (
                    <img src={cropForm.imageUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (!file.type.startsWith("image/")) {
                          alert("Strict Validation Error: Only image files are allowed.");
                          return;
                        }
                        setCropForm({ ...cropForm, imageUrl: URL.createObjectURL(file) });
                      }
                    }} 
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700">Expected Yield</label>
                  <input required name="expectedYield" value={cropForm.expectedYield} onChange={handleCropChange} placeholder="e.g. 2 - 3 Ton/ha" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700">Growing Period</label>
                  <input required name="growingPeriod" value={cropForm.growingPeriod} onChange={handleCropChange} placeholder="e.g. 6 - 8 Months" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700">Water Requirement (1 to 5 Index)</label>
                <input required type="number" min="1" max="5" step="0.5" name="waterRequirement" value={cropForm.waterRequirement} onChange={handleCropChange} placeholder="Water Req (1-5)" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700">Recommended Fertilizer</label>
                <input required name="fertilizer" value={cropForm.fertilizer} onChange={handleCropChange} placeholder="NPK 90-45-45" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700">Recommended Pesticide</label>
                <input required name="pesticide" value={cropForm.pesticide} onChange={handleCropChange} placeholder="Neem based / Biopesticides" className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" />
              </div>
            </div>
            <div className="flex justify-end mt-5 space-x-2">
              <button type="button" onClick={() => setIsCropModalOpen(false)} className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold cursor-pointer transition-colors">Save Crop</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
