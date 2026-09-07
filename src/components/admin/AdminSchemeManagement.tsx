"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Trash2, Plus, X, Search, Edit } from "lucide-react";

export function AdminSchemeManagement() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    department: "",
    category: "",
    description: "",
    subsidyAmount: "",
    linkUrl: "",
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schemes");
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
      }
    } catch (err) {
      console.error("Failed to fetch schemes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const openModal = () => {
    setForm({
      title: "",
      department: "",
      category: "",
      description: "",
      subsidyAmount: "",
      linkUrl: "",
      isActive: true
    });
    setIsModalOpen(true);
  };

  const deleteScheme = async (id: string) => {
    if (!confirm("Are you sure you want to delete this government scheme?")) return;
    try {
      const res = await fetch(`/api/schemes?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting scheme", error);
    }
  };

  const saveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Failed to save scheme.");
      }
    } catch (error) {
      console.error("Error saving scheme", error);
    }
  };

  const filteredSchemes = schemes.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <span>Government Schemes Management</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Add, update, or remove active agricultural schemes</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={openModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scheme</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Title / Department</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Subsidy Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading schemes...</td>
              </tr>
            ) : filteredSchemes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No schemes found matching your search.</td>
              </tr>
            ) : (
              filteredSchemes.map((scheme) => (
                <tr key={scheme.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{scheme.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{scheme.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium border border-gray-200 uppercase">
                      {scheme.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{scheme.subsidyAmount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      scheme.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {scheme.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => deleteScheme(scheme.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Scheme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Landmark className="w-5 h-5 mr-2 text-indigo-600" />
                Add New Scheme
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={saveScheme} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Scheme Title</label>
                  <input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. PM Kisan Samman Nidhi" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input type="text" name="department" required value={form.department} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Ministry of Agriculture" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <input type="text" name="category" required value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Financial Assistance" />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea name="description" required value={form.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Brief details about the scheme benefits..." />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subsidy Amount</label>
                  <input type="text" name="subsidyAmount" required value={form.subsidyAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. ₹6000/year" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Official Link URL</label>
                  <input type="url" name="linkUrl" required value={form.linkUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="https://..." />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 font-medium">Scheme is currently active</label>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
