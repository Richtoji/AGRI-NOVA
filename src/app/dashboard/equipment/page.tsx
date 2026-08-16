"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Tractor, Calendar, DollarSign, Plus } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function EquipmentOwnerDashboard() {
  const { currentUser } = useAuthRole();

  return (
    <RouteGuard allowedRoles={["EQUIPMENT_OWNER"]}>
      <AppLayout>
        
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
              alt={currentUser?.name || "Equipment Owner"}
              className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{currentUser?.name}</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold border border-amber-100">
                  VERIFIED FLEET OWNER
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Kisan Agro Fleet Hub | Punjab & Haryana Belt</p>
            </div>
          </div>

          <button className="flex items-center space-x-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>List New Machinery</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-gray-50 rounded-md text-gray-900 mr-2">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="font-medium">Total Rental Revenue</span>
            </div>
            <div className="text-2xl font-black text-gray-900">₹1,84,500</div>
            <div className="text-[10px] text-gray-900 font-medium mt-1">+14% vs last month</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-blue-50 rounded-md text-blue-600 mr-2">
                <Tractor className="w-4 h-4" />
              </div>
              <span className="font-medium">Active Machinery Fleet</span>
            </div>
            <div className="text-2xl font-black text-gray-900">3 Machines</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">100% Operational Status</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="text-xs text-gray-500 flex items-center mb-2">
              <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 mr-2">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-medium">Pending Booking Requests</span>
            </div>
            <div className="text-2xl font-black text-gray-900">2 Requests</div>
            <div className="text-[10px] text-amber-600 font-medium mt-1">Requires Approval</div>
          </div>
        </div>

      </AppLayout>
    </RouteGuard>
  );
}
