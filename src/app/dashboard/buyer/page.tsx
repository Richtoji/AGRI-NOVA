"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search, 
  Eye, 
  RefreshCw, 
  Phone, 
  Mail,
  FileText, 
  ChevronRight, 
  X, 
  Calendar, 
  Building2, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Package,
  Layers,
  ThermometerSnowflake,
  ExternalLink,
  User
} from "lucide-react";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { SafeImage } from "@/components/ui/SafeImage";

interface OrderItemData {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    title: string;
    imageUrl: string;
    unit: string;
    category: string;
    price: number;
    location?: string;
  };
}

interface DeliveryTaskData {
  id: string;
  status: string;
  driver?: {
    name: string;
    phone: string;
  };
  pickupLocation?: string;
  deliveryLocation?: string;
}

interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: string;
  createdAt: string;
  orderItems: OrderItemData[];
  deliveries?: DeliveryTaskData[];
}

export default function BuyerDashboard() {
  const { currentUser, openCart, addToCart } = useAuthRole();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "escrow" | "addresses">("overview");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [confirmingInspectionId, setConfirmingInspectionId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/buyer/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load buyer orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleConfirmInspection = async (orderId: string) => {
    setConfirmingInspectionId(orderId);
    try {
      const res = await fetch("/api/buyer/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "CONFIRM_INSPECTION" })
      });
      if (res.ok) {
        setActionSuccessMessage(`Order ${orderId} verified & Escrow released to farmer.`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "DELIVERED" } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: "DELIVERED" } : null);
        }
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
    } catch (e) {
      console.error("Failed to confirm inspection", e);
    } finally {
      setConfirmingInspectionId(null);
    }
  };

  const handleReorder = async (order: OrderData) => {
    for (const item of order.orderItems) {
      await addToCart(item.product.id, item.quantity);
    }
    openCart();
  };

  // Metrics Calculations
  const activeOrders = orders.filter(o => o.status === "SHIPPED" || o.status === "PROCESSING" || o.status === "PENDING");
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED");
  const totalSpend = orders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? o.totalAmount : 0), 0);
  const escrowLockedAmount = activeOrders
    .filter(o => o.paymentMethod === "ESCROW")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const displayedActiveOrder = activeOrders[0] || orders[0];
  const distinctAddresses = Array.from(new Set(orders.map(o => o.deliveryAddress).filter(Boolean)));

  // Filtering orders for Order History tab
  const filteredOrders = orders.filter((o) => {
    const matchesQuery = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderItems.some(i => i.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.deliveryAddress || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "ALL") return matchesQuery;
    if (statusFilter === "ACTIVE") return matchesQuery && (o.status === "SHIPPED" || o.status === "PROCESSING" || o.status === "PENDING");
    if (statusFilter === "DELIVERED") return matchesQuery && o.status === "DELIVERED";
    if (statusFilter === "CANCELLED") return matchesQuery && o.status === "CANCELLED";
    return matchesQuery;
  });

  return (
    <RouteGuard allowedRoles={["BUYER"]}>
      <AppLayout>
        <div className="space-y-6 pb-12">
          
          {/* ================= SUCCESS BANNER NOTIFICATION ================= */}
          {actionSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs animate-fadeIn shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{actionSuccessMessage}</span>
              </div>
              <button 
                onClick={() => setActionSuccessMessage(null)}
                className="text-emerald-500 hover:text-emerald-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* ================= 1. NEAT CORPORATE BUYER HEADER ================= */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <Link 
              href="/dashboard/profile"
              className="flex items-center space-x-4 group cursor-pointer hover:opacity-95 transition-all"
              title="Click to view full profile details"
            >
              <div className="relative">
                <img
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt={currentUser?.name || "FreshBasket Supermarkets"}
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Verified Session" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {currentUser?.name || "FreshBasket Supermarkets"}
                  </h1>
                  <span className="inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                    {currentUser?.kycStatus === "VERIFIED" ? "Verified Corporate Buyer" : "Registered Buyer"}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Escrow Protected
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500 font-medium mt-1">
                  <span className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    {currentUser?.email || "buyer@agri-nova.com"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    {currentUser?.phone || "+91 98123 45678"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center text-emerald-600 font-semibold group-hover:underline">
                    View Profile Details &rarr;
                  </span>
                </div>
              </div>
            </Link>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-3 self-stretch sm:self-auto">
              <Link
                href="/dashboard/profile"
                className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
                title="View Full Profile Details"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline">Profile Details</span>
              </Link>

              <button
                onClick={fetchOrders}
                disabled={refreshing}
                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-gray-900" : ""}`} />
              </button>

              <Link
                href="/marketplace"
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                <span>Browse Marketplace</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </div>

          {/* ================= 2. NEAT METRICS KPI CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Active Cold-Chain Shipments */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Shipments</span>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {activeOrders.length}
                </div>
                <span className="text-[11px] font-semibold text-blue-600 flex items-center mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                  Live cold-chain transit
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Truck className="w-6 h-6" strokeWidth={1.75} />
              </div>
            </div>

            {/* KPI 2: Total Procurement Volume */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Purchases</span>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  ₹{totalSpend.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  100% Verified Farm-Gate
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShoppingBag className="w-6 h-6" strokeWidth={1.75} />
              </div>
            </div>

            {/* KPI 3: Escrow Protected Balance */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escrow Vault</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  ₹{escrowLockedAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] font-semibold text-amber-700 flex items-center mt-1">
                  <ShieldCheck className="w-3 h-3 mr-1 text-amber-600" />
                  Held until inspection
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
            </div>

            {/* KPI 4: Inspected & Delivered */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Orders</span>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {deliveredOrders.length}
                </div>
                <span className="text-[11px] font-semibold text-gray-500 flex items-center mt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  Zero quality disputes
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-700">
                <Package className="w-6 h-6" strokeWidth={1.75} />
              </div>
            </div>

          </div>

          {/* ================= 3. SEGMENTED NAVIGATION TABS ================= */}
          <div className="flex border-b border-gray-200/80 gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 transition-all flex items-center space-x-2 border-b-2 -mb-[1px] ${
                activeTab === "overview"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Live Shipment & Overview</span>
              {activeOrders.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-3 transition-all flex items-center space-x-2 border-b-2 -mb-[1px] ${
                activeTab === "orders"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order History & Invoices</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("escrow")}
              className={`pb-3 transition-all flex items-center space-x-2 border-b-2 -mb-[1px] ${
                activeTab === "escrow"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Escrow & Inspection Policy</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`pb-3 transition-all flex items-center space-x-2 border-b-2 -mb-[1px] ${
                activeTab === "addresses"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Delivery Hubs</span>
            </button>
          </div>

          {/* ================= TAB 1: OVERVIEW & LIVE SHIPMENT ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Live Cold-Chain Tracking Card */}
              {displayedActiveOrder ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
                  
                  {/* Tracking Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-black text-gray-900">
                          Live Cold-Chain Shipment Dispatch
                        </h2>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>Tracking Order ID:</span>
                        <span className="font-mono font-bold text-gray-900">{displayedActiveOrder.id}</span>
                        <button 
                          onClick={() => handleCopyOrderId(displayedActiveOrder.id)}
                          className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded text-gray-400"
                          title="Copy ID"
                        >
                          {copiedOrderId === displayedActiveOrder.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-gray-300">•</span>
                        <span>Placed on {new Date(displayedActiveOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span>{displayedActiveOrder.status === "DELIVERED" ? "DELIVERED & INSPECTED" : "COLD-CHAIN IN TRANSIT"}</span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedOrder(displayedActiveOrder)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>

                  {/* Cold-Chain Transit Sensor Pill */}
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-xs">
                        <ThermometerSnowflake className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-900">Cold-Chain Temperature Lock</div>
                        <div className="text-[11px] text-blue-700">
                          {displayedActiveOrder.status === "DELIVERED" 
                            ? "Produce Inspected & Received (Ambient Log: 2°C - 6°C)"
                            : "IoT Cold-Chain Monitored Transit (Optimal Range: 2°C - 6°C)"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-500 font-medium">Logistics Status:</span>
                      <span className="font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-blue-100">
                        {displayedActiveOrder.status === "DELIVERED" 
                          ? "Delivered & Inspected" 
                          : displayedActiveOrder.status === "SHIPPED" 
                          ? "Live Cold-Chain Dispatch" 
                          : "Order Processing"}
                      </span>
                    </div>
                  </div>

                  {/* 4-Stage Stepper Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-2">
                    {[
                      { 
                        title: "Order Verified", 
                        desc: "Payment in Agri-Vault", 
                        time: new Date(displayedActiveOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                        done: true,
                        active: false 
                      },
                      { 
                        title: "Farm Harvest & Pack", 
                        desc: "Quality pre-check passed", 
                        time: displayedActiveOrder.status === "PENDING" ? "In Preparation" : "Completed", 
                        done: displayedActiveOrder.status !== "PENDING",
                        active: displayedActiveOrder.status === "PENDING" 
                      },
                      { 
                        title: "Cold-Chain In Transit", 
                        desc: "En route to delivery hub", 
                        time: displayedActiveOrder.status === "SHIPPED" ? "In Transit" : (displayedActiveOrder.status === "DELIVERED" ? "Completed" : "Pending Dispatch"), 
                        done: displayedActiveOrder.status === "DELIVERED" || displayedActiveOrder.status === "SHIPPED",
                        active: displayedActiveOrder.status === "SHIPPED" 
                      },
                      { 
                        title: "Gate Delivery & Inspection", 
                        desc: "OTP quality acceptance", 
                        time: displayedActiveOrder.status === "DELIVERED" ? "Delivered & Verified" : "Pending Inspection", 
                        done: displayedActiveOrder.status === "DELIVERED",
                        active: false 
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="relative flex flex-col space-y-2 p-3 rounded-2xl bg-gray-50/60 border border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                            step.done 
                              ? "bg-gray-900 text-white" 
                              : step.active 
                              ? "bg-blue-600 text-white animate-pulse" 
                              : "bg-gray-200 text-gray-500"
                          }`}>
                            {step.done ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                          </div>
                          <span className={`text-xs font-bold ${step.done || step.active ? "text-gray-900" : "text-gray-400"}`}>
                            {step.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 pl-9 leading-tight">{step.desc}</p>
                        <div className="text-[10px] text-gray-400 pl-9 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.time}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Logistics Driver & Destination Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Driver Card */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                        <Truck className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Cold-Chain Logistics</span>
                        <div className="text-xs font-bold text-gray-900 truncate mt-0.5">
                          {displayedActiveOrder.deliveries?.[0]?.driver?.name 
                            ? `Driver: ${displayedActiveOrder.deliveries[0].driver.name}`
                            : (displayedActiveOrder.status === "DELIVERED" ? "Verified Logistics Completed" : "AgriExpress Logistics Fleet")}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 flex items-center space-x-2">
                          {displayedActiveOrder.deliveries?.[0]?.driver?.phone ? (
                            <a href={`tel:${displayedActiveOrder.deliveries[0].driver.phone}`} className="text-blue-600 font-bold hover:underline flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {displayedActiveOrder.deliveries[0].driver.phone}
                            </a>
                          ) : (
                            <span className="text-gray-500">
                              {displayedActiveOrder.status === "DELIVERED" ? "Delivery OTP Verified" : "Direct Farm-Gate Transit"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Destination Address Card */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Delivery Destination</span>
                        <p className="text-xs text-gray-800 font-semibold line-clamp-2 mt-0.5">
                          {displayedActiveOrder.deliveryAddress}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Inspection Release Action Box */}
                  {displayedActiveOrder.status !== "DELIVERED" && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-900">Produce Inspection Awaiting Your Confirmation</h4>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Upon receiving and physically inspecting produce freshness at the gate, click below to release escrow funds to the farmer.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmInspection(displayedActiveOrder.id)}
                        disabled={confirmingInspectionId === displayedActiveOrder.id}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1 shrink-0"
                      >
                        {confirmingInspectionId === displayedActiveOrder.id ? (
                          <span>Releasing Escrow...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span>Confirm Inspection & Release Escrow</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Active Shipments Right Now</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    All your previous agricultural shipments have been delivered and inspected. Explore the marketplace to initiate fresh farm procurements.
                  </p>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors mt-2"
                  >
                    Start Procurement
                  </Link>
                </div>
              )}

              {/* Recent Orders Quick Glance */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span>Recent Procurement Orders</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center"
                  >
                    <span>View All ({orders.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all cursor-pointer bg-white flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-gray-900">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : order.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod}
                        </p>

                        <div className="mt-3 space-y-1.5">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs">
                              <div className="w-6 h-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                <SafeImage src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-gray-800 font-medium truncate flex-1">{item.product.title}</span>
                              <span className="text-gray-500 font-semibold text-[11px] shrink-0">{item.quantity} {item.product.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Payable:</span>
                        <span className="text-sm font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: ORDER HISTORY & INVOICES ================= */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-5 animate-fadeIn">
              
              {/* Header with Search and Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-black text-gray-900">Procurement Orders & Invoices</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Full itemized history with escrow status and cold-chain receipts.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Order ID, produce..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-gray-900 transition-all"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-gray-900 cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">In Transit / Active</option>
                    <option value="DELIVERED">Delivered & Approved</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-sm font-bold text-gray-700">No orders matching your criteria</p>
                  <p className="text-xs text-gray-400">Try adjusting your search query or status filter.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-gray-900">{order.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : order.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {order.paymentMethod}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-2">
                            <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="truncate">{order.orderItems.map(i => `${i.product.title} (${i.quantity}${i.product.unit})`).join(", ")}</span>
                          </div>

                          <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                            Dest: {order.deliveryAddress}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end space-x-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                        <div className="text-left lg:text-right">
                          <div className="text-[10px] text-gray-400 font-medium">Grand Total</div>
                          <div className="text-sm font-black text-gray-900">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 3: ESCROW & INSPECTION POLICY ================= */}
          {activeTab === "escrow" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Guarantee Highlight Card */}
              <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Agri-Vault Cold-Chain Escrow Framework</span>
                    </span>
                    <h2 className="text-2xl font-black mt-1">100% Buyer Protection & Quality Guarantee</h2>
                    <p className="text-xs text-gray-300 mt-1 max-w-xl">
                      Your purchase funds remain strictly locked in the Agri-Nova vault until you physically inspect produce grade, weight, and moisture upon arrival.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right">
                    <span className="text-[10px] text-gray-300 font-medium">Currently Vault Protected</span>
                    <div className="text-2xl font-black text-emerald-400">
                      ₹{escrowLockedAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* 4 Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      title: "1. Smart Contract Lock",
                      desc: "Payment authorized into RBI-compliant escrow vault upon strict checkout validation."
                    },
                    {
                      title: "2. Cold-Chain IoT Log",
                      desc: "Temperature monitored continuously from farm-gate loading to delivery bay."
                    },
                    {
                      title: "3. Gate Inspection Pass",
                      desc: "Buyer checks moisture, size grade, and packaging before signing OTP handover."
                    },
                    {
                      title: "4. Instant Release",
                      desc: "One click confirms release to farmer. 24-hour return window for any discrepancy."
                    }
                  ].map((pillar, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="text-xs font-black text-blue-300">{pillar.title}</div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspection Dispute Hotline Card */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Need Quality Dispute Resolution?</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Produce defect, weight variance, or transit delay? Our 24/7 Agro-Arbitration team resolves issues within 2 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href="tel:1800-425-AGRI"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    <span>1800-425-AGRI</span>
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 4: DELIVERY HUBS ================= */}
          {activeTab === "addresses" && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-black text-gray-900">Verified Corporate Delivery Hubs</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Pre-cleared unloading docks for temperature-controlled freight.</p>
                </div>
              </div>

              {distinctAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {distinctAddresses.map((address, idx) => (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-2xl border ${
                        idx === 0 
                          ? "border-2 border-gray-900 bg-gray-50/50" 
                          : "border border-gray-200 bg-white"
                      } space-y-3 relative`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          idx === 0 
                            ? "text-gray-900 bg-white border border-gray-200" 
                            : "text-gray-600 bg-gray-100"
                        }`}>
                          {idx === 0 ? "Primary Delivery Hub" : `Hub Location #${idx + 1}`}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Verified Dock
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          {currentUser?.name || "Corporate Buyer"}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {address}
                        </p>
                        {currentUser?.phone && (
                          <p className="text-xs text-gray-500 mt-1">
                            Contact: {currentUser.phone.startsWith("+") ? currentUser.phone : `+91 ${currentUser.phone}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-3">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center mx-auto text-gray-400 shadow-xs">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">No Delivery Hubs Registered Yet</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Your unloading hubs and delivery addresses will automatically appear here once you place procurement orders through checkout.
                  </p>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors mt-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                    <span>Browse Marketplace</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ================= ORDER DETAILS & INVOICE MODAL ================= */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono font-black text-gray-900">{selectedOrder.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedOrder.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
                  
                  {/* Itemized Produce List */}
                  <div className="space-y-3">
                    <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
                      Procured Produce Items ({selectedOrder.orderItems.length})
                    </span>

                    <div className="space-y-2.5">
                      {selectedOrder.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                              <SafeImage src={item.product?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"} alt={item.product?.title || "Produce Item"} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{item.product?.title || "Farm Produce"}</h4>
                              <p className="text-[10px] text-gray-500">₹{item.unitPrice} per {item.product?.unit || "unit"}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-bold text-gray-900">{item.quantity} {item.product?.unit || "unit"}</div>
                            <div className="text-[11px] text-gray-500 font-semibold">₹{(item.quantity * item.unitPrice).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Price Breakdown */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex justify-between text-gray-500">
                      <span>Produce Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(selectedOrder.orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)).toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.totalAmount > selectedOrder.orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) && (
                      <div className="flex justify-between text-gray-500">
                        <span>Cold-Chain Transit Freight</span>
                        <span className="font-semibold text-gray-900">
                          ₹{(selectedOrder.totalAmount - selectedOrder.orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Payment Method</span>
                      <span className="font-bold text-blue-600">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">Grand Total Paid</span>
                      <span className="font-black text-gray-900 text-base">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Delivery Address & Instructions */}
                  <div className="space-y-1">
                    <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
                      Delivery Address & Slot
                    </span>
                    <p className="p-3 bg-gray-50 rounded-xl text-gray-700 leading-relaxed font-medium">
                      {selectedOrder.deliveryAddress}
                    </p>
                  </div>

                  {/* Escrow Release Button inside Modal if not delivered */}
                  {selectedOrder.status !== "DELIVERED" && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-emerald-900">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs">Confirm Quality & Release Escrow</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Physically verified produce weight and quality? Releasing escrow credits the farmer's account immediately.
                      </p>
                      <button
                        onClick={() => handleConfirmInspection(selectedOrder.id)}
                        disabled={confirmingInspectionId === selectedOrder.id}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-xs"
                      >
                        {confirmingInspectionId === selectedOrder.id ? "Releasing Escrow..." : "Confirm & Release Escrow"}
                      </button>
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyOrderId(selectedOrder.id)}
                    className="text-gray-500 hover:text-gray-900 font-bold text-xs flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy Order ID</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Close Invoice
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </AppLayout>
    </RouteGuard>
  );
}
