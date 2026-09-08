"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Truck, MapPin, Navigation, CheckCircle2, DollarSign, PackageCheck, PhoneCall, RefreshCw } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function DeliveryDashboard() {
  const { currentUser } = useAuthRole();
  const [delivered, setDelivered] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/delivery/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const activeTask = tasks.length > 0 ? {
    orderId: tasks[0].orderId,
    item: tasks[0].order?.orderItems?.map((i: any) => `${i.quantity}x ${i.product?.title || 'Product'}`).join(', ') || "Unknown Cargo",
    pickup: tasks[0].pickupLocation,
    delivery: tasks[0].deliveryLocation,
    distance: "N/A",
    payout: `₹${tasks[0].earnings}`,
    status: delivered ? "DELIVERED" : tasks[0].status
  } : null;

  return (
    <RouteGuard allowedRoles={["DELIVERY_PARTNER"]}>
      <AppLayout>
        
        {/* Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150"}
                alt={currentUser?.name || "Driver"}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{currentUser?.name}</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-semibold border border-purple-100">
                    EXPRESS LOGISTICS DRIVER
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Refrigerated Van #PB-10-CZ-4921 | Cold Chain Certified</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Earnings</div>
              <div className="font-bold text-gray-900 text-xl">₹24,800</div>
            </div>
            <div className="w-px h-10 bg-gray-100"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Completed Trips</div>
              <div className="font-bold text-gray-900 text-xl">18</div>
            </div>
          </div>
        </div>

        {/* Active Delivery Dispatch Card */}
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 mt-6 flex flex-col items-center justify-center text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mb-3 text-purple-600" />
            <p className="text-sm font-semibold">Loading your dispatches...</p>
          </div>
        ) : activeTask ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-black text-gray-900">Active Order Pickup & Delivery Route</h2>
              </div>
              <span className="text-xs font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {activeTask.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cargo Details</div>
                  <div className="text-sm font-bold text-gray-900">{activeTask.item}</div>
                  <div className="text-gray-900 font-medium text-xs">Order ID: {activeTask.orderId}</div>
                  <div className="text-green-600 font-bold text-xs mt-2">Payout: {activeTask.payout}</div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">Pickup Location</div>
                      <div className="text-gray-600 text-sm">{activeTask.pickup}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-3 border-t border-gray-200">
                    <Navigation className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">Delivery Destination</div>
                      <div className="text-gray-600 text-sm">{activeTask.delivery}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative bg-gray-100 flex items-center justify-center min-h-[200px]">
                   <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                   <div className="bg-white p-2 rounded-full shadow-lg z-10 animate-bounce">
                      <Truck className="w-6 h-6 text-purple-600" />
                   </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setDelivered(true)}
                    disabled={delivered}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex justify-center items-center space-x-2 transition-colors shadow-sm"
                  >
                    <PackageCheck className="w-5 h-5" />
                    <span>{delivered ? "Delivery Confirmed" : "Mark as Delivered"}</span>
                  </button>
                  <button className="px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm">
                    <PhoneCall className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 mt-6 flex flex-col items-center justify-center text-gray-500">
            <Truck className="w-12 h-12 mb-3 text-gray-300" />
            <h3 className="text-lg font-black text-gray-900 mb-1">No Active Deliveries</h3>
            <p className="text-sm">You currently don't have any orders assigned to you.</p>
          </div>
        )}

      </AppLayout>
    </RouteGuard>
  );
}
