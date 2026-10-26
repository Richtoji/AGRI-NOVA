"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Check, 
  MapPin, 
  SlidersHorizontal, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag
} from "lucide-react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { SafeImage } from "@/components/ui/SafeImage";
import { FeedStore } from "@/components/marketplace/FeedStore";
import { VetPharmacy } from "@/components/marketplace/VetPharmacy";
import { MyListings } from "@/components/marketplace/MyListings";

interface MarketplaceFeedProps {
  initialSubMarket?: "produce" | "feed" | "vet" | "my-listings";
}

export function MarketplaceFeed({ initialSubMarket = "produce" }: MarketplaceFeedProps) {
  const { addToCart, currentRole, openCart } = useAuthRole();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [validationToast, setValidationToast] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [subMarket, setSubMarket] = useState<"produce" | "feed" | "vet" | "my-listings">(initialSubMarket);
  const [sortBy, setSortBy] = useState("price-asc");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [minRating, setMinRating] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = [
    "All", 
    "Fresh Vegetables", 
    "Fruits", 
    "Rice & Grains", 
    "Pulses", 
    "Tubers",
    "Kerala Spices", 
    "Plantation Products", 
    "Coconut Products", 
    "Dairy Products",
    "Poultry Products", 
    "Honey & Beekeeping", 
    "Fish & Aquaculture", 
    "Livestock",
    "Traditional Kerala Agricultural Products",
    "Vegetables", 
    "Spices", 
    "Dairy"
  ];

  const locations = [
    "All Locations", 
    "Palakkad", 
    "Wayanad", 
    "Idukki", 
    "Ernakulam",
    "Thrissur", 
    "Kottayam", 
    "Alappuzha", 
    "Kollam", 
    "Kannur", 
    "Malappuram",
    "Kozhikode",
    "Thiruvananthapuram"
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // If "All", show any product except feed/medicine when in "produce" mode
        const isFeedOrVet = ["Cattle Feed", "Poultry Feed", "Fish Feed", "Goat Feed", "Pig Feed", "Vaccine", "Antibiotic", "Dewormer", "Supplement", "Veterinary Medicine"].includes(p.category);
        
        if (subMarket === "produce" && isFeedOrVet && selectedCategory === "All") {
          return false;
        }

        const matchesCategory = selectedCategory === "All" || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
        const matchesLocation = selectedLocation === "All Locations" || (p.location && p.location.toLowerCase() === selectedLocation.toLowerCase());
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.localName && p.localName.toLowerCase().includes(query)) ||
          (p.location && p.location.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query));
        
        const rating = typeof p.rating === "number" ? p.rating : 4.5;
        const matchesRating = rating >= minRating;
        return matchesCategory && matchesLocation && matchesSearch && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, selectedCategory, selectedLocation, searchQuery, minRating, sortBy, subMarket]);

  const handleAddToCart = async (product: any) => {
    const min = product.minOrderQuantity || 1;
    const max = product.stockQuantity !== undefined ? product.stockQuantity : 99999;
    const rawQty = quantities[product.id];
    const qty = rawQty !== undefined ? rawQty : min;

    if (isNaN(qty) || !Number.isInteger(qty) || qty < min) {
      setValidationToast(`Minimum order quantity for ${product.title} is ${min} ${product.unit}.`);
      return;
    }
    if (qty > max) {
      setValidationToast(`Requested quantity (${qty} ${product.unit}) exceeds available stock (${max} ${product.unit}).`);
      return;
    }

    setValidationToast(null);
    const result = await addToCart(product.id, qty);
    if (result.success) {
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 1500);
    } else {
      setValidationToast(result.error || "Failed to add product to cart.");
    }
  };

  const handleBuyNow = async (product: any) => {
    const min = product.minOrderQuantity || 1;
    const max = product.stockQuantity !== undefined ? product.stockQuantity : 99999;
    const rawQty = quantities[product.id];
    const qty = rawQty !== undefined ? rawQty : min;

    if (isNaN(qty) || !Number.isInteger(qty) || qty < min) {
      setValidationToast(`Minimum order quantity for ${product.title} is ${min} ${product.unit}.`);
      return;
    }
    if (qty > max) {
      setValidationToast(`Requested quantity (${qty} ${product.unit}) exceeds available stock (${max} ${product.unit}).`);
      return;
    }

    setValidationToast(null);
    const result = await addToCart(product.id, qty);
    if (result.success) {
      setAddedItem(product.id);
      openCart();
    } else {
      setValidationToast(result.error || "Failed to proceed to checkout.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ===== MARKETPLACE TOP CONTROL BAR ===== */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                Direct Farm Marketplace
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Verified farm-gate produce, wholesale agricultural commodities, and inputs.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-market toggle */}
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto max-w-full no-scrollbar touch-scroll">
          {[
            { key: "produce", label: "Farm Produce" },
            { key: "feed", label: "Feed & Seeds" },
            { key: "vet", label: "Vet Pharmacy" },
            ...(currentRole !== "BUYER" ? [{ key: "my-listings", label: "My Listings" }] : []),
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSubMarket(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                subMarket === tab.key
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Toast */}
      {validationToast && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-bold">{validationToast}</span>
          </div>
          <button
            onClick={() => setValidationToast(null)}
            className="text-red-400 hover:text-red-600 font-black text-sm px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===== SUB-MARKET VIEWS ===== */}
      {subMarket === "my-listings" ? (
        <MyListings />
      ) : subMarket === "feed" ? (
        <FeedStore products={products} />
      ) : subMarket === "vet" ? (
        <VetPharmacy products={products} />
      ) : (
        <div className="space-y-5">

          {/* Filter Bar */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search produce (e.g. Tomatoes, Pepper, Matta Rice, Tapioca)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 text-gray-500 text-xs font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters:</span>
                </div>

                <select
                  className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
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

                {(searchQuery || selectedCategory !== "All" || selectedLocation !== "All Locations") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedLocation("All Locations");
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-500 font-semibold">
              Showing <span className="text-gray-900 font-black">{filteredProducts.length}</span> agricultural items
            </span>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-500">Loading marketplace commodities...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No products match your criteria</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try searching with different keywords or resetting your location and category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedLocation("All Locations");
                }}
                className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col group relative hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  {/* Organic Badge */}
                  {product.isOrganic && (
                    <div className="absolute top-3 right-3 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-full z-10 shadow-xs flex items-center space-x-0.5">
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
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.title}</h3>
                      <div className="flex items-center space-x-0.5 text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-lg shrink-0 ml-2">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating || 4.8}</span>
                      </div>
                    </div>

                    {product.localName && (
                      <p className="text-[10px] text-gray-400 mb-2 italic font-medium">Local: {product.localName}</p>
                    )}

                    <div className="flex items-center space-x-1.5 mb-3">
                      <ShieldCheck className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] text-gray-600 font-semibold truncate">{product.sellerName || "Verified Farm"}</span>
                      {product.location && (
                        <>
                          <span className="text-gray-200">•</span>
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500 truncate">{product.location}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline space-x-0.5">
                            <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                            <span className="text-xs text-gray-500 font-medium">/{product.unit}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                            Min Order: {product.minOrderQuantity || 1} {product.unit}
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                          <button 
                            type="button"
                            className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold border-r border-gray-200 disabled:opacity-40 cursor-pointer"
                            disabled={(quantities[product.id] || product.minOrderQuantity || 1) <= (product.minOrderQuantity || 1)}
                            onClick={() => {
                              const min = product.minOrderQuantity || 1;
                              const current = quantities[product.id] || min;
                              if (current > min) setQuantities({...quantities, [product.id]: current - 1});
                            }}
                          >-</button>
                          <input 
                            type="number"
                            min={product.minOrderQuantity || 1}
                            max={product.stockQuantity || 99999}
                            className="w-12 text-center text-xs font-bold text-gray-900 border-none outline-none p-1 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={quantities[product.id] || product.minOrderQuantity || 1}
                            onChange={(e) => {
                              const min = product.minOrderQuantity || 1;
                              const max = product.stockQuantity !== undefined ? product.stockQuantity : 99999;
                              let val = parseInt(e.target.value, 10);
                              if (isNaN(val)) val = min;
                              if (val < min) val = min;
                              if (val > max) val = max;
                              setQuantities({...quantities, [product.id]: val});
                            }}
                          />
                          <button 
                            type="button"
                            className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold border-l border-gray-200 disabled:opacity-40 cursor-pointer"
                            disabled={(quantities[product.id] || product.minOrderQuantity || 1) >= (product.stockQuantity || 99999)}
                            onClick={() => {
                              const min = product.minOrderQuantity || 1;
                              const max = product.stockQuantity !== undefined ? product.stockQuantity : 99999;
                              const current = quantities[product.id] || min;
                              if (current < max) {
                                setQuantities({...quantities, [product.id]: current + 1});
                              }
                            }}
                          >+</button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`py-2 px-1.5 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer truncate ${
                            addedItem === product.id
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {addedItem === product.id ? (
                            <><Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" /> Added</>
                          ) : (
                            <><ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" /> <span className="truncate">Add to Cart</span></>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBuyNow(product)}
                          className="py-2 px-1.5 sm:py-2.5 sm:px-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-[11px] sm:text-xs font-black shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer truncate"
                        >
                          <span>⚡ Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
