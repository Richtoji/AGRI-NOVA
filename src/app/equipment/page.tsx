"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockSeedData } from "../../../backend/prisma/seed";
import { SafeImage } from "@/components/ui/SafeImage";
import { Tractor, MapPin, Calendar, CheckCircle2, Zap, X, AlertCircle } from "lucide-react";
import { validateRentalDays } from "@/lib/validation";

export default function EquipmentPage() {
  const [selectedEq, setSelectedEq] = useState<any | null>(null);
  const [days, setDays] = useState<number | string>(2);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleConfirmBooking = async () => {
    setValidationError(null);
    const validation = validateRentalDays(days);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid duration.");
      return;
    }
    setIsBooking(true);
    try {
      const totalCost = (selectedEq.dailyRate * (Number(days) || 0)) + 850;
      const res = await fetch("/api/equipment/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedEq.id,
          days: Number(days),
          totalCost
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Failed to book equipment.");
      } else {
        setBookingSuccess(true);
        setSelectedEq(null);
        setDays(2);
        setTimeout(() => {
          setBookingSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setValidationError("An unexpected error occurred.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100 bg-white">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Tractor className="w-6 h-6 mr-2 text-gray-900" /> Equipment Rental
            </h1>
            <p className="text-sm text-gray-500">
              Rent Modern Machinery With GPS Dispatch
            </p>
          </div>
        </div>

        {/* Machinery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockSeedData.equipment.map((eq) => (
            <div key={eq.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col group relative bg-white border border-gray-200 shadow-sm p-4 rounded-xl">
              <div className="space-y-3 flex-1 flex flex-col">
                
                <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100 mb-3">
                  <SafeImage src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[10px] font-bold shadow-sm">
                    {eq.category}
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[10px] font-bold flex items-center shadow-sm">
                    <Zap className="w-3 h-3 mr-1" /> Available
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-900">{eq.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{eq.locationName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-3">
                  <div>
                    <div className="text-gray-500 text-[10px]">Daily Rate</div>
                    <div className="text-sm font-bold text-gray-900">₹{eq.dailyRate}/day</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px]">Hourly Rate</div>
                    <div className="text-sm font-bold text-gray-900">₹{eq.hourlyRate}/hr</div>
                  </div>
                </div>

              </div>

              <button 
                onClick={() => setSelectedEq(eq)} 
                className="w-full mt-4 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-bold rounded-lg py-2.5 shadow-sm transition-colors flex items-center justify-center text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>Book Equipment</span>
              </button>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {selectedEq && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900">Book {selectedEq.name}</h3>
                <button onClick={() => setSelectedEq(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <SafeImage src={selectedEq.imageUrl} alt={selectedEq.name} className="w-20 h-20 rounded-lg object-cover" />
                   <div>
                     <h4 className="font-bold text-gray-900 text-sm">{selectedEq.name}</h4>
                     <p className="text-xs text-gray-500">{selectedEq.locationName}</p>
                     <p className="text-sm font-black text-gray-900 mt-1">₹{selectedEq.dailyRate} <span className="text-[10px] font-normal text-gray-500">/ day</span></p>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">Rental Duration (Days)</label>
                  <input 
                    type="number" 
                    min={1} max={30}
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                  />
                  {validationError && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" /> {validationError}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Cost</span>
                    <span className="font-medium text-gray-900">₹{selectedEq.dailyRate * (Number(days) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Insurance & Transport</span>
                    <span className="font-medium text-gray-900">₹850</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Total Estimate</span>
                    <span className="font-black text-gray-800 text-lg">₹{(selectedEq.dailyRate * (Number(days) || 0)) + 850}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl shadow-sm transition-all"
                >
                  {isBooking ? "Booking..." : "Confirm Booking Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {bookingSuccess && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 z-50 animate-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">Booking Requested!</p>
              <p className="text-xs text-gray-200">The owner will confirm shortly.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
