"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { useLocationWeather } from "@/lib/hooks/useLocationWeather";
import { CropCultivationGuideModal } from "@/components/farmer/CropCultivationGuideModal";
import { PlantAnyCropModal } from "@/components/farmer/PlantAnyCropModal";
import { PlantThisCropModal } from "@/components/farmer/PlantThisCropModal";
import { CropCultivationProgressModule } from "@/components/farmer/CropCultivationProgressModule";
import { CultivationImageUpload } from "@/components/farmer/CultivationImageUpload";
import { MyListings } from "@/components/marketplace/MyListings";
import { getCropKnowledge } from "@/data/cropKnowledge";
import { 
  Home,
  Store,
  MapPin, 
  Droplets, 
  Sun, 
  Sprout, 
  ShoppingBag, 
  Tractor,
  PawPrint,
  Stethoscope,
  ChevronRight,
  PlusCircle,
  CloudSun,
  Bug,
  ShieldAlert,
  ClipboardList,
  Coins,
  CloudRain,
  Cloud,
  RefreshCw,
  AlertTriangle,
  Search,
  Camera,
  CheckCircle,
  CheckCircle2,
  Clock,
  Lock,
  Leaf,
  ArrowRight,
  Info,
  AlertCircle,
  FlaskConical,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Trash2,
  Sparkles,
  ExternalLink
} from "lucide-react";

// Dynamically import the map to avoid SSR issues with Leaflet
const FarmMap = dynamic(() => import('@/components/dashboard/weather/FarmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400 font-medium">
      Loading Map...
    </div>
  )
});

function FarmerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam || 'dashboard';

  const { currentUser } = useAuthRole();
  const userName = currentUser?.name || "Farmer";
  
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);
  
  const { coordinates, weatherData, loading, error, permissionState, refresh, setLocationManually } = useLocationWeather();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError("");
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setLocationManually(Number(data[0].lat), Number(data[0].lon));
        setSearchQuery("");
      } else {
        setSearchError("Location not found.");
      }
    } catch (err) {
      setSearchError("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const [cropRecommendations, setCropRecommendations] = useState<any[]>([]);
  const [cropZone, setCropZone] = useState<string>("");
  const [cropRecsError, setCropRecsError] = useState<string>("");

  useEffect(() => {
    if (coordinates) {
      setCropRecsError("");
      fetch(`/api/crops/recommendations?latitude=${coordinates.lat}&longitude=${coordinates.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.recommendations) {
            setCropRecommendations(data.recommendations);
            setCropZone(data.zone);
          } else {
            setCropRecsError(data.error || "Failed to generate recommendations");
          }
        })
        .catch(err => {
          console.error("Failed to load crop recommendations", err);
          setCropRecsError("Failed to communicate with server");
        });
    }
  }, [coordinates]);

  const [isCropGuideOpen, setIsCropGuideOpen] = useState(false);
  const [isPlantAnyOpen, setIsPlantAnyOpen] = useState(false);
  const [isPlantThisCropModalOpen, setIsPlantThisCropModalOpen] = useState(false);
  const [plantCropModalData, setPlantCropModalData] = useState<{
    cropProfileId?: string;
    cropName: string;
    cropImage?: string;
    growingPeriod?: string;
    waterRequirement?: number;
    expectedYield?: string;
    zoneName?: string;
  } | null>(null);
  const [selectedCropName, setSelectedCropName] = useState("");
  const [selectedCropIsRecommended, setSelectedCropIsRecommended] = useState(false);
  const [myCultivations, setMyCultivations] = useState<any[]>([]);
  const [selectedCultivationId, setSelectedCultivationId] = useState<string | null>(null);
  const [dashboardActionError, setDashboardActionError] = useState<string | null>(null);
  const [startingCropName, setStartingCropName] = useState<string | null>(null);
  const [cultivationSuccessMessage, setCultivationSuccessMessage] = useState<string | null>(null);

  const openPlantThisCropAgreement = (crop: any) => {
    const matchedRec = cropRecommendations.find(
      (r: any) => r.name?.toLowerCase() === crop.name?.toLowerCase()
    );
    const knowledge = getCropKnowledge(crop.name || "Coconut");
    setPlantCropModalData({
      cropProfileId: crop.id || matchedRec?.id,
      cropName: crop.name,
      cropImage: crop.image || crop.imageUrl || matchedRec?.image || `/images/crops/${crop.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      growingPeriod: crop.growingPeriod || matchedRec?.growingPeriod || knowledge.growingPeriod,
      waterRequirement: crop.waterRequirement || matchedRec?.waterRequirement || knowledge.waterRequirement || 3,
      expectedYield: crop.metricValue || crop.expectedYield || matchedRec?.metricValue || knowledge.expectedYield,
      zoneName: crop.zoneName || matchedRec?.zoneName || cropZone
    });
    setIsPlantThisCropModalOpen(true);
  };

  const fetchCultivations = async (preferredId?: string) => {
    try {
      const res = await fetch('/api/crops/cultivate');
      const data = await res.json();
      if (data.success && data.cultivations) {
        setMyCultivations(data.cultivations);
        if (preferredId) {
          setSelectedCultivationId(preferredId);
        } else if (data.cultivations.length > 0) {
          setSelectedCultivationId(prev => {
            const exists = data.cultivations.some((c: any) => c.id === prev);
            return exists ? prev : data.cultivations[0].id;
          });
        }
      }
    } catch (err) {
      console.error("Failed to load cultivations", err);
    }
  };

  useEffect(() => {
    fetchCultivations();
  }, []);

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/farmer?tab=${tab}`);
  };

  const handleStartCultivation = async (cropProfileId: string, cropName?: string, initialPhotoUrl?: string, initialNotes?: string) => {
    const finalCropName = 
      cropName || 
      (typeof cropProfileId === 'string' && cropProfileId.length < 30 ? cropProfileId : selectedCropName) || 
      selectedCropName || 
      'Coconut';
    if (finalCropName) setSelectedCropName(finalCropName);
    setStartingCropName(finalCropName);
    setDashboardActionError(null);
    setCultivationSuccessMessage(null);

    try {
      const res = await fetch('/api/crops/cultivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cropProfileId, 
          cropName: finalCropName, 
          region: cropZone,
          restart: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start cultivation.");
      }

      const cultivation = data.cultivation;
      const cultId = cultivation?.id;

      // Optimistically update local state immediately so user sees their progress right away
      if (cultivation && cultId) {
        setSelectedCultivationId(cultId);
        setMyCultivations(prev => {
          const filtered = prev.filter(c => c.id !== cultId && c.cropProfileId !== cultivation.cropProfileId);
          return [cultivation, ...filtered];
        });
      }

      // If initial planting photograph was uploaded in the start modal, submit it immediately
      if (initialPhotoUrl && cultId) {
        const stageId = cultivation.currentStageId || 
          cultivation.cropProfile?.cultivationGuide?.cultivationStages?.[0]?.id || 
          "stage_1";

        try {
          await fetch(`/api/crops/cultivate/${cultId}/stage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stageId,
              imageUrl: initialPhotoUrl,
              farmerNotes: initialNotes || "Planting photograph submitted at cultivation start"
            })
          });
        } catch (stageErr) {
          console.warn("Could not submit immediate planting evidence", stageErr);
        }
      }

      await fetchCultivations(cultId);
      if (cultId) {
        setSelectedCultivationId(cultId);
      }

      // Notify other tabs and admin panel in real-time
      try {
        localStorage.setItem('agri_nova_last_cultivation_start', JSON.stringify({
          cultivationId: cultId,
          cropName: finalCropName,
          timestamp: Date.now()
        }));
        localStorage.setItem('agri_nova_cultivation_updated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('agri_nova_cultivation_started', {
          detail: { cultivationId: cultId, cropName: finalCropName }
        }));
      } catch (e) {}

      setCultivationSuccessMessage(
        initialPhotoUrl 
          ? `🎉 Supervised cultivation policy accepted for ${finalCropName}! Your planting photograph has been submitted and is currently under Administrator review in your dedicated area below.`
          : `🎉 Supervised cultivation policy accepted for ${finalCropName}! Your 72-hour planting window is active. Please upload your photograph below after planting.`
      );

      // Immediately navigate to the dedicated cultivation tab so the farmer lands directly on the progress & upload area
      router.push('/dashboard/farmer?tab=cultivation');
    } catch (err: any) {
      console.error("Failed to start cultivation", err);
      setDashboardActionError(err.message || "Failed to start cultivation. Please try again.");
    } finally {
      setStartingCropName(null);
    }
  };

  const submitStageFromDashboard = async (cultivationId: string, stageId: string, imageUrl: string, notes: string) => {
    setDashboardActionError(null);
    try {
      const res = await fetch(`/api/crops/cultivate/${cultivationId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, imageUrl, farmerNotes: notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit stage evidence.");
      await fetchCultivations();

      try {
        localStorage.setItem('agri_nova_cultivation_updated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('agri_nova_cultivation_updated', { detail: { cultivationId } }));
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setDashboardActionError(err.message || "Failed to submit stage evidence.");
      throw err;
    }
  };

  const submitWeeklyFromDashboard = async (cultivationId: string, weekNumber: number, dueDate: Date, imageUrl: string, notes: string) => {
    setDashboardActionError(null);
    try {
      const res = await fetch(`/api/crops/cultivate/${cultivationId}/weekly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber, dueDate, imageUrl, farmerNotes: notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit weekly growth photograph.");
      await fetchCultivations();

      try {
        localStorage.setItem('agri_nova_cultivation_updated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('agri_nova_cultivation_updated', { detail: { cultivationId } }));
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setDashboardActionError(err.message || "Failed to submit weekly update.");
      throw err;
    }
  };

  const handleDeleteCultivation = async (cultivationId: string) => {
    if (!window.confirm("Are you sure you want to remove this cultivation? You can start planting another crop anytime.")) {
      return;
    }
    setDashboardActionError(null);
    try {
      const res = await fetch(`/api/crops/cultivate/${cultivationId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete cultivation.");
      await fetchCultivations();
      setSelectedCultivationId(null);
      setCultivationSuccessMessage("Cultivation removed. You can now select any crop to start a fresh supervised cultivation.");

      try {
        localStorage.setItem('agri_nova_cultivation_updated', Date.now().toString());
        window.dispatchEvent(new CustomEvent('agri_nova_cultivation_updated', { detail: { cultivationId } }));
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setDashboardActionError(err.message || "Failed to remove cultivation.");
    }
  };

  const openCropGuide = (cropName: string, isRecommended: boolean) => {
    setSelectedCropName(cropName);
    setSelectedCropIsRecommended(isRecommended);
    setIsCropGuideOpen(true);
  };

  const renderWeatherIcon = (type: string, className: string = "w-14 h-14") => {
    switch(type) {
      case 'sun': return <Sun className={`${className} text-yellow-500`} strokeWidth={1.5} />;
      case 'cloud': return <Cloud className={`${className} text-gray-400`} strokeWidth={1.5} />;
      case 'partly': return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <Cloud className="w-14 h-14 text-gray-300 absolute" strokeWidth={1} />
          <Sun className="w-8 h-8 text-yellow-500 absolute -top-1 right-0" strokeWidth={1.5} />
        </div>
      );
      case 'rain': return <CloudRain className={`${className} text-blue-500`} strokeWidth={1.5} />;
      case 'snow': return <Cloud className={`${className} text-blue-200`} strokeWidth={1.5} />;
      default: return <Sun className={`${className} text-yellow-500`} strokeWidth={1.5} />;
    }
  };

  const renderSmallIcon = (type: string, className: string = "w-5 h-5 text-gray-600") => {
    switch(type) {
      case 'sun': return <Sun className={className} strokeWidth={1.5} />;
      case 'cloud': return <Cloud className={className} strokeWidth={1.5} />;
      case 'partly': return <CloudSun className={className} strokeWidth={1.5} />;
      case 'rain': return <CloudRain className={className} strokeWidth={1.5} />;
      default: return <Sun className={className} strokeWidth={1.5} />;
    }
  };

  // Find active cultivation details for the snapshot card
  const activeCultivation = myCultivations.find(c => c.id === selectedCultivationId) || myCultivations[0];
  const activeCropName = activeCultivation?.cropProfile?.name || "Crop";
  const activeCropImage = activeCultivation?.cropProfile?.imageUrl || activeCultivation?.cropProfile?.image || "/images/crops/default.jpg";
  const isPlantingPhase = activeCultivation?.status === "PLANTING_PENDING" || !activeCultivation?.stageSubmissions || activeCultivation.stageSubmissions.length === 0;
  const stageOneSubmission = activeCultivation?.stageSubmissions?.find((s: any) => s.stageId === 'stage_1' || s.stageOrder === 1);
  const isPendingReview = stageOneSubmission?.status === 'PENDING REVIEW';
  const isApproved = stageOneSubmission?.status === 'APPROVED';

  return (
    <RouteGuard allowedRoles={["FARMER"]}>
      <AppLayout>
        <div className="space-y-4 pb-8">

          {/* ===== TOP NAVIGATION TABS: DEDICATED WORKSPACES ===== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => handleTabChange('cultivation')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'cultivation'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Sprout className="w-4 h-4" />
                <span>My Cultivation Progress</span>
                {myCultivations.length > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'cultivation' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {myCultivations.length} Active
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Farm Overview</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('recommendations')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Leaf className="w-4 h-4" />
                <span>Crop Recommendations</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('weather')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'weather'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <CloudSun className="w-4 h-4" />
                <span>Weather &amp; Forecast</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('products')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>My Products</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  if (cropRecommendations && cropRecommendations.length > 0) {
                    openPlantThisCropAgreement(cropRecommendations[0]);
                  } else {
                    openPlantThisCropAgreement({
                      id: 'coconut',
                      name: 'Coconut',
                      growingPeriod: 'Perennial (Starts in 4-6 yrs)',
                      waterRequirement: 4,
                      expectedYield: '60 - 80 Nuts/Palm/Year',
                      zoneName: cropZone
                    });
                  }
                }}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Plant Crop</span>
              </button>

              <button
                onClick={() => setIsPlantAnyOpen(true)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Search Any Crop
              </button>
            </div>
          </div>

          {/* GLOBAL FEEDBACK NOTIFICATIONS */}
          {cultivationSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="font-bold">{cultivationSuccessMessage}</p>
              </div>
              <button 
                onClick={() => setCultivationSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {dashboardActionError && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between text-xs text-rose-900 shadow-sm">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <p className="font-bold">{dashboardActionError}</p>
              </div>
              <button 
                onClick={() => setDashboardActionError(null)}
                className="text-rose-700 hover:text-rose-900 text-xs font-bold px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: DEDICATED CULTIVATION PROGRESS & PHOTO EVIDENCE AREA */}
          {/* ============================================================== */}
          {activeTab === 'cultivation' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* DEDICATED AREA HEADER BANNER */}
              <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 text-white rounded-3xl p-6 lg:p-7 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 backdrop-blur-xs flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-300" />
                        Dedicated Cultivation Workspace
                      </span>
                      {myCultivations.length > 0 && (
                        <span className="text-[10px] font-bold bg-emerald-400 text-gray-900 px-2.5 py-0.5 rounded-full">
                          {myCultivations.length} Active {myCultivations.length === 1 ? 'Crop' : 'Crops'}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mb-1.5">
                      Cultivation Progress &amp; Evidence Center
                    </h1>
                    <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                      This dedicated area allows you to track your plant cultivation stages, upload photographic evidence within the required 72-hour planting policy window, and inspect future stage guidelines.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        if (cropRecommendations && cropRecommendations.length > 0) {
                          openPlantThisCropAgreement(cropRecommendations[0]);
                        } else {
                          openPlantThisCropAgreement({
                            id: 'coconut',
                            name: 'Coconut',
                            growingPeriod: 'Perennial (Starts in 4-6 yrs)',
                            waterRequirement: 4,
                            expectedYield: '60 - 80 Nuts/Palm/Year',
                            zoneName: cropZone
                          });
                        }
                      }}
                      className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-black rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-700" />
                      <span>Plant New Crop</span>
                    </button>
                    <button
                      onClick={() => setIsPlantAnyOpen(true)}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Browse All Crops
                    </button>
                  </div>
                </div>

                {/* Subtle decorative glow */}
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
              </div>

              {/* DEDICATED PROGRESS MODULE (Full view, zero distraction) */}
              <CropCultivationProgressModule
                cultivations={myCultivations}
                selectedCultivationId={selectedCultivationId}
                onSelectCultivation={(id) => setSelectedCultivationId(id)}
                onSubmitStageEvidence={submitStageFromDashboard}
                onSubmitWeeklyPhoto={submitWeeklyFromDashboard}
                onDeleteCultivation={handleDeleteCultivation}
                onOpenGuide={(cropName) => openCropGuide(cropName, true)}
                onStartNewCrop={() => {
                  if (cropRecommendations && cropRecommendations.length > 0) {
                    openPlantThisCropAgreement(cropRecommendations[0]);
                  } else {
                    openPlantThisCropAgreement({
                      id: 'coconut',
                      name: 'Coconut',
                      growingPeriod: 'Perennial (Starts in 4-6 yrs)',
                      waterRequirement: 4,
                      expectedYield: '60 - 80 Nuts/Palm/Year',
                      zoneName: cropZone
                    });
                  }
                }}
                onStartAnyCrop={() => setIsPlantAnyOpen(true)}
                loading={false}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: FARM OVERVIEW (Dashboard with Quick Cultivation Snapshot) */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* ACTIVE CULTIVATION QUICK SNAPSHOT BANNER ON OVERVIEW */}
              {myCultivations.length > 0 ? (
                <div className="bg-gradient-to-r from-emerald-50 via-white to-green-50 border-2 border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-emerald-200 shrink-0 shadow-xs relative">
                      <img 
                        src={activeCropImage} 
                        alt={activeCropName} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full hidden items-center justify-center bg-emerald-50 text-emerald-600">
                        <Sprout className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Active Cultivation
                        </span>
                        {isPendingReview ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-amber-700 animate-pulse" />
                            Evidence Pending Review
                          </span>
                        ) : isPlantingPhase ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-amber-700 animate-pulse" />
                            72h Planting Window Active
                          </span>
                        ) : isApproved ? (
                          <span className="text-[10px] font-bold bg-green-100 text-green-900 px-2 py-0.5 rounded-full border border-green-200 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-green-700" />
                            Stage 1 Approved &amp; Growing
                          </span>
                        ) : null}
                      </div>
                      <h4 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                        <span>{activeCropName}</span>
                        <span className="text-xs font-semibold text-gray-500">· {activeCultivation?.region || cropZone || "Farm Field"}</span>
                      </h4>
                      <p className="text-xs text-gray-600">
                        {isPendingReview 
                          ? "Planting photograph submitted. Administrator review in progress."
                          : isPlantingPhase 
                          ? "Policy accepted. Please upload your planting photograph within 72 hours."
                          : "Supervised growth active. Weekly photo monitoring enabled."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTabChange('cultivation')}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <span>Open Dedicated Area &amp; Upload Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/dashboard/farmer/cultivation/${activeCultivation.id}`}
                      className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl transition-colors"
                      title="Open full workspace"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">No crops under active cultivation</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Start supervised farming by choosing a recommended crop below and accepting the cultivation policy.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (cropRecommendations && cropRecommendations.length > 0) {
                        openPlantThisCropAgreement(cropRecommendations[0]);
                      } else {
                        openPlantThisCropAgreement({
                          id: 'coconut',
                          name: 'Coconut',
                          growingPeriod: 'Perennial (Starts in 4-6 yrs)',
                          waterRequirement: 4,
                          expectedYield: '60 - 80 Nuts/Palm/Year',
                          zoneName: cropZone
                        });
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    + Start Cultivating
                  </button>
                </div>
              )}

              {/* ===== ROW 1: Greeting | Location | Weather ===== */}
              <div className="grid grid-cols-12 gap-4">

                {/* GREETING CARD */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between" style={{minHeight: '230px'}}>
                  <div>
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-4">
                      <Sprout className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">
                      {greeting},<br />{userName}! 👋
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">Here&apos;s what&apos;s happening on your farm today.</p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-50 mt-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold mb-1">Total Crops</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-black text-gray-900">{myCultivations.length}</span>
                        <Sprout className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold mb-1">Active Listings</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-black text-gray-900">0</span>
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold mb-1">Orders</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-black text-gray-900">0</span>
                        <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold mb-1">Equipment</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-black text-gray-900">0</span>
                        <Tractor className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FARM LOCATION CARD */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col relative isolate" style={{minHeight: '230px'}}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-sm text-gray-900">Farm Location</div>
                    <button 
                      onClick={refresh}
                      className="text-[11px] font-bold text-gray-500 flex items-center hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Detect Location
                    </button>
                  </div>

                  {/* SEARCH BAR */}
                  <form onSubmit={handleSearch} className="mb-3 relative z-[1001]">
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search location manually..."
                        className="block w-full pl-8 pr-16 py-1.5 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="absolute inset-y-0 right-0 px-3 flex items-center bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded-r-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSearching ? '...' : 'Search'}
                      </button>
                    </div>
                    {searchError && <p className="text-[9px] text-red-500 mt-1 pl-1 font-medium">{searchError}</p>}
                  </form>
                  
                  {/* Map Area */}
                  <div className="flex-1 bg-[#eef0f3] rounded-xl relative overflow-hidden flex items-center justify-center mb-3" style={{minHeight: '130px'}}>
                    {loading && !coordinates ? (
                       <div className="text-xs text-gray-500 font-medium flex flex-col items-center">
                         <RefreshCw className="w-5 h-5 mb-2 animate-spin text-gray-400" />
                         Detecting your location...
                       </div>
                    ) : error && !coordinates ? (
                       <div className="text-xs text-red-500 font-medium px-4 text-center">
                         {error}
                       </div>
                    ) : coordinates ? (
                       <div className="w-full h-full relative">
                         <FarmMap 
                           latitude={coordinates.lat} 
                           longitude={coordinates.lng} 
                           locationName={weatherData?.location?.name || "Locating area..."}
                           onLocationSelect={setLocationManually}
                         />
                         <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-[1000]">
                           <div className="bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs text-[10px] font-bold text-gray-600 border border-gray-200">
                             Click map to change location
                           </div>
                         </div>
                       </div>
                    ) : (
                      <div className="text-xs text-gray-500 font-medium text-center px-4">
                         Location unavailable
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      {weatherData ? (
                        <>
                          <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-900">
                            <MapPin className="w-3.5 h-3.5 text-gray-700" />
                            <span className="truncate max-w-[200px]">{weatherData.location.details}</span>
                          </div>
                          <span className="text-[9px] text-gray-400 mt-0.5 ml-5">
                            Lat: {coordinates?.lat.toFixed(4)}, Lng: {coordinates?.lng.toFixed(4)}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{loading ? 'Locating...' : 'Location Unknown'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* TODAY'S WEATHER CARD */}
                <div id="weather" className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col" style={{minHeight: '230px'}}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-gray-900">Today&apos;s Weather</h3>
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Live API</span>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-xs text-gray-500 animate-pulse">
                      Fetching latest weather...
                    </div>
                  ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-xs text-red-500 text-center px-4">
                      {error}
                    </div>
                  ) : weatherData ? (
                    <>
                      <div className="flex items-center space-x-4 mb-5">
                        {renderWeatherIcon(weatherData.current.type)}
                        <div>
                          <div className="text-4xl font-black text-gray-900 tracking-tight">{weatherData.current.temperature}°C</div>
                          <div className="text-xs font-semibold text-gray-500 mt-0.5">{weatherData.current.condition}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1 mt-auto">
                        {[
                          { label: "Humidity", value: `${weatherData.current.humidity}%` },
                          { label: "Rain Prob", value: `${weatherData.current.rainProbability}%` },
                          { label: "Wind", value: `${weatherData.current.windSpeed} km/h` },
                          { label: "Feels Like", value: `${weatherData.current.feelsLike}°C` },
                        ].map((item) => (
                          <div key={item.label} className="flex flex-col items-center text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[9px] text-gray-400 font-semibold mb-1 leading-tight">{item.label}</span>
                            <span className="text-xs font-black text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* ===== ROW 2: Crop Recommendations Preview | 7-Day Forecast ===== */}
              <div className="grid grid-cols-12 gap-4">

                {/* CROP RECOMMENDATIONS (spans 8 cols) */}
                <div id="crop-recommendations" className="col-span-12 lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">Crop Recommendations</h3>
                      <p className="text-[11px] text-gray-500">AI-curated recommendations based on soil &amp; climate</p>
                    </div>
                    <button 
                      onClick={() => handleTabChange('recommendations')}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  {permissionState === 'denied' && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 flex items-start space-x-3 text-orange-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">
                        Location access is denied. Recommendations cannot use local weather and soil data. Please enable GPS for personalized AI recommendations.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    {cropRecommendations.length > 0 ? cropRecommendations.slice(0, 2).map((crop, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between border border-gray-100">
                        <div>
                          <div className="flex items-center mb-3 justify-between">
                            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white rounded-full border border-gray-200 shadow-xs">
                              <Coins className="w-3.5 h-3.5 text-gray-700" />
                              <span className="text-[10px] font-bold text-gray-800">{crop.badgeLabel}</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{crop.zoneName}</span>
                          </div>
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-xl font-black text-gray-900 mb-1">{crop.name}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold mb-0.5">{crop.metricLabel}</p>
                              <p className="text-xs font-bold text-gray-800 mb-3">{crop.metricValue}</p>
                              <div className="flex space-x-5">
                                <div>
                                  <p className="text-[9px] text-gray-400 font-semibold">Growing Period</p>
                                  <p className="text-[11px] font-bold text-gray-800">{crop.growingPeriod}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-400 font-semibold mb-0.5">Water Requirement</p>
                                  <div className="flex space-x-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Droplets key={i} className={`w-3 h-3 ${i < crop.waterRequirement ? 'text-gray-700 fill-gray-700' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-20 h-20 rounded-lg ml-2 flex items-center justify-center overflow-hidden bg-gray-200 relative shrink-0">
                              <img 
                                src={crop.image} 
                                alt={crop.name} 
                                className="w-full h-full object-cover z-10" 
                                onError={(e) => { 
                                  e.currentTarget.style.display = 'none'; 
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
                                }} 
                              />
                              <Sprout className="w-8 h-8 text-gray-400 absolute hidden z-0" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button 
                            onClick={() => openCropGuide(crop.name, true)}
                            className="py-2 px-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors text-center cursor-pointer"
                          >
                            View Guide
                          </button>
                          <button 
                            onClick={() => openPlantThisCropAgreement(crop)}
                            disabled={startingCropName === crop.name}
                            className="py-2 px-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-black transition-colors flex items-center justify-center space-x-1 shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            <Sprout className="w-3.5 h-3.5 mr-1" />
                            <span>Start Cultivation</span>
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 flex flex-col items-center justify-center text-gray-400 py-10">
                        <Sprout className="w-8 h-8 mb-2 opacity-50 animate-pulse" />
                        <p className="text-xs font-semibold">Loading recommendations...</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Want to plant another crop?</span>
                    <button
                      onClick={() => setIsPlantAnyOpen(true)}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Select From AGRI-NOVA Database →
                    </button>
                  </div>
                </div>

                {/* 7-DAY WEATHER FORECAST (spans 4 cols) */}
                <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-sm text-gray-900">7-Day Forecast</h3>
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Live API</span>
                  </div>
                  
                  <div className="flex-1 flex justify-between items-start">
                    {loading ? (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 animate-pulse">
                        Fetching forecast...
                      </div>
                    ) : error ? (
                       <div className="w-full h-full flex items-center justify-center text-xs text-red-500 text-center px-4">
                         {error}
                       </div>
                    ) : weatherData?.forecast ? (
                      weatherData.forecast.slice(0, 7).map((d) => (
                        <div key={d.day} className="flex flex-col items-center space-y-3">
                          <span className="text-[10px] font-bold text-gray-700">{d.day}</span>
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-black text-gray-900">{d.hi}°</span>
                            <span className="text-[10px] font-semibold text-gray-400">{d.lo}°</span>
                          </div>
                          {renderSmallIcon(d.type)}
                          <div className="flex items-center text-[9px] font-bold text-blue-500">
                            <Droplets className="w-2 h-2 mr-0.5" />
                            {d.pop}%
                          </div>
                        </div>
                      ))
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ===== ROW 3: Advisory | Insights | Quick Actions | Govt Schemes ===== */}
              <div className="grid grid-cols-12 gap-4">

                {/* 1. FARMING ADVISORY */}
                <div className="col-span-12 lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-gray-900">Farming Advisory</h3>
                  </div>

                  {loading ? (
                    <div className="bg-gray-50 rounded-xl p-3 flex-1 flex items-center justify-center">
                      <span className="text-xs text-gray-400 animate-pulse">Generating advisory...</span>
                    </div>
                  ) : weatherData?.advisory ? (
                    <>
                      <div className={`rounded-xl p-3 flex items-start space-x-2.5 mb-4 ${
                        weatherData.advisory.type === 'GOOD' ? 'bg-green-50' : 
                        weatherData.advisory.type === 'RAIN' ? 'bg-blue-50' :
                        weatherData.advisory.type === 'HOT' ? 'bg-orange-50' : 'bg-purple-50'
                      }`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          weatherData.advisory.type === 'GOOD' ? 'bg-green-100' : 
                          weatherData.advisory.type === 'RAIN' ? 'bg-blue-100' :
                          weatherData.advisory.type === 'HOT' ? 'bg-orange-100' : 'bg-purple-100'
                        }`}>
                          {weatherData.advisory.type === 'GOOD' && <Sprout className="w-3.5 h-3.5 text-green-700" />}
                          {weatherData.advisory.type === 'RAIN' && <CloudRain className="w-3.5 h-3.5 text-blue-700" />}
                          {weatherData.advisory.type === 'HOT' && <Sun className="w-3.5 h-3.5 text-orange-700" />}
                          {weatherData.advisory.type === 'HUMID' && <Droplets className="w-3.5 h-3.5 text-purple-700" />}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-900">
                            {weatherData.advisory.type === 'GOOD' ? 'Good Farming Conditions' : 
                             weatherData.advisory.type === 'RAIN' ? 'Rain Expected' :
                             weatherData.advisory.type === 'HOT' ? 'High Temperature' : 'High Humidity'}
                          </p>
                          <p className="text-[10px] text-gray-600 font-medium leading-snug mt-0.5">{weatherData.advisory.text}</p>
                        </div>
                      </div>

                      <div className="space-y-3 flex-1">
                        {[
                          { icon: <Droplets className="w-3.5 h-3.5 text-gray-600" />, title: "Irrigation", desc: weatherData.advisory.type === 'RAIN' ? "No irrigation needed today." : "Ensure adequate watering." },
                          { icon: <Bug className="w-3.5 h-3.5 text-gray-600" />, title: "Pest Control", desc: weatherData.advisory.type === 'RAIN' ? "Avoid spraying chemicals today." : "Suitable for pest monitoring." },
                          { icon: <Sprout className="w-3.5 h-3.5 text-gray-600" />, title: "Fertilizer", desc: "Apply organic manure if required." },
                        ].map((item) => (
                          <div key={item.title} className="flex items-center justify-between group cursor-pointer py-1">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                {item.icon}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-gray-900">{item.title}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 flex-1 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Advisory unavailable</span>
                    </div>
                  )}
                </div>

                {/* 2. FARM INSIGHTS */}
                <div className="col-span-12 lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-sm text-gray-900">Farm Insights</h3>
                    <button 
                      type="button"
                      onClick={() => handleTabChange('recommendations')}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                      title="View all crop recommendations and advisory insights"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-5 flex-1">
                    {[
                      { icon: <Droplets className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, title: "Soil Moisture", value: "Optimal" },
                      { icon: <CloudSun className="w-4 h-4 text-amber-500" strokeWidth={1.5} />, title: "Weather Suitability", value: "Good" },
                      { icon: <Bug className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, title: "Pest Risk", value: "Low" },
                      { icon: <ShieldAlert className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, title: "Disease Risk", value: "Low" },
                    ].map((item) => (
                      <div key={item.title} className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-900">{item.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. QUICK ACTIONS */}
                <div className="col-span-12 lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
                  <h3 className="font-bold text-sm text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="space-y-2 flex-1">
                    {[
                      { 
                        icon: <Sprout className="w-4 h-4 text-green-600" strokeWidth={1.5} />, 
                        label: "Plant Any Crop", 
                        onClick: () => setIsPlantAnyOpen(true) 
                      },
                      { 
                        icon: <Tractor className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, 
                        label: "Rent Equipment", 
                        href: "/equipment" 
                      },
                      { 
                        icon: <ShoppingBag className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, 
                        label: "Sell Products", 
                        href: "/marketplace" 
                      },
                      { 
                        icon: <Stethoscope className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, 
                        label: "Book Vet Appointment", 
                        href: "/veterinary" 
                      },
                    ].map((action) => {
                      const content = (
                        <>
                          <div className="flex items-center space-x-3">
                            {action.icon}
                            <span className="text-[12px] font-bold text-gray-800">{action.label}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </>
                      );

                      if (action.onClick) {
                        return (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group text-left cursor-pointer"
                          >
                            {content}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={action.label}
                          href={action.href!}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 4. GOVERNMENT SCHEMES */}
                <div className="col-span-12 lg:col-span-3 flex flex-col space-y-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-sm text-gray-900">Government Schemes</h3>
                      <Link href="/schemes" className="text-[10px] font-semibold text-gray-500 hover:underline">View All</Link>
                    </div>

                    <div className="flex space-x-3">
                      <img 
                        src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=200&q=80" 
                        alt="Scheme" 
                        className="w-20 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-gray-900 mb-0.5">PM Kisan Samman Nidhi</p>
                          <p className="text-[9px] text-gray-500 font-medium leading-snug">Financial assistance to farmers across India.</p>
                        </div>
                        <Link href="/schemes" className="text-[10px] font-bold text-gray-900 flex items-center hover:underline mt-1">
                          Apply Now <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ===== ROW 4: FOOTER MODULE PILLS ===== */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { icon: <ShoppingBag className="w-4 h-4 text-gray-700" strokeWidth={1.5} />, label: "Marketplace", desc: "Buy & Sell Products", href: "/marketplace" },
                  { icon: <Tractor className="w-4 h-4 text-gray-700" strokeWidth={1.5} />, label: "Equipment Rental", desc: "Rent Farming Equipments", href: "/equipment" },
                  { icon: <PawPrint className="w-4 h-4 text-gray-700" strokeWidth={1.5} />, label: "Livestock Care", desc: "Cattle, Poultry & More", href: "/veterinary" },
                  { icon: <Stethoscope className="w-4 h-4 text-gray-700" strokeWidth={1.5} />, label: "Vet Consultation", desc: "Book Appointments", href: "/veterinary" },
                  { icon: <ClipboardList className="w-4 h-4 text-gray-700" strokeWidth={1.5} />, label: "My Orders", desc: "Track Your Orders", href: "/dashboard/farmer" },
                  { icon: <Coins className="w-4 h-4 text-gray-700" strokeWidth={1.5} />, label: "Earnings", desc: "View Your Earnings", href: "/dashboard/farmer" },
                ].map((pill) => (
                  <Link
                    key={pill.label}
                    href={pill.href}
                    className="bg-white border border-gray-100 rounded-xl p-3 flex items-center space-x-2.5 hover:border-gray-200 hover:shadow-xs transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                      {pill.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">{pill.label}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{pill.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CROP RECOMMENDATIONS VIEW */}
          {/* ============================================================== */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Crop Recommendations &amp; Guidance</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Personalized AI recommendations based on your local coordinates, soil profile, and weather conditions.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsPlantAnyOpen(true)}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                  >
                    Search &amp; Plant Any Crop
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cropRecommendations.length > 0 ? cropRecommendations.map((crop, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                            {crop.badgeLabel}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            {crop.zoneName}
                          </span>
                        </div>

                        <div className="flex gap-4 items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900">{crop.name}</h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{crop.metricLabel}: <strong className="text-gray-800">{crop.metricValue}</strong></p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Growing Period: <strong className="text-gray-800">{crop.growingPeriod}</strong></p>
                          </div>
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                            <img src={crop.image} alt={crop.name} className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-1 text-[11px]">
                          <p><strong className="text-gray-700">Fertilizer:</strong> {crop.fertilizer}</p>
                          <p><strong className="text-gray-700">Pesticide:</strong> {crop.pesticide}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-200/60">
                        <button
                          onClick={() => openCropGuide(crop.name, true)}
                          className="py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-center"
                        >
                          View Guide
                        </button>
                        <button
                          onClick={() => openPlantThisCropAgreement(crop)}
                          className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Sprout className="w-3.5 h-3.5" />
                          <span>Start Plant</span>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                      <Sprout className="w-10 h-10 mx-auto mb-2 opacity-50 animate-pulse" />
                      <p className="text-xs font-bold">Loading recommendations...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: WEATHER & FORECAST VIEW */}
          {/* ============================================================== */}
          {activeTab === 'weather' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col" style={{minHeight: '400px'}}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Farm Location &amp; Satellite Map</h2>
                      <p className="text-xs text-gray-500">Click anywhere on the map to pin your field coordinates</p>
                    </div>
                    <button 
                      onClick={refresh}
                      className="text-xs font-bold text-emerald-700 flex items-center hover:underline cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Detect Live Location
                    </button>
                  </div>

                  <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative flex items-center">
                      <Search className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search district, village, or coordinates..."
                        className="w-full pl-9 pr-24 py-2 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                      <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="absolute right-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {isSearching ? '...' : 'Search'}
                      </button>
                    </div>
                  </form>

                  <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 relative min-h-[250px]">
                    {coordinates ? (
                      <FarmMap 
                        latitude={coordinates.lat} 
                        longitude={coordinates.lng} 
                        locationName={weatherData?.location?.name || "Farm Area"}
                        onLocationSelect={setLocationManually}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Loading map...</div>
                    )}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 mb-2">Live Weather Telemetry</h3>
                    {weatherData ? (
                      <div>
                        <div className="flex items-center space-x-4 my-4">
                          {renderWeatherIcon(weatherData.current.type, "w-16 h-16")}
                          <div>
                            <div className="text-5xl font-black text-gray-900">{weatherData.current.temperature}°C</div>
                            <div className="text-sm font-semibold text-gray-500 mt-1">{weatherData.current.condition}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {[
                            { label: "Humidity", value: `${weatherData.current.humidity}%` },
                            { label: "Rain Probability", value: `${weatherData.current.rainProbability}%` },
                            { label: "Wind Speed", value: `${weatherData.current.windSpeed} km/h` },
                            { label: "Feels Like", value: `${weatherData.current.feelsLike}°C` },
                          ].map(item => (
                            <div key={item.label} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <p className="text-[10px] text-gray-400 font-semibold">{item.label}</p>
                              <p className="text-sm font-black text-gray-900 mt-0.5">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Loading weather...</p>
                    )}
                  </div>

                  {weatherData?.forecast && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 mb-3">Next 5 Days Outlook</h4>
                      <div className="flex justify-between items-center">
                        {weatherData.forecast.slice(0, 5).map(d => (
                          <div key={d.day} className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-600">{d.day}</span>
                            {renderSmallIcon(d.type, "w-4 h-4 my-1.5")}
                            <span className="text-xs font-black text-gray-900">{d.hi}°</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: MY PRODUCTS (SELLER LISTINGS) */}
          {/* ============================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <MyListings />
            </div>
          )}

        </div>
      </AppLayout>

      <CropCultivationGuideModal 
        isOpen={isCropGuideOpen} 
        onClose={() => setIsCropGuideOpen(false)} 
        cropName={selectedCropName} 
        isRecommended={selectedCropIsRecommended} 
        zoneName={cropZone}
        onStartCultivation={(cropId, cropName, profileData) => {
          setIsCropGuideOpen(false);
          openPlantThisCropAgreement({
            id: cropId,
            name: cropName || selectedCropName,
            image: profileData?.imageUrl,
            growingPeriod: profileData?.growingPeriod,
            expectedYield: profileData?.expectedYield,
            waterRequirement: profileData?.waterRequirement,
            zoneName: cropZone
          });
        }}
      />
      
      <PlantAnyCropModal 
        isOpen={isPlantAnyOpen} 
        onClose={() => setIsPlantAnyOpen(false)} 
        onSelectCrop={(cropName) => openCropGuide(cropName, false)} 
        onPlantCrop={(crop) => {
          setIsPlantAnyOpen(false);
          openPlantThisCropAgreement(crop);
        }}
      />

      {plantCropModalData ? (
        <PlantThisCropModal
          isOpen={isPlantThisCropModalOpen}
          onClose={() => setIsPlantThisCropModalOpen(false)}
          cropName={plantCropModalData.cropName}
          cropProfileId={plantCropModalData.cropProfileId}
          cropImage={plantCropModalData.cropImage}
          growingPeriod={plantCropModalData.growingPeriod}
          waterRequirement={plantCropModalData.waterRequirement}
          expectedYield={plantCropModalData.expectedYield}
          zoneName={plantCropModalData.zoneName}
          onConfirmAgreement={async (cropProfileId, cropName, initialPhotoUrl, initialNotes) => {
            await handleStartCultivation(cropProfileId, cropName, initialPhotoUrl, initialNotes);
          }}
        />
      ) : null}
    </RouteGuard>
  );
}

export default function FarmerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-700">Loading Farmer Dashboard...</p>
        </div>
      </div>
    }>
      <FarmerDashboardContent />
    </Suspense>
  );
}
