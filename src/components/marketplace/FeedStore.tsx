"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, Filter, Star, Info, CheckCircle2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { productImages } from "@/lib/productImages";

interface FeedItem {
  id: string;
  name: string;
  category: "Cattle" | "Poultry" | "Fish" | "Goat" | "Supplements";
  price: number;
  weight: string;
  rating: number;
  image: string;
  discount: number;
  stock: number;
  description: string;
}

export const FeedStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const feeds: FeedItem[] = [
    {
      id: "feed-1",
      name: "High-Protein Dairy Bovine Feed",
      category: "Cattle",
      price: 1450,
      weight: "50 kg",
      rating: 4.8,
      image: productImages.cattleFeed,
      discount: 10,
      stock: 45,
      description: "Optimized formulation for maximizing daily dairy milk production yield."
    },
    {
      id: "feed-2",
      name: "Layer Poultry Starter Feed Crumble",
      category: "Poultry",
      price: 1800,
      weight: "40 kg",
      rating: 4.7,
      image: productImages.poultryFeed,
      discount: 5,
      stock: 28,
      description: "Calcium-dense crumbles ideal for egg-laying hens and broiler growth acceleration."
    },
    {
      id: "feed-3",
      name: "Floating Aquaculture Fish Feed Pellets",
      category: "Fish",
      price: 2100,
      weight: "35 kg",
      rating: 4.9,
      image: productImages.fishFeed,
      discount: 15,
      stock: 60,
      description: "Specialized floating micro-pellets formulated for Tilapia and Rohu carp fingerlings."
    },
    {
      id: "feed-4",
      name: "Organic Caprine Goat & Sheep Feed",
      category: "Goat",
      price: 1200,
      weight: "50 kg",
      rating: 4.6,
      image: productImages.goatFeed,
      discount: 0,
      stock: 12,
      description: "High-fiber feed blend loaded with mineral mixtures to assist in body weight gain."
    },
    {
      id: "feed-5",
      name: "Premium Veterinary Mineral Supplement",
      category: "Supplements",
      price: 850,
      weight: "5 kg",
      rating: 4.9,
      image: productImages.calciumSupplement,
      discount: 8,
      stock: 80,
      description: "Essential trace minerals, calcium, and vitamin D3 to enhance cattle bone integrity."
    }
  ];

  const handleAddToCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id, qty: 1 }];
    });
  };

  const handleCheckout = () => {
    setCart([]);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
    }, 1500);
  };

  const filteredFeeds = feeds.filter((feed) => {
    const matchesSearch = feed.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || feed.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Catalog */}
      <div className="lg:col-span-8 space-y-5">
        
        {/* Search & Category Pills */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed formulas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "Cattle", "Poultry", "Fish", "Goat", "Supplements"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeeds.map((feed) => {
            const finalPrice = feed.discount > 0 ? feed.price * (1 - feed.discount / 100) : feed.price;

            return (
              <div key={feed.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="relative rounded-t-2xl overflow-hidden aspect-video bg-gray-50">
                  <img src={feed.image} alt={feed.name} className="w-full h-full object-cover" />
                  {feed.discount > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-gray-900 text-white font-black text-[9px] uppercase tracking-wider">
                      {feed.discount}% Off
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {feed.category} Feed
                    </span>
                    <span className="flex items-center text-[10px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-lg">
                      <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                      {feed.rating}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">{feed.name}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed flex-1">{feed.description}</p>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-medium">Price per {feed.weight} bag</div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-sm font-black text-gray-900">₹{finalPrice.toFixed(0)}</span>
                        {feed.discount > 0 && (
                          <span className="text-[10px] line-through text-gray-400">₹{feed.price}</span>
                        )}
                      </div>
                    </div>

                    <button onClick={() => handleAddToCart(feed.id)} className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center">
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Cart Sidebar */}
      <div className="lg:col-span-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
            <ShoppingCart className="w-4 h-4 text-gray-700" />
            <span>Feed Order Cart ({cart.length})</span>
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs font-medium">
              No feed items selected. Click "Add to Cart" to start.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {cart.map((cartItem) => {
                  const feed = feeds.find((f) => f.id === cartItem.id)!;
                  const finalPrice = feed.discount > 0 ? feed.price * (1 - feed.discount / 100) : feed.price;

                  return (
                    <div key={cartItem.id} className="flex justify-between items-center text-[11px] text-gray-600">
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{feed.name}</div>
                        <div className="text-gray-400">₹{finalPrice} x {cartItem.qty}</div>
                      </div>
                      <span className="font-bold text-gray-900">₹{finalPrice * cartItem.qty}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-xs">
                <span>Total Amount:</span>
                <span>
                  ₹{cart.reduce((acc, cItem) => {
                    const fd = feeds.find((f) => f.id === cItem.id)!;
                    const pr = fd.discount > 0 ? fd.price * (1 - fd.discount / 100) : fd.price;
                    return acc + pr * cItem.qty;
                  }, 0)}
                </span>
              </div>

              {checkoutSuccess ? (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center space-x-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-gray-700" />
                  <span>Feed Order Placed!</span>
                </div>
              ) : (
                <button onClick={handleCheckout} className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center">
                  <span>Pay with Integrated Escrow</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
