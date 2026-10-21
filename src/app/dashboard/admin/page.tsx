"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { 
  ShieldCheck, 
  Cpu, 
  Users, 
  DollarSign, 
  Activity, 
  RefreshCw, 
  Sprout, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Leaf, 
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Eye,
  Store,
  FileText,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { MarketplaceApproval } from "@/components/admin/MarketplaceApproval";
import { AdminProductManagement } from "@/components/admin/AdminProductManagement";
import { AdminCropManagement } from "@/components/admin/AdminCropManagement";
import { AdminSchemeManagement } from "@/components/admin/AdminSchemeManagement";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { AdminCultivationMonitoring } from "@/components/admin/AdminCultivationMonitoring";

function AdminDashboardContent() {
  const router = useRouter();
  const { currentUser } = useAuthRole();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cultivationStats, setCultivationStats] = useState<any>(null);
  const [recentCultivations, setRecentCultivations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCultivations, setLoadingCultivations] = useState(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filters for users
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsersList(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
      setRefreshing(false);
    }
  };

  const fetchCultivations = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch('/api/admin/cultivation?view=stats').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/cultivation?view=list').then(r => r.json()).catch(() => ({})),
      ]);
      if (statsRes.success) setCultivationStats(statsRes.stats);
      if (listRes.success && Array.isArray(listRes.cultivations)) {
        setRecentCultivations(listRes.cultivations);
      }
    } catch (e) {
      console.error("Failed to fetch admin cultivation summary:", e);
    } finally {
      setLoadingCultivations(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCultivations();

    // Auto-polling for real-time synchronization every 3 seconds
    const interval = setInterval(() => {
      fetchCultivations();
      fetchUsers();
    }, 3000);

    const handleSync = () => {
      fetchCultivations();
      fetchUsers();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('agri_nova_cultivation_started', handleSync);
    window.addEventListener('agri_nova_cultivation_updated', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('agri_nova_cultivation_started', handleSync);
      window.removeEventListener('agri_nova_cultivation_updated', handleSync);
    };
  }, []);

  const toggleKyc = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "VERIFIED" ? "PENDING" : "VERIFIED";
    
    // Optimistic update
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, kycStatus: newStatus } : u))
    );

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, kycStatus: newStatus })
      });
      if (!res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, kycStatus: currentStatus } : u))
        );
      } else {
        setActionSuccessMessage(`KYC status updated for user.`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error("Failed to update KYC status", error);
      setUsersList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, kycStatus: currentStatus } : u))
      );
    }
  };

  const handleQuickApprovePlanting = async (cultivationId: string, cropName: string, farmerName: string) => {
    try {
      const res = await fetch('/api/admin/cultivation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cultivation',
          id: cultivationId,
          action: 'APPROVE_PLANTING',
          adminComment: 'Planting phase approved by Administrator from Live Dashboard'
        })
      });

      if (res.ok) {
        setActionSuccessMessage(`✓ Approved planting for ${farmerName}'s ${cropName}! Cultivation is now in Active Growth phase.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        fetchCultivations();
        try {
          localStorage.setItem('agri_nova_cultivation_updated', Date.now().toString());
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }
    } catch (e) {
      console.error('Quick approve failed:', e);
    }
  };

  const handleRefreshTelemetry = () => {
    setRefreshing(true);
    fetchUsers();
    fetchCultivations();
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(userSearchQuery.toLowerCase());
      
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchQuery, userRoleFilter]);

  const navTabs = [
    { id: 'dashboard', label: 'Overview', icon: Activity, count: null },
    { id: 'cultivation', label: 'Cultivation Monitoring', icon: Sprout, count: cultivationStats?.pendingPlanting ?? null },
    { id: 'users', label: 'User Directory & KYC', icon: Users, count: usersList.length || null },
    { id: 'products', label: 'Marketplace Approvals', icon: Store, count: null },
    { id: 'stock', label: 'Crop Stock', icon: ClipboardList, count: null },
    { id: 'schemes', label: 'Govt Schemes', icon: FileText, count: null },
  ];

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        
        {/* Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <Link
              href="/dashboard/profile"
              className="flex items-center space-x-4 group cursor-pointer hover:opacity-95 transition-all"
              title="Click to view full profile details"
            >
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                alt={currentUser?.name || "Enterprise Admin"}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                    {currentUser?.name || "Enterprise Admin"}
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-900 font-semibold border border-gray-100">
                    ENTERPRISE ADMIN
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1.5">
                  <span>System Command Center | Moderation &amp; Real-time Agriculture Analytics</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold group-hover:underline">View Profile &rarr;</span>
                </p>
              </div>
            </Link>

            <button
              onClick={handleRefreshTelemetry}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Refresh Telemetry"}</span>
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-around shadow-xs">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Ongoing Cultivations</div>
              <div className="font-bold text-emerald-700 text-2xl">
                {cultivationStats?.activeCultivations ?? recentCultivations.length}
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">System Status</div>
              <div className="font-bold text-emerald-600 text-sm flex items-center justify-center space-x-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span>Real-time Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionSuccessMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-gray-50 rounded-md text-gray-900 mr-2">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-medium">Registered Platform Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{usersList.length}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1">
              {usersList.filter(u => u.kycStatus === 'VERIFIED').length} KYC Verified Farmers &amp; Users
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600 mr-2">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-medium">Active Plant Cultivations</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {cultivationStats?.activeCultivations ?? recentCultivations.length}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">
              {cultivationStats?.plantingPendingCount ?? recentCultivations.filter(c => c.status === 'PLANTING_PENDING').length} in Planting Phase
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 mr-2">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-medium">Planting Verifications Due</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {cultivationStats?.pendingPlanting ?? recentCultivations.filter(c => c.status === 'PLANTING_PENDING').length}
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-1">
              {cultivationStats?.pendingPlantingSubmissions ?? 0} photos awaiting approval
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-sky-50 rounded-md text-sky-600 mr-2">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-medium">AI Crop Diagnoses</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">98,410</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Avg Response: 42ms · 100% Uptime</div>
          </div>
        </div>

        {/* On-Page Tab Navigation Bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-xs overflow-x-auto">
          <div className="flex items-center space-x-1 min-w-max">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/dashboard/admin?tab=${t.id}`)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  {t.count !== null && t.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-gray-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* DASHBOARD TAB: Overview containing Cultivation Live Feed + User Directory */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Live Crop Cultivation Feed & Planting Approvals */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-emerald-600" />
                      <span>Live Plant Cultivation Activity Feed</span>
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Real-time Live Sync</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Instant updates when farmers start cultivating crops or submit planting photo evidence
                  </p>
                </div>

                <Link
                  href="/dashboard/admin?tab=cultivation"
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <span>Open Cultivation Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingCultivations ? (
                <div className="text-center py-8 text-gray-500 text-xs font-medium">Loading cultivations telemetry...</div>
              ) : recentCultivations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                  <Sprout className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold text-gray-600">No active cultivations recorded</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">When any farmer selects and starts cultivating any crop, it will appear here immediately.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCultivations.slice(0, 10).map((c) => {
                    const isPlantingPhase = c.status === 'PLANTING_PENDING';
                    const deadline = new Date(new Date(c.startDate).getTime() + 3 * 24 * 60 * 60 * 1000);
                    const now = new Date();
                    const msLeft = deadline.getTime() - now.getTime();
                    const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
                    const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                    const isOverdue = msLeft <= 0;

                    return (
                      <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {c.cropProfile?.imageUrl ? (
                              <img src={c.cropProfile.imageUrl} alt={c.cropProfile.name || c.cropName} className="w-full h-full object-cover" />
                            ) : (
                              <Leaf className="w-6 h-6 text-emerald-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-sm">{c.farmer?.name || "Farmer"}</p>
                              <span className="text-gray-300">·</span>
                              <p className="text-emerald-800 font-bold text-xs">{c.cropProfile?.name || c.cropName}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isPlantingPhase 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {isPlantingPhase ? '🌱 Planting Phase (3-Day Window)' : '🌿 Active Growth (' + (c.progress || 25) + '%)'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Farmer: <span className="font-medium text-gray-700">{c.farmer?.email || c.farmer?.phone || "Registered Farmer"}</span> · Started: {new Date(c.startDate).toLocaleDateString()} · Region: {c.region || 'Kerala Farmland'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2.5 shrink-0">
                          {isPlantingPhase && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>
                              {isOverdue ? '⚠️ 3-Day Deadline Expired' : `⏳ ${daysLeft}d ${hoursLeft}h to plant`}
                            </span>
                          )}

                          {isPlantingPhase && (
                            <button
                              onClick={() => handleQuickApprovePlanting(c.id, c.cropProfile?.name || c.cropName, c.farmer?.name || "Farmer")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                              title="Instantly approve planting and unlock Stage 2"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Planting</span>
                            </button>
                          )}

                          <Link
                            href="/dashboard/admin?tab=cultivation"
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                          >
                            {isPlantingPhase ? 'Review' : 'View Details'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform Users & KYC Verification Overview (Directly on Dashboard) */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-900" />
                    <span>Registered Platform Users &amp; KYC Verification</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Live overview of farmers, buyers, veterinary experts, and equipment owners registered on the platform</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
                    />
                  </div>

                  <Link
                    href="/dashboard/admin?tab=users"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    View All ({usersList.length}) &rarr;
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Email / Phone</th>
                      <th className="px-6 py-4 text-center">KYC Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading user directory...</td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found matching query.</td>
                      </tr>
                    ) : filteredUsers.slice(0, 10).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 flex items-center space-x-3">
                          <img
                            src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                          <span>{user.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold border ${
                            user.role === 'FARMER' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            user.role === 'BUYER' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                            user.role === 'VETERINARY_EXPERT' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                            user.role === 'EQUIPMENT_OWNER' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            user.role === 'DELIVERY_PARTNER' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                            'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">{user.email || user.phone}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            user.kycStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {user.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleKyc(user.id, user.kycStatus)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border cursor-pointer ${
                              user.kycStatus === "VERIFIED"
                                ? "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                                : "bg-gray-900 text-white border-transparent hover:bg-gray-800"
                            }`}
                          >
                            {user.kycStatus === "VERIFIED" ? "Revoke" : "Approve KYC"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Marketplace Approval Queue */}
            <ErrorBoundary name="MarketplaceApproval">
              <MarketplaceApproval />
            </ErrorBoundary>

          </div>
        )}

        {/* CULTIVATION TAB */}
        {activeTab === 'cultivation' && (
          <ErrorBoundary name="AdminCultivationMonitoring">
            <AdminCultivationMonitoring />
          </ErrorBoundary>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-gray-700" />
                  <span>Platform User Directory &amp; KYC Verification</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Manage onboarding, contact profiles, and verification status for all agricultural users</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-64"
                  />
                </div>

                <button
                  onClick={handleRefreshTelemetry}
                  disabled={refreshing}
                  className="flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center space-x-2 overflow-x-auto">
              <span className="text-xs font-bold text-gray-500 shrink-0">Filter Role:</span>
              {["ALL", "FARMER", "BUYER", "EQUIPMENT_OWNER", "VETERINARY_EXPERT", "DELIVERY_PARTNER", "ADMIN"].map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    userRoleFilter === r
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {r === "ALL" ? `All Users (${usersList.length})` : r.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email / Phone</th>
                    <th className="px-6 py-4 text-center">KYC Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 flex items-center space-x-3">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-[11px] text-gray-400 font-normal">ID: {user.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold border ${
                          user.role === 'FARMER' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          user.role === 'BUYER' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                          user.role === 'VETERINARY_EXPERT' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                          user.role === 'EQUIPMENT_OWNER' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          user.role === 'DELIVERY_PARTNER' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          'bg-purple-50 text-purple-800 border-purple-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{user.email || user.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          user.kycStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleKyc(user.id, user.kycStatus)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border cursor-pointer ${
                            user.kycStatus === "VERIFIED"
                              ? "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                              : "bg-gray-900 text-white border-transparent hover:bg-gray-800"
                          }`}
                        >
                          {user.kycStatus === "VERIFIED" ? "Revoke" : "Approve KYC"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <ErrorBoundary name="AdminProductManagement">
            <AdminProductManagement />
          </ErrorBoundary>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <ErrorBoundary name="AdminCropManagement">
            <AdminCropManagement />
          </ErrorBoundary>
        )}

        {/* SCHEMES TAB */}
        {activeTab === 'schemes' && (
          <ErrorBoundary name="AdminSchemeManagement">
            <AdminSchemeManagement />
          </ErrorBoundary>
        )}

      </AppLayout>
    </RouteGuard>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-xs font-bold text-gray-500">Loading Command Center...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
