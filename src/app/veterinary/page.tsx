"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Stethoscope, 
  Droplets, 
  Calendar, 
  ChevronRight, 
  Activity, 
  Beaker, 
  MapPin, 
  Loader2, 
  Target, 
  X, 
  Check, 
  ShieldCheck, 
  HeartPulse, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Info,
  Search,
  Filter,
  Ban,
  CheckCircle2,
  ClipboardList,
  User,
  Phone
} from "lucide-react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { AdminLivestockManagement } from "@/components/admin/AdminLivestockManagement";
import { SafeImage } from "@/components/ui/SafeImage";
import { AppointmentModal } from "@/components/veterinary/AppointmentModal";

export default function VeterinaryPage() {
  const { currentUser, currentRole } = useAuthRole();
  const isAdmin = currentRole === "ADMIN" || currentUser?.role === "ADMIN";

  // Farmer booking modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<any | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [regionalAnalysis, setRegionalAnalysis] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  
  // Location-based recommendation state
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);

  // Admin states
  const [adminTab, setAdminTab] = useState<"bookings" | "breeds">("bookings");
  const [adminAppointments, setAdminAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("ALL");

  useEffect(() => {
    if (isAdmin) {
      // Fetch all appointments for Admin audit view
      const fetchAdminAppointments = async () => {
        setLoadingAppointments(true);
        try {
          const res = await fetch("/api/veterinary/book");
          if (res.ok) {
            const data = await res.json();
            setAdminAppointments(data.appointments || []);
          }
        } catch (err) {
          console.error("Failed to fetch admin veterinary appointments:", err);
        } finally {
          setLoadingAppointments(false);
        }
      };
      fetchAdminAppointments();
      return;
    }

    const fetchRecs = async () => {
      try {
        const [resLivestock, resRegions] = await Promise.all([
          fetch("/api/admin/livestock-recommendations"),
          fetch("/api/admin/regional-livestock")
        ]);
        
        if (resLivestock.ok) {
          const data = await resLivestock.json();
          setRecommendations(data.recommendations || []);
        }
        
        if (resRegions.ok) {
          const data = await resRegions.json();
          setRegionalAnalysis(data.regions || []);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [isAdmin]);

  const detectLocationAndRecommend = () => {
    setIsLocating(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          
          let locality = data.city || data.locality || data.principalSubdivision;
          
          if (locality) {
            const matchedRegion = regionalAnalysis.find(r => 
              locality.toLowerCase().includes(r.district.toLowerCase()) || 
              r.district.toLowerCase().includes(locality.toLowerCase())
            );
            
            if (matchedRegion) {
              setUserDistrict(matchedRegion.district);
            } else {
              const defaultCluster = regionalAnalysis.length > 0 ? regionalAnalysis[0].district : "Palakkad";
              setUserDistrict(defaultCluster);
              if (locality) {
                setLocationError(`Detected region: ${locality}. Showing regional agricultural cluster data (${defaultCluster}).`);
              }
            }
          } else {
            setLocationError("Could not determine your district from coordinates.");
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          setLocationError("Failed to fetch location details.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setLocationError("Unable to retrieve your location. Please allow location access.");
        setIsLocating(false);
      }
    );
  };

  const recommendedRegionData = userDistrict ? regionalAnalysis.find(r => r.district === userDistrict) : null;

  // Filter admin appointments
  const filteredAppointments = adminAppointments.filter(apt => {
    const q = appointmentSearch.toLowerCase();
    const matchesSearch = 
      (apt.farmerName || "").toLowerCase().includes(q) ||
      (apt.vetName || "").toLowerCase().includes(q) ||
      (apt.animal || "").toLowerCase().includes(q) ||
      (apt.symptoms || "").toLowerCase().includes(q) ||
      (apt.id || "").toLowerCase().includes(q);

    const matchesStatus = appointmentStatusFilter === "ALL" || 
      apt.status?.toUpperCase() === appointmentStatusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Admin metrics
  const totalAppointmentsCount = adminAppointments.length;
  const scheduledCount = adminAppointments.filter(a => a.status === "SCHEDULED").length;
  const completedCount = adminAppointments.filter(a => a.status === "COMPLETED").length;
  const uniqueVetsCount = Array.from(new Set(adminAppointments.map(a => a.vetName).filter(Boolean))).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Livestock &amp; Veterinary {isAdmin ? "Operations & Consultation Records" : "Care"}
                  {isAdmin && (
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin Audit View
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500">
                  {isAdmin
                    ? "Full platform audit of veterinary appointments, consulting doctors, patient species, and livestock database."
                    : "Manage your livestock health, view breed recommendations, and book veterinary appointments."}
                </p>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>Admin Booking Disabled &bull; Read-Only Audit Mode</span>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Vet Appointment
            </button>
          )}
        </div>

        {/* ADMIN TAB NAVIGATION */}
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
              <span>Veterinary Bookings Data ({adminAppointments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminTab("breeds")}
              className={`pb-3 px-2 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                adminTab === "breeds"
                  ? "border-emerald-800 text-emerald-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Livestock Breeds &amp; Regional Database</span>
            </button>
          </div>
        )}

        {/* ADMIN VIEW: VETERINARY BOOKINGS DATA */}
        {isAdmin && adminTab === "bookings" && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Consultations</span>
                  <ClipboardList className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900">{totalAppointmentsCount}</div>
                <p className="text-[11px] text-gray-400 mt-1">Platform-wide clinic bookings</p>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-amber-700 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Scheduled / Upcoming</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700">{scheduledCount}</div>
                <p className="text-[11px] text-gray-400 mt-1">Pending veterinary visits</p>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-emerald-700 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Completed Visits</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">{completedCount}</div>
                <p className="text-[11px] text-gray-400 mt-1">Fulfilled health examinations</p>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Veterinary Specialists</span>
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">{uniqueVetsCount || 1}</div>
                <p className="text-[11px] text-gray-400 mt-1">Assigned veterinary doctors</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by farmer, vet, animal species, symptoms..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={appointmentStatusFilter}
                  onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none cursor-pointer focus:bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SCHEDULED">Scheduled / Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Appointments Table */}
            {loadingAppointments ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">
                Loading veterinary booking data...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">No Veterinary Bookings Found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {appointmentSearch || appointmentStatusFilter !== "ALL"
                    ? "No consultation records match your filter criteria. Try adjusting your query."
                    : "No veterinary appointments have been scheduled on the platform yet."}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Case ID</th>
                        <th className="py-3.5 px-4">Patient &amp; Symptoms</th>
                        <th className="py-3.5 px-4">Farmer / Owner</th>
                        <th className="py-3.5 px-4">Attending Doctor</th>
                        <th className="py-3.5 px-4">Scheduled Date &amp; Time</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-4 font-mono text-[11px] text-gray-500">
                            #{apt.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1 max-w-xs">
                              <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                {apt.animal || "Farm Animal"}
                              </span>
                              <p className="text-gray-900 font-medium text-xs leading-relaxed line-clamp-2">
                                {apt.symptoms || "Routine checkup and clinical assessment"}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                                {apt.farmerName?.charAt(0) || "F"}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{apt.farmerName}</div>
                                <div className="text-[11px] text-gray-400">Registered Farmer</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                Dr
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{apt.vetName || "Dr. Ananya Sharma, DVM"}</div>
                                <div className="text-[11px] text-gray-400">Veterinary Surgeon</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {apt.time}
                              </div>
                              <div className="text-[11px] text-gray-400">On-Farm Consultation</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              apt.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : apt.status === "SCHEDULED"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              {apt.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                              {apt.status === "SCHEDULED" && <Clock className="w-3 h-3" />}
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN VIEW: LIVESTOCK MANAGEMENT TAB */}
        {isAdmin && adminTab === "breeds" && (
          <div className="space-y-6">
            <AdminLivestockManagement />
          </div>
        )}

        {/* FARMER VIEW */}
        {!isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Smart Location-Based Recommendation */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Target className="w-32 h-32 text-gray-900" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-xl font-black text-gray-900 flex items-center mb-2">
                    <MapPin className="w-5 h-5 mr-2 text-gray-900" />
                    Smart Livestock Recommender
                  </h2>
                  <p className="text-gray-500 text-sm mb-6 max-w-lg">
                    Select your district or detect your farm's location to get AI-driven livestock recommendations perfectly suited for your local climate and geography.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                      value={userDistrict || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setUserDistrict(e.target.value);
                          setLocationCoords(null);
                          setLocationError(null);
                        } else {
                          setUserDistrict(null);
                        }
                      }}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10 flex-1 max-w-xs"
                    >
                      <option value="">Select your district manually...</option>
                      {[
                        "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
                        "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
                        "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
                      ].map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center justify-center">
                      <span className="text-gray-400 font-bold text-xs uppercase mx-2">or</span>
                    </div>

                    <button 
                      type="button"
                      onClick={detectLocationAndRecommend}
                      disabled={isLocating}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center disabled:opacity-70 cursor-pointer"
                    >
                      {isLocating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Locating...</>
                      ) : (
                        <><Target className="w-4 h-4 mr-2" /> Auto Detect Location</>
                      )}
                    </button>
                  </div>
                  
                  {locationError && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold flex items-center">
                      {locationError}
                      <button onClick={detectLocationAndRecommend} className="ml-auto underline hover:text-rose-700">Retry</button>
                    </div>
                  )}
                  
                  {userDistrict && !recommendedRegionData && !isLocating && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold flex items-center">
                      No specific data for {userDistrict} yet. Please check back later.
                    </div>
                  )}
                  
                  {recommendedRegionData && (
                    <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
                        <div className="flex items-center text-gray-500 font-mono text-xs">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {locationCoords ? `${locationCoords.lat.toFixed(4)}° N, ${locationCoords.lng.toFixed(4)}° E` : ''}
                        </div>
                        <h3 className="text-lg font-black text-gray-900">
                          {recommendedRegionData.district} Region Profile
                        </h3>
                      </div>
                      <div className="flex flex-col md:flex-row gap-6 mt-4">
                        {recommendedRegionData.imageUrl && (
                          <div className="md:w-1/3 flex-shrink-0">
                            <img src={recommendedRegionData.imageUrl} alt={recommendedRegionData.district} className="w-full h-40 object-cover rounded-xl border border-gray-200 shadow-sm" />
                          </div>
                        )}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Ideal Livestock Profile</p>
                            <p className="text-gray-900 font-bold">{recommendedRegionData.primaryLivestock}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Regional Strategic Focus</p>
                            <p className="text-gray-600 text-sm leading-relaxed">{recommendedRegionData.focusAreas}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Breed Recommendation */}
              <h2 className="text-lg font-black text-gray-900">Recommended Breeds for Your Region</h2>
              
              {loadingRecs ? (
                <div className="text-sm text-gray-500 animate-pulse">Loading recommended breeds...</div>
              ) : recommendations.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">No specific recommendations for your region yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                      <div className="h-48 relative bg-gray-50">
                        {rec.imageUrl && (
                          <SafeImage 
                            src={rec.imageUrl} 
                            alt={rec.breedName} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-gray-800 border border-gray-200 shadow-sm uppercase">
                          {rec.location}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-black text-gray-900">{rec.breedName}</h3>
                        <div className="mt-4 space-y-3 flex-1 text-sm">
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 flex items-center"><Droplets className="w-4 h-4 mr-2 text-blue-500" /> Expected Yield</span>
                            <span className="font-bold text-gray-900">{rec.expectedYield}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500 flex items-center"><Activity className="w-4 h-4 mr-2 text-gray-700" /> Fat Content</span>
                            <span className="font-bold text-gray-900">{rec.fatContent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 flex items-center"><Beaker className="w-4 h-4 mr-2 text-amber-500" /> Maintenance</span>
                            <span className="font-bold text-gray-900">{rec.maintenanceLevel}</span>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedBreed(rec)}
                          className="mt-5 w-full py-2 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 font-bold text-sm rounded-lg transition-colors border border-gray-200 hover:border-emerald-200 cursor-pointer flex items-center justify-center space-x-1"
                          title="View comprehensive breed characteristics, yield statistics, and health guidelines"
                        >
                          <span>View Full Details</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feed Requirements */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 bg-white border border-gray-200 rounded-xl mt-6">
                <h3 className="text-lg font-black text-gray-900 mb-4">Daily Feed Requirements (per Adult Cow)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Green Fodder (Napier/Maize)</h4>
                      <p className="text-xs text-gray-500">Provides essential moisture and vitamins</p>
                    </div>
                    <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">15 - 20 kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Dry Fodder (Paddy Straw)</h4>
                      <p className="text-xs text-gray-500">Maintains rumen health and digestion</p>
                    </div>
                    <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">4 - 5 kg</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Concentrate Feed &amp; Minerals</h4>
                      <p className="text-xs text-gray-500">For energy, protein, and calcium</p>
                    </div>
                    <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">2 - 3 kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Area for Farmers */}
            <div className="space-y-6">
              
              <div className="bg-white border border-gray-100 rounded-2xl p-5 bg-gray-50 border border-gray-100 rounded-xl">
                <h3 className="font-bold text-emerald-900 mb-2">Book Veterinary Care</h3>
                <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                  Schedule an on-farm visit or teleconsultation with certified veterinary doctors.
                </p>
                <button 
                  type="button"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center cursor-pointer"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Upcoming Vaccinations</h3>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-gray-100">
                  <div className="relative pl-7">
                    <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-white"></div>
                    <div className="text-xs font-bold text-amber-600 mb-0.5">Due in 5 Days</div>
                    <h4 className="font-bold text-gray-900 text-sm">FMD Vaccine</h4>
                    <p className="text-xs text-gray-500">Foot and Mouth Disease booster</p>
                  </div>
                  <div className="relative pl-7">
                    <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-gray-700 ring-4 ring-white"></div>
                    <div className="text-xs font-bold text-gray-900 mb-0.5">Completed (Oct 12)</div>
                    <h4 className="font-bold text-gray-900 text-sm">HS &amp; BQ Vaccine</h4>
                    <p className="text-xs text-gray-500">Hemorrhagic Septicemia</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="mt-5 text-sm text-gray-900 hover:text-emerald-700 font-bold flex items-center cursor-pointer transition-colors"
                  title="View complete 12-month vaccination & deworming schedule"
                >
                  <span>View Full Schedule</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Appointment Modal: Strictly non-admin only */}
      {!isAdmin && (
        <AppointmentModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
      )}

      {/* Breed Full Details Modal */}
      {selectedBreed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  🐄
                </div>
                <div>
                  <h3 className="font-bold text-base">{selectedBreed.breedName}</h3>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Recommended for {selectedBreed.location || "Kerala Farm Regions"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBreed(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Image banner if present */}
              {selectedBreed.imageUrl && (
                <div className="h-48 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100">
                  <SafeImage
                    src={selectedBreed.imageUrl}
                    alt={selectedBreed.breedName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      Verified Livestock Variety
                    </span>
                  </div>
                </div>
              )}

              {/* Statistics Key Metrics */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Production &amp; Yield Benchmarks
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <span className="text-[10px] font-semibold text-blue-700">Daily Milk Yield</span>
                    <p className="font-black text-gray-900 text-sm mt-0.5">{selectedBreed.expectedYield}</p>
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <span className="text-[10px] font-semibold text-amber-700">Butterfat Content</span>
                    <p className="font-black text-gray-900 text-sm mt-0.5">{selectedBreed.fatContent}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-semibold text-emerald-700">Maintenance Level</span>
                    <p className="font-black text-gray-900 text-sm mt-0.5">{selectedBreed.maintenanceLevel}</p>
                  </div>
                </div>
              </div>

              {/* Veterinary Health Insights */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Veterinary Health &amp; Climate Adaptation</span>
                </h4>
                <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2 text-xs text-gray-700 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">Climate Resistance:</strong> Well adapted to tropical coastal and high-humidity climates with high heat tolerance.
                  </p>
                  <p>
                    <strong className="text-gray-900">Disease Vulnerabilities:</strong> Moderate resistance to tick-borne infections. Requires mandatory bi-annual Foot &amp; Mouth Disease (FMD) booster and quarterly anthelmintic deworming.
                  </p>
                  <p>
                    <strong className="text-gray-900">Optimal Nutrition:</strong> 18 kg green fodder (Napier CO-4/CO-5) + 4 kg dry straw + 2.5 kg balanced cattle concentrate per 10 liters of yield.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBreed(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBreed(null);
                    setIsBookingModalOpen(true);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Veterinary Checkup</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Vaccination Full Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
            
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Complete Livestock Health &amp; Vaccine Calendar</h3>
                  <p className="text-[10px] text-emerald-200">Recommended by State Veterinary Services &amp; KVASU</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {[
                {
                  period: "January - February",
                  disease: "Foot and Mouth Disease (FMD) Booster",
                  animal: "Cattle, Buffalo, Sheep, Goats",
                  dosage: "Subcutaneous (3ml) - Biannual",
                  status: "Upcoming"
                },
                {
                  period: "March",
                  disease: "Spring Deworming (Broad Spectrum Anthelmintic)",
                  animal: "All Ruminants & Calves",
                  dosage: "Oral Suspension (Albendazole / Oxyclozanide)",
                  status: "Routine"
                },
                {
                  period: "May - June (Pre-Monsoon)",
                  disease: "Hemorrhagic Septicemia (HS) & Black Quarter (BQ)",
                  animal: "Cattle & Buffaloes above 6 months",
                  dosage: "Combined Alum Precipitated Vaccine (5ml Subcut)",
                  status: "Mandatory Pre-Monsoon"
                },
                {
                  period: "August",
                  disease: "Anthrax & Theileriosis Preventive Screening",
                  animal: "High-Yielding Dairy Crossbreds",
                  dosage: "Clinical Blood Smear & Sero-monitoring",
                  status: "High Alert"
                },
                {
                  period: "October",
                  disease: "Brucellosis S19 Calfhood Vaccination",
                  animal: "Female Calves (4 - 8 months only)",
                  dosage: "One-time Lifetime Vaccine (2ml Subcut)",
                  status: "Essential"
                },
                {
                  period: "November - December",
                  disease: "Post-Monsoon Deworming & Mineral Bolus Course",
                  animal: "Lactating Cows & Pregnant Heifers",
                  dosage: "Chelated Mineral Mixture (50g daily)",
                  status: "Nutritional"
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                      {item.period}
                    </span>
                    <h4 className="font-bold text-xs text-gray-900">{item.disease}</h4>
                    <p className="text-[11px] text-gray-500">{item.animal} &bull; {item.dosage}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setIsBookingModalOpen(true);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Doctor for Vaccination</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </AppLayout>
  );
}
