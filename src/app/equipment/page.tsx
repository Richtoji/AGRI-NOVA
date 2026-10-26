"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { SafeImage } from "@/components/ui/SafeImage";
import { 
  Tractor, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Clock, 
  Check, 
  Phone, 
  User, 
  ClipboardList, 
  Filter, 
  DollarSign, 
  Info,
  Ban,
  ArrowRight
} from "lucide-react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";

export default function EquipmentPage() {
  const { currentUser, currentRole } = useAuthRole();
  const isAdmin = currentRole === "ADMIN" || currentUser?.role === "ADMIN";
  const isBuyer = currentRole === "BUYER" || currentUser?.role === "BUYER";

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEq, setSelectedEq] = useState<any | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [bookedDates, setBookedDates] = useState<any[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Admin state
  const [adminTab, setAdminTab] = useState<"bookings" | "fleet">("bookings");
  const [adminBookings, setAdminBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    // If Admin or Buyer, do not allow selectedEq
    if (isAdmin || isBuyer) {
      setSelectedEq(null);
      return;
    }

    if (selectedEq) {
      fetch(`/api/equipment/${selectedEq.id}/availability`)
        .then(res => res.json())
        .then(data => {
          if (data.bookings) setBookedDates(data.bookings);
        })
        .catch(console.error);
    } else {
      setStartDate("");
      setEndDate("");
      setBookedDates([]);
      setValidationError(null);
    }
  }, [selectedEq, isAdmin]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/equipment");
        if (res.ok) {
          const data = await res.json();
          setEquipmentList(data.equipment || []);
        }
      } catch (err) {
        console.error("Failed to fetch equipment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  // Fetch all bookings for admin
  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminBookings = async () => {
      setLoadingBookings(true);
      try {
        const res = await fetch("/api/equipment/requests");
        if (res.ok) {
          const data = await res.json();
          setAdminBookings(data.rentals || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchAdminBookings();
  }, [isAdmin]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleConfirmBooking = async () => {
    // Extra safety: Admins and Buyers cannot book machinery
    if (isAdmin) {
      setValidationError("Admins are restricted to view-only mode and cannot book equipment.");
      return;
    }
    if (isBuyer) {
      setValidationError("Buyers are restricted to product procurement only and cannot book agricultural machinery.");
      return;
    }

    setValidationError(null);
    
    if (!startDate || !endDate) {
      setValidationError("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      setValidationError("Start date cannot be in the past.");
      return;
    }

    const days = calculateDays();
    if (days < 1) {
      setValidationError("Minimum booking duration is 1 day.");
      return;
    }

    // Check overlaps
    const hasOverlap = bookedDates.some((b: any) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return (start < bEnd && end > bStart);
    });

    if (hasOverlap) {
      setValidationError("Selected dates conflict with an existing booking.");
      return;
    }

    setIsBooking(true);
    try {
      const totalCost = (selectedEq.dailyRate * days) + 850;
      const reqHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (currentUser?.id) reqHeaders["x-user-id"] = currentUser.id;
      if (currentRole) reqHeaders["x-user-role"] = currentRole;

      const res = await fetch("/api/equipment/book", {
        method: "POST",
        headers: reqHeaders,
        credentials: "include",
        body: JSON.stringify({
          equipmentId: selectedEq.id,
          startDate,
          endDate,
          totalCost
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Failed to book equipment.");
      } else {
        setBookingSuccess(true);
        setSelectedEq(null);
        try {
          localStorage.setItem('agri_nova_equipment_booked', Date.now().toString());
          window.dispatchEvent(new CustomEvent('agri_nova_equipment_booked', { detail: data.booking }));
        } catch (_) {}
        setTimeout(() => {
          setBookingSuccess(false);
        }, 8000);
      }
    } catch (err) {
      setValidationError("An unexpected error occurred.");
    } finally {
      setIsBooking(false);
    }
  };

  // Filter admin bookings
  const filteredAdminBookings = adminBookings.filter(b => {
    const matchesSearch = 
      (b.equipment?.name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.renter?.name || b.farmer?.name || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.renter?.phone || b.farmer?.phone || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.equipment?.category || "").toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || b.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate admin metrics
  const totalBookingsCount = adminBookings.length;
  const approvedBookingsCount = adminBookings.filter(b => b.status === "APPROVED").length;
  const pendingBookingsCount = adminBookings.filter(b => b.status === "PENDING").length;
  const totalRentalValue = adminBookings.reduce((sum, b) => sum + (Number(b.totalCost) || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Equipment {isAdmin ? "Operations & Rental Records" : "Rental"}
                  {isAdmin && (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin Audit View
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500">
                  {isAdmin 
                    ? "Full platform audit of machinery rentals, renter contacts, schedules, and fleet availability."
                    : "Rent Modern Machinery With GPS Dispatch"}
                </p>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>Admin Booking Disabled &bull; Read-Only Audit Mode</span>
            </div>
          ) : null}
        </div>

        {/* Admin Tabs */}
        {isAdmin && (
          <div className="flex border-b border-gray-200 gap-4">
            <button
              type="button"
              onClick={() => setAdminTab("bookings")}
              className={`pb-3 px-2 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                adminTab === "bookings"
                  ? "border-emerald-800 text-emerald-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>All Equipment Bookings ({adminBookings.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminTab("fleet")}
              className={`pb-3 px-2 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                adminTab === "fleet"
                  ? "border-emerald-800 text-emerald-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>Machinery Fleet Inventory ({equipmentList.length})</span>
            </button>
          </div>
        )}

        {/* ADMIN VIEW: Rental Bookings Data */}
        {isAdmin && adminTab === "bookings" && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                  <ClipboardList className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900">{totalBookingsCount}</div>
                <p className="text-[11px] text-gray-400 mt-1">Platform-wide rental requests</p>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-emerald-700 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active / Approved</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">{approvedBookingsCount}</div>
                <p className="text-[11px] text-gray-400 mt-1">Confirmed equipment dispatches</p>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-amber-700 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Review</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700">{pendingBookingsCount}</div>
                <p className="text-[11px] text-gray-400 mt-1">Awaiting owner approval</p>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Value</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">₹{totalRentalValue.toLocaleString('en-IN')}</div>
                <p className="text-[11px] text-gray-400 mt-1">Gross platform rental fees</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by equipment, farmer, phone, category..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer focus:bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved / Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bookings Table / List */}
            {loadingBookings ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">
                Loading equipment bookings data...
              </div>
            ) : filteredAdminBookings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">No Equipment Bookings Found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {searchFilter || statusFilter !== "ALL"
                    ? "No records match your search filters. Try adjusting the query."
                    : "No farmer equipment rentals have been recorded yet."}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Booking ID</th>
                        <th className="py-3.5 px-4">Equipment Details</th>
                        <th className="py-3.5 px-4">Renter / Farmer</th>
                        <th className="py-3.5 px-4">Rental Duration</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredAdminBookings.map((bk) => {
                        const renter = bk.renter || bk.farmer || { name: "Rajesh Kumar", phone: "+91 98765 43210" };
                        const eq = bk.equipment || { name: "Mahindra Tractor", category: "Tractors", locationName: "Kerala" };
                        
                        return (
                          <tr key={bk.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-4 px-4 font-mono text-[11px] text-gray-500">
                              #{bk.id}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                {eq.imageUrl ? (
                                  <SafeImage
                                    src={eq.imageUrl}
                                    alt={eq.name}
                                    className="w-12 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <Tractor className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-gray-900">{eq.name}</div>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                                      {eq.category}
                                    </span>
                                    <span>&bull;</span>
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      {eq.locationName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2.5">
                                {renter.avatarUrl ? (
                                  <SafeImage
                                    src={renter.avatarUrl}
                                    alt={renter.name}
                                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                                    {renter.name?.charAt(0) || "F"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-gray-900">{renter.name}</div>
                                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    {renter.phone || "Not provided"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-0.5">
                                <div className="text-gray-900 font-semibold">
                                  {bk.startDate} &rarr; {bk.endDate}
                                </div>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Scheduled Dispatch
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-black text-gray-900 text-sm">
                                ₹{Number(bk.totalCost || 0).toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-gray-400">Incl. Transport</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                bk.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : bk.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : bk.status === "COMPLETED"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-gray-100 text-gray-700 border border-gray-200"
                              }`}>
                                {bk.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                                {bk.status === "PENDING" && <Clock className="w-3 h-3" />}
                                {bk.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Machinery Grid (Shown for Farmers always, and for Admin under 'fleet' tab) */}
        {(!isAdmin || (isAdmin && adminTab === "fleet")) && (
          <div className="space-y-4">
            {isAdmin ? (
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Fleet Overview:</strong> Review catalog machinery rates and availability. Booking actions are restricted to registered farmer accounts.
                </span>
              </div>
            ) : isBuyer ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Buyer Notice:</strong> Agricultural machinery booking is restricted to farmers. Buyers are registered exclusively for purchasing produce and products in the Agri Marketplace.
                  </span>
                </div>
                <Link
                  href="/marketplace"
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg text-xs whitespace-nowrap self-start sm:self-auto shrink-0 transition-colors"
                >
                  Go to Marketplace &rarr;
                </Link>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {equipmentList.map((eq: any) => (
                <div key={eq.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col group relative shadow-xs p-4">
                  <div className="space-y-3 flex-1 flex flex-col">
                    
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100 mb-3">
                      <SafeImage src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[10px] font-bold shadow-sm">
                        {eq.category}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[10px] font-bold flex items-center shadow-sm">
                        <Zap className="w-3 h-3 mr-1" /> Available
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900">{eq.name}</h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{eq.locationName}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-3">
                      <div>
                        <div className="text-gray-500 text-[10px]">Daily Rate</div>
                        <div className="text-sm font-bold text-gray-900">₹{eq.dailyRate}/day</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px]">Hourly Rate</div>
                        <div className="text-sm font-bold text-gray-900">₹{eq.hourlyRate}/hr</div>
                      </div>
                    </div>

                  </div>

                  {/* ACTION: Non-Admin & Non-Buyer gets 'Book Equipment' */}
                  {isAdmin ? (
                    <div className="w-full mt-4 bg-gray-50 border border-gray-200 text-gray-500 font-semibold rounded-lg py-2.5 flex items-center justify-center text-xs space-x-1.5 select-none">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Farmer Booking Only &bull; View Only</span>
                    </div>
                  ) : isBuyer ? (
                    <div className="w-full mt-4 bg-gray-50 border border-gray-200 text-gray-400 font-semibold rounded-lg py-2.5 flex items-center justify-center text-xs space-x-1.5 select-none">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      <span>Buyers Restrict &bull; Purchase in Marketplace</span>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setSelectedEq(eq)} 
                      className="w-full mt-4 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-bold rounded-lg py-2.5 shadow-sm transition-colors flex items-center justify-center text-sm cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Book Equipment</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Modal (Strictly disabled for Admins and Buyers) */}
        {!isAdmin && !isBuyer && selectedEq && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
                <h3 className="font-bold text-gray-900">Book {selectedEq.name}</h3>
                <button 
                  type="button"
                  onClick={() => setSelectedEq(null)} 
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <SafeImage src={selectedEq.imageUrl} alt={selectedEq.name} className="w-20 h-20 rounded-lg object-cover" />
                   <div>
                     <h4 className="font-bold text-gray-900 text-sm">{selectedEq.name}</h4>
                     <p className="text-xs text-gray-500">{selectedEq.locationName}</p>
                     <p className="text-sm font-black text-gray-900 mt-1">₹{selectedEq.dailyRate} <span className="text-[10px] font-normal text-gray-500">/ day</span></p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Start Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">End Date</label>
                    <input 
                      type="date" 
                      min={startDate || new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                    />
                  </div>
                </div>
                
                {validationError && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {validationError}
                  </p>
                )}

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Cost</span>
                    <span className="font-medium text-gray-900">₹{selectedEq.dailyRate * calculateDays()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Insurance & Transport</span>
                    <span className="font-medium text-gray-900">₹850</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Total Estimate</span>
                    <span className="font-black text-gray-800 text-lg">₹{(selectedEq.dailyRate * calculateDays()) + (calculateDays() > 0 ? 850 : 0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {isBooking ? "Booking..." : "Confirm Booking Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast with Direct Navigation to Farmer Dashboard */}
        {!isAdmin && bookingSuccess && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-start space-x-3.5 z-50 animate-in slide-in-from-bottom-4 border border-emerald-500/40 max-w-sm sm:max-w-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white">Booking Request Submitted!</p>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                Your machinery rental request is sent to Kisan Agro Rentals. An order record has been created in your Farmer Dashboard.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Link 
                  href="/dashboard/farmer?tab=equipment-rentals"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>View in Farmer Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setBookingSuccess(false)}
                  className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
