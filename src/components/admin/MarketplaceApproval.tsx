import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Store, Clock } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export function MarketplaceApproval() {
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?status=PENDING");
      if (res.ok) {
        const data = await res.json();
        setPendingProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch pending products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApproval = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Remove from list
        setPendingProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <Store className="w-5 h-5 mr-2 text-gray-700" />
          Marketplace Approvals
        </h2>
        <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1 text-yellow-500" />
          {pendingProducts.length} Pending
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-500 animate-pulse">Loading pending products...</div>
      ) : pendingProducts.length === 0 ? (
        <div className="text-center py-10 text-xs font-medium text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No pending products to approve.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingProducts.map(p => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:border-gray-200 transition-colors bg-white">
              <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <SafeImage src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-sm">{p.title}</h3>
                    <span className="text-[9px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded shadow-sm">{p.category}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-gray-600 font-medium">
                    <div><span className="text-gray-400">Seller:</span> {p.sellerName}</div>
                    <div><span className="text-gray-400">Loc:</span> {p.location}</div>
                    <div><span className="text-gray-400">Price:</span> ₹{p.price}/{p.unit}</div>
                    <div><span className="text-gray-400">Stock:</span> {p.stockQuantity}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-50">
                  <button 
                    onClick={() => handleApproval(p.id, "APPROVED")}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center border border-green-200"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                  </button>
                  <button 
                    onClick={() => handleApproval(p.id, "REJECTED")}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center border border-red-200"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
