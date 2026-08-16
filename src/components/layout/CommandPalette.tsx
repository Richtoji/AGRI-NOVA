"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthRole, RoleType } from "@/lib/context/AuthRoleContext";
import { Search, Sprout, Tractor, ShoppingBag, Stethoscope, Truck, ShieldCheck, Sun, Moon, Sparkles, X } from "lucide-react";

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { login, toggleTheme, theme } = useAuthRole();

  const switchRole = async (role: RoleType) => {
    let demoEmail = `${role.toLowerCase()}@agri-nova.com`;
    if (role === "EQUIPMENT_OWNER") demoEmail = "equipment@agri-nova.com";
    if (role === "VETERINARY_EXPERT") demoEmail = "vet@agri-nova.com";
    if (role === "DELIVERY_PARTNER") demoEmail = "delivery@agri-nova.com";
    if (role === "ADMIN") demoEmail = "admin@agri-nova.com";
    
    await login(demoEmail, "password123", role);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = [
    { id: "farmer", title: "Switch to Farmer Workspace", category: "Navigation", icon: <Sprout className="w-4 h-4 text-gray-600" />, action: async () => { await switchRole("FARMER"); router.push("/dashboard/farmer"); } },
    { id: "buyer", title: "Switch to Buyer Workspace", category: "Navigation", icon: <ShoppingBag className="w-4 h-4 text-blue-400" />, action: async () => { await switchRole("BUYER"); router.push("/dashboard/buyer"); } },
    { id: "equipment", title: "Switch to Equipment Rental Dashboard", category: "Navigation", icon: <Tractor className="w-4 h-4 text-amber-400" />, action: async () => { await switchRole("EQUIPMENT_OWNER"); router.push("/dashboard/equipment"); } },
    { id: "vet", title: "Switch to Veterinary Doctor Portal", category: "Navigation", icon: <Stethoscope className="w-4 h-4 text-rose-400" />, action: async () => { await switchRole("VETERINARY_EXPERT"); router.push("/dashboard/veterinary"); } },
    { id: "delivery", title: "Switch to Delivery Logistics Hub", category: "Navigation", icon: <Truck className="w-4 h-4 text-purple-400" />, action: async () => { await switchRole("DELIVERY_PARTNER"); router.push("/dashboard/delivery"); } },
    { id: "admin", title: "Switch to Enterprise Admin Command", category: "Navigation", icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />, action: async () => { await switchRole("ADMIN"); router.push("/dashboard/admin"); } },
    { id: "theme", title: `Toggle Theme (Current: ${theme})`, category: "Settings", icon: theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />, action: () => toggleTheme() },
    { id: "marketplace", title: "Browse Commodities Marketplace", category: "Direct Links", icon: <ShoppingBag className="w-4 h-4 text-gray-700" />, action: () => router.push("/marketplace") },
    { id: "schemes", title: "View Govt Schemes & Subsidies", category: "Direct Links", icon: <Sparkles className="w-4 h-4 text-blue-400" />, action: () => router.push("/schemes") },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommandClick = (cmdAction: () => void) => {
    cmdAction();
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl overflow-hidden border border-gray-700/30 shadow-2xl flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Bar Input */}
        <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-gray-800 shrink-0">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search workspace..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleCommandClick(cmd.action)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs text-gray-300 hover:text-white hover:bg-gray-900/10 hover:border hover:border-gray-700/20 transition-all font-medium"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-1.5 rounded-lg bg-gray-800 border border-gray-700">{cmd.icon}</span>
                  <span>{cmd.title}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  {cmd.category}
                </span>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-gray-500">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between items-center bg-gray-900/30 shrink-0">
          <span>Navigate with arrows, press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono text-[9px]">Enter</kbd> to select</span>
          <span>Close with <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono text-[9px]">Esc</kbd></span>
        </div>

      </div>
    </div>
  );
};
