"use client";

import React, { useState, useEffect } from "react";
import { Stethoscope, Edit, Trash2, Plus, Search, Map } from "lucide-react";

export function AdminLivestockManagement() {
  const [activeTab, setActiveTab] = useState<"livestock" | "regions">("livestock");
  
  const [livestock, setLivestock] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingRegion, setEditingRegion] = useState<any>(null);

  const [formData, setFormData] = useState({
    breedName: "", location: "All Regions", expectedYield: "", fatContent: "", maintenanceLevel: "Medium", imageUrl: ""
  });
  
  const [regionFormData, setRegionFormData] = useState({
    district: "", primaryLivestock: "", focusAreas: "", imageUrl: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLivestock, resRegions] = await Promise.all([
        fetch("/api/admin/livestock-recommendations"),
        fetch("/api/admin/regional-livestock")
      ]);
      
      if (resLivestock.ok) {
        const data = await resLivestock.json();
        setLivestock(data.recommendations || []);
      }
      
      if (resRegions.ok) {
        const data = await resRegions.json();
        setRegions(data.regions || []);
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

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRegionChange = (e: any) => setRegionFormData({ ...regionFormData, [e.target.name]: e.target.value });

  const openModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        breedName: item.breedName, location: item.location, expectedYield: item.expectedYield, 
        fatContent: item.fatContent, maintenanceLevel: item.maintenanceLevel, imageUrl: item.imageUrl || ""
      });
    } else {
      setFormData({ breedName: "", location: "All Regions", expectedYield: "", fatContent: "", maintenanceLevel: "Medium", imageUrl: "" });
    }
    setIsModalOpen(true);
  };

  const openRegionModal = (item: any = null) => {
    setEditingRegion(item);
    if (item) {
      setRegionFormData({
        district: item.district, primaryLivestock: item.primaryLivestock, focusAreas: item.focusAreas, imageUrl: item.imageUrl || ""
      });
    } else {
      setRegionFormData({ district: "", primaryLivestock: "", focusAreas: "", imageUrl: "" });
    }
    setIsRegionModalOpen(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this livestock recommendation?")) return;
    const res = await fetch(`/api/admin/livestock-recommendations?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const deleteRegion = async (id: string) => {
    if (!confirm("Delete this regional analysis?")) return;
    const res = await fetch(`/api/admin/regional-livestock?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let finalImageUrl = formData.imageUrl;
    
    const fileInput = e.target.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const uploadData = new FormData();
      uploadData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalImageUrl = url;
        } else {
          alert("Image upload failed");
          return;
        }
      } catch (err) {
        alert("Image upload error");
        return;
      }
    }

    const payload = { ...formData, imageUrl: finalImageUrl };
    if (editingItem) {
      await fetch(`/api/admin/livestock-recommendations`, { method: "PUT", body: JSON.stringify({ id: editingItem.id, ...payload }) });
    } else {
      await fetch(`/api/admin/livestock-recommendations`, { method: "POST", body: JSON.stringify(payload) });
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleRegionSubmit = async (e: any) => {
    e.preventDefault();
    let finalImageUrl = regionFormData.imageUrl;
    
    const fileInput = e.target.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const uploadData = new FormData();
      uploadData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalImageUrl = url;
        } else {
          alert("Image upload failed");
          return;
        }
      } catch (err) {
        alert("Image upload error");
        return;
      }
    }

    const payload = { ...regionFormData, imageUrl: finalImageUrl };
    if (editingRegion) {
      await fetch(`/api/admin/regional-livestock`, { method: "PUT", body: JSON.stringify({ id: editingRegion.id, ...payload }) });
    } else {
      await fetch(`/api/admin/regional-livestock`, { method: "POST", body: JSON.stringify(payload) });
    }
    setIsRegionModalOpen(false);
    fetchData();
  };

  const filteredLivestock = livestock.filter(l => l.breedName.toLowerCase().includes(searchQuery.toLowerCase()) || l.location.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRegions = regions.filter(r => r.district.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2 text-gray-700" />
            Livestock Administration
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage livestock breed recommendations and regional analysis data.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("livestock")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === "livestock" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              Breeds
            </button>
            <button 
              onClick={() => setActiveTab("regions")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === "regions" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              Regions
            </button>
          </div>
        
          <div className="relative w-full sm:w-48 hidden md:block">
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
            onClick={() => activeTab === "livestock" ? openModal() : openRegionModal()}
            className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add {activeTab === "livestock" ? "Breed" : "Region"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-500 animate-pulse">Loading data...</div>
      ) : (
        <div className="overflow-x-auto">
          {activeTab === "livestock" ? (
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Breed Name</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Yield / Fat</th>
                  <th className="px-4 py-3">Maintenance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLivestock.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-900 flex items-center">
                      {l.imageUrl ? (
                        <img src={l.imageUrl} alt={l.breedName} className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 border border-gray-200">
                          <Stethoscope className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      {l.breedName}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{l.location}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">
                      <div>Y: {l.expectedYield}</div>
                      <div>F: {l.fatContent}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{l.maintenanceLevel}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal(l)} className="p-1 text-gray-400 hover:text-sky-600"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => deleteItem(l.id)} className="p-1 text-gray-400 hover:text-rose-600 ml-1"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Primary Livestock</th>
                  <th className="px-4 py-3">Focus Areas</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRegions.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-900 flex items-center">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.district} className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 border border-gray-200">
                          <Map className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      {r.district}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.primaryLivestock}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.focusAreas}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openRegionModal(r)} className="p-1 text-gray-400 hover:text-sky-600"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => deleteRegion(r.id)} className="p-1 text-gray-400 hover:text-rose-600 ml-1"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Livestock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-black text-sm mb-4 uppercase">{editingItem ? "Edit Livestock" : "Add Livestock"}</h3>
            <div className="space-y-3">
              <input required name="breedName" value={formData.breedName} onChange={handleChange} placeholder="Breed Name" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="location" value={formData.location} onChange={handleChange} placeholder="Target Region (e.g. Palakkad)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-gray-700">Image</label>
                <div className="flex items-center space-x-3">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, imageUrl: URL.createObjectURL(e.target.files[0]) });
                    }
                  }} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
                </div>
              </div>

              <input required name="expectedYield" value={formData.expectedYield} onChange={handleChange} placeholder="Expected Yield (e.g. 18-25 L/day)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="fatContent" value={formData.fatContent} onChange={handleChange} placeholder="Fat Content (e.g. 4.5% - 5.5%)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              
              <select name="maintenanceLevel" value={formData.maintenanceLevel} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:border-gray-900">
                <option value="Low">Low Maintenance</option>
                <option value="Medium">Medium Maintenance</option>
                <option value="High">High Maintenance</option>
              </select>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs bg-gray-100 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs bg-gray-900 text-white rounded-xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Region Modal */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <form onSubmit={handleRegionSubmit} className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-black text-sm mb-4 uppercase">{editingRegion ? "Edit Region Analysis" : "Add Region Analysis"}</h3>
            <div className="space-y-3">
              <input required name="district" value={regionFormData.district} onChange={handleRegionChange} placeholder="District Name (e.g. Kottayam)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <input required name="primaryLivestock" value={regionFormData.primaryLivestock} onChange={handleRegionChange} placeholder="Primary Livestock (e.g. Cows, Ducks)" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl" />
              <textarea required name="focusAreas" value={regionFormData.focusAreas} onChange={handleRegionChange} placeholder="Key Focus Areas & Specialties" className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl min-h-[100px]" />
              
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-gray-700">Region Image (Optional)</label>
                <div className="flex items-center space-x-3">
                  {regionFormData.imageUrl && (
                    <img src={regionFormData.imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRegionFormData({ ...regionFormData, imageUrl: URL.createObjectURL(e.target.files[0]) });
                    }
                  }} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button type="button" onClick={() => setIsRegionModalOpen(false)} className="px-4 py-2 text-xs bg-gray-100 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs bg-gray-900 text-white rounded-xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
