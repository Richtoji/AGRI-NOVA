"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Search, ShoppingBag, Star, ShieldCheck, Check, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";
import { FeedStore } from "@/components/marketplace/FeedStore";
import { VetPharmacy } from "@/components/marketplace/VetPharmacy";
import { SafeImage } from "@/components/ui/SafeImage";
import { RouteGuard } from "@/components/layout/RouteGuard";

export default function MarketplacePage() {
  const { addToCart } = useAuthRole();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [subMarket, setSubMarket] = useState<"produce" | "feed" | "vet">("produce");
  const [sortBy, setSortBy] = useState("price-asc");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    "All", "Fresh Vegetables", "Fruits", "Rice & Grains", "Pulses", "Tubers",
    "Kerala Spices", "Plantation Products", "Coconut Products", "Organic Farming",
    "Fertilizers & Manure", "Farming Tools", "Nursery Supplies", "Dairy Products",
    "Poultry Products", "Honey & Beekeeping", "Fish & Aquaculture", "Livestock"
  ];

  const locations = [
    "All Locations", "Palakkad", "Wayanad", "Idukki", "Ernakulam",
    "Thrissur", "Kottayam", "Alappuzha", "Kollam", "Kannur", "Malappuram"
  ];

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesLocation = selectedLocation === "All Locations" || (p.location && p.location.toLowerCase() === selectedLocation.toLowerCase());
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.localName && p.localName.toLowerCase().includes(query)) ||
        (p.location && p.location.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query);
      const matchesRating = p.rating >= minRating;
      return matchesCategory && matchesLocation && matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating-desc") return b.rating - a.rating;
      return 0;
    });

  const handleAddToCart = async (product: any) => {
    // Default quantity is 1 for now, user can adjust in CartPanel
    const result = await addToCart(product.id, 1);
    if (result.success) {
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 1500);
    } else {
      alert(result.error);
    }
  };

  return (
    <RouteGuard allowedRoles={["FARMER", "BUYER", "ADMIN"]}>
      <AppLayout>
      <div className="space-y-5 pb-6">

        {/* ===== HEADER ===== */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-gray-700" strokeWidth={1.5} />
              Agri-Commerce Marketplace
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Directly connect with farmers, buyers, and suppliers.</p>
          </div>

          {/* Sub-market toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {[
              { key: "produce", label: "Farm Produce" },
              { key: "feed", label: "Feed & Seeds" },
              { key: "vet", label: "Vet Pharmacy" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSubMarket(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  subMarket === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== SUB MARKETS ===== */}
        {subMarket === "feed" ? (
          <FeedStore />
        ) : subMarket === "vet" ? (
          <VetPharmacy />
        ) : (
          <div className="space-y-5">

            {/* Filter Bar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, e.g. Tomatoes..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1.5 text-gray-500">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Filters:</span>
                  </div>
                  <select
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>

                  <select
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>

                  <select
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-gray-500 font-semibold">
                Showing <span className="text-gray-900 font-black">{filteredProducts.length}</span> results
              </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col group relative hover:border-gray-200 hover:shadow-sm transition-all">
                  
                  {/* Organic Badge */}
                  {(product as any).isOrganic && (
                    <div className="absolute top-3 right-3 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-full z-10 shadow-sm flex items-center space-x-0.5">
                      <Check className="w-2.5 h-2.5 mr-0.5" />
                      Organic
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-50">
                    <SafeImage
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.title}</h3>
                      <div className="flex items-center space-x-0.5 text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-lg shrink-0 ml-2">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    {product.localName && (
                      <p className="text-[10px] text-gray-400 mb-2 italic font-medium">Local: {product.localName}</p>
                    )}

                    <div className="flex items-center space-x-1.5 mb-3">
                      <ShieldCheck className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] text-gray-600 font-semibold truncate">{(product as any).sellerName}</span>
                      {product.location && (
                        <>
                          <span className="text-gray-200">•</span>
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500 truncate">{product.location}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-50">
                      <div>
                        <div className="flex items-baseline space-x-0.5">
                          <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                          <span className="text-xs text-gray-500 font-medium">/{product.unit}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">Min: {(product as any).minOrderQuantity} {product.unit}</p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                          addedItem === product.id
                            ? "bg-gray-100 text-gray-700 border border-gray-200"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        {addedItem === product.id ? (
                          <><Check className="w-3.5 h-3.5 mr-1" /> Added</>
                        ) : (
                          <><ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </AppLayout>
    </RouteGuard>
  );
}
