"use client";

import React, { useState, useEffect } from "react";
import { Sprout, Edit, Trash2, Plus, X, Search, Map, Leaf } from "lucide-react";

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
    name: "", expectedYield: "", growingPeriod: "", waterRequirement: "", fertilizer: "", pesticide: ""
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
        setZones(zData.zones || []);
      }
      if (cropsRes.ok) {
        const cData = await cropsRes.json();
        setCrops(cData.crops || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
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
        name: item.name,
        minElevation: item.minElevation.toString(),
        maxElevation: item.maxElevation.toString(),
        landform: item.landform,
        majorCrops: item.majorCrops.join(", ")
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
        name: item.name,
        expectedYield: item.expectedYield,
        growingPeriod: item.growingPeriod,
        waterRequirement: item.waterRequirement.toString(),
        fertilizer: item.fertilizer,
        pesticide: item.pesticide
      });
    } else {
      setCropForm({ name: "", expectedYield: "", growingPeriod: "", waterRequirement: "", fertilizer: "", pesticide: "" });
    }
    setIsCropModalOpen(true);
  };

  const deleteItem = async (type: "zones" | "crops", id: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    const res = await fetch(`/api/admin/${type}?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const saveZone = async (e: any) => {
    e.preventDefault();
    const payload = {
      ...zoneForm,
      minElevation: parseFloat(zoneForm.minElevation),
      maxElevation: parseFloat(zoneForm.maxElevation),
      majorCrops: zoneForm.majorCrops.split(",").map((c: string) => c.trim())
    };
    
    if (editingItem) {
      await fetch(`/api/admin/zones`, { method: "PATCH", body: JSON.stringify({ id: editingItem.id, ...payload }) });
    } else {
      await fetch(`/api/admin/zones`, { method: "POST", body: JSON.stringify(payload) });
    }
    setIsZoneModalOpen(false);
    fetchData();
  };

  const saveCrop = async (e: any) => {
    e.preventDefault();
    const payload = {
      ...cropForm,
      waterRequirement: parseFloat(cropForm.waterRequirement)
    };
    
    if (editingItem) {
      await fetch(`/api/admin/crops`, { method: "PATCH", body: JSON.stringify({ id: editingItem.id, ...payload }) });
    } else {
      await fetch(`/api/admin/crops`, { method: "POST", body: JSON.stringify(payload) });
    }
    setIsCropModalOpen(false);
    fetchData();
  };

  const filteredZones = zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCrops = crops.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Sprout className="w-5 h-5 mr-2 text-green-600" />
            AI Crop Recommendation Settings
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage agro-climatic regions and crop profiles.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs focus:outline-none focus:border-gray-300"
            />
          </div>
          <button 
            onClick={() => activeTab === 'ZONES' ? openZoneModal() : openCropModal()}
            className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add {activeTab === 'ZONES' ? 'Region' : 'Crop'}
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-100 mb-4">
        <button 
          onClick={() => setActiveTab("ZONES")} 
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === "ZONES" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center"><Map className="w-3.5 h-3.5 mr-1"/> Agro-Climatic Regions</span>
        </button>
        <button 
          onClick={() => setActiveTab("CROPS")} 
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === "CROPS" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center"><Leaf className="w-3.5 h-3.5 mr-1"/> Crop Profiles</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-500 animate-pulse">Loading data...</div>
      ) : activeTab === "ZONES" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Region Name</th>
                <th className="px-4 py-3">Elevation (m)</th>
                <th className="px-4 py-3">Major Crops</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredZones.map(z => (
                <tr key={z.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{z.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{z.minElevation} - {z.maxElevation}</td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{z.majorCrops.join(", ")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openZoneModal(z)} className="p-1 text-gray-400 hover:text-sky-600"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => deleteItem("zones", z.id)} className="p-1 text-gray-400 hover:text-rose-600 ml-1"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Crop Name</th>
                <th className="px-4 py-3">Yield</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Water / Fert.</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCrops.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.expectedYield}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.growingPeriod}</td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">
                    <div>W: {c.waterRequirement}</div>
                    <div>F: {c.fertilizer}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openCropModal(c)} className="p-1 text-gray-400 hover:text-sky-600"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => deleteItem("crops", c.id)} className="p-1 text-gray-400 hover:text-rose-600 ml-1"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form onSubmit={saveZone} className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-black text-sm mb-4 uppercase">{editingItem ? "Edit Region" : "Add Region"}</h3>
            <div className="space-y-3">
              <input required name="name" value={zoneForm.name} onChange={handleZoneChange} placeholder="Region Name" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.1" name="minElevation" value={zoneForm.minElevation} onChange={handleZoneChange} placeholder="Min Elev (m)" className="px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
                <input required type="number" step="0.1" name="maxElevation" value={zoneForm.maxElevation} onChange={handleZoneChange} placeholder="Max Elev (m)" className="px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              </div>
              <input required name="landform" value={zoneForm.landform} onChange={handleZoneChange} placeholder="Landform description" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="majorCrops" value={zoneForm.majorCrops} onChange={handleZoneChange} placeholder="Major Crops (comma separated)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button type="button" onClick={() => setIsZoneModalOpen(false)} className="px-4 py-2 text-xs bg-gray-100 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs bg-gray-900 text-white rounded-xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form onSubmit={saveCrop} className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-black text-sm mb-4 uppercase">{editingItem ? "Edit Crop" : "Add Crop"}</h3>
            <div className="space-y-3">
              <input required name="name" value={cropForm.name} onChange={handleCropChange} placeholder="Crop Name" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="expectedYield" value={cropForm.expectedYield} onChange={handleCropChange} placeholder="Expected Yield" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="growingPeriod" value={cropForm.growingPeriod} onChange={handleCropChange} placeholder="Growing Period" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required type="number" step="0.1" name="waterRequirement" value={cropForm.waterRequirement} onChange={handleCropChange} placeholder="Water Req (1-5)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="fertilizer" value={cropForm.fertilizer} onChange={handleCropChange} placeholder="Fertilizer" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="pesticide" value={cropForm.pesticide} onChange={handleCropChange} placeholder="Pesticide" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button type="button" onClick={() => setIsCropModalOpen(false)} className="px-4 py-2 text-xs bg-gray-100 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs bg-gray-900 text-white rounded-xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
