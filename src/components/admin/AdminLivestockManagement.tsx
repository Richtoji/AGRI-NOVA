"use client";

import React, { useState, useEffect } from "react";
import { Stethoscope, Edit, Trash2, Plus, Search, Map, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";

interface AdminLivestockManagementProps {
  onUpdate?: () => void;
}

export function AdminLivestockManagement({ onUpdate }: AdminLivestockManagementProps) {
  const [activeTab, setActiveTab] = useState<"livestock" | "regions">("livestock");
  
  const [livestock, setLivestock] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingRegion, setEditingRegion] = useState<any>(null);

  const [formData, setFormData] = useState({
    breedName: "", 
    location: "All Kerala", 
    expectedYield: "", 
    fatContent: "", 
    maintenanceLevel: "Medium", 
    imageUrl: "",
    category: "Cattle",
    description: "",
    feedRequirement: ""
  });
  
  const [regionFormData, setRegionFormData] = useState({
    district: "", 
    primaryLivestock: "", 
    focusAreas: "", 
    climateSuitability: "",
    imageUrl: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLivestock, resRegions] = await Promise.all([
        fetch(`/api/admin/livestock-recommendations?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", "x-user-role": "ADMIN" },
          credentials: "include"
        }),
        fetch(`/api/admin/regional-livestock?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", "x-user-role": "ADMIN" },
          credentials: "include"
        })
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
        breedName: item.breedName || "", 
        location: item.location || "All Kerala", 
        expectedYield: item.expectedYield || "", 
        fatContent: item.fatContent || "", 
        maintenanceLevel: item.maintenanceLevel || "Medium", 
        imageUrl: item.imageUrl || "",
        category: item.category || "Cattle",
        description: item.description || "",
        feedRequirement: item.feedRequirement || ""
      });
    } else {
      setFormData({ 
        breedName: "", 
        location: "All Kerala", 
        expectedYield: "", 
        fatContent: "", 
        maintenanceLevel: "Medium", 
        imageUrl: "",
        category: "Cattle",
        description: "",
        feedRequirement: ""
      });
    }
    setIsModalOpen(true);
  };

  const openRegionModal = (item: any = null) => {
    setEditingRegion(item);
    if (item) {
      setRegionFormData({
        district: item.district || "", 
        primaryLivestock: item.primaryLivestock || "", 
        focusAreas: item.focusAreas || "", 
        climateSuitability: item.climateSuitability || "",
        imageUrl: item.imageUrl || ""
      });
    } else {
      setRegionFormData({ district: "", primaryLivestock: "", focusAreas: "", climateSuitability: "", imageUrl: "" });
    }
    setIsRegionModalOpen(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this livestock recommendation?")) return;
    
    // Optimistic deletion
    setLivestock(prev => prev.filter(l => l.id !== id));

    try {
      const res = await fetch(`/api/admin/livestock-recommendations?id=${id}`, { 
        method: "DELETE",
        credentials: "include",
        headers: { "x-user-role": "ADMIN" }
      });
      if (res.ok) {
        await fetchData();
        if (onUpdate) onUpdate();
        window.dispatchEvent(new CustomEvent('livestock-data-updated'));
      } else {
        await fetchData();
        alert("Failed to delete breed from database.");
      }
    } catch (err) {
      await fetchData();
      alert("Error occurred while deleting breed.");
    }
  };

  const deleteRegion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this regional analysis?")) return;
    
    // Optimistic deletion
    setRegions(prev => prev.filter(r => r.id !== id));

    try {
      const res = await fetch(`/api/admin/regional-livestock?id=${id}`, { 
        method: "DELETE",
        credentials: "include",
        headers: { "x-user-role": "ADMIN" }
      });
      if (res.ok) {
        await fetchData();
        if (onUpdate) onUpdate();
        window.dispatchEvent(new CustomEvent('livestock-data-updated'));
      } else {
        await fetchData();
        alert("Failed to delete regional profile.");
      }
    } catch (err) {
      await fetchData();
      alert("Error occurred while deleting district profile.");
    }
  };

  const processImageUpload = async (fileInput: HTMLInputElement | null, fallbackUrl: string): Promise<string> => {
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      
      // Try /api/upload
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { 
          method: "POST", 
          body: uploadData,
          credentials: "include",
          headers: { "x-user-role": "ADMIN" }
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          if (url) return url;
        }
      } catch (err) {
        console.warn("Upload endpoint failed, utilizing Base64 fallback:", err);
      }

      // Base64 fallback ensures images always work even if filesystem or uploads endpoint fails
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve((reader.result as string) || fallbackUrl);
        };
        reader.readAsDataURL(file);
      });
    }
    return fallbackUrl;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fileInput = e.target.querySelector('input[type="file"]') as HTMLInputElement | null;
      const finalImageUrl = await processImageUpload(fileInput, formData.imageUrl);

      const payload = { 
        breedName: formData.breedName.trim(),
        location: formData.location.trim(),
        expectedYield: formData.expectedYield.trim(),
        fatContent: formData.fatContent.trim(),
        maintenanceLevel: formData.maintenanceLevel,
        category: formData.category,
        imageUrl: finalImageUrl,
        description: formData.description.trim() || undefined,
        feedRequirement: formData.feedRequirement.trim() || undefined
      };

      // Optimistic update so changes reflect immediately in Admin list
      if (editingItem) {
        setLivestock(prev => prev.map(item => 
          (item.id === editingItem.id || item.breedName?.toLowerCase() === editingItem.breedName?.toLowerCase())
            ? { ...item, ...payload }
            : item
        ));
      } else {
        const tempId = `rec-${Date.now()}`;
        setLivestock(prev => [{ id: tempId, ...payload }, ...prev]);
      }

      let res: Response;
      if (editingItem) {
        res = await fetch(`/api/admin/livestock-recommendations`, { 
          method: "PUT", 
          headers: { 
            "Content-Type": "application/json",
            "x-user-role": "ADMIN"
          },
          credentials: "include",
          body: JSON.stringify({ id: editingItem.id, ...payload }) 
        });
      } else {
        res = await fetch(`/api/admin/livestock-recommendations`, { 
          method: "POST", 
          headers: { 
            "Content-Type": "application/json",
            "x-user-role": "ADMIN"
          },
          credentials: "include",
          body: JSON.stringify(payload) 
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      setIsModalOpen(false);
      await fetchData();
      if (onUpdate) onUpdate();
      window.dispatchEvent(new CustomEvent('livestock-data-updated'));
    } catch (err: any) {
      console.error("Failed to save livestock breed:", err);
      alert(`Failed to save livestock breed: ${err.message || 'Please check network connection.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegionSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fileInput = e.target.querySelector('input[type="file"]') as HTMLInputElement | null;
      const finalImageUrl = await processImageUpload(fileInput, regionFormData.imageUrl);

      const payload = { 
        district: regionFormData.district.trim(),
        primaryLivestock: regionFormData.primaryLivestock.trim(),
        focusAreas: regionFormData.focusAreas.trim(),
        climateSuitability: regionFormData.climateSuitability.trim() || undefined,
        imageUrl: finalImageUrl 
      };

      // Optimistic update
      if (editingRegion) {
        setRegions(prev => prev.map(item => 
          (item.id === editingRegion.id || item.district?.toLowerCase() === editingRegion.district?.toLowerCase())
            ? { ...item, ...payload }
            : item
        ));
      } else {
        const tempId = `reg-${Date.now()}`;
        setRegions(prev => [{ id: tempId, ...payload }, ...prev]);
      }

      let res: Response;
      if (editingRegion) {
        res = await fetch(`/api/admin/regional-livestock`, { 
          method: "PUT", 
          headers: { 
            "Content-Type": "application/json",
            "x-user-role": "ADMIN"
          },
          credentials: "include",
          body: JSON.stringify({ id: editingRegion.id, ...payload }) 
        });
      } else {
        res = await fetch(`/api/admin/regional-livestock`, { 
          method: "POST", 
          headers: { 
            "Content-Type": "application/json",
            "x-user-role": "ADMIN"
          },
          credentials: "include",
          body: JSON.stringify(payload) 
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      setIsRegionModalOpen(false);
      await fetchData();
      if (onUpdate) onUpdate();
      window.dispatchEvent(new CustomEvent('livestock-data-updated'));
    } catch (err: any) {
      console.error("Failed to save region profile:", err);
      alert(`Failed to save regional profile: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLivestock = livestock.filter(l => 
    (l.breedName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRegions = regions.filter(r => 
    (r.district || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.primaryLivestock || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2 text-emerald-700" />
            Livestock Varieties &amp; District Profiles Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Update certified breed characteristics, district livestock agro-profiles, and high-resolution breed photos.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => setActiveTab("livestock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "livestock" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Certified Breeds ({livestock.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("regions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "regions" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            District Profiles ({regions.length})
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={activeTab === "livestock" ? "Search breed name, location..." : "Search district, livestock..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => activeTab === "livestock" ? openModal() : openRegionModal()}
            className="flex-shrink-0 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add {activeTab === "livestock" ? "Breed Variety" : "District Profile"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-500 animate-pulse flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
          <span>Loading livestock database records...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {activeTab === "livestock" ? (
            <table className="w-full min-w-[620px] text-sm text-left">
              <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Breed Variety &amp; Image</th>
                  <th className="px-4 py-3">Target District / Region</th>
                  <th className="px-4 py-3">Yield &amp; Milk Fat</th>
                  <th className="px-4 py-3">Maintenance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLivestock.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-900 flex items-center">
                      {l.imageUrl ? (
                        <img 
                          src={l.imageUrl} 
                          alt={l.breedName} 
                          className="w-10 h-10 rounded-xl object-cover mr-3 border border-gray-200 shadow-xs shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mr-3 border border-emerald-100 text-emerald-800 shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{l.breedName}</div>
                        <span className="text-[10px] text-gray-400 font-semibold">{l.category || "Livestock"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{l.location}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-600">
                      <div><span className="font-bold text-gray-800">Yield:</span> {l.expectedYield}</div>
                      <div><span className="font-bold text-gray-800">Fat/Quality:</span> {l.fatContent}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                        {l.maintenanceLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        type="button"
                        onClick={() => openModal(l)} 
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit breed details and image"
                      >
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button 
                        type="button"
                        onClick={() => deleteItem(l.id)} 
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                        title="Delete recommendation"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[560px] text-sm text-left">
              <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">District Profile</th>
                  <th className="px-4 py-3">Primary Livestock</th>
                  <th className="px-4 py-3">Strategic Focus</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRegions.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-900 flex items-center">
                      {r.imageUrl ? (
                        <img 
                          src={r.imageUrl} 
                          alt={r.district} 
                          className="w-10 h-10 rounded-xl object-cover mr-3 border border-gray-200 shadow-xs shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-3 border border-gray-200 shrink-0">
                          <Map className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <span className="text-xs font-bold">{r.district}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-[220px] leading-snug">{r.primaryLivestock}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.focusAreas}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        type="button"
                        onClick={() => openRegionModal(r)} 
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit district analysis"
                      >
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button 
                        type="button"
                        onClick={() => deleteRegion(r.id)} 
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                        title="Delete district profile"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Livestock Breed Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-black text-sm mb-4 uppercase text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              {editingItem ? "Edit Livestock Variety" : "Add Livestock Variety"}
            </h3>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Breed Name</label>
                <input 
                  required 
                  name="breedName" 
                  value={formData.breedName} 
                  onChange={handleChange} 
                  placeholder="e.g. Vechur Cow (Indigenous Dwarf)" 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Region / Districts (e.g. All Kerala, Palakkad, Thrissur)</label>
                <input 
                  required 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="e.g. Palakkad, Thrissur, Ernakulam & All Kerala" 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer font-semibold"
                >
                  <option value="Cattle">Cattle</option>
                  <option value="Goat">Goat</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Duck">Duck</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Swine">Swine / Pig</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[11px] font-bold text-gray-600">Breed Photo (Upload file or enter URL)</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {formData.imageUrl ? (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-200/60 flex items-center justify-center text-gray-400 shrink-0">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
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
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setFormData(prev => ({ ...prev, imageUrl: (ev.target?.result as string) || "" }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="w-full text-[11px] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer" 
                    />
                    <input 
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl.startsWith("data:") ? "" : formData.imageUrl}
                      onChange={handleChange}
                      placeholder="Or enter direct image URL (https://...)"
                      className="w-full px-2.5 py-1 text-[11px] bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Expected Yield</label>
                  <input 
                    required 
                    name="expectedYield" 
                    value={formData.expectedYield} 
                    onChange={handleChange} 
                    placeholder="e.g. 18-25 L/day" 
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Fat Content / Quality</label>
                  <input 
                    required 
                    name="fatContent" 
                    value={formData.fatContent} 
                    onChange={handleChange} 
                    placeholder="e.g. 4.5% - 5.5%" 
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Maintenance Level</label>
                <select 
                  name="maintenanceLevel" 
                  value={formData.maintenanceLevel} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="Low">Low Maintenance</option>
                  <option value="Low to Moderate">Low to Moderate</option>
                  <option value="Medium">Medium Maintenance</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High Maintenance</option>
                  <option value="Extremely Low (High Heat & Disease Resistance)">Extremely Low (High Heat &amp; Disease Resistance)</option>
                  <option value="Very Low (Survives on local roughage)">Very Low (Survives on local roughage)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Breed Description (Optional)</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={2}
                  placeholder="Key traits, disease immunity, origin, commercial suitability..." 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Daily Feed Requirement (Optional)</label>
                <input 
                  name="feedRequirement" 
                  value={formData.feedRequirement} 
                  onChange={handleChange} 
                  placeholder="e.g. 20-25 kg green fodder + 4 kg concentrate mix" 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                />
              </div>
            </div>

            <div className="flex justify-end mt-5 space-x-2 pt-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2 text-xs bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-70 shadow-xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Variety</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* District Profile Modal */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleRegionSubmit} className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-black text-sm mb-4 uppercase text-gray-900 flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-700" />
              {editingRegion ? `Edit ${editingRegion.district} Profile` : "Add District Profile"}
            </h3>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">District Name</label>
                <input 
                  required 
                  name="district" 
                  value={regionFormData.district} 
                  onChange={handleRegionChange} 
                  placeholder="e.g. Palakkad" 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-bold" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Primary Livestock Profile</label>
                <input 
                  required 
                  name="primaryLivestock" 
                  value={regionFormData.primaryLivestock} 
                  onChange={handleRegionChange} 
                  placeholder="e.g. Attappady Black Goats, Murrah Buffaloes, High-Yielding Dairy Cows" 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Regional Strategic Focus</label>
                <textarea 
                  required 
                  name="focusAreas" 
                  value={regionFormData.focusAreas} 
                  onChange={handleRegionChange} 
                  rows={3}
                  placeholder="Key agricultural priorities, breeding hubs, climate notes..." 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Climate Suitability &amp; Housing Protocol (Optional)</label>
                <textarea 
                  name="climateSuitability" 
                  value={regionFormData.climateSuitability} 
                  onChange={handleRegionChange} 
                  rows={2}
                  placeholder="e.g. Humid coastal-midland climate; regular vaccination against PPR recommended." 
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600" 
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[11px] font-bold text-gray-600">District Landscape Image</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {regionFormData.imageUrl ? (
                    <img 
                      src={regionFormData.imageUrl} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-200/60 flex items-center justify-center text-gray-400 shrink-0">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
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
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setRegionFormData(prev => ({ ...prev, imageUrl: (ev.target?.result as string) || "" }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="w-full text-[11px] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer" 
                    />
                    <input 
                      type="url"
                      name="imageUrl"
                      value={regionFormData.imageUrl.startsWith("data:") ? "" : regionFormData.imageUrl}
                      onChange={handleRegionChange}
                      placeholder="Or enter direct image URL..."
                      className="w-full px-2.5 py-1 text-[11px] bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5 space-x-2 pt-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsRegionModalOpen(false)} 
                className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2 text-xs bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-70 shadow-xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save District Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
