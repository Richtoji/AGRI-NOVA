"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { User, ShieldCheck, Mail, Phone, Lock, Eye, Bell, ShieldAlert, Smartphone, CheckCircle2, CloudLightning } from "lucide-react";
import { validateEmail, validatePhone } from "@/lib/validation";

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuthRole();
  const [name, setName] = useState(currentUser?.name || "Rajesh Kumar");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [email, setEmail] = useState(currentUser?.email || "farmer@agri-nova.com");
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const deviceHistory = [
    { device: "Chrome (Windows 11) • Noida, UP", time: "Active Now", current: true },
    { device: "AGRI-NOVA Mobile App (Android 14) • Ludhiana", time: "July 24, 2026, 04:30 PM", current: false },
    { device: "Firefox (Ubuntu Linux) • Delhi NCR", time: "July 21, 2026, 11:15 AM", current: false },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setValidationError(null);

    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(phone)) {
      setValidationError("Please enter a valid 10-12 digit phone number.");
      return;
    }

    updateProfile(name, email, phone);
    setSuccessMsg("Profile metrics synchronized successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">{name}</h1>
              <p className="text-xs text-gray-500">Manage your credentials, security settings, and device history</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-gray-50 text-gray-900 border border-gray-100">
            KYC VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: General Settings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-gray-700" />
                <span>General Profile Settings</span>
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs font-semibold block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-500 text-xs font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700 transition-colors"
                    required
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors">
                  Update Account Details
                </button>
              </form>

              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center space-x-2 text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 flex items-center space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Bell className="w-4 h-4 text-gray-700" />
                <span>Notification Preferences</span>
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-700" />
                  <span className="group-hover:text-gray-900 transition-colors">SMS weather advisories and heatwave warnings</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-700" />
                  <span className="group-hover:text-gray-900 transition-colors">Mandi market commodity price alerts</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-700" />
                  <span className="group-hover:text-gray-900 transition-colors">Weekly platform transaction billing summaries</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Security & Sessions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Two Factor Authentication Settings */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Smartphone className="w-4 h-4 text-gray-700" />
                <span>Two-Factor Authentication (2FA)</span>
              </h3>

              <div className="space-y-4 text-sm">
                <p className="text-gray-500 leading-relaxed text-xs">
                  Protect your farm details and checkout configurations by adding an extra layer of SMS validation.
                </p>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-gray-900" />
                    <span className="font-semibold text-gray-900">2FA Status</span>
                  </div>
                  <button
                    onClick={() => setIs2FaEnabled(!is2FaEnabled)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all ${
                      is2FaEnabled ? "bg-gray-100 text-gray-800 hover:bg-emerald-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {is2FaEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Session History */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Smartphone className="w-4 h-4 text-sky-500" />
                <span>Device Authorization Log</span>
              </h3>

              <div className="space-y-3 text-sm">
                {deviceHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-gray-900">{item.device}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                    </div>
                    {item.current && (
                      <span className="text-[10px] font-bold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
