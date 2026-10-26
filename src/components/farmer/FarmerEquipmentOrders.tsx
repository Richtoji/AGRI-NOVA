"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Tractor, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  DollarSign,
  Layers
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export interface EquipmentBookingItem {
  id: string;
  equipmentId: string;
  farmerId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: "PENDING" | "APPROVED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "REJECTED";
  createdAt?: string;
  equipment?: {
    id: string;
    name: string;
    category: string;
    dailyRate: number;
    hourlyRate?: number;
    locationName?: string;
    imageUrl?: string;
    ownerName?: string;
  };
  farmer?: {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
  };
}

interface FarmerEquipmentOrdersProps {
  onRentNew?: () => void;
}

export function FarmerEquipmentOrders({ onRentNew }: FarmerEquipmentOrdersProps) {
  const [bookings, setBookings] = useState<EquipmentBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/equipment/farmer-bookings?_t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.error("Failed to load farmer equipment bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Listen to real-time events when equipment is booked in another component or tab
    const handleBookingEvent = () => {
      fetchBookings();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "agri_nova_equipment_booked") {
        fetchBookings();
      }
    };

    window.addEventListener("agri_nova_equipment_booked", handleBookingEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("agri_nova_equipment_booked", handleBookingEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this equipment booking request?")) {
      return;
    }

    setCancellingId(bookingId);
    setActionMessage(null);
    try {
      const res = await fetch("/api/equipment/farmer-bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId })
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage("Equipment booking request cancelled successfully.");
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "CANCELLED" } : b));
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.error || "Failed to cancel request.");
      }
    } catch (err) {
      alert("Network error while cancelling request.");
    } finally {
      setCancellingId(null);
    }
  };

  const calculateDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 1;
    const s = new Date(startStr);
    const e = new Date(endStr);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "PENDING").length;
  const activeCount = bookings.filter(b => b.status === "APPROVED" || b.status === "ACTIVE").length;
  const completedCount = bookings.filter(b => b.status === "COMPLETED").length;
  const totalSpent = bookings
    .filter(b => b.status !== "CANCELLED" && b.status !== "REJECTED")
    .reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const eqName = (b.equipment?.name || "").toLowerCase();
      const cat = (b.equipment?.category || "").toLowerCase();
      const id = (b.id || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || eqName.includes(q) || cat.includes(q) || id.includes(q);
      const matchesStatus = 
        statusFilter === "ALL" 
          ? true 
          : statusFilter === "ACTIVE" 
          ? (b.status === "APPROVED" || b.status === "ACTIVE")
          : b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Request Sent (Pending Approval)",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20",
          icon: Clock,
          color: "text-amber-600"
        };
      case "APPROVED":
        return {
          label: "Approved & Confirmed",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20",
          icon: CheckCircle2,
          color: "text-emerald-600"
        };
      case "ACTIVE":
        return {
          label: "Active On Farm",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400/20",
          icon: Tractor,
          color: "text-blue-600"
        };
      case "COMPLETED":
        return {
          label: "Rental Completed",
          badgeClass: "bg-gray-100 text-gray-800 border-gray-300",
          icon: Check,
          color: "text-gray-600"
        };
      case "CANCELLED":
        return {
          label: "Request Cancelled",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-300",
          icon: XCircle,
          color: "text-rose-600"
        };
      case "REJECTED":
        return {
          label: "Request Declined",
          badgeClass: "bg-red-50 text-red-800 border-red-300",
          icon: AlertCircle,
          color: "text-red-600"
        };
      default:
        return {
          label: status,
          badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Clock,
          color: "text-gray-500"
        };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-gray-900 text-white rounded-3xl p-6 lg:p-7 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-xs flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5 text-emerald-300" />
                Equipment Rental Hub
              </span>
              <span className="text-[10px] font-bold bg-emerald-400 text-gray-900 px-2.5 py-0.5 rounded-full">
                {totalCount} Total {totalCount === 1 ? "Booking" : "Bookings"}
              </span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full animate-pulse">
                  {pendingCount} Pending Request{pendingCount === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mb-1.5">
              My Equipment Bookings &amp; Rental History
            </h1>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Real-time records of machinery you have booked or requested from Kisan Agro Rentals. Track booking approvals, dispatch timelines, and on-farm machinery usage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
              title="Refresh equipment bookings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-300" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/equipment"
              className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider w-full sm:w-auto text-center"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Rent More Equipment</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button 
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= METRIC CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalCount}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium">All recorded rentals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Requests</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
          <div className="text-[10px] text-amber-700 font-medium">Awaiting owner confirmation</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active &amp; Approved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900">{activeCount}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Ready or on-field</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Rental Spend</span>
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">₹{totalSpent.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium">Estimated Machinery Cost</div>
        </div>
      </div>

      {/* ================= CONTROLS: SEARCH & FILTER TABS ================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by equipment name, category, or booking ID..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-scroll">
          {[
            { id: "ALL", label: "All Orders", count: totalCount },
            { id: "PENDING", label: "Pending", count: pendingCount },
            { id: "ACTIVE", label: "Approved / Active", count: activeCount },
            { id: "COMPLETED", label: "Completed", count: completedCount },
            { id: "CANCELLED", label: "Cancelled" }
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= ORDER CARDS LIST ================= */}
      {loading ? (
        <div className="p-12 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <h3 className="text-sm font-bold text-gray-900">Loading Equipment Orders...</h3>
          <p className="text-xs text-gray-500 mt-1">Fetching your latest rental requests and booking history</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-10 sm:p-14 bg-white rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
            <Tractor className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-gray-900 mb-1">
            {searchQuery || statusFilter !== "ALL" 
              ? "No Matching Equipment Orders Found" 
              : "No Equipment Bookings Yet"}
          </h3>

          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed mb-5">
            {searchQuery || statusFilter !== "ALL"
              ? "Try resetting your search query or switching your status filter to 'All Orders' to view your machinery history."
              : "Rent modern agricultural machinery with GPS dispatch: tractors, harvesters, rotary tillers, and spraying drones to maximize your farm's productivity."}
          </p>

          <div className="flex items-center gap-3">
            {searchQuery || statusFilter !== "ALL" ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : null}

            <Link
              href="/equipment"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-colors flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <Tractor className="w-4 h-4" />
              <span>Browse &amp; Rent Machinery</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const eq = b.equipment || {
              id: b.equipmentId,
              name: "Agricultural Machinery",
              category: "General Machinery",
              dailyRate: 2200,
              imageUrl: "/images/equipment/tractor_mahindra_575.png",
              locationName: "Palakkad, Kerala",
              ownerName: "Kisan Agro Rentals"
            };

            const days = calculateDays(b.startDate, b.endDate);
            const statusMeta = getStatusBadge(b.status);
            const StatusIcon = statusMeta.icon;
            const refCode = `#BK-${b.id.slice(-6).toUpperCase()}`;

            return (
              <div 
                key={b.id} 
                className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs hover:border-gray-200 transition-all flex flex-col gap-4"
              >
                {/* Top Bar: Reference ID, Booking Date, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {refCode}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Requested on {formatDate(b.createdAt || b.startDate)}
                    </span>
                  </div>

                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusMeta.color}`} />
                    <span>{statusMeta.label}</span>
                  </span>
                </div>

                {/* Main Content: Equipment Image, Specs & Rental Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  
                  {/* Machinery Photo & Specs (5 cols) */}
                  <div className="lg:col-span-5 flex items-start space-x-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 relative shadow-2xs">
                      <SafeImage
                        src={eq.imageUrl || "/images/equipment/tractor_mahindra_575.png"}
                        alt={eq.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                        {eq.category || "Machinery"}
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-gray-900 truncate leading-snug">
                        {eq.name}
                      </h3>
                      <div className="flex items-center text-[11px] text-gray-500 font-medium mt-1">
                        <MapPin className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
                        <span className="truncate">{eq.locationName || "Palakkad Hub, Kerala"}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 font-bold mt-1">
                        Provider: <span className="text-gray-900">{eq.ownerName || "Kisan Agro Rentals"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Schedule (4 cols) */}
                  <div className="lg:col-span-4 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Start Date</div>
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          <span>{formatDate(b.startDate)}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Return Date</div>
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          <span>{formatDate(b.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-medium">Rental Period:</span>
                      <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {days} {days === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing & Total (3 cols) */}
                  <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end">
                    <div className="w-full lg:text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Rental Cost</div>
                      <div className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                        ₹{(Number(b.totalCost) || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        (₹{eq.dailyRate}/day + ₹850 Transport)
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="mt-3 flex items-center gap-2 w-full lg:justify-end flex-wrap">
                      <a
                        href="tel:+919876543210"
                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-bold text-gray-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Call Kisan Agro Rentals Hub Hotline"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Call Hub</span>
                      </a>

                      {b.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={cancellingId === b.id}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-800 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === b.id ? "Cancelling..." : "Cancel Request"}
                        </button>
                      )}

                      <Link
                        href="/equipment"
                        className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-[11px] font-bold text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Rebook</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>

                {/* Status Progress Step Tracker */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center text-[10px] font-bold">
                    <div className={`p-1.5 rounded-lg ${
                      b.status !== "CANCELLED" && b.status !== "REJECTED" ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-400"
                    }`}>
                      1. Request Placed
                    </div>
                    <div className={`p-1.5 rounded-lg ${
                      b.status === "APPROVED" || b.status === "ACTIVE" || b.status === "COMPLETED" 
                        ? "bg-emerald-50 text-emerald-800" 
                        : b.status === "CANCELLED"
                        ? "bg-rose-50 text-rose-700 line-through"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      2. Provider Approval
                    </div>
                    <div className={`p-1.5 rounded-lg ${
                      b.status === "ACTIVE" || b.status === "COMPLETED" 
                        ? "bg-emerald-50 text-emerald-800" 
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      3. Dispatched to Farm
                    </div>
                    <div className={`p-1.5 rounded-lg ${
                      b.status === "COMPLETED" ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-400"
                    }`}>
                      4. Completed
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
