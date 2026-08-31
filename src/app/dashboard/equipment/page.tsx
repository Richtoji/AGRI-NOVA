"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Tractor, Calendar, IndianRupee, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function EquipmentOwnerDashboard() {
  const { currentUser } = useAuthRole();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await fetch("/api/equipment/requests");
        if (res.ok) {
          const data = await res.json();
          setRentals(data.rentals || []);
        }
      } catch (err) {
        console.error("Failed to fetch rentals:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchRentals();
  }, [currentUser]);

  const totalRevenue = rentals.reduce((sum, r) => sum + (r.status !== 'REJECTED' ? r.totalCost : 0), 0);
  const pendingRequests = rentals.filter(r => r.status === 'PENDING').length;

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
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="font-medium">Total Rental Revenue</span>
            </div>
            <div className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-gray-900 font-medium mt-1">From all accepted bookings</div>
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
            <div className="text-2xl font-black text-gray-900">{pendingRequests} Requests</div>
            <div className="text-[10px] text-amber-600 font-medium mt-1">Requires Approval</div>
          </div>
        </div>

        {/* Pending Requests List */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Rental Requests</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Loading requests...</div>
          ) : rentals.length === 0 ? (
            <div className="text-sm text-gray-500">No rental requests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map((rental) => (
                <div key={rental.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <img src={rental.renter.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{rental.renter.name}</h4>
                        <p className="text-xs text-gray-500">{rental.renter.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${rental.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : rental.status === 'ACTIVE' || rental.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {rental.status}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2 mb-4 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Equipment</span>
                      <span className="font-semibold text-gray-900">{rental.equipment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-semibold text-gray-900">
                        {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 3600 * 24))} Days
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-900 font-bold">Total Estimate</span>
                      <span className="font-black text-gray-900 text-lg flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" />{rental.totalCost}
                      </span>
                    </div>
                  </div>

                  {rental.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Accept Request
                      </button>
                      <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center">
                        <XCircle className="w-4 h-4 mr-1.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </AppLayout>
    </RouteGuard>
  );
}
