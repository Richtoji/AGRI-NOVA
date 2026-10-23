"use client";

import React, { Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { MarketplaceFeed } from "@/components/marketplace/MarketplaceFeed";
import { Loader2 } from "lucide-react";

export default function MarketplacePage() {
  return (
    <RouteGuard allowedRoles={["FARMER", "BUYER", "ADMIN", "EQUIPMENT_OWNER", "VETERINARY_EXPERT", "DELIVERY_PARTNER"]}>
      <AppLayout>
        <Suspense fallback={
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-500">Loading marketplace commodities...</p>
          </div>
        }>
          <MarketplaceFeed />
        </Suspense>
      </AppLayout>
    </RouteGuard>
  );
}
