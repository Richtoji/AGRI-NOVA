"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CartPanel } from "../marketplace/CartPanel";
import { useAuthRole } from "@/lib/context/AuthRoleContext";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCartOpen, toggleCart, cartItems, updateCartItemQuantity, removeFromCart } = useAuthRole();

  return (
    <div className="flex h-screen w-full bg-light-bg overflow-hidden text-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
      
      <CartPanel 
        isOpen={isCartOpen}
        onClose={toggleCart}
        items={cartItems}
        onUpdateQuantity={updateCartItemQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
};
