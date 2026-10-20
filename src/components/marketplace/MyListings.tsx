"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PackageOpen, 
  UploadCloud, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  AlertTriangle,
  Check,
  Star,
  MapPin
} from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  stockQuantity: string;
  imageUrl: string;
  location: string;
  quality: string;
  rating: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  unit?: string;
  stockQuantity?: string;
  imageUrl?: string;
  location?: string;
  quality?: string;
  rating?: string;
  general?: string;
}

export function MyListings() {
  const { currentUser } = useAuthRole();
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
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
    "Seeds",
    "Fertilizers & Manure",
    "Farming Tools"
  ];

  const locations = [
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
    "Kasargod", 
    "Pathanamthitta", 
    "Thiruvananthapuram"
  ];

  const units = ["kg", "grams", "litres", "ml", "ton", "quintal", "dozen", "unit", "bunch", "packet"];
  const qualities = ["Grade A Organic", "Export Quality", "Premium", "Standard", "Fair"];

  // Initial Form State
  const initialFormState: ProductFormData = {
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
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string; dimensions?: string } | null>(null);

  // Strict Validation Rules
  const validateField = (name: keyof ProductFormData, value: string): string | undefined => {
    switch (name) {
      case "title": {
        const trimmed = value.trim();
        if (!trimmed) return "Product name is strictly required.";
        if (trimmed.length < 3) return "Product name must be at least 3 characters long.";
        if (trimmed.length > 80) return "Product name cannot exceed 80 characters.";
        if (!/[a-zA-Z]/.test(trimmed)) return "Product name must contain alphabetical letters.";
        if (/[<>{}]/.test(trimmed)) return "Special HTML characters (<, >, {, }) are not permitted.";
        return undefined;
      }
      case "description": {
        const trimmed = value.trim();
        if (!trimmed) return "Product description is strictly required.";
        if (trimmed.length < 15) return "Description must be at least 15 characters (provide harvest date, farming method, or quality details).";
        if (trimmed.length > 1000) return "Description cannot exceed 1000 characters.";
        return undefined;
      }
      case "category": {
        if (!value || !categories.includes(value)) return "Please select a valid marketplace category from the list.";
        return undefined;
      }
      case "location": {
        if (!value || !locations.includes(value)) return "Please select a valid farming district or location.";
        return undefined;
      }
      case "quality": {
        if (!value || !qualities.includes(value)) return "Please select a valid quality grade.";
        return undefined;
      }
      case "rating": {
        if (!value || isNaN(Number(value))) return "Quality rating must be a valid number.";
        const num = Number(value);
        if (num < 1.0 || num > 5.0) return "Quality rating must be between 1.0 and 5.0.";
        return undefined;
      }
      case "price": {
        const trimmed = value.trim();
        if (!trimmed) return "Price per unit is strictly required.";
        const num = Number(trimmed);
        if (isNaN(num)) return "Price must be a valid numeric amount.";
        if (num <= 0) return "Strict Validation: Price must be strictly greater than ₹0.00.";
        if (num > 1000000) return "Price cannot exceed ₹1,000,000 per unit.";
        if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return "Price can have at most 2 decimal places (e.g., 45.50).";
        return undefined;
      }
      case "unit": {
        if (!value || !units.includes(value.toLowerCase())) return "Please select a valid measurement unit.";
        return undefined;
      }
      case "stockQuantity": {
        const trimmed = value.trim();
        if (!trimmed) return "Available stock quantity is strictly required.";
        const num = Number(trimmed);
        if (isNaN(num)) return "Stock quantity must be a valid number.";
        if (!Number.isInteger(num)) return "Stock quantity must be a whole integer (fractional stock not allowed).";
        if (num < 1) return "Strict Validation: Stock quantity must be at least 1 unit.";
        if (num > 100000) return "Stock quantity cannot exceed 100,000 units.";
        return undefined;
      }
      case "imageUrl": {
        if (!value || !value.trim()) return "A clear product photograph is strictly required for buyer verification.";
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const validateAll = (data: ProductFormData): FormErrors => {
    const newErrors: FormErrors = {};
    (Object.keys(data) as Array<keyof ProductFormData>).forEach((field) => {
      const err = validateField(field, data[field]);
      if (err) newErrors[field] = err;
    });
    return newErrors;
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof ProductFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setTouched(prev => ({ ...prev, imageUrl: true }));

    if (!file) {
      setErrors(prev => ({ ...prev, imageUrl: "Please select an image file to upload." }));
      return;
    }

    // 1. Strict MIME type check
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      setErrors(prev => ({ ...prev, imageUrl: "Strict Validation Error: Only JPEG, PNG, or WebP images are permitted." }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Strict file size check (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrors(prev => ({ ...prev, imageUrl: `Strict Validation Error: File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5MB limit.` }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 3. Strict dimension validation via browser Image constructor
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth < 150 || img.naturalHeight < 150) {
        setErrors(prev => ({ 
          ...prev, 
          imageUrl: `Strict Validation Error: Image resolution (${img.naturalWidth}×${img.naturalHeight}px) is too low. Please upload a clear photo (min 150×150px).` 
        }));
        URL.revokeObjectURL(objectUrl);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Convert to DataURL for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        setImageMeta({
          name: file.name,
          size: file.size > 1024 * 1024 
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
            : `${Math.round(file.size / 1024)} KB`,
          dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`
        });
        setErrors(prev => ({ ...prev, imageUrl: undefined }));
        URL.revokeObjectURL(objectUrl);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      setErrors(prev => ({ ...prev, imageUrl: "Strict Validation Error: The selected file is corrupted or not a valid image." }));
      URL.revokeObjectURL(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    img.src = objectUrl;
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    setImageMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (touched.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: "A product photograph is strictly required." }));
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

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData(initialFormState);
    setErrors({});
    setTouched({});
    setImageMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  };

  const openEditModal = (product: any) => {
    setEditingProductId(product.id);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      category: product.category || "Fresh Vegetables",
      price: product.price !== undefined ? product.price.toString() : "",
      unit: product.unit || "kg",
      stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity.toString() : "",
      imageUrl: product.imageUrl || "",
      location: product.location || "Palakkad",
      quality: product.quality || "Standard",
      rating: product.rating !== undefined ? product.rating.toString() : "5.0"
    });
    setErrors({});
    setTouched({});
    setImageMeta(product.imageUrl ? { name: "Current Product Image", size: "Active" } : null);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingProductId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete product.");
      } else {
        setSuccessBanner(`Listing "${title}" was successfully deleted.`);
        setTimeout(() => setSuccessBanner(null), 5000);
        fetchMyProducts();
      }
    } catch (err) {
      alert("An unexpected error occurred while deleting the product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    (Object.keys(formData) as Array<keyof ProductFormData>).forEach(f => {
      allTouched[f] = true;
    });
    setTouched(allTouched);

    // 2. Perform strict validation on all fields
    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    // 3. Block submit if any errors exist
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(`field-${firstErrorField}`);
      element?.focus();
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : "/api/products";
      const method = editingProductId ? "PATCH" : "POST";

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price.trim()),
        unit: formData.unit.toLowerCase(),
        stockQuantity: parseInt(formData.stockQuantity.trim(), 10),
        imageUrl: formData.imageUrl,
        location: formData.location,
        quality: formData.quality,
        rating: parseFloat(formData.rating)
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        setFormData(initialFormState);
        setSuccessBanner(
          editingProductId 
            ? `🎉 Product "${payload.title}" updated successfully! Changes submitted for admin review.` 
            : `🎉 Product "${payload.title}" submitted successfully! It is now pending admin approval before publishing on the marketplace.`
        );
        setTimeout(() => setSuccessBanner(null), 6000);
        fetchMyProducts();
      } else {
        setErrors({ general: data.error || "Validation error: Failed to submit product." });
      }
    } catch (err: any) {
      setErrors({ general: err.message || "A network error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = Object.keys(errors).filter(k => errors[k as keyof FormErrors] && k !== 'general').length;

  return (
    <div className="space-y-5">
      {/* SUCCESS BANNER */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold">{successBanner}</p>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Seller Portal
            </span>
            <span className="text-xs text-gray-400 font-medium">Marketplace User Module</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">My Product Listings</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Sell your harvested crops, organic produce, and agricultural items with verified admin quality approval.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer shrink-0 uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" /> 
          <span>List Product For Sale</span>
        </button>
      </div>

      {/* LISTINGS GRID */}
      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold">Loading your verified listings...</p>
        </div>
      ) : myProducts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Active Listings Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mb-5 leading-relaxed">
            You haven&apos;t listed any agricultural products for sale. Click the button below to submit your product with strict quality verification.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            + Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {myProducts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col group relative shadow-xs hover:border-gray-200 transition-all">
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-50">
                <SafeImage src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                <div className="absolute top-3 right-3 flex space-x-1.5 z-10">
                  {p.status === 'PENDING' && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center border border-amber-300">
                      <Clock className="w-3 h-3 mr-1 text-amber-700 animate-pulse" /> PENDING REVIEW
                    </span>
                  )}
                  {p.status === 'APPROVED' && (
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" /> ACTIVE &amp; VERIFIED
                    </span>
                  )}
                  {p.status === 'REJECTED' && (
                    <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center border border-rose-300">
                      <XCircle className="w-3 h-3 mr-1 text-rose-700" /> REJECTED
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1 mr-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{p.category}</span>
                    <h3 className="font-bold text-gray-900 text-sm truncate">{p.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => openEditModal(p)} 
                      className="p-1.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit product details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(p.id, p.title)} 
                      disabled={deletingProductId === p.id}
                      className="p-1.5 text-rose-400 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete this listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-gray-500 mb-2">
                  <span className="flex items-center text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-current mr-0.5" /> {p.rating || "5.0"}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-gray-700">{p.quality || "Standard"}</span>
                  {p.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center text-gray-400">
                        <MapPin className="w-3 h-3 mr-0.5 text-gray-400" /> {p.location}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">{p.description}</p>

                <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-baseline space-x-0.5">
                    <span className="text-xl font-black text-gray-900">₹{p.price}</span>
                    <span className="text-xs text-gray-500 font-medium">/{p.unit}</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                    Stock: {p.stockQuantity} {p.unit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STRICT VALIDATION SELL / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
              <div>
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Strict Validation Active
                  </span>
                  {editingProductId ? (
                    <span className="text-[9px] font-bold text-gray-400">Re-Verification Required</span>
                  ) : (
                    <span className="text-[9px] font-bold text-gray-400">Admin Approval Required</span>
                  )}
                </div>
                <h2 className="text-lg font-black text-gray-900">
                  {editingProductId ? "Edit Product Details" : "List New Agricultural Product"}
                </h2>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                className="p-1.5 hover:bg-gray-200 rounded-xl transition-colors text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* TOP VALIDATION SUMMARY ALERT */}
              {errorCount > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-rose-900 text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Please correct the {errorCount} highlighted {errorCount === 1 ? 'error' : 'errors'} before submitting:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-800 font-medium">
                      {Object.keys(errors).map(fieldKey => {
                        const msg = errors[fieldKey as keyof FormErrors];
                        return msg ? <li key={fieldKey}>{msg}</li> : null;
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* API ERROR BANNER */}
              {errors.general && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-center space-x-2 text-rose-900 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
                
                {/* 1. PRODUCT TITLE */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="field-title" className="text-xs font-bold text-gray-900 flex items-center">
                      <span>Product Title / Name</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {formData.title.length}/80 chars
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="field-title"
                      type="text"
                      maxLength={80}
                      value={formData.title}
                      onChange={e => handleInputChange("title", e.target.value)}
                      onBlur={() => handleBlur("title")}
                      placeholder="e.g. Organic Nendran Bananas"
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-medium outline-none transition-all ${
                        touched.title && errors.title
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : touched.title && !errors.title
                          ? "border-emerald-400 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                      }`}
                    />
                    {touched.title && !errors.title && (
                      <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {touched.title && errors.title && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                </div>

                {/* 2. CATEGORY & LOCATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="field-category" className="block text-xs font-bold text-gray-900 mb-1">
                      <span>Category</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <select
                      id="field-category"
                      value={formData.category}
                      onChange={e => handleInputChange("category", e.target.value)}
                      onBlur={() => handleBlur("category")}
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-semibold outline-none transition-all cursor-pointer ${
                        touched.category && errors.category
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white"
                      }`}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {touched.category && errors.category && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.category}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-location" className="block text-xs font-bold text-gray-900 mb-1">
                      <span>Farming Location / District</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <select
                      id="field-location"
                      value={formData.location}
                      onChange={e => handleInputChange("location", e.target.value)}
                      onBlur={() => handleBlur("location")}
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-semibold outline-none transition-all cursor-pointer ${
                        touched.location && errors.location
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white"
                      }`}
                    >
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {touched.location && errors.location && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. PRODUCT QUALITY & RATING */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="field-quality" className="block text-xs font-bold text-gray-900 mb-1">
                      <span>Quality Grade</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <select
                      id="field-quality"
                      value={formData.quality}
                      onChange={e => handleInputChange("quality", e.target.value)}
                      onBlur={() => handleBlur("quality")}
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-semibold outline-none transition-all cursor-pointer ${
                        touched.quality && errors.quality
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white"
                      }`}
                    >
                      {qualities.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                    {touched.quality && errors.quality && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.quality}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="field-rating" className="text-xs font-bold text-gray-900 flex items-center">
                        <span>Quality Score (1.0 - 5.0)</span>
                        <span className="text-rose-500 ml-1">*</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-semibold">Self-Assessment</span>
                    </div>
                    <input
                      id="field-rating"
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={formData.rating}
                      onChange={e => handleInputChange("rating", e.target.value)}
                      onBlur={() => handleBlur("rating")}
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-medium outline-none transition-all ${
                        touched.rating && errors.rating
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white"
                      }`}
                    />
                    {touched.rating && errors.rating && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.rating}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. DESCRIPTION */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="field-description" className="text-xs font-bold text-gray-900 flex items-center">
                      <span>Detailed Description</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <span className={`text-[10px] font-semibold ${
                      formData.description.trim().length < 15 ? "text-amber-600" : "text-gray-400"
                    }`}>
                      {formData.description.length}/1000 chars (min 15)
                    </span>
                  </div>
                  <textarea
                    id="field-description"
                    rows={3}
                    maxLength={1000}
                    value={formData.description}
                    onChange={e => handleInputChange("description", e.target.value)}
                    onBlur={() => handleBlur("description")}
                    placeholder="Describe harvest date, organic certification, pesticide-free practices, moisture content, packaging, and freshness guarantees..."
                    className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-medium outline-none transition-all ${
                      touched.description && errors.description
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                        : touched.description && !errors.description
                        ? "border-emerald-400 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20"
                        : "border-gray-200 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                    }`}
                  />
                  {touched.description && errors.description && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>

                {/* 5. PRICE, UNIT & STOCK */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="field-price" className="block text-xs font-bold text-gray-900 mb-1">
                      <span>Price (₹)</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                      <input
                        id="field-price"
                        type="text"
                        inputMode="decimal"
                        value={formData.price}
                        onChange={e => handleInputChange("price", e.target.value)}
                        onBlur={() => handleBlur("price")}
                        placeholder="50.00"
                        className={`w-full pl-7 pr-2.5 py-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-black outline-none transition-all ${
                          touched.price && errors.price
                            ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                            : "border-gray-200 focus:border-gray-900 focus:bg-white"
                        }`}
                      />
                    </div>
                    {touched.price && errors.price && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.price}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-unit" className="block text-xs font-bold text-gray-900 mb-1">
                      <span>Unit</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <select
                      id="field-unit"
                      value={formData.unit}
                      onChange={e => handleInputChange("unit", e.target.value)}
                      onBlur={() => handleBlur("unit")}
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-semibold outline-none transition-all cursor-pointer ${
                        touched.unit && errors.unit
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white"
                      }`}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {touched.unit && errors.unit && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.unit}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-stockQuantity" className="block text-xs font-bold text-gray-900 mb-1">
                      <span>Stock Quantity</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <input
                      id="field-stockQuantity"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.stockQuantity}
                      onChange={e => handleInputChange("stockQuantity", e.target.value)}
                      onBlur={() => handleBlur("stockQuantity")}
                      placeholder="100"
                      className={`w-full p-2.5 bg-gray-50/80 border rounded-xl text-xs text-gray-900 font-black outline-none transition-all ${
                        touched.stockQuantity && errors.stockQuantity
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                          : "border-gray-200 focus:border-gray-900 focus:bg-white"
                      }`}
                    />
                    {touched.stockQuantity && errors.stockQuantity && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.stockQuantity}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. IMAGE UPLOAD WITH PREVIEW */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-900 flex items-center">
                      <span>Product Photograph Evidence</span>
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
                  </div>

                  {!formData.imageUrl ? (
                    <label 
                      htmlFor="field-imageUrl"
                      className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                        touched.imageUrl && errors.imageUrl
                          ? "border-rose-400 bg-rose-50/30 hover:bg-rose-50/50"
                          : "border-gray-200 bg-gray-50/70 hover:bg-gray-100/70"
                      }`}
                    >
                      <input
                        id="field-imageUrl"
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <UploadCloud className={`w-8 h-8 mb-2 ${
                        touched.imageUrl && errors.imageUrl ? "text-rose-500" : "text-gray-400"
                      }`} />
                      <span className="text-xs font-bold text-gray-700">Click to browse or drag photograph here</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Strict check: Min 150×150px, under 5MB</span>
                    </label>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 truncate max-w-[220px]">
                            {imageMeta?.name || "Product Image"}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {imageMeta?.size} {imageMeta?.dimensions && `• ${imageMeta.dimensions}`}
                          </p>
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Validated Successfully
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  )}

                  {touched.imageUrl && errors.imageUrl && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.imageUrl}</span>
                    </p>
                  )}
                </div>

                {/* MODAL ACTION BUTTONS */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer uppercase tracking-wider flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Validating &amp; Submitting...</span>
                      </>
                    ) : editingProductId ? (
                      <span>Save &amp; Request Verification</span>
                    ) : (
                      <span>Submit For Admin Approval</span>
                    )}
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
