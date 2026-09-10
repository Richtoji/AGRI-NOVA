"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, CheckCircle2, Star } from "lucide-react";

import { useAuthRole } from "@/lib/context/AuthRoleContext";

interface FeedStoreProps {
  products?: any[];
}

export const FeedStore: React.FC<FeedStoreProps> = ({ products = [] }) => {
  const { addToCart } = useAuthRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const feedCategories = [
    "Cattle Feed", "Poultry Feed", "Fish Feed", "Goat Feed", "Pig Feed",
    "Organic Farming", "Fertilizers & Manure", "Biofertilizers & Biopesticides", "Farming Tools", "Nursery Supplies", "Seeds"
  ];

  const feeds = products
    .filter(p => feedCategories.includes(p.category))
    .map(p => ({
      id: p.id,
      name: p.title,
      category: p.category,
      price: p.price,
      weight: "1 " + p.unit,
      rating: p.rating || 4.5,
      image: p.imageUrl,
      discount: 0,
      stock: p.stockQuantity,
      description: p.description
    }));

  const availableCategories = Array.from(new Set(feeds.map(f => f.category)));

  const handleAddToCart = async (id: string) => {
    const result = await addToCart(id, 1);
    if (result.success) {
      setAddedItem(id);
      setTimeout(() => setAddedItem(null), 1500);
    } else {
      alert(result.error);
    }
  };



  const filteredFeeds = feeds.filter((feed) => {
    const matchesSearch = feed.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || feed.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      
      {/* Catalog */}
      <div className="space-y-5">
        
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
            {["ALL", ...availableCategories].map((cat) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      {addedItem === feed.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
