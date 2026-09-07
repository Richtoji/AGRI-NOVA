"use client";

import React, { useState } from "react";
import { Search, MapPin, Bell, MessageSquare, ChevronDown, Menu } from "lucide-react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";

export const Topbar: React.FC = () => {
  const { currentUser, currentRole } = useAuthRole();
  const [searchQuery, setSearchQuery] = useState("");

  const roleLabel = currentRole
    ? currentRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "User";

  const defaultAvatar = currentUser?.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=f3f4f6&color=111827` 
    : "https://ui-avatars.com/api/?name=User&background=f3f4f6&color=111827";

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      
      {/* Mobile menu toggle */}
      <button className="lg:hidden mr-3 text-gray-500 hover:text-gray-900">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200 rounded-full py-2 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4 ml-4">
        
        {/* Location Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-700">Kottayam, Kerala</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-1.5 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>

        {/* Messages */}
        <button className="p-1.5 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-100"></div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <img
            src={currentUser?.avatarUrl || defaultAvatar}
            alt={currentUser?.name || "Profile"}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-gray-900 leading-tight">
              Hi, {currentUser?.name || "Guest"}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              {roleLabel}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
        </div>
        
      </div>
    </header>
  );
};
