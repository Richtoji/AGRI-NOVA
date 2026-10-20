"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Bell, 
  MessageSquare, 
  ChevronDown, 
  Menu, 
  ShoppingBag, 
  Compass, 
  X, 
  Check, 
  RefreshCw,
  Sun,
  CloudRain,
  Cloud,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Settings,
  LogOut,
  Maximize2,
  Sprout,
  Shield,
  Award,
  Sparkles,
  MessageCircle,
  CheckCheck,
  Clock,
  Home,
  Tractor,
  PawPrint,
  FileText,
  Store,
  Truck,
  AlertTriangle,
  ArrowRight,
  Leaf,
  Trash2,
  RotateCcw
} from "lucide-react";
import { useAuthRole, RoleType } from "@/lib/context/AuthRoleContext";
import { useLocationWeather } from "@/lib/hooks/useLocationWeather";

const ROLE_DEFAULT_USERS: Record<string, {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  kycStatus: string;
  id: string;
}> = {
  FARMER: {
    id: "u-farmer-01",
    name: "Rajesh Kumar",
    email: "farmer@agri-nova.com",
    phone: "+91 98765 43210",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    kycStatus: "VERIFIED"
  },
  BUYER: {
    id: "u-buyer-01",
    name: "FreshBasket Supermarkets",
    email: "buyer@agri-nova.com",
    phone: "+91 98123 45678",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    kycStatus: "VERIFIED"
  },
  EQUIPMENT_OWNER: {
    id: "u-equipment-01",
    name: "Kisan Agro Rentals",
    email: "equipment@agri-nova.com",
    phone: "+91 97111 22334",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    kycStatus: "VERIFIED"
  },
  VETERINARY_EXPERT: {
    id: "u-vet-01",
    name: "Dr. Ananya Sharma, DVM",
    email: "vet@agri-nova.com",
    phone: "+91 99887 76655",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
    kycStatus: "VERIFIED"
  },
  DELIVERY_PARTNER: {
    id: "u-delivery-01",
    name: "AgriExpress Logistics",
    email: "delivery@agri-nova.com",
    phone: "+91 98989 89898",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    kycStatus: "VERIFIED"
  },
  ADMIN: {
    id: "u-admin-01",
    name: "Enterprise Admin",
    email: "admin@agri-nova.com",
    phone: "+91 90000 00001",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    kycStatus: "VERIFIED"
  },
  SUPER_ADMIN: {
    id: "u-admin-01",
    name: "Enterprise Super Admin",
    email: "superadmin@agri-nova.com",
    phone: "+91 90000 00001",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    kycStatus: "VERIFIED"
  }
};

