"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { 
  Home,
  Sprout, 
  CloudSun,
  ShoppingBag, 
  Tractor, 
  PawPrint,
  ClipboardList,
  Store,
  ShieldCheck,
  FileText,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Truck,
  ShoppingCart,
  ArrowLeft
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { currentRole, logout, toggleCart } = useAuthRole();
  const pathname = usePathname();

  const getDashboardPath = () => {
    switch (currentRole) {
      case "FARMER": return "/dashboard/farmer";
      case "BUYER": return "/dashboard/buyer";
      case "EQUIPMENT_OWNER": return "/dashboard/equipment";
      case "VETERINARY_EXPERT": return "/dashboard/veterinary";
      case "DELIVERY_PARTNER": return "/dashboard/delivery";
      case "ADMIN": return "/dashboard/admin";
      default: return "/dashboard/farmer";
    }
  };

  const commonMenuItems = [
    { label: "Profile", href: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
    { label: "Settings", href: "/dashboard/profile", icon: <Settings className="w-4 h-4" /> },
  ];

  const getMenuItems = () => {
    switch (currentRole) {
      case "FARMER":
        return [
          { label: "Dashboard", href: "/dashboard/farmer", icon: <Home className="w-4 h-4" /> },
          { label: "Weather", href: "/dashboard/farmer#weather", icon: <CloudSun className="w-4 h-4" /> },
          { label: "Crop Recommendation", href: "/dashboard/farmer#crop-recommendations", icon: <Sprout className="w-4 h-4" /> },
          { label: "Equipment Rental", href: "/equipment", icon: <Tractor className="w-4 h-4" /> },
          { label: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
          { label: "My Products", href: "/dashboard/farmer#my-products", icon: <Store className="w-4 h-4" /> },
          { label: "Veterinary", href: "/veterinary", icon: <PawPrint className="w-4 h-4" /> },
          { label: "Government Schemes", href: "/schemes", icon: <FileText className="w-4 h-4" /> },
          { label: "Profile", href: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
        ];
      case "BUYER":
        return [
          { label: "Dashboard", href: "/dashboard/buyer", icon: <Home className="w-4 h-4" /> },
          { label: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
          { label: "Cart", action: toggleCart, icon: <ShoppingCart className="w-4 h-4" /> },
          { label: "My Orders", href: "/dashboard/buyer", icon: <ClipboardList className="w-4 h-4" /> },
          { label: "Profile", href: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
        ];
      case "EQUIPMENT_OWNER":
        return [
          { label: "Dashboard", href: "/dashboard/equipment", icon: <Home className="w-4 h-4" /> },
          { label: "My Equipment", href: "/dashboard/equipment", icon: <Tractor className="w-4 h-4" /> },
          { label: "Rental Requests", href: "/dashboard/equipment", icon: <Bell className="w-4 h-4" /> },
          { label: "Active Rentals", href: "/dashboard/equipment", icon: <ClipboardList className="w-4 h-4" /> },
          { label: "Rental History", href: "/dashboard/equipment", icon: <Store className="w-4 h-4" /> },
          { label: "Profile", href: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
        ];
      case "VETERINARY_EXPERT":
        return [
          { label: "Dashboard", href: "/dashboard/veterinary", icon: <Home className="w-4 h-4" /> },
          { label: "Appointments", href: "/dashboard/veterinary", icon: <ClipboardList className="w-4 h-4" /> },
          { label: "Consultations", href: "/dashboard/veterinary", icon: <MessageSquare className="w-4 h-4" /> },
          { label: "Schedule", href: "/dashboard/veterinary", icon: <Settings className="w-4 h-4" /> },
          { label: "Profile", href: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
        ];
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/dashboard/admin", icon: <Home className="w-4 h-4" /> },
          { label: "Users", href: "/dashboard/admin", icon: <User className="w-4 h-4" /> },
          { label: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
          { label: "Products", href: "/dashboard/admin", icon: <Store className="w-4 h-4" /> },
          { label: "Stock", href: "/dashboard/admin", icon: <ClipboardList className="w-4 h-4" /> },
          { label: "Equipment", href: "/equipment", icon: <Tractor className="w-4 h-4" /> },
          { label: "Veterinary", href: "/veterinary", icon: <PawPrint className="w-4 h-4" /> },
          { label: "Government Schemes", href: "/schemes", icon: <FileText className="w-4 h-4" /> },
          { label: "System Management", href: "/dashboard/admin", icon: <Settings className="w-4 h-4" /> },
        ];
      case "DELIVERY_PARTNER":
        return [
          { label: "Dashboard", href: "/dashboard/delivery", icon: <Home className="w-4 h-4" /> },
          { label: "Deliveries", href: "/dashboard/delivery", icon: <Truck className="w-4 h-4" /> },
          ...commonMenuItems,
        ];
      default:
        return [
          { label: "Dashboard", href: "/dashboard/farmer", icon: <Home className="w-4 h-4" /> },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-[168px] bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col justify-between overflow-y-auto hidden lg:flex shrink-0">
      <div>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 rounded-xl bg-gray-900 flex items-center justify-center text-white group-hover:bg-gray-800 transition-colors shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm text-gray-900 tracking-tighter leading-none">
                AGRI-NOVA
              </span>
              <span className="text-[8px] font-semibold text-gray-400 tracking-wide mt-0.5">
                Smart Agriculture Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-0.5">
          {menuItems.map((item: any) => {
            const isActive = item.href ? pathname === item.href && item.label === "Dashboard" : false;
            
            const className = `flex items-center w-full space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`;

            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={className}
                >
                  <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={className}
              >
                <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-2 border-t border-gray-100 space-y-1">
        <Link
          href="/"
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <span>Back to Website</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
