"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Tractor, Calendar, IndianRupee, Plus, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function EquipmentOwnerDashboard() {
  const { currentUser } = useAuthRole();
  const [rentals, setRentals] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Tractors",
    dailyRate: "",
    hourlyRate: "",
    locationName: "",
    imageUrl: "",
    available: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRentals = async () => {
    try {
      const res = await fetch("/api/equipment/requests");
      if (res.ok) {
        const data = await res.json();
        setRentals(data.rentals || []);
      }
    } catch (err) {
      console.error("Failed to fetch rentals:", err);
    }
  };

  const fetchFleet = async () => {
    try {
      const res = await fetch("/api/dashboard/equipment");
      if (res.ok) {
        const data = await res.json();
        setFleet(data.equipment || []);
      }
    } catch (err) {
      console.error("Failed to fetch fleet:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      Promise.all([fetchRentals(), fetchFleet()]).finally(() => setLoading(false));
    }
  }, [currentUser]);

  const totalRevenue = rentals.reduce((sum, r) => sum + (r.status !== 'REJECTED' ? r.totalCost : 0), 0);
  const pendingRequests = rentals.filter(r => r.status === 'PENDING').length;

  const openModalForNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "Tractors",
      dailyRate: "",
      hourlyRate: "",
      locationName: "",
      imageUrl: "",
      available: true
    });
    setShowModal(true);
  };

  const openModalForEdit = (equipment: any) => {
    setEditingId(equipment.id);
    setFormData({
      name: equipment.name,
      category: equipment.category,
      dailyRate: equipment.dailyRate.toString(),
      hourlyRate: equipment.hourlyRate.toString(),
      locationName: equipment.locationName,
      imageUrl: equipment.imageUrl,
      available: equipment.available
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `/api/dashboard/equipment/${editingId}` : "/api/dashboard/equipment";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchFleet();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save equipment");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    try {
      const res = await fetch(`/api/dashboard/equipment/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFleet();
      } else {
        alert("Failed to delete equipment");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  const handleUpdateRentalStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/equipment/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRentals(); // Refresh the list
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  return (
    <RouteGuard allowedRoles={["EQUIPMENT_OWNER"]}>
      <AppLayout>
        
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
              alt={currentUser?.name || "Equipment Owner"}
              className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{currentUser?.name}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold border border-amber-100">
                  VERIFIED FLEET OWNER
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Kisan Agro Fleet Hub</p>
            </div>
          </div>

          <button 
            onClick={openModalForNew}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>List New Machinery</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-gray-50 rounded-md text-gray-900 mr-2">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="font-medium">Total Rental Revenue</span>
            </div>
            <div className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-gray-900 font-medium mt-1">From all accepted bookings</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-blue-50 rounded-md text-blue-600 mr-2">
                <Tractor className="w-4 h-4" />
              </div>
              <span className="font-medium">Active Machinery Fleet</span>
            </div>
            <div className="text-2xl font-black text-gray-900">{fleet.length} Machines</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">
              {fleet.filter(f => f.available).length} available for rent
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 mr-2">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-medium">Pending Booking Requests</span>
            </div>
            <div className="text-2xl font-black text-gray-900">{pendingRequests} Requests</div>
            <div className="text-[10px] text-amber-600 font-medium mt-1">Requires Approval</div>
          </div>
        </div>

        {/* My Fleet Section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">My Machinery Fleet</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Loading fleet...</div>
          ) : fleet.length === 0 ? (
            <div className="text-sm text-gray-500">You haven't listed any machinery yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fleet.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.category}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.available ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {item.available ? 'AVAILABLE' : 'OFFLINE'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4 text-xs font-medium text-gray-600 mt-2">
                      <div className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-1" />₹{item.dailyRate}/day</div>
                      <div className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-1" />₹{item.hourlyRate}/hr</div>
                    </div>
                    
                    <div className="mt-auto flex items-center space-x-2 pt-3 border-t border-gray-100">
                      <button onClick={() => openModalForEdit(item)} className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests List */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Rental Requests</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Loading requests...</div>
          ) : rentals.length === 0 ? (
            <div className="text-sm text-gray-500">No rental requests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map((rental) => (
                <div key={rental.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <img 
                      src={rental.renter.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rental.renter.name)}&background=f3f4f6&color=111827`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                    />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{rental.renter.name}</h4>
                        <p className="text-xs text-gray-500">{rental.renter.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${rental.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : rental.status === 'ACTIVE' || rental.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {rental.status}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2 mb-4 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Equipment</span>
                      <span className="font-semibold text-gray-900">{rental.equipment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-semibold text-gray-900">
                        {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 3600 * 24))} Days
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-900 font-bold">Total Estimate</span>
                      <span className="font-black text-gray-900 text-lg flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" />{rental.totalCost}
                      </span>
                    </div>
                  </div>

                  {rental.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleUpdateRentalStatus(rental.id, 'APPROVED')}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Accept Request
                      </button>
                      <button 
                        onClick={() => handleUpdateRentalStatus(rental.id, 'REJECTED')}
                        className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-900">
                  {editingId ? "Edit Machinery" : "List New Machinery"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Equipment Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium"
                      placeholder="e.g. Mahindra Tractor 575 DI"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium bg-white"
                      >
                        <option value="Tractors">Tractors</option>
                        <option value="Harvesters">Harvesters</option>
                        <option value="Implements">Implements</option>
                        <option value="Drones">Drones</option>
                        <option value="Irrigation">Irrigation Systems</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Location *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.locationName}
                        onChange={e => setFormData({...formData, locationName: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium"
                        placeholder="e.g. Ludhiana, Punjab"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Daily Rate (₹) *</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={formData.dailyRate}
                        onChange={e => setFormData({...formData, dailyRate: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium"
                        placeholder="e.g. 1500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Rate (₹) *</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={formData.hourlyRate}
                        onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium"
                        placeholder="e.g. 300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Image URL *</label>
                    <input 
                      type="url" 
                      required 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm font-medium"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Provide a valid URL to the equipment photo.</p>
                  </div>

                  <div className="flex items-center mt-2 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                    <input 
                      type="checkbox" 
                      id="available"
                      checked={formData.available}
                      onChange={e => setFormData({...formData, available: e.target.checked})}
                      className="w-4 h-4 text-gray-900 bg-white border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                    />
                    <label htmlFor="available" className="ml-2 text-sm font-bold text-gray-900 cursor-pointer">
                      Available for Rent
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex space-x-3">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Saving..." : (editingId ? "Save Changes" : "List Machinery")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </AppLayout>
    </RouteGuard>
  );
}
