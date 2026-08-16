"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, ShieldCheck } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function BuyerDashboard() {
  const { currentUser } = useAuthRole();

  const activeOrder = {
    id: "ORD-98214",
    seller: "Rajesh Kumar (Organic Farmer)",
    items: "500kg Organic Grade A Tomatoes",
    total: 22500,
    status: "IN_TRANSIT",
    driver: "AgriExpress Logistics (Driver: Vikram Singh)",
    estimatedDelivery: "Today by 4:30 PM",
    trackingSteps: [
      { label: "Order Confirmed", done: true, time: "08:30 AM" },
      { label: "Picked Up from Farm", done: true, time: "11:15 AM" },
      { label: "In Transit", done: true, time: "01:00 PM" },
      { label: "Out for Delivery", done: false, time: "Est. 04:00 PM" },
    ]
  };

  return (
    <RouteGuard allowedRoles={["BUYER"]}>
      <AppLayout>
        
        {/* Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={currentUser?.name || "Buyer"}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-gray-900">{currentUser?.name}</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100">
                    VERIFIED CORPORATE BUYER
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">FreshBasket Wholesale Hub #2 | GSTIN: 07AAAAA0000A1Z5</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Purchases</div>
              <div className="font-bold text-gray-900 text-xl">₹4,85,000</div>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Escrow Balance</div>
              <div className="font-bold text-blue-600 text-xl">₹62,000</div>
            </div>
          </div>
        </div>

        {/* Live Shipment Tracking */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
                <h2 className="text-lg font-black text-gray-900">Live Cold-Chain Shipment Tracking</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">Order ID: {activeOrder.id} • Seller: {activeOrder.seller}</p>
            </div>
            <span className="text-xs font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              IN TRANSIT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {activeOrder.trackingSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col space-y-2 relative">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      step.done ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-semibold ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                <div className="pl-8 text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
