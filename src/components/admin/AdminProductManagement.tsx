"use client";

import React, { useState, useEffect } from "react";
import { Store, Edit, Trash2, Plus, X, Search, Image as ImageIcon } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

export function AdminProductManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Vegetables",
    price: "",
    unit: "kg",
    stockQuantity: "",
    imageUrl: "",
    location: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?status=ALL");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    }
  };

  const openAddModal = () => {
    setImageFile(null);
    setFormData({
      title: "",
      description: "",
      category: "Vegetables",
      price: "",
      unit: "kg",
      stockQuantity: "",
      imageUrl: "",
      location: "",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setImageFile(null);
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || "",
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stockQuantity: product.stockQuantity.toString(),
      imageUrl: product.imageUrl,
      location: product.location || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = formData.imageUrl;

    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalImageUrl = url;
        } else {
          alert("Image upload failed");
          return;
        }
      } catch (err) {
        alert("Image upload error");
        return;
      }
    }

    const payload = {
      ...formData,
      imageUrl: finalImageUrl,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
    };

    try {
      if (isEditModalOpen && editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchProducts();
          setIsEditModalOpen(false);
        } else {
          alert("Failed to update product");
        }
      } else if (isAddModalOpen) {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchProducts();
          setIsAddModalOpen(false);
        } else {
          alert("Failed to add product");
        }
      }
    } catch (err) {
      alert("Error saving product");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Store className="w-5 h-5 mr-2 text-gray-700" />
            Product Catalog Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">Add, edit, or remove marketplace items directly.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs focus:outline-none focus:border-gray-300"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-gray-500 animate-pulse">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-xs font-medium text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 bg-gray-50 uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <SafeImage src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{p.title}</div>
                        <div className="text-[10px] text-gray-500">{p.sellerName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-700">{p.category}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">₹{p.price}/{p.unit}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.stockQuantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      p.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' :
                      p.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-auto border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                {isEditModalOpen ? "Edit Product" : "Add New Product"}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product Title</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Organic Nendran Bananas" />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors">
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                  </select>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Wayanad" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="0.00" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors">
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                    <option value="piece">piece</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="Available amount" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Product Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800" 
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <SafeImage src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition-colors" placeholder="Product details..."></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3 mt-2">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm">
                  {isEditModalOpen ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
