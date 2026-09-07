"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { 
  Sprout, 
  Sun, 
  Moon, 
  ShoppingBag, 
  Tractor, 
  LayoutDashboard, 
  FileText, 
  Menu,
  X,
  LogOut,
  Settings,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const { currentRole, currentUser, isLoggedIn, logout, cartCount, theme, toggleTheme } = useAuthRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

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

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-gray-200 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-gray-100 transition-colors shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-bold text-lg text-gray-900 tracking-tight">
              AGRI-NOVA
            </span>
            <span className="text-[10px] font-semibold text-gray-900 uppercase tracking-wider -mt-1">
              Agriculture & Commerce
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-gray-600 ml-4 mr-4">
          <Link href="/" className="hover:text-gray-900 transition-colors whitespace-nowrap">
            Home
          </Link>
          <Link href="/marketplace" className="hover:text-gray-900 transition-colors flex items-center space-x-1.5 whitespace-nowrap">
            <ShoppingBag className="w-3.5 h-3.5 text-gray-900" />
            <span>Marketplace</span>
          </Link>
          <Link href="/equipment" className="hover:text-gray-900 transition-colors flex items-center space-x-1.5 whitespace-nowrap">
            <Tractor className="w-3.5 h-3.5 text-amber-500" />
            <span>Machinery Rental</span>
          </Link>
          <Link href="/schemes" className="hover:text-gray-900 transition-colors flex items-center space-x-1.5 whitespace-nowrap">
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>Government Schemes</span>
          </Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors whitespace-nowrap">
            Contact
          </Link>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Quick Search Shortcut */}
          <button
            onClick={triggerCommandPalette}
            className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
            title="Search Platform"
          >
            <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>Search...</span>
          </button>

          {/* Cart Icon */}
          <Link
            href="/marketplace"
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5 text-gray-600 shrink-0" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-gray-700 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500 shrink-0" /> : <Moon className="w-5 h-5 text-indigo-500 shrink-0" />}
          </button>

          {isLoggedIn && currentUser ? (
            <>
              {/* Dashboard Button */}
              <Link
                href={getDashboardPath()}
                className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard ({currentRole.split('_')[0]})</span>
              </Link>

              {/* Profile / Settings Button */}
              <Link
                href="/dashboard/profile"
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
                title="Profile & Settings"
              >
                <Settings className="w-5 h-5 shrink-0" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-5 h-5 shrink-0" />
              </button>

              {/* User Avatar */}
              <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-gray-200 shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
                />
                <div className="flex flex-col text-xs leading-tight whitespace-nowrap">
                  <span className="font-semibold text-gray-900 truncate max-w-[120px]">{currentUser.name}</span>
                  <span className="text-[10px] text-gray-900 font-bold uppercase">{currentRole}</span>
                </div>
              </div>
            </>

          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/login">
                <Button size="sm" variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3 text-sm">
          <Link href="/" className="block py-2 font-semibold text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link href="/marketplace" className="block py-2 font-semibold text-gray-700 hover:text-gray-900">
            Marketplace
          </Link>
          <Link href="/equipment" className="block py-2 font-semibold text-gray-700 hover:text-gray-900">
            Machinery Rental
          </Link>
          <Link href="/schemes" className="block py-2 font-semibold text-gray-700 hover:text-gray-900">
            Government Schemes
          </Link>
          <Link href="/contact" className="block py-2 font-semibold text-gray-700 hover:text-gray-900">
            Contact Us
          </Link>

          {isLoggedIn ? (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <Link
                href={getDashboardPath()}
                className="block py-2.5 px-3 rounded-xl bg-gray-900 text-white font-semibold text-center"
              >
                Open {currentRole} Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="block py-2.5 px-3 rounded-xl bg-gray-50 text-gray-700 font-semibold text-center border border-gray-200"
              >
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 font-semibold text-center border border-rose-100"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Link href="/auth/login" className="block text-center">
                <Button size="sm" variant="outline" className="w-full text-gray-700 border-gray-300">Sign In</Button>
              </Link>
              <Link href="/auth/register" className="block text-center">
                <Button size="sm" className="w-full bg-gray-900 text-white">Register</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
