"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Stethoscope, Droplets, Calendar, ChevronRight, Activity, Beaker } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export default function VeterinaryPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100 bg-white">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Stethoscope className="w-6 h-6 mr-2 text-gray-900" /> Livestock & Veterinary Care
            </h1>
            <p className="text-sm text-gray-500">
              Manage your livestock health, view breed recommendations, and book veterinary appointments.
            </p>
          </div>
          <button className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Book Vet Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Breed Recommendation */}
            <h2 className="text-lg font-black text-gray-900">Recommended Breeds for Your Region</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Jersey Cow */}
              <div className="bg-white border border-gray-100 rounded-2xl bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="h-48 relative">
                  <SafeImage 
                    src="https://images.unsplash.com/photo-1546446306-444458514120?w=600" 
                    alt="Jersey Cow" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-gray-800 border border-gray-200 shadow-sm">
                    HIGH YIELD BREED
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-900">Jersey Cow</h3>
                  <div className="mt-4 space-y-3 flex-1 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 flex items-center"><Droplets className="w-4 h-4 mr-2 text-blue-500" /> Expected Milk</span>
                      <span className="font-bold text-gray-900">18–25 L/day</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 flex items-center"><Activity className="w-4 h-4 mr-2 text-gray-700" /> Fat Content</span>
                      <span className="font-bold text-gray-900">4.5% - 5.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center"><Beaker className="w-4 h-4 mr-2 text-amber-500" /> Maintenance</span>
                      <span className="font-bold text-gray-900">Medium</span>
                    </div>
                  </div>
                  <button className="mt-5 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm rounded-lg transition-colors border border-gray-200">
                    View Full Details
                  </button>
                </div>
              </div>

              {/* Murrah Buffalo */}
              <div className="bg-white border border-gray-100 rounded-2xl bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="h-48 relative">
                  <SafeImage 
                    src="https://images.unsplash.com/photo-1528646199653-333e25ba138e?w=600" 
                    alt="Murrah Buffalo" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-gray-800 border border-gray-200 shadow-sm">
                    HIGH FAT CONTENT
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-900">Murrah Buffalo</h3>
                  <div className="mt-4 space-y-3 flex-1 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 flex items-center"><Droplets className="w-4 h-4 mr-2 text-blue-500" /> Expected Milk</span>
                      <span className="font-bold text-gray-900">12–16 L/day</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 flex items-center"><Activity className="w-4 h-4 mr-2 text-gray-700" /> Fat Content</span>
                      <span className="font-bold text-gray-900">7.0% - 8.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center"><Beaker className="w-4 h-4 mr-2 text-amber-500" /> Maintenance</span>
                      <span className="font-bold text-gray-900">High</span>
                    </div>
                  </div>
                  <button className="mt-5 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm rounded-lg transition-colors border border-gray-200">
                    View Full Details
                  </button>
                </div>
              </div>
            </div>

            {/* Feed Requirements */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 bg-white border border-gray-200 rounded-xl mt-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Daily Feed Requirements (per Adult Cow)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Green Fodder (Napier/Maize)</h4>
                    <p className="text-xs text-gray-500">Provides essential moisture and vitamins</p>
                  </div>
                  <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">15 - 20 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Dry Fodder (Paddy Straw)</h4>
                    <p className="text-xs text-gray-500">Maintains rumen health and digestion</p>
                  </div>
                  <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">4 - 5 kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Concentrate Feed & Minerals</h4>
                    <p className="text-xs text-gray-500">For energy, protein, and calcium</p>
                  </div>
                  <span className="font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-100">2 - 3 kg</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            <div className="bg-white border border-gray-100 rounded-2xl p-5 bg-gray-50 border border-gray-100 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-2">Book Veterinary Care</h3>
              <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                Schedule an on-farm visit or teleconsultation with certified veterinary doctors.
              </p>
              <button className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-2" /> Book Appointment
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Vaccinations</h3>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-gray-100">
                <div className="relative pl-7">
                  <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-white"></div>
                  <div className="text-xs font-bold text-amber-600 mb-0.5">Due in 5 Days</div>
                  <h4 className="font-bold text-gray-900 text-sm">FMD Vaccine</h4>
                  <p className="text-xs text-gray-500">Foot and Mouth Disease booster</p>
                </div>
                <div className="relative pl-7">
                  <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-gray-700 ring-4 ring-white"></div>
                  <div className="text-xs font-bold text-gray-900 mb-0.5">Completed (Oct 12)</div>
                  <h4 className="font-bold text-gray-900 text-sm">HS & BQ Vaccine</h4>
                  <p className="text-xs text-gray-500">Hemorrhagic Septicemia</p>
                </div>
              </div>
              <button className="mt-5 text-sm text-gray-900 font-bold hover:text-gray-800 flex items-center">
                View Full Schedule <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
