"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { mockSeedData } from "../../../../backend/prisma/seed";
import { ShieldCheck, Cpu, Users, DollarSign, Activity, RefreshCw } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function AdminDashboard() {
  const { currentUser } = useAuthRole();
  const [usersList, setUsersList] = useState(mockSeedData.users);
  const [refreshing, setRefreshing] = useState(false);

  const toggleKyc = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, kycStatus: u.kycStatus === "VERIFIED" ? "PENDING" : "VERIFIED" }
          : u
      )
    );
  };

  const handleRefreshTelemetry = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        
        {/* Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                alt={currentUser?.name || "Admin"}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{currentUser?.name || "System Admin"}</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-900 font-semibold border border-gray-100">
                    ENTERPRISE ADMIN
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">System Command Center | Moderation & Platform Analytics</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Platform GMV</div>
              <div className="font-bold text-gray-900 text-xl">₹42.8L</div>
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
            <div className="text-2xl font-bold text-gray-900">14,250</div>
            <div className="text-[10px] text-gray-900 font-medium mt-1">+12% growth this month</div>
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

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 mr-2">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="font-medium">Escrow Hold Reserve</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">₹12.4L</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">0 Active Payment Disputes</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-purple-50 rounded-md text-purple-600 mr-2">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-medium">Active Subscriptions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">1,204</div>
            <div className="text-[10px] text-purple-600 font-medium mt-1">+5% from last week</div>
          </div>
        </div>

        {/* KYC User Management Table */}
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
                {usersList.slice(0, 5).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium border border-gray-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.email}</td>
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
                        onClick={() => toggleKyc(user.id)}
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

      </AppLayout>
    </RouteGuard>
  );
}
