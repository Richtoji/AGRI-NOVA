"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Stethoscope, Droplets, Calendar, ChevronRight, Activity, Beaker } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { AdminLivestockManagement } from "@/components/admin/AdminLivestockManagement";
import { Map, MapPin, Loader2, Target } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { AppointmentModal } from "@/components/veterinary/AppointmentModal";

export default function VeterinaryPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { currentUser } = useAuthRole();
  const isAdmin = currentUser?.role === "ADMIN";
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [regionalAnalysis, setRegionalAnalysis] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  
  // Location-based recommendation state
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (isAdmin) return; // Admins have their own panel
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
          // Use a free reverse geocoding API
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          
          // Extract district/city name
          let locality = data.city || data.locality || data.principalSubdivision;
          
          if (locality) {
            // Try to match with our regionalAnalysis data
            const matchedRegion = regionalAnalysis.find(r => 
              locality.toLowerCase().includes(r.district.toLowerCase()) || 
              r.district.toLowerCase().includes(locality.toLowerCase())
            );
            
            if (matchedRegion) {
              setUserDistrict(matchedRegion.district);
            } else {
              // Fallback to a default if in Kerala but not perfectly matched, or show error
              setLocationError(`Detected location: ${locality}. We don't have specific data for this district yet.`);
              // For demo purposes if outside Kerala, let's mock it to Palakkad
              if (data.countryCode !== "IN" || !data.principalSubdivision.includes("Kerala")) {
                setUserDistrict("Palakkad"); 
                setLocationError(null);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100 bg-white">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="w-6 h-6 mr-2 text-gray-900" /> Livestock & Veterinary Care
            </h1>
            <p className="text-sm text-gray-500">
              Manage your livestock health, view breed recommendations, and book veterinary appointments.
            </p>
          </div>
          {!isAdmin && (
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Vet Appointment
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {isAdmin ? (
            <div className="lg:col-span-3">
              <AdminLivestockManagement />
            </div>
          ) : (
            <>
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
                    onClick={detectLocationAndRecommend}
                    disabled={isLocating}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center disabled:opacity-70"
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
                      <button className="mt-5 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm rounded-lg transition-colors border border-gray-200">
                        View Full Details
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
                    <h4 className="font-bold text-gray-900 text-sm">Concentrate Feed & Minerals</h4>
                    <p className="text-xs text-gray-500">For energy, protein, and calcium</p>
                  </div>
                  <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">2 - 3 kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            <div className="bg-white border border-gray-100 rounded-2xl p-5 bg-gray-50 border border-gray-100 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-2">Book Veterinary Care</h3>
              <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                Schedule an on-farm visit or teleconsultation with certified veterinary doctors.
              </p>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center"
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
                  <h4 className="font-bold text-gray-900 text-sm">HS & BQ Vaccine</h4>
                  <p className="text-xs text-gray-500">Hemorrhagic Septicemia</p>
                </div>
              </div>
              <button className="mt-5 text-sm text-gray-900 font-bold hover:text-gray-800 flex items-center">
                View Full Schedule <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

          </div>
            </>
          )}

        </div>
      </div>

      <AppointmentModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </AppLayout>
  );
}
