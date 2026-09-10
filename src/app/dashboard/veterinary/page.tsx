"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Stethoscope, Video, Calendar, FileText, CheckCircle2, User, X, AlertCircle } from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { validatePrescription } from "@/lib/validation";
import { useSearchParams } from "next/navigation";

function VeterinaryDashboardContent() {
  const { currentUser } = useAuthRole();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [rxSent, setRxSent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/veterinary/book");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAppointments(data.appointments);
          }
        }
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      }
    };
    fetchAppointments();
  }, []);

  const handleSendPrescription = () => {
    setValidationError(null);
    if (!validatePrescription(prescriptionText)) {
      setValidationError("Please enter a valid prescription (at least 10 characters long).");
      return;
    }
    setRxSent(true);
    setPrescriptionText("");
    setTimeout(() => {
      setRxSent(false);
    }, 2000);
  };

  return (
    <RouteGuard allowedRoles={["VETERINARY_EXPERT"]}>
      <AppLayout>
        
        {currentTab === 'dashboard' && (
          <>
            {/* Header Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                    alt={currentUser?.name || "Veterinary Specialist"}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{currentUser?.name}</h1>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold border border-gray-200">
                        LICENSED VETERINARY SURGEON
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Regn No: VET-IND-99402 | Bovine & Livestock Specialist</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-around">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Consultations Done</div>
                  <div className="font-bold text-gray-900 text-xl">142</div>
                </div>
                <div className="w-px h-10 bg-gray-100"></div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Rating</div>
                  <div className="font-bold text-amber-500 text-xl">4.9 / 5.0</div>
                </div>
              </div>
            </div>

            {/* Appointments Grid */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-900" />
                  <span>Today's Telehealth Consultations</span>
                </h2>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  2 Pending
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-1" /> {apt.farmerName}
                        </h3>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{apt.animal}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm">
                        {apt.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100 mb-4 line-clamp-2">
                      <span className="font-semibold block mb-0.5">Symptoms:</span>
                      {apt.symptoms}
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsVideoModalOpen(true)}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-xs font-medium flex justify-center items-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Video Call</span>
                      </button>
                      <button className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors shadow-sm">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentTab === 'appointments' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">Appointments</h2>
            <p className="text-sm text-gray-500">Manage all your upcoming and past appointments here.</p>
          </div>
        )}

        {currentTab === 'consultations' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">Consultations History</h2>
            <p className="text-sm text-gray-500">Review your past telehealth consultations and e-prescriptions.</p>
          </div>
        )}

        {currentTab === 'schedule' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-black text-gray-900 mb-4">My Schedule</h2>
            <p className="text-sm text-gray-500">Set your availability and manage your working hours.</p>
          </div>
        )}

        {/* Video Call Modal */}
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <h3 className="font-bold text-gray-900">Live Consultation</h3>
                  <span className="text-xs text-gray-500">| Rajesh Kumar (Gir Cow)</span>
                </div>
                <button onClick={() => setIsVideoModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50">
                <div className="sm:col-span-2 bg-gray-900 rounded-xl aspect-video relative overflow-hidden flex items-center justify-center border border-gray-200">
                  <img src="https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=800&q=80" alt="Cow on camera" className="object-cover w-full h-full opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                    <button className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg" onClick={() => setIsVideoModalOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col h-[300px] sm:h-auto">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center border-b border-gray-100 pb-2">
                    <FileText className="w-3.5 h-3.5 mr-1 text-gray-500" /> Generate E-Prescription
                  </h4>
                  
                  {validationError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded-md text-[10px] text-red-600 flex items-start">
                      <AlertCircle className="w-3 h-3 mr-1 mt-0.5 shrink-0" />
                      {validationError}
                    </div>
                  )}

                  <textarea 
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-900 resize-none focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all placeholder-gray-400"
                    placeholder="Enter diagnosis, medicines, and dosage instructions here..."
                  ></textarea>
                  <button 
                    onClick={handleSendPrescription}
                    disabled={rxSent}
                    className="w-full mt-3 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center"
                  >
                    {rxSent ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Sent to Farmer</> : "Sign & Send Prescription"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </AppLayout>
    </RouteGuard>
  );
}

export default function VeterinaryDashboard() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Dashboard...</div>}>
      <VeterinaryDashboardContent />
    </React.Suspense>
  );
}