const POPULAR_HUBS = [
  { name: "Kottayam", state: "Kerala", lat: 9.5916, lng: 76.5222 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Palakkad", state: "Kerala", lat: 10.7867, lng: 76.6548 },
  { name: "Wayanad", state: "Kerala", lat: 11.6854, lng: 76.1320 },
  { name: "Idukki", state: "Kerala", lat: 9.8494, lng: 76.9806 },
  { name: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144 },
  { name: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
];

export interface TopbarNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  link: string;
  type: "cultivation" | "weather" | "equipment" | "consultation";
}

const DEFAULT_NOTIFICATIONS: TopbarNotification[] = [
  {
    id: "n-1",
    title: "Stage 1 Photo Verification Approved",
    message: "Admin approved your Basmati Rice germination photo. Stage 2 is unlocked!",
    time: "10 mins ago",
    unread: true,
    link: "/dashboard/farmer?tab=cultivation",
    type: "cultivation"
  },
  {
    id: "n-2",
    title: "Heavy Rainfall Alert for Kerala",
    message: "Monsoon showers expected in next 24-48 hours. Ensure field drainage channels are clear.",
    time: "1 hour ago",
    unread: true,
    link: "/dashboard/farmer?tab=weather",
    type: "weather"
  },
  {
    id: "n-3",
    title: "Equipment Rental Confirmed",
    message: "John Deere 5050 D booked for tomorrow 8:00 AM. Driver assigned.",
    time: "3 hours ago",
    unread: false,
    link: "/equipment",
    type: "equipment"
  },
  {
    id: "n-4",
    title: "Veterinary Consultation Scheduled",
    message: "Dr. Ananya Sharma confirmed tele-consultation appointment for cattle health check.",
    time: "Yesterday",
    unread: false,
    link: "/veterinary",
    type: "consultation"
  }
];

export interface TopbarMessage {
  id: string;
  sender: string;
  avatar: string;
  role: string;
  snippet: string;
  time: string;
  unread: boolean;
  link: string;
}

const DEFAULT_MESSAGES: TopbarMessage[] = [
  {
    id: "m-1",
    sender: "Dr. Ananya Sharma, DVM",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
    role: "Veterinary Expert",
    snippet: "I've reviewed the symptoms. Please administer the electrolyte solution twice daily.",
    time: "15m ago",
    unread: true,
    link: "/dashboard/veterinary"
  },
  {
    id: "m-2",
    sender: "FreshBasket Supermarkets",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: "Bulk Buyer Hub",
    snippet: "We want to purchase 12 Quintals of Uma Paddy. Let's confirm price and transit date.",
    time: "2h ago",
    unread: true,
    link: "/dashboard/buyer"
  },
  {
    id: "m-3",
    sender: "Kisan Agro Fleet Hub",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    role: "Machinery Fleet",
    snippet: "Your tractor operator is arriving at your farm coordinates with fuel filled.",
    time: "1d ago",
    unread: false,
    link: "/equipment"
  }
];

const SEARCH_SUGGESTIONS = [
  { title: "Basmati Rice Cultivation Tracker", category: "Cultivation", href: "/dashboard/farmer?tab=cultivation" },
  { title: "NPK & Soil Fertilizer Calculator", category: "Advisory", href: "/dashboard/farmer?tab=recommendations" },
  { title: "Marketplace: Buy & Sell Crops", category: "Marketplace", href: "/marketplace" },
  { title: "Tractor & Harvester Fleet Rental", category: "Machinery", href: "/equipment" },
  { title: "Veterinary Doctor Tele-Consultation", category: "Animal Health", href: "/veterinary" },
  { title: "PM-KISAN & State Government Subsidies", category: "Govt Schemes", href: "/schemes" },
  { title: "Cold-Chain Logistics & Delivery Fleet", category: "Logistics", href: "/dashboard/delivery" },
  { title: "Live Radar & Hourly Weather Forecast", category: "Weather", href: "/dashboard/farmer?tab=weather" }
];

export const Topbar: React.FC = () => {
  const router = useRouter();
  const { currentUser, currentRole, toggleCart, cartItems, logout } = useAuthRole();
  const {
    coordinates,
    detectedCoordinates,
    detectedLocationName,
    weatherData,
    loading,
    isDetecting,
    isOtherLocation,
    refresh,
    resetToDetected,
    setLocationManually
  } = useLocationWeather();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Profile Popover & Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications state & ref
  const [notifications, setNotifications] = useState<TopbarNotification[]>(DEFAULT_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Messages state & ref
  const [messages, setMessages] = useState<TopbarMessage[]>(DEFAULT_MESSAGES);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Mobile menu & search popover
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(target)) {
        setIsMessagesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsProfileModalOpen(false);
        setIsNotificationsOpen(false);
        setIsMessagesOpen(false);
        setIsSearchFocused(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCopy = (text: string, field: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const defaultAvatar = currentUser?.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=f3f4f6&color=111827` 
    : "https://ui-avatars.com/api/?name=User&background=f3f4f6&color=111827";

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationSearch.trim()) return;

    setIsSearchingLocation(true);
    try {
      const res = await fetch(`/api/location?search=${encodeURIComponent(locationSearch.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("Location search failed", err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const selectLocation = (lat: number, lng: number, name: string) => {
    setLocationManually(lat, lng, name);
    setIsLocationModalOpen(false);
    setLocationSearch("");
    setSearchResults([]);
  };

  const handleAutoDetect = () => {
    refresh();
    setIsLocationModalOpen(false);
  };

  const pathname = usePathname();

  const getEffectiveRole = (): RoleType => {
    if (pathname?.startsWith("/dashboard/buyer")) return "BUYER";
    if (pathname?.startsWith("/dashboard/equipment")) return "EQUIPMENT_OWNER";
    if (pathname?.startsWith("/dashboard/veterinary")) return "VETERINARY_EXPERT";
    if (pathname?.startsWith("/dashboard/delivery")) return "DELIVERY_PARTNER";
    if (pathname?.startsWith("/dashboard/admin")) return "ADMIN";
    if (pathname?.startsWith("/dashboard/farmer")) return "FARMER";
    return currentRole || "FARMER";
  };

  const effectiveRole = getEffectiveRole();
  const fallbackUser = ROLE_DEFAULT_USERS[effectiveRole] || ROLE_DEFAULT_USERS.FARMER;
  
  // If currentUser is set for this role, use it; otherwise use role's default user
  const isMatchingRole = currentUser && (currentUser.role === effectiveRole || (!pathname?.includes('/dashboard/') && currentUser.role === currentRole));
  const activeUser = isMatchingRole ? currentUser : fallbackUser;

  const displayUserName = activeUser?.name || "User";
  const displayEmail = activeUser?.email || "";
  const displayPhone = activeUser?.phone || "";
  const displayAvatar = activeUser?.avatarUrl || defaultAvatar;
  const displayLocation = weatherData?.location?.name || (isDetecting ? "Detecting GPS..." : "Farm Location");
  const displayTemp = weatherData?.current?.temperature;
  const displayKyc = activeUser?.kycStatus || "VERIFIED";
  const displayId = activeUser?.id || "";

  const roleLabel = effectiveRole
    ? effectiveRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "User";

  const getRoleMetadata = (role: RoleType) => {
    switch (role) {
      case "FARMER":
        return {
          title: "Agricultural Landholding",
          value: "5.2 Acres (Registered)",
          sub: "Organic Paddy & Horticulture",
          crops: "Paddy (Uma, Jyothi), Spices, Rubber",
          soil: "Laterite Soil (pH 6.1)",
          irrigation: "Borewell & Drip Irrigation",
          kycDetail: "Govt. Krishi Bhavan & Aadhaar Verified"
        };
      case "BUYER":
        return {
          title: "Procurement Organization",
          value: "FreshBasket Supermarkets",
          sub: "Wholesale & Direct Farm Sourcing",
          crops: "Organic Grains, Fruits & Vegetables",
          soil: "Procurement Hub: Central Kerala",
          irrigation: "Cold-Chain Logistics Certified",
          kycDetail: "GSTIN & Corporate Registry Verified"
        };
      case "EQUIPMENT_OWNER":
        return {
          title: "Machinery Fleet",
          value: "6 Farm Machines Registered",
          sub: "Kisan Agro Rentals Hub",
          crops: "Tractors, Harvesters, Power Tillers",
          soil: "Coverage: Kottayam, Kochi & Wayanad",
          irrigation: "Commercial Equipment Insured",
          kycDetail: "Commercial Fleet & RTO Verified"
        };
      case "VETERINARY_EXPERT":
        return {
          title: "Veterinary Accreditation",
          value: "VCI / KVC-2018-9481",
          sub: "Dr. Ananya Sharma, DVM",
          crops: "Bovine, Dairy Cattle, Caprine, Poultry",
          soil: "Clinical Center: Kottayam Agro Vet",
          irrigation: "Emergency Tele-Consultation Active",
          kycDetail: "Veterinary Council of India Verified"
        };
      case "DELIVERY_PARTNER":
        return {
          title: "Agro-Logistics Fleet",
          value: "Cold-Chain Cargo Van",
          sub: "Priority Fresh Produce Transit",
          crops: "Perishables, Grains & Seeds Logistics",
          soil: "Transit Hub: Central Zone",
          irrigation: "Active Commercial Transit Permit",
          kycDetail: "Commercial Driver & Vehicle Verified"
        };
      case "ADMIN":
        return {
          title: "System Administration",
          value: "Super Admin Privileges",
          sub: "AGRI-NOVA Core Operations",
          crops: "Full Platform Infrastructure",
          soil: "Master Control Console",
          irrigation: "Security Clearance: Level 5",
          kycDetail: "Antigravity Security Verified"
        };
      default:
        return {
          title: "Agricultural Profile",
          value: "Standard Farm Account",
          sub: "Active Farmer Member",
          crops: "Sustainable Crops",
          soil: "Regional Soil",
          irrigation: "Local Water Source",
          kycDetail: "KYC Verified"
        };
    }
  };

  const roleMeta = getRoleMetadata(effectiveRole);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
        
        {/* Mobile menu toggle */}
        <button 
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden mr-3 text-gray-500 hover:text-gray-900 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Open mobile navigation"
          title="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar with Live Suggestions */}
        <div className="flex-1 max-w-sm relative" ref={searchRef}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              setIsSearchFocused(false);
              const match = SEARCH_SUGGESTIONS.find(s => 
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                s.category.toLowerCase().includes(searchQuery.toLowerCase())
              );
              if (match) {
                router.push(match.href);
              } else {
                router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search crops, equipment, services..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-full py-2 pl-9 pr-8 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Search Live Suggestions Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-scaleUp">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex justify-between items-center">
                <span>Quick Navigation</span>
                <span className="text-[9px] text-gray-400">Esc to close</span>
              </div>
              <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                {SEARCH_SUGGESTIONS
                  .filter(item => !searchQuery.trim() || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 transition-colors group text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                          {item.category}
                        </span>
                        <span className="font-semibold truncate">{item.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side navigation & tools */}
        <div className="flex items-center space-x-3.5 ml-4">
          
          {/* Dynamic Interactive Location Pill */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100/80 rounded-full border border-gray-200 transition-all cursor-pointer group shadow-2xs"
            title="Click to detect or change your location"
          >
            <MapPin className={`w-3.5 h-3.5 ${isDetecting ? "text-emerald-500 animate-spin" : isOtherLocation ? "text-blue-600" : "text-emerald-600"} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-semibold text-gray-800 max-w-[140px] truncate">
              {isDetecting ? "Detecting GPS..." : displayLocation}
            </span>
            {isOtherLocation && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded-sm">
                Selected
              </span>
            )}
            {displayTemp !== undefined && !isDetecting && (
              <span className="text-[11px] font-bold text-gray-500 border-l border-gray-200 pl-1.5 ml-0.5">
                {displayTemp}°C
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 ml-0.5" />
          </button>

          {/* Notification Bell with interactive dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsMessagesOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
              )}
            </button>

            {/* Notification Dropdown Card */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scaleUp">
                <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-emerald-300" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Alerts &amp; Updates</h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
                      {notifications.filter(n => n.unread).length} new
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-emerald-200 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors font-medium cursor-pointer"
                      title="Mark all as read"
                    >
                      Mark Read
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifications([])}
                      className="text-emerald-200 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors font-medium cursor-pointer"
                      title="Clear all notifications"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs">
                      <CheckCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
                      <p className="font-semibold text-gray-600">All caught up!</p>
                      <p className="text-[11px] mt-0.5">No new alerts right now.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
                          setIsNotificationsOpen(false);
                          router.push(item.link);
                        }}
                        className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex items-start space-x-3 text-left ${item.unread ? "bg-emerald-50/30" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          item.type === "cultivation" ? "bg-emerald-100 text-emerald-700" :
                          item.type === "weather" ? "bg-blue-100 text-blue-700" :
                          item.type === "equipment" ? "bg-amber-100 text-amber-700" :
                          "bg-purple-100 text-purple-700"
                        }`}>
                          {item.type === "cultivation" && <Sprout className="w-4 h-4" />}
                          {item.type === "weather" && <CloudRain className="w-4 h-4" />}
                          {item.type === "equipment" && <Tractor className="w-4 h-4" />}
                          {item.type === "consultation" && <PawPrint className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs truncate ${item.unread ? "font-black text-gray-900" : "font-semibold text-gray-700"}`}>
                              {item.title}
                            </h4>
                            {item.unread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-1.5"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                  <Link
                    href="/dashboard/farmer?tab=cultivation"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center space-x-1"
                  >
                    <span>View Farm Cultivation Timeline</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Messages with interactive dropdown */}
          <div className="relative" ref={messagesRef}>
            <button 
              type="button"
              onClick={() => {
                setIsMessagesOpen(!isMessagesOpen);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer relative"
              title="Consultations & Messages"
              aria-label="View messages"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              {messages.some(m => m.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white"></span>
              )}
            </button>

            {/* Messages Dropdown Card */}
            {isMessagesOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scaleUp">
                <div className="p-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Consultations</h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 rounded-full">
                      {messages.filter(m => m.unread).length} new
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMessages(prev => prev.map(m => ({ ...m, unread: false })))}
                    className="text-gray-300 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-[11px] font-medium cursor-pointer"
                    title="Mark all as read"
                  >
                    Mark Read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setMessages(prev => prev.map(m => m.id === item.id ? { ...m, unread: false } : m));
                        setIsMessagesOpen(false);
                        router.push(item.link);
                      }}
                      className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex items-start space-x-3 text-left ${item.unread ? "bg-emerald-50/20" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={item.avatar}
                          alt={item.sender}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                        {item.unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {item.sender}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">{item.time}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">{item.role}</div>
                        <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.snippet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href="/veterinary"
                    onClick={() => setIsMessagesOpen(false)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <PawPrint className="w-3.5 h-3.5 mr-1" />
                    <span>Book Vet Care</span>
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsMessagesOpen(false)}
                    className="text-[11px] font-bold text-gray-600 hover:text-gray-900"
                  >
                    <span>Support Directory</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <button 
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartItems.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white border-2 border-white">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/80"></div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              id="topbar-user-profile-button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 p-1 -mr-1 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer group border border-transparent hover:border-gray-200"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              title="Click to view profile details"
            >
              <div className="relative">
                <img
                  src={displayAvatar}
                  alt={displayUserName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                  Hi, {displayUserName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {roleLabel}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 hidden sm:block ${isProfileOpen ? "rotate-180 text-emerald-600" : ""}`} />
            </button>

            {/* Profile Dropdown Details Card */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-84 sm:w-92 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scaleUp">
                
                {/* Header Profile Banner */}
                <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-4 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-start justify-between relative z-10 mb-3">
                    <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-400/30 text-[10px] font-bold text-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Active Session</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Expand to Full Profile Modal"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-center space-x-3 relative z-10">
                    <img
                      src={displayAvatar}
                      alt={displayUserName}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-white truncate leading-tight">
                        {displayUserName}
                      </h4>
                      <p className="text-[11px] text-emerald-100/90 truncate font-medium mt-0.5">
                        {displayEmail}
                      </p>
                      
                      <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">
                          {roleLabel}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-400/25 text-emerald-200 px-2 py-0.5 rounded-md flex items-center space-x-1 border border-emerald-300/30">
                          <ShieldCheck className="w-3 h-3 text-emerald-300" />
                          <span>KYC {displayKyc}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details List */}
                <div className="p-3 bg-gray-50/70 border-b border-gray-100 space-y-2 text-xs">
                  
                  {/* Phone Item */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</div>
                        <div className="font-semibold text-gray-800 text-[11px] truncate">{displayPhone}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleCopy(displayPhone, "phone", e)}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                      title="Copy phone"
                    >
                      {copiedField === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>

                  {/* Email Item */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</div>
                        <div className="font-semibold text-gray-800 text-[11px] truncate">{displayEmail}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleCopy(displayEmail, "email", e)}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                      title="Copy email"
                    >
                      {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>

                  {/* Location Item */}
                  <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Agri Hub</div>
                      <div className="font-semibold text-gray-800 text-[11px] truncate">{displayLocation}</div>
                    </div>
                  </div>

                  {/* Role Specific Farm / Holding Detail */}
                  <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sprout className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{roleMeta.title}</div>
                      <div className="font-semibold text-gray-800 text-[11px] truncate">{roleMeta.value}</div>
                    </div>
                  </div>

                </div>

                {/* Card Actions */}
                <div className="p-3 bg-white space-y-1 text-xs">
                  
                  {/* View Full Profile Details Button */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors font-semibold group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <User className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>View Full Profile Details</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-700" />
                  </button>

                  {/* Manage Settings & Preferences Link */}
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-semibold group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Settings className="w-4 h-4 text-gray-500 group-hover:rotate-45 transition-transform" />
                      <span>Profile Settings &amp; Security</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Edit</span>
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-semibold cursor-pointer border-t border-gray-100 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>

                </div>

              </div>
            )}
          </div>
          
        </div>
      </header>

      {/* ================= LOCATION SELECTOR MODAL ================= */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Select Agricultural Location</h3>
                  <p className="text-[11px] text-gray-500">Weather, crop recommendations &amp; logistics optimize based on this.</p>
                </div>
              </div>

              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Reset to Detected Farm GPS if an other location is selected */}
              {isOtherLocation && (
                <button
                  type="button"
                  onClick={() => {
                    resetToDetected();
                    setIsLocationModalOpen(false);
                  }}
                  className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl font-bold flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-emerald-700" />
                    <span>Reset to Detected Farm GPS</span>
                  </div>
                  {detectedLocationName && (
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold truncate max-w-[140px]">
                      {detectedLocationName}
                    </span>
                  )}
                </button>
              )}

              {/* GPS Auto-Detect Button */}
              <button
                onClick={handleAutoDetect}
                className="w-full p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Compass className={`w-4 h-4 ${isDetecting || loading ? "animate-spin" : ""}`} />
                  <span>{isDetecting ? "Acquiring Farm GPS..." : "Detect Live Farm GPS Location"}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  High-Precision
                </span>
              </button>

              {/* Search Bar */}
              <form onSubmit={handleLocationSearch} className="space-y-2">
                <label className="text-[11px] font-bold text-gray-700">Or search any town or district:</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Palakkad, Wayanad, Pune..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:bg-white focus:border-gray-900 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingLocation}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingLocation ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-1">Search Results:</span>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(result.latitude, result.longitude, result.name)}
                      className="w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-2xs transition-all flex items-center justify-between text-xs font-semibold text-gray-800 cursor-pointer"
                    >
                      <span className="truncate pr-2">{result.details}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Agricultural Hubs */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Popular Agricultural Centers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_HUBS.map((hub) => (
                    <button
                      key={hub.name}
                      onClick={() => selectLocation(hub.lat, hub.lng, `${hub.name}, ${hub.state}`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1 ${
                        weatherData?.location?.name?.includes(hub.name)
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300"
                      }`}
                    >
                      <span>{hub.name}</span>
                      <span className="text-[10px] text-gray-400">({hub.state})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Current Selected Location Indicator */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-gray-900 truncate max-w-[240px]">
                  {weatherData?.location?.details || displayLocation}
                </span>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= FULL PROFILE DETAILS MODAL ================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 animate-scaleUp max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Agricultural Profile &amp; Identity Record</h3>
                  <p className="text-[11px] text-gray-500">Official verified credentials, operational details &amp; credentials on AGRI-NOVA</p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs">
              
              {/* Hero Banner Card */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-5 relative overflow-hidden shadow-sm">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={displayAvatar}
                        alt={displayUserName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-black text-white">{displayUserName}</h2>
                        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                          {roleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100/90 font-medium mt-0.5">
                        {displayEmail}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          <span>KYC {displayKyc}</span>
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-950/40 text-emerald-200 px-2 py-0.5 rounded-md">
                          Account ID: {displayId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    <div className="text-[10px] text-emerald-200/80 font-bold uppercase tracking-wider">Primary Location</div>
                    <div className="text-xs font-bold text-white mt-0.5 flex items-center sm:justify-end space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span>{displayLocation}</span>
                    </div>
                    {displayTemp !== undefined && (
                      <div className="text-[11px] text-emerald-200 font-semibold mt-0.5">
                        Current Hub Weather: {displayTemp}°C
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Section: Personal & Contact */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Personal &amp; Contact Records</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Legal Full Name</div>
                      <div className="font-bold text-gray-800 text-xs mt-0.5">{displayUserName}</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">Verified</span>
                  </div>

                  {/* Role */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Assigned Platform Role</div>
                      <div className="font-bold text-gray-800 text-xs mt-0.5">{roleLabel}</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">Active</span>
                  </div>

                  {/* Phone */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Verified Phone Number</div>
                      <div className="font-bold text-gray-800 text-xs mt-0.5">{displayPhone}</div>
                    </div>
                    <button
                      onClick={(e) => handleCopy(displayPhone, "modal-phone", e)}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedField === "modal-phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>

                  {/* Email */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Primary Email Address</div>
                      <div className="font-bold text-gray-800 text-xs mt-0.5 truncate">{displayEmail}</div>
                    </div>
                    <button
                      onClick={(e) => handleCopy(displayEmail, "modal-email", e)}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                      title="Copy email"
                    >
                      {copiedField === "modal-email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Section: Agricultural Assets & Operations */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Agricultural Credentials &amp; Operations</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Holding Size */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{roleMeta.title}</div>
                    <div className="font-bold text-gray-800 text-xs mt-0.5">{roleMeta.value}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{roleMeta.sub}</div>
                  </div>

                  {/* Crop Specialization */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Focus &amp; Specialization</div>
                    <div className="font-bold text-gray-800 text-xs mt-0.5">{roleMeta.crops}</div>
                  </div>

                  {/* Soil Profile */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Soil &amp; Agro-Climatic Zone</div>
                    <div className="font-bold text-gray-800 text-xs mt-0.5">{roleMeta.soil}</div>
                  </div>

                  {/* Water / Irrigation */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Infrastructure &amp; Systems</div>
                    <div className="font-bold text-gray-800 text-xs mt-0.5">{roleMeta.irrigation}</div>
                  </div>
                </div>
              </div>

              {/* Grid Section: Security & Verification Status */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Compliance &amp; Security Status</span>
                </h4>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Award className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-xs">Official Agricultural Verification</div>
                      <div className="text-[11px] text-gray-600 mt-0.5">{roleMeta.kycDetail}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-600 text-white rounded-full shrink-0">
                    Verified Tier-2
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-xl font-bold text-xs transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Edit Full Profile &amp; Settings</span>
              </Link>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Menu Slide-over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm">
                  🌾
                </div>
                <div>
                  <h3 className="font-black text-sm leading-none tracking-wide">AGRI-NOVA</h3>
                  <span className="text-[10px] text-emerald-200">Smart Agriculture Portal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Quick Info */}
            <div className="p-4 bg-gray-50 border-b border-gray-200/70 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={displayAvatar}
                  alt={displayUserName}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{displayUserName}</h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 cursor-pointer"
                title="View profile modal"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { label: "Farm Overview", href: "/dashboard/farmer", icon: Home },
                { label: "Crop Cultivation Tracker", href: "/dashboard/farmer?tab=cultivation", icon: Sprout },
                { label: "Agri Marketplace", href: "/marketplace", icon: Store },
                { label: "Machinery & Equipment", href: "/equipment", icon: Tractor },
                { label: "Veterinary Care & Health", href: "/veterinary", icon: PawPrint },
                { label: "Government Schemes", href: "/schemes", icon: FileText },
                { label: "Cold-Chain Logistics", href: "/dashboard/delivery", icon: Truck },
                { label: "Weather Radar & Advisory", href: "/dashboard/farmer?tab=weather", icon: CloudRain },
                { label: "Full Account Profile", href: "/dashboard/profile", icon: User },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[120px]">{displayLocation}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
