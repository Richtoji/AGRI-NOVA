import React, { useState, useEffect } from "react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { Plus, Clock, CheckCircle2, XCircle, PackageOpen, UploadCloud } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export function MyListings() {
  const { currentUser } = useAuthRole();
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Fresh Vegetables",
    price: "",
    unit: "kg",
    stockQuantity: "",
    imageUrl: "",
    location: "Palakkad",
    quality: "Standard",
    rating: "5.0"
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchMyProducts = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?sellerId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch my products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          category: "Fresh Vegetables",
          price: "",
          unit: "kg",
          stockQuantity: "",
          imageUrl: "",
          location: "Palakkad",
          quality: "Standard",
          rating: "5.0"
        });
        fetchMyProducts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit product.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["Fresh Vegetables", "Fruits", "Rice & Grains", "Pulses", "Tubers", "Kerala Spices", "Plantation Products", "Dairy Products", "Poultry Products"];
  const locations = ["Palakkad", "Wayanad", "Idukki", "Ernakulam", "Thrissur", "Kottayam", "Alappuzha"];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-white border border-gray-100 rounded-2xl p-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
          <p className="text-xs text-gray-500">Manage your products and check approval status.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-sm hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Sell an Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-500 animate-pulse">Loading your listings...</div>
      ) : myProducts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <PackageOpen className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-900 mb-1">No Listings Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mb-4">You haven't listed any items for sale. Click the button above to submit your first product for approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {myProducts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col group relative">
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-50">
                <SafeImage src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex space-x-2">
                  {p.status === 'PENDING' && (
                    <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black px-2 py-1 rounded-full shadow-sm flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> PENDING APPROVAL
                    </span>
                  )}
                  {p.status === 'APPROVED' && (
                    <span className="bg-green-100 text-green-800 text-[9px] font-black px-2 py-1 rounded-full shadow-sm flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE
                    </span>
                  )}
                  {p.status === 'REJECTED' && (
                    <span className="bg-red-100 text-red-800 text-[9px] font-black px-2 py-1 rounded-full shadow-sm flex items-center">
                      <XCircle className="w-3 h-3 mr-1" /> REJECTED
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{p.title}</h3>
                <p className="text-[10px] text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-lg font-black text-gray-900">₹{p.price}</span>
                    <span className="text-xs text-gray-500 font-medium">/{p.unit}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    Stock: {p.stockQuantity} {p.unit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sell Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">List Your Product</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Product Name</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. Organic Tomatoes" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Location</label>
                    <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Product Quality</label>
                    <select value={formData.quality} onChange={e => setFormData({...formData, quality: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                      {["Premium", "Standard", "Fair", "Export Quality"].map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Quality Rating (out of 5)</label>
                    <input required type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" placeholder="5.0" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows={3} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" placeholder="Provide details about quality, farming method, etc." />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Unit</label>
                    <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" placeholder="e.g. kg, ton" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Stock</label>
                    <input required type="number" min="1" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none" placeholder="0" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Upload Product Image</label>
                  <label className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input required={!formData.imageUrl} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 font-medium">Click to upload an image</span>
                    </div>
                  </label>
                  {formData.imageUrl && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-green-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> <span>Image uploaded successfully</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                    {submitting ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
