"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { 
  Tractor, 
  Calendar, 
  IndianRupee, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Pencil, 
  Trash2, 
  User, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Clock, 
  Phone, 
  Search, 
  ArrowRight, 
  Inbox,
  ShieldCheck,
  CheckCheck
} from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { useSearchParams } from "next/navigation";
import { SafeImage } from "@/components/ui/SafeImage";

export default function EquipmentOwnerDashboard() {
  const { currentUser } = useAuthRole();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const [rentals, setRentals] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Filters for requests tab
  const [requestFilter, setRequestFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "HISTORY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  
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
      const headers: Record<string, string> = {};
      if (currentUser?.id) headers["x-user-id"] = currentUser.id;
      headers["x-user-role"] = "EQUIPMENT_OWNER";

      const res = await fetch("/api/equipment/requests", {
        headers,
        credentials: "include"
      });
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
      const headers: Record<string, string> = {};
      if (currentUser?.id) headers["x-user-id"] = currentUser.id;
      headers["x-user-role"] = "EQUIPMENT_OWNER";

      const res = await fetch("/api/dashboard/equipment", {
        headers,
        credentials: "include"
      });
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

  const totalRevenue = rentals.reduce((sum, r) => sum + (r.status === 'APPROVED' || r.status === 'ACTIVE' || r.status === 'COMPLETED' ? Number(r.totalCost || 0) : 0), 0);
  const pendingRequests = rentals.filter(r => r.status === 'PENDING').length;
  const activeRentalsCount = rentals.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE').length;
  const historyCount = rentals.filter(r => r.status === 'COMPLETED' || r.status === 'REJECTED').length;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve((e.target?.result as string) || "");
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: localPreview }));

      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
          credentials: "include",
          headers: { "x-user-role": "EQUIPMENT_OWNER" }
        });
        if (res.ok) {
          const data = await res.json();
          const savedUrl = data.staticUrl || data.url || data.apiUrl;
          if (savedUrl) {
            setFormData(prev => ({ ...prev, imageUrl: savedUrl }));
            return;
          }
        }
      } catch (err) {
        console.warn("Upload route failed, applying compressed image fallback:", err);
      }

      const compressedDataUrl = await compressImage(file);
      if (compressedDataUrl) {
        setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
      }
    } catch (e) {
      console.error("Failed to handle image upload:", e);
    } finally {
      setUploadingImage(false);
    }
  };

  const openModalForNew = () => {
    setEditingId(null);
    setShowUrlInput(false);
    setFormData({
      name: "",
      category: "Tractors",
      dailyRate: "",
      hourlyRate: "",
      locationName: "",
      imageUrl: "/images/equipment/tractor_mahindra_575.png",
      available: true
    });
    setShowModal(true);
  };

  const openModalForEdit = (equipment: any) => {
    setEditingId(equipment.id);
    setShowUrlInput(false);
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
        const savedData = await res.json().catch(() => ({}));
        setShowModal(false);
        if (editingId) {
          setFleet(prev => prev.map(item => item.id === editingId ? {
            ...item,
            ...formData,
            imageUrl: savedData.equipment?.imageUrl || formData.imageUrl,
            dailyRate: Number(formData.dailyRate),
            hourlyRate: Number(formData.hourlyRate)
          } : item));
        } else if (savedData.equipment) {
          setFleet(prev => [savedData.equipment, ...prev]);
        }
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
    setUpdatingStatusId(id);
    try {
      // Optimistic update
      setRentals(prev => prev.map(r => r.id === id ? { ...r, status } : r));

      const res = await fetch(`/api/equipment/requests/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}),
          "x-user-role": "EQUIPMENT_OWNER"
        },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchRentals();
      } else {
        alert("Failed to update status");
        fetchRentals();
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
      fetchRentals();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtered requests computation
  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      // Status filter
      if (requestFilter === "PENDING" && rental.status !== "PENDING") return false;
      if (requestFilter === "APPROVED" && (rental.status !== "APPROVED" && rental.status !== "ACTIVE")) return false;
      if (requestFilter === "HISTORY" && (rental.status !== "COMPLETED" && rental.status !== "REJECTED")) return false;

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const renter = rental?.renter || rental?.farmer || {};
        const renterName = (renter.name || "").toLowerCase();
        const renterPhone = (renter.phone || "").toLowerCase();
        const eqName = (rental?.equipment?.name || "").toLowerCase();
        const category = (rental?.equipment?.category || "").toLowerCase();
        return renterName.includes(q) || renterPhone.includes(q) || eqName.includes(q) || category.includes(q);
      }

      return true;
    });
  }, [rentals, requestFilter, searchQuery]);

  const activeRentalsList = useMemo(() => {
    return rentals.filter(r => r.status === "APPROVED" || r.status === "ACTIVE");
  }, [rentals]);

  const historyRentalsList = useMemo(() => {
    return rentals.filter(r => r.status === "COMPLETED" || r.status === "REJECTED");
  }, [rentals]);

  // Helper to render a rental request card
  const renderRentalCard = (rental: any) => {
    const renter = rental?.renter || rental?.farmer || { name: "Farmer Client", phone: "+91 98765 43210", avatarUrl: "" };
    const renterName = renter.name || "Farmer Client";
    const renterPhone = renter.phone || "+91 98765 43210";
    const renterAvatar = renter.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(renterName)}&background=10b981&color=ffffff`;
    
    const equipment = rental?.equipment || {};
    const equipmentName = equipment.name || "Agricultural Machinery";
    const equipmentCategory = equipment.category || "Machinery";
    const equipmentImg = equipment.imageUrl || "/images/equipment/tractor_mahindra_575.png";
    const locationName = equipment.locationName || "Kerala Hub";

    const startDate = rental?.startDate ? new Date(rental.startDate).getTime() : Date.now();
    const endDate = rental?.endDate ? new Date(rental.endDate).getTime() : (Date.now() + 86400000);
    const durationDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 3600 * 24)));
    const totalCost = Number(rental?.totalCost) || 0;
    const status = rental?.status || "PENDING";
    const isUpdating = updatingStatusId === rental.id;

    return (
      <div 
        key={rental.id || Math.random()} 
        className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
      >
        <div>
          {/* Top Row: Farmer Profile & Status Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src={renterAvatar} 
                alt={renterName}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 shadow-xs" 
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight">{renterName}</h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                    Farmer
                  </span>
                </div>
                <a 
                  href={`tel:${renterPhone}`} 
                  className="text-xs text-gray-500 hover:text-emerald-700 flex items-center space-x-1 mt-1 transition-colors"
                  title="Click to call farmer"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{renterPhone}</span>
                </a>
              </div>
            </div>

            <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 ${
              status === 'PENDING' 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : status === 'ACTIVE' || status === 'APPROVED' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
              {status === 'APPROVED' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
              {status === 'ACTIVE' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
              {status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
              {status}
            </span>
          </div>

          {/* Machinery Info Card */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
            <div className="w-16 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
              <SafeImage 
                src={equipmentImg} 
                alt={equipmentName} 
                className="w-full h-full object-cover" 
                fallbackSrc="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {equipmentCategory}
              </span>
              <h5 className="font-bold text-gray-900 text-sm truncate">{equipmentName}</h5>
              <p className="text-xs text-gray-500 truncate">{locationName}</p>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-emerald-50/40 rounded-xl p-3 text-xs space-y-2 mb-4 border border-emerald-100/60">
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Rental Schedule
              </span>
              <span className="font-bold text-gray-900">
                {rental?.startDate ? new Date(rental.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Immediate'} 
                &nbsp;&rarr;&nbsp; 
                {rental?.endDate ? new Date(rental.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">Total Duration</span>
              <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                {durationDays} Day{durationDays > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-200/60 pt-2 text-sm">
              <span className="font-bold text-gray-900">Total Rental Earnings</span>
              <span className="font-black text-emerald-800 text-base flex items-center">
                <IndianRupee className="w-4 h-4 mr-0.5" />
                {totalCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div>
          {status === 'PENDING' ? (
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => handleUpdateRentalStatus(rental.id, 'APPROVED')}
                disabled={isUpdating}
                className="flex-1 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-400" /> 
                    <span>Accept Request</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to decline this rental request?")) {
                    handleUpdateRentalStatus(rental.id, 'REJECTED');
                  }
                }}
                disabled={isUpdating}
                className="flex-1 bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 active:scale-[0.98] text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-1.5 text-rose-500" /> 
                <span>Decline</span>
              </button>
            </div>
          ) : status === 'APPROVED' || status === 'ACTIVE' ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Approved & Ready for Dispatch
              </span>
              <a 
                href={`tel:${renterPhone}`} 
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> Call Farmer
              </a>
            </div>
          ) : (
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold text-center">
              Request {status.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <RouteGuard allowedRoles={["EQUIPMENT_OWNER"]}>
      <AppLayout>
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <Link 
              href="/dashboard/profile"
              className="flex items-center space-x-4 group cursor-pointer hover:opacity-95 transition-all"
              title="Click to view full profile details"
            >
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
                alt={currentUser?.name || "Kisan Agro Rentals"}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200 shadow-sm group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                    {currentUser?.name || "Kisan Agro Rentals"}
                  </h1>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> VERIFIED FLEET OWNER
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1.5">
                  <span className="font-semibold text-gray-700">Kisan Agro Fleet Hub</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold group-hover:underline">View Profile Details &rarr;</span>
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <Link
                href="/dashboard/profile"
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold border border-gray-200 transition-colors"
                title="View Profile Details"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span>Profile</span>
              </Link>

              <button 
                onClick={openModalForNew}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>List New Machinery</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <div className="text-xs text-gray-500 flex items-center mb-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800 mr-2 border border-emerald-100">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-700">Total Rental Revenue</span>
              </div>
              <div className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">From accepted & completed rentals</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <div className="text-xs text-gray-500 flex items-center mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 mr-2 border border-blue-100">
                  <Tractor className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-700">Active Machinery Fleet</span>
              </div>
              <div className="text-2xl font-black text-gray-900">{fleet.length} Machines</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">
                {fleet.filter(f => f.available).length} available for booking
              </div>
            </div>

            <Link 
              href="/dashboard/equipment?tab=requests"
              className={`border rounded-2xl p-6 transition-all shadow-xs block group ${
                pendingRequests > 0 
                  ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300' 
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="text-xs text-gray-500 flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-lg mr-2 border ${
                    pendingRequests > 0 
                      ? 'bg-amber-100 text-amber-800 border-amber-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-100'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-800">Pending Booking Requests</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-700 transition-all" />
              </div>
              <div className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>{pendingRequests} Requests</span>
                {pendingRequests > 0 && (
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-amber-800 mt-1">
                {pendingRequests > 0 ? "Click to review and accept requests &rarr;" : "All requests up to date"}
              </div>
            </Link>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
            <Link
              href="/dashboard/equipment"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>Overview</span>
            </Link>

            <Link
              href="/dashboard/equipment?tab=requests"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                currentTab === 'requests'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>Rental Requests</span>
              {pendingRequests > 0 ? (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {pendingRequests}
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full">
                  {rentals.length}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/equipment?tab=my-equipment"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'my-equipment'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>My Fleet</span>
              <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full">
                {fleet.length}
              </span>
            </Link>

            <Link
              href="/dashboard/equipment?tab=active"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'active'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>Active Rentals</span>
              <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full">
                {activeRentalsCount}
              </span>
            </Link>

            <Link
              href="/dashboard/equipment?tab=history"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'history'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>Rental History</span>
              <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            </Link>
          </div>

          {/* TAB: DASHBOARD (OVERVIEW) */}
          {currentTab === 'dashboard' && (
            <div className="space-y-8">
              {/* If there are pending requests, display callout card */}
              {pendingRequests > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
                      <Clock className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-black text-amber-950 text-base">
                        {pendingRequests} Incoming Farmer Booking Request{pendingRequests > 1 ? 's' : ''} Awaiting Review
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Farmers have submitted bookings for your machinery. Accept them to confirm schedules and dispatch.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/equipment?tab=requests"
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all whitespace-nowrap"
                  >
                    <span>Manage Requests</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Recent Rental Requests Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Rental Requests</h2>
                    <p className="text-xs text-gray-500">Incoming bookings submitted by farmers</p>
                  </div>
                  <Link
                    href="/dashboard/equipment?tab=requests"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>View All ({rentals.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loading ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-sm text-gray-500 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                    <span>Loading rental requests...</span>
                  </div>
                ) : rentals.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                    <Inbox className="w-10 h-10 text-gray-300 mb-2" />
                    <h4 className="font-bold text-gray-800 text-sm">No Rental Requests Yet</h4>
                    <p className="text-xs text-gray-500 max-w-sm mt-1">
                      When farmers book machinery from the Equipment Rental page, their booking requests will appear here immediately for your approval.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rentals.slice(0, 4).map(rental => renderRentalCard(rental))}
                  </div>
                )}
              </div>

              {/* Machinery Fleet Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">My Machinery Fleet</h2>
                    <p className="text-xs text-gray-500">Agricultural equipment currently listed for hire</p>
                  </div>
                  <button 
                    onClick={openModalForNew}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>List New</span>
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-sm text-gray-500">
                    Loading fleet...
                  </div>
                ) : fleet.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                    <Tractor className="w-10 h-10 text-gray-300 mb-2" />
                    <h4 className="font-bold text-gray-800 text-sm">No Machinery Listed</h4>
                    <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                      List your tractors, harvesters, or agricultural drones to start receiving rental requests from local farmers.
                    </p>
                    <button
                      onClick={openModalForNew}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      List First Machine
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fleet.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs flex flex-col hover:border-gray-200 transition-all">
                        <SafeImage 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-40 object-cover" 
                          fallbackSrc="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600"
                        />
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
                            <button onClick={() => openModalForEdit(item)} className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer">
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">
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
            </div>
          )}

          {/* TAB: RENTAL REQUESTS */}
          {currentTab === 'requests' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <span>Rental Requests Management</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {rentals.length} Total
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Review, accept, or decline incoming machinery rental bookings from verified farmers.
                    </p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search farmer or machinery..."
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 overflow-x-auto">
                  <button
                    onClick={() => setRequestFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      requestFilter === "ALL"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    All Requests ({rentals.length})
                  </button>

                  <button
                    onClick={() => setRequestFilter("PENDING")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      requestFilter === "PENDING"
                        ? "bg-amber-600 text-white"
                        : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Action ({pendingRequests})</span>
                  </button>

                  <button
                    onClick={() => setRequestFilter("APPROVED")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      requestFilter === "APPROVED"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approved / Active ({activeRentalsCount})</span>
                  </button>

                  <button
                    onClick={() => setRequestFilter("HISTORY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      requestFilter === "HISTORY"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    Declined / Completed ({historyCount})
                  </button>
                </div>
              </div>

              {/* Requests List */}
              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                  <span>Loading booking requests...</span>
                </div>
              ) : filteredRentals.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                  <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                  <h4 className="font-bold text-gray-900 text-base">No Matching Requests Found</h4>
                  <p className="text-xs text-gray-500 max-w-md mt-1 mb-4">
                    {searchQuery 
                      ? `No rental requests matched "${searchQuery}". Try clearing the search filter.`
                      : requestFilter === "PENDING"
                      ? "You have answered all pending requests! Great work."
                      : "No rental requests recorded under this category yet."}
                  </p>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredRentals.map(rental => renderRentalCard(rental))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MY EQUIPMENT */}
          {currentTab === 'my-equipment' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <span>My Machinery Fleet</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {fleet.length} Machines
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage your agricultural tractors, harvesters, power tillers, and drones listed for hire.
                  </p>
                </div>

                <button 
                  onClick={openModalForNew}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>List New Machinery</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2 mx-auto" />
                  <span>Loading fleet...</span>
                </div>
              ) : fleet.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                  <Tractor className="w-12 h-12 text-gray-300 mb-3" />
                  <h4 className="font-bold text-gray-900 text-base">You haven't listed any machinery yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                    Add your machinery with custom daily and hourly rental rates to start receiving booking requests from farmers.
                  </p>
                  <button 
                    onClick={openModalForNew}
                    className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    List First Machinery
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {fleet.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all">
                      <SafeImage 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-44 object-cover" 
                        fallbackSrc="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600"
                      />
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{item.category}</span>
                            <h4 className="font-bold text-gray-900 text-sm mt-0.5">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.locationName}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${item.available ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                            {item.available ? 'AVAILABLE' : 'OFFLINE'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-4 text-xs font-bold text-gray-700 mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <div className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />₹{item.dailyRate}/day</div>
                          <div className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />₹{item.hourlyRate}/hr</div>
                        </div>
                        
                        <div className="mt-auto flex items-center space-x-2 pt-3 border-t border-gray-100">
                          <button onClick={() => openModalForEdit(item)} className="flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit Machinery</span>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer">
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
          )}

          {/* TAB: ACTIVE RENTALS */}
          {currentTab === 'active' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span>Active Rentals & Dispatches</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {activeRentalsList.length} Active
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Monitor equipment currently rented out and approved for farm work.
                </p>
              </div>

              {activeRentalsList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                  <CheckCheck className="w-12 h-12 text-gray-300 mb-3" />
                  <h4 className="font-bold text-gray-900 text-base">No Active Rentals Currently</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    When you accept incoming requests, they will show up here as active rentals until completed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeRentalsList.map(rental => renderRentalCard(rental))}
                </div>
              )}
            </div>
          )}

          {/* TAB: RENTAL HISTORY */}
          {currentTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span>Rental History & Records</span>
                  <span className="text-xs bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded-full">
                    {historyRentalsList.length} Records
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Archive of completed bookings, earnings transactions, and declined requests.
                </p>
              </div>

              {historyRentalsList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center justify-center">
                  <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                  <h4 className="font-bold text-gray-900 text-base">No History Records Yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    Completed rentals and closed requests will be archived here for your accounting records.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {historyRentalsList.map(rental => renderRentalCard(rental))}
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Machinery Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-3 sm:p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-lg text-gray-900">
                    {editingId ? "Edit Machinery" : "List New Machinery"}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-4 sm:px-6 sm:py-5 overflow-y-auto">
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
                          <option value="Tillers">Tillers</option>
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
                          placeholder="e.g. Palakkad, Kerala"
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
                          placeholder="e.g. 2200"
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
                          placeholder="e.g. 350"
                        />
                      </div>
                    </div>

                    {/* Equipment Photo / Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700">
                          Equipment Photo <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          {showUrlInput ? "Hide Direct URL" : "Enter Direct URL"}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center">
                          {formData.imageUrl ? (
                            <SafeImage
                              src={formData.imageUrl}
                              alt="Machinery Preview"
                              className="w-full h-full object-cover"
                              fallbackSrc="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <ImageIcon className="w-6 h-6 mb-1" />
                              <span className="text-[10px]">No photo</span>
                            </div>
                          )}
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="text-[9px] font-bold mt-1">Uploading...</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 w-full space-y-1.5">
                          <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 cursor-pointer transition-all group">
                            <Upload className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-700 transition-colors">
                              {uploadingImage ? "Optimizing & uploading..." : "Choose Photo from Device"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingImage}
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-gray-500">
                            Supports JPG, PNG, WEBP. Automatically optimized.
                          </p>
                        </div>
                      </div>

                      {showUrlInput && (
                        <div className="pt-1">
                          <input
                            type="text"
                            required
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 text-xs font-medium bg-white"
                            placeholder="Paste image URL (e.g. https://... or /uploads/...)"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center mt-2 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                      <input 
                        type="checkbox" 
                        id="available"
                        checked={formData.available}
                        onChange={e => setFormData({...formData, available: e.target.checked})}
                        className="w-4 h-4 text-gray-900 bg-white border-gray-300 rounded focus:ring-gray-900 focus:ring-2 cursor-pointer"
                      />
                      <label htmlFor="available" className="ml-2 text-sm font-bold text-gray-900 cursor-pointer">
                        Available for Rent
                      </label>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex space-x-3">
                      <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {submitting ? "Saving..." : (editingId ? "Save Changes" : "List Machinery")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </AppLayout>
    </RouteGuard>
  );
}
