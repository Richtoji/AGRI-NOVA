"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { ShieldCheck, Cpu, Users, DollarSign, Activity, RefreshCw, Sprout, ArrowRight, Clock, CheckCircle2, Leaf, ExternalLink } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { MarketplaceApproval } from "@/components/admin/MarketplaceApproval";
import { AdminProductManagement } from "@/components/admin/AdminProductManagement";
import { AdminCropManagement } from "@/components/admin/AdminCropManagement";
import { AdminSchemeManagement } from "@/components/admin/AdminSchemeManagement";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { AdminCultivationMonitoring } from "@/components/admin/AdminCultivationMonitoring";

function AdminDashboardContent() {
  const { currentUser } = useAuthRole();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cultivationStats, setCultivationStats] = useState<any>(null);
  const [recentCultivations, setRecentCultivations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
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
        fetch('/api/admin/cultivation?view=stats').then(r => r.json()),
        fetch('/api/admin/cultivation?view=list').then(r => r.json()),
      ]);
      if (statsRes.success) setCultivationStats(statsRes.stats);
      if (listRes.success) setRecentCultivations(listRes.cultivations?.slice(0, 5) || []);
    } catch (e) {
      console.error("Failed to fetch admin cultivation summary:", e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCultivations();

    // Auto-polling for live synchronization
    const interval = setInterval(() => {
      fetchCultivations();
    }, 4000);

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

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'dashboard') {
      fetchUsers();
    }
  }, [activeTab]);

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
        // Revert on failure
        setUsersList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, kycStatus: currentStatus } : u))
        );
      }
    } catch (error) {
      console.error("Failed to update KYC status", error);
      // Revert on failure
      setUsersList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, kycStatus: currentStatus } : u))
      );
    }
  };

  const handleRefreshTelemetry = () => {
    setRefreshing(true);
    fetchUsers();
    fetchCultivations();
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        
        {/* Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  <span>System Command Center | Moderation &amp; Platform Analytics</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold group-hover:underline">View Profile Details &rarr;</span>
                </p>
              </div>
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Ongoing Cultivations</div>
              <div className="font-bold text-emerald-700 text-xl">
                {cultivationStats?.activeCultivations ?? 0}
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">System Status</div>
              <div className="font-bold text-sky-500 text-sm flex items-center justify-center space-x-1">
                 <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                 <span>Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-gray-50 rounded-md text-gray-900 mr-2">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-medium">Platform Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{usersList.length || 14250}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1">
              {usersList.filter(u => u.kycStatus === 'VERIFIED').length} KYC Verified Farmers &amp; Users
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600 mr-2">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-medium">Active Plant Cultivations</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {cultivationStats?.activeCultivations ?? 0}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">
              {cultivationStats?.plantingPendingCount ?? 0} currently in Planting Phase
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 mr-2">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-medium">Planting Verifications Due</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {cultivationStats?.pendingPlanting ?? 0}
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-1">
              {cultivationStats?.pendingPlantingSubmissions ?? 0} photographs awaiting approval
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-sky-50 rounded-md text-sky-600 mr-2">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-medium">AI Crop Diagnoses</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">98,410</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Avg Latency: 42ms</div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 mt-6">
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
                      <span>Live Sync</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time monitoring of crop plans started by farmers and 3-day planting deadlines
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

              {recentCultivations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                  <Sprout className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold text-gray-600">No active cultivations recorded</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">When farmers select and plant any crop, updates will appear here live.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCultivations.map((c) => {
                    const isPlantingPhase = c.status === 'PLANTING_PENDING';
                    const deadline = new Date(new Date(c.startDate).getTime() + 3 * 24 * 60 * 60 * 1000);
                    const now = new Date();
                    const msLeft = deadline.getTime() - now.getTime();
                    const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
                    const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                    const isOverdue = msLeft <= 0;

                    return (
                      <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                            {c.cropProfile?.imageUrl ? (
                              <img src={c.cropProfile.imageUrl} alt={c.cropProfile.name} className="w-full h-full object-cover" />
                            ) : (
                              <Leaf className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-sm">{c.farmer?.name || "Farmer"}</p>
                              <span className="text-gray-300">·</span>
                              <p className="text-emerald-800 font-bold text-xs">{c.cropProfile?.name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isPlantingPhase 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {isPlantingPhase ? '🌱 Planting Phase (3-Day Window)' : c.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Started: {new Date(c.startDate).toLocaleDateString()} at {new Date(c.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Region: {c.region || 'Local'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          {isPlantingPhase && (
                            <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-amber-700'}`}>
                              {isOverdue ? '⚠️ 3-Day Deadline Expired' : `⏳ ${daysLeft}d ${hoursLeft}h to plant`}
                            </span>
                          )}
                          <Link
                            href="/dashboard/admin?tab=cultivation"
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                          >
                            {isPlantingPhase ? 'Review Planting' : 'View Cultivation'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <ErrorBoundary name="MarketplaceApproval">
              <MarketplaceApproval />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'products' && (
          <ErrorBoundary name="AdminProductManagement">
            <AdminProductManagement />
          </ErrorBoundary>
        )}

        {activeTab === 'stock' && (
          <ErrorBoundary name="AdminCropManagement">
            <AdminCropManagement />
          </ErrorBoundary>
        )}

        {activeTab === 'schemes' && (
          <ErrorBoundary name="AdminSchemeManagement">
            <AdminSchemeManagement />
          </ErrorBoundary>
        )}

        {activeTab === 'cultivation' && (
          <ErrorBoundary name="AdminCultivationMonitoring">
            <AdminCultivationMonitoring />
          </ErrorBoundary>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-gray-700" />
                  <span>KYC & Identity Verification Queue</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">Manage user onboarding and role verification manually</p>
              </div>
              <button
                onClick={handleRefreshTelemetry}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
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
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : usersList.slice(0, 50).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium border border-gray-200">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.email || user.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          user.kycStatus === "VERIFIED"
                            ? "bg-gray-50 text-gray-800 border-gray-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleKyc(user.id, user.kycStatus)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${
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

      </AppLayout>
    </RouteGuard>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
