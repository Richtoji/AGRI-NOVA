"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { useLocationWeather } from "@/lib/hooks/useLocationWeather";
import { 
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
  Search
} from "lucide-react";

// Dynamically import the map to avoid SSR issues with Leaflet
const FarmMap = dynamic(() => import('@/components/dashboard/weather/FarmMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400 font-medium">Loading Map...</div>
});

export default function FarmerDashboard() {
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
        setSearchQuery(""); // Clear on success
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

  return (
    <RouteGuard allowedRoles={["FARMER"]}>
      <AppLayout>
        <div className="space-y-4 pb-6">

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
                <p className="text-xs text-gray-500 font-medium">Here's what's happening on your farm today.</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-50 mt-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold mb-1">Total Crops</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-black text-gray-900">0</span>
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
                  <p className="text-[10px] text-gray-400 font-semibold mb-1">Equipment Bookings</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-black text-gray-900">0</span>
                    <Tractor className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* FARM LOCATION CARD */}
            <div className="col-span-12 lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col" style={{minHeight: '230px'}}>
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold text-sm text-gray-900">Farm Location</div>
                <button 
                  onClick={refresh}
                  className="text-[11px] font-bold text-gray-500 flex items-center hover:text-gray-900 transition-colors"
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
                    className="absolute inset-y-0 right-0 px-3 flex items-center bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded-r-lg transition-colors disabled:opacity-50"
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
                       <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-[10px] font-bold text-gray-600 border border-gray-200">
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
                <h3 className="font-bold text-sm text-gray-900">Today's Weather</h3>
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

          {/* ===== ROW 2: Crop Recommendations | 7-Day Forecast ===== */}
          <div className="grid grid-cols-12 gap-4">

            {/* CROP RECOMMENDATIONS (spans 8 cols) */}
            <div id="crop-recommendations" className="col-span-12 lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-gray-900">Crop Recommendations</h3>
                <button className="text-[11px] font-semibold text-gray-500 hover:text-gray-900">View All</button>
              </div>

              {permissionState === 'denied' && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 flex items-start space-x-3 text-orange-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">
                    Location access is denied. Recommendations cannot use local weather and soil data. Please enable GPS for personalized AI recommendations.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 flex-1">
                {cropRecommendations.length > 0 ? cropRecommendations.map((crop, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-3 justify-between">
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {crop.badgeLabel === "Maximum Profit" ? (
                              <Coins className="w-3.5 h-3.5 text-gray-700" />
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-gray-700" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
                            )}
                          </div>
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
                          <div className="mt-2 space-y-1">
                            <p className="text-[9px] text-gray-500"><strong className="text-gray-700">Fertilizer:</strong> {crop.fertilizer}</p>
                            <p className="text-[9px] text-gray-500"><strong className="text-gray-700">Pesticide:</strong> {crop.pesticide}</p>
                          </div>
                        </div>
                        <div className="w-20 h-20 rounded-lg ml-2 flex items-center justify-center overflow-hidden bg-gray-200 relative">
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
                    <button className="w-full mt-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                )) : cropRecsError ? (
                  <div className="col-span-2 flex flex-col items-center justify-center text-red-400 py-10">
                    <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-xs font-semibold">{cropRecsError}</p>
                  </div>
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center text-gray-400 py-10">
                    <Sprout className="w-10 h-10 mb-2 opacity-50 animate-pulse" />
                    <p className="text-xs font-semibold">Loading recommendations...</p>
                  </div>
                )}
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



          {/* ===== ROW 4: Advisory | Insights | Quick Actions | Govt Schemes ===== */}
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
                <button className="text-[10px] font-semibold text-gray-500">View All</button>
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
                  { icon: <PlusCircle className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, label: "Add New Crop", href: "/dashboard/farmer" },
                  { icon: <Tractor className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, label: "Rent Equipment", href: "/equipment" },
                  { icon: <ShoppingBag className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, label: "Sell Products", href: "/marketplace" },
                  { icon: <Stethoscope className="w-4 h-4 text-gray-600" strokeWidth={1.5} />, label: "Book Vet Appointment", href: "/veterinary" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      {action.icon}
                      <span className="text-[12px] font-bold text-gray-800">{action.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* 4. GOVERNMENT SCHEMES + ANNOUNCEMENTS */}
            <div className="col-span-12 lg:col-span-3 flex flex-col space-y-4">

              {/* Govt Schemes */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-gray-900">Government Schemes</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold text-gray-500">View All</span>
                    <div className="flex space-x-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
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

              {/* Weather Alerts / Announcements */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 relative overflow-hidden">
                {weatherData?.warning && (
                  <div className={`absolute inset-0 opacity-10 pointer-events-none ${weatherData.warning.level === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                )}
                
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <h3 className="font-bold text-sm text-gray-900">Weather Alerts</h3>
                  <span className="text-[10px] font-semibold text-gray-500 cursor-pointer hover:underline">View All</span>
                </div>

                <div className="flex space-x-3 relative z-10">
                  {weatherData?.warning ? (
                    <>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${weatherData.warning.level === 'CRITICAL' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-orange-100 text-orange-600 border border-orange-200'}`}>
                        {weatherData.warning.level === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" strokeWidth={1.5} /> : <CloudRain className="w-4 h-4" strokeWidth={1.5} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-[11px] font-bold ${weatherData.warning.level === 'CRITICAL' ? 'text-red-700' : 'text-orange-700'}`}>
                            {weatherData.warning.title}
                          </p>
                          <div className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${weatherData.warning.level === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'}`}></div>
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium leading-snug">{weatherData.warning.message}</p>
                        <p className="text-[9px] text-gray-400 font-semibold mt-1.5">Live Data</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                        <Sun className="w-4 h-4 text-green-600" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[11px] font-bold text-gray-900">No Alerts</p>
                          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-snug">Weather conditions are clear. No immediate weather alerts for your farm location.</p>
                        <p className="text-[9px] text-gray-400 font-semibold mt-1.5">Live Data</p>
                      </div>
                    </>
                  )}
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
                className="bg-white border border-gray-100 rounded-xl p-3 flex items-center space-x-2.5 hover:border-gray-200 hover:shadow-sm transition-all group"
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
      </AppLayout>
    </RouteGuard>
  );
}
