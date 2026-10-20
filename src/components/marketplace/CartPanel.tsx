import React, { useState, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Check,
  ChevronRight,
  Truck
} from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';
import { useAuthRole } from '@/lib/context/AuthRoleContext';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit: string;
}

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

interface CheckoutFormState {
  recipientName: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  customCity: string;
  pincode: string;
  deliverySlot: string;
  deliveryNotes: string;
  paymentMethod: "UPI" | "ESCROW" | "COD" | "NET_BANKING";
  agreedToInspection: boolean;
}

const KERALA_DISTRICTS = [
  "Palakkad",
  "Wayanad",
  "Ernakulam",
  "Idukki",
  "Thrissur",
  "Kottayam",
  "Kozhikode",
  "Alappuzha",
  "Kollam",
  "Malappuram",
  "Kannur",
  "Kasaragod",
  "Pathanamthitta",
  "Thiruvananthapuram",
  "Other"
];

const DELIVERY_SLOTS = [
  { id: "Morning (8:00 AM - 12:00 PM)", label: "Morning (8:00 AM - 12:00 PM)", desc: "Fresh dawn harvest delivery" },
  { id: "Afternoon (12:00 PM - 4:00 PM)", label: "Afternoon (12:00 PM - 4:00 PM)", desc: "Standard daytime slot" },
  { id: "Evening (4:00 PM - 8:00 PM)", label: "Evening (4:00 PM - 8:00 PM)", desc: "Post-harvest cold logistics" },
  { id: "Express Farm-to-Fork (Within 3 Hours)", label: "⚡ Express Farm-to-Fork (< 3 hrs)", desc: "Priority temperature-controlled transit" }
];

export function CartPanel({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartPanelProps) {
  const { fetchCart, currentUser } = useAuthRole();
  const [step, setStep] = useState<'items' | 'checkout' | 'success'>('items');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<CheckoutFormState>({
    recipientName: '',
    phone: '',
    deliveryAddress: '',
    city: 'Ernakulam',
    customCity: '',
    pincode: '',
    deliverySlot: 'Morning (8:00 AM - 12:00 PM)',
    deliveryNotes: '',
    paymentMethod: 'ESCROW',
    agreedToInspection: false
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Auto-fill buyer details when available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        recipientName: prev.recipientName || currentUser.name || '',
        phone: prev.phone || currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  // Reset step if closed and reopened from clean state
  useEffect(() => {
    if (!isOpen && step === 'success') {
      setStep('items');
      setConfirmedOrder(null);
    }
  }, [isOpen, step]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + delivery;

  // Strict Field Validation
  const validateField = (name: keyof CheckoutFormState, value: any, currentForm = formData): string | null => {
    switch (name) {
      case 'recipientName': {
        const val = (value || '').trim();
        if (!val) return "Recipient full name is required.";
        if (val.length < 3) return "Name must be at least 3 characters long.";
        if (val.length > 60) return "Name cannot exceed 60 characters.";
        if (!/^[a-zA-Z\s.]+$/.test(val)) return "Name must contain only alphabetic letters, spaces, or dots.";
        return null;
      }
      case 'phone': {
        const clean = (value || '').replace(/\D/g, '');
        if (!clean) return "Contact phone number is required.";
        if (clean.length !== 10) return `Must be exactly 10 digits (currently ${clean.length} digits).`;
        if (!/^[6-9]/.test(clean)) return "Must be a valid Indian mobile number starting with 6, 7, 8, or 9.";
        return null;
      }
      case 'deliveryAddress': {
        const val = (value || '').trim();
        if (!val) return "Complete delivery address is required.";
        if (val.length < 10) return `Address is too short (${val.length}/10 chars minimum required).`;
        if (val.length > 200) return "Address cannot exceed 200 characters.";
        return null;
      }
      case 'city': {
        if (value === 'Other') {
          const custom = (currentForm.customCity || '').trim();
          if (!custom) return "Please enter your city / district name.";
          if (custom.length < 2) return "City name must be at least 2 characters.";
          if (custom.length > 50) return "City name cannot exceed 50 characters.";
          if (!/^[a-zA-Z\s-]+$/.test(custom)) return "City name can only contain letters, spaces, and hyphens.";
          return null;
        }
        if (!value || typeof value !== 'string' || value.trim().length < 2) {
          return "Please select a valid delivery district.";
        }
        return null;
      }
      case 'customCity': {
        if (currentForm.city === 'Other') {
          const custom = (value || '').trim();
          if (!custom) return "Please enter your city / district name.";
          if (custom.length < 2) return "City name must be at least 2 characters.";
          if (custom.length > 50) return "City name cannot exceed 50 characters.";
          if (!/^[a-zA-Z\s-]+$/.test(custom)) return "City name can only contain letters, spaces, and hyphens.";
        }
        return null;
      }
      case 'pincode': {
        const clean = (value || '').trim();
        if (!clean) return "Postal PIN code is required.";
        if (!/^\d{6}$/.test(clean)) return "PIN code must be exactly 6 numeric digits (e.g. 682001).";
        return null;
      }
      case 'deliveryNotes': {
        const val = (value || '').trim();
        if (val.length > 120) return "Delivery notes cannot exceed 120 characters.";
        return null;
      }
      case 'agreedToInspection': {
        if (value !== true) {
          return "You must agree to inspect produce quality upon delivery.";
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Run validation across all fields
  const validateAll = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const fieldsToValidate: (keyof CheckoutFormState)[] = [
      'recipientName',
      'phone',
      'deliveryAddress',
      'city',
      'pincode',
      'agreedToInspection'
    ];

    if (formData.city === 'Other') {
      fieldsToValidate.push('customCity');
    }

    if (formData.deliveryNotes) {
      fieldsToValidate.push('deliveryNotes');
    }

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });

    setFormErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleFieldChange = (name: keyof CheckoutFormState, value: any) => {
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (touched[name] || hasAttemptedSubmit) {
      const error = validateField(name, value, updatedForm);
      setFormErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[name] = error;
        } else {
          delete next[name];
        }
        return next;
      });
    }
  };

  const handleBlur = (name: keyof CheckoutFormState) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setFormErrors(prev => {
      const next = { ...prev };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setStep('checkout');
    setCheckoutError(null);
  };

  const handleBackToItems = () => {
    setStep('items');
    setCheckoutError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setCheckoutError(null);

    // Mark all as touched
    const allTouched: Record<string, boolean> = {
      recipientName: true,
      phone: true,
      deliveryAddress: true,
      city: true,
      customCity: true,
      pincode: true,
      agreedToInspection: true
    };
    setTouched(allTouched);

    const { isValid, errors } = validateAll();
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      setCheckoutError(`Strict Validation Error: ${firstError}`);
      return;
    }

    setIsCheckingOut(true);

    const effectiveCity = formData.city === 'Other' ? formData.customCity.trim() : formData.city.trim();

    try {
      const payload = {
        recipientName: formData.recipientName.trim(),
        phone: formData.phone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        city: effectiveCity,
        pincode: formData.pincode.trim(),
        deliverySlot: formData.deliverySlot,
        deliveryNotes: formData.deliveryNotes.trim(),
        paymentMethod: formData.paymentMethod,
        agreedToInspection: formData.agreedToInspection
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutError(data.error || "Order placement failed. Please verify your details.");
      } else {
        setConfirmedOrder(data);
        setStep('success');
        await fetchCart();
      }
    } catch (e) {
      setCheckoutError("Network error. Please verify your connection and try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md md:max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={handleBackToItems}
                className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                title="Back to cart items"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-gray-900">
                  {step === 'items' && 'Your Shopping Cart'}
                  {step === 'checkout' && 'Buyer Checkout & Delivery'}
                  {step === 'success' && 'Order Confirmed!'}
                </h2>
                {step === 'items' && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                )}
                {step === 'checkout' && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-100">
                    Step 2 of 2
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {step === 'items' && 'Review your farm produce before checkout'}
                {step === 'checkout' && 'Strict verification for cold-chain dispatch'}
                {step === 'success' && 'Dispatched for farm gate inspection'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">

          {/* ================= STEP 1: REVIEW CART ITEMS ================= */}
          {step === 'items' && (
            <>
              {items.length === 0 ? (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Your cart is empty</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Explore fresh farm produce, certified cattle feeds, and veterinary medicines in the marketplace.
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="mt-2 px-6 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
                    <span>Produce Items ({items.length})</span>
                    <span>Subtotal: ₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-white p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all shadow-sm">
                        <div className="w-18 h-18 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                          <SafeImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="truncate">
                              <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">₹{item.price} / {item.unit}</p>
                            </div>
                            <button 
                              onClick={() => onRemove(item.id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-1 transition-colors"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5">
                              <button 
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 w-5 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-gray-500 hover:text-gray-900"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-black text-gray-900 text-sm">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Escrow Guarantee Pill */}
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Agri-Nova Escrow Protection Active</span>
                      <p className="text-[11px] text-blue-700/80 mt-0.5">
                        Your payment is held safely until you inspect the quality at delivery.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= STEP 2: BUYER DELIVERY & STRICT VALIDATION FORM ================= */}
          {step === 'checkout' && (
            <form id="buyerCheckoutForm" onSubmit={handlePlaceOrder} className="space-y-5" noValidate>
              
              {/* Order Quick Summary Header */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-semibold">Total Order Payable</span>
                  <div className="text-xl font-black text-gray-900">₹{total.toFixed(2)}</div>
                  <span className="text-[10px] text-gray-400 font-medium">Includes ₹50 cold-chain delivery</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    {items.length} {items.length === 1 ? 'Produce Item' : 'Produce Items'}
                  </span>
                </div>
              </div>

              {/* Strict Validation Error Banner */}
              {checkoutError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-700 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold block">Validation Alert</span>
                    <span className="text-red-600 font-medium">{checkoutError}</span>
                  </div>
                </div>
              )}

              {/* 1. Recipient Full Name */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="checkout_recipientName" className="font-bold text-gray-800 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Consignee Full Name <span className="text-red-500">*</span></span>
                  </label>
                  <span className={`text-[10px] font-semibold ${
                    formData.recipientName.length > 60 ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {formData.recipientName.length}/60
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="checkout_recipientName"
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => handleFieldChange('recipientName', e.target.value)}
                    onBlur={() => handleBlur('recipientName')}
                    placeholder="e.g. Anandha Krishnan"
                    className={`w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border bg-white outline-none transition-all ${
                      formErrors.recipientName && (touched.recipientName || hasAttemptedSubmit)
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                        : touched.recipientName && !formErrors.recipientName && formData.recipientName
                        ? 'border-green-400 focus:border-green-500 ring-1 ring-green-100'
                        : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    }`}
                  />
                  {touched.recipientName && !formErrors.recipientName && formData.recipientName && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                  )}
                </div>
                {formErrors.recipientName && (touched.recipientName || hasAttemptedSubmit) && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.recipientName}</span>
                  </p>
                )}
                <p className="text-[10px] text-gray-400">Strictly alphabet letters and spaces only. No numbers or special symbols.</p>
              </div>

              {/* 2. Contact Phone Number */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="checkout_phone" className="font-bold text-gray-800 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>Contact Mobile Number <span className="text-red-500">*</span></span>
                  </label>
                  <span className={`text-[10px] font-semibold ${
                    formData.phone.replace(/\D/g, '').length === 10 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {formData.phone.replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-gray-600 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">
                    +91
                  </span>
                  <input
                    id="checkout_phone"
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      handleFieldChange('phone', onlyNums);
                    }}
                    onBlur={() => handleBlur('phone')}
                    placeholder="9876543210"
                    className={`flex-1 text-xs font-medium px-3.5 py-2.5 rounded-r-xl border bg-white outline-none transition-all ${
                      formErrors.phone && (touched.phone || hasAttemptedSubmit)
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                        : touched.phone && !formErrors.phone && formData.phone.length === 10
                        ? 'border-green-400 focus:border-green-500 ring-1 ring-green-100'
                        : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    }`}
                  />
                  {touched.phone && !formErrors.phone && formData.phone.length === 10 && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                  )}
                </div>
                {formErrors.phone && (touched.phone || hasAttemptedSubmit) && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.phone}</span>
                  </p>
                )}
                <p className="text-[10px] text-gray-400">Strictly 10-digit Indian mobile number starting with 6, 7, 8, or 9 for OTP delivery verification.</p>
              </div>

              {/* 3. Delivery Street Address */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="checkout_address" className="font-bold text-gray-800 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>Delivery Street Address <span className="text-red-500">*</span></span>
                  </label>
                  <span className={`text-[10px] font-semibold ${
                    formData.deliveryAddress.length < 10
                      ? 'text-amber-500'
                      : formData.deliveryAddress.length > 200
                      ? 'text-red-500'
                      : 'text-green-600'
                  }`}>
                    {formData.deliveryAddress.length}/200 (min 10)
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="checkout_address"
                    rows={2}
                    value={formData.deliveryAddress}
                    onChange={(e) => handleFieldChange('deliveryAddress', e.target.value)}
                    onBlur={() => handleBlur('deliveryAddress')}
                    placeholder="House/Building Name, Street/Road, Landmark, Village..."
                    className={`w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border bg-white outline-none resize-none transition-all ${
                      formErrors.deliveryAddress && (touched.deliveryAddress || hasAttemptedSubmit)
                        ? 'border-red-400 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                        : touched.deliveryAddress && !formErrors.deliveryAddress && formData.deliveryAddress.length >= 10
                        ? 'border-green-400 focus:border-green-500 ring-1 ring-green-100'
                        : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    }`}
                  />
                  {touched.deliveryAddress && !formErrors.deliveryAddress && formData.deliveryAddress.length >= 10 && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                  )}
                </div>
                {formErrors.deliveryAddress && (touched.deliveryAddress || hasAttemptedSubmit) && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.deliveryAddress}</span>
                  </p>
                )}
              </div>

              {/* 4. District & PIN Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* District Selection */}
                <div className="space-y-1">
                  <label htmlFor="checkout_city" className="block text-xs font-bold text-gray-800">
                    District / Hub <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="checkout_city"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900"
                  >
                    {KERALA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist === 'Other' ? 'Other (Enter Custom City)' : `${dist} District`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PIN Code */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="checkout_pincode" className="font-bold text-gray-800">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">6 Digits</span>
                  </div>
                  <div className="relative">
                    <input
                      id="checkout_pincode"
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        handleFieldChange('pincode', digits);
                      }}
                      onBlur={() => handleBlur('pincode')}
                      placeholder="682001"
                      className={`w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border bg-white outline-none transition-all ${
                        formErrors.pincode && (touched.pincode || hasAttemptedSubmit)
                          ? 'border-red-400 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                          : touched.pincode && !formErrors.pincode && formData.pincode.length === 6
                          ? 'border-green-400 focus:border-green-500 ring-1 ring-green-100'
                          : 'border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                      }`}
                    />
                    {touched.pincode && !formErrors.pincode && formData.pincode.length === 6 && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                    )}
                  </div>
                  {formErrors.pincode && (touched.pincode || hasAttemptedSubmit) && (
                    <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formErrors.pincode}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Custom District Input if 'Other' selected */}
              {formData.city === 'Other' && (
                <div className="space-y-1 animate-fadeIn">
                  <label htmlFor="checkout_customCity" className="block text-xs font-bold text-gray-800">
                    Specify Custom City / District Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout_customCity"
                    type="text"
                    value={formData.customCity}
                    onChange={(e) => handleFieldChange('customCity', e.target.value)}
                    onBlur={() => handleBlur('customCity')}
                    placeholder="Enter city name..."
                    className={`w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border bg-white outline-none transition-all ${
                      formErrors.customCity && (touched.customCity || hasAttemptedSubmit)
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-gray-200 focus:border-gray-900'
                    }`}
                  />
                  {formErrors.customCity && (touched.customCity || hasAttemptedSubmit) && (
                    <p className="text-[11px] text-red-600 font-semibold">{formErrors.customCity}</p>
                  )}
                </div>
              )}

              {/* 5. Preferred Delivery Slot */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>Cold-Chain Delivery Window <span className="text-red-500">*</span></span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {DELIVERY_SLOTS.map((slot) => (
                    <label 
                      key={slot.id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        formData.deliverySlot === slot.id
                          ? 'border-gray-900 bg-gray-50/80 shadow-xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="radio"
                          name="deliverySlot"
                          checked={formData.deliverySlot === slot.id}
                          onChange={() => handleFieldChange('deliverySlot', slot.id)}
                          className="text-gray-900 focus:ring-gray-900"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900">{slot.label}</div>
                          <div className="text-[10px] text-gray-500">{slot.desc}</div>
                        </div>
                      </div>
                      {formData.deliverySlot === slot.id && (
                        <Check className="w-4 h-4 text-gray-900" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Payment Method Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 flex items-center space-x-1">
                  <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                  <span>Payment Method & Escrow Guarantee <span className="text-red-500">*</span></span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Escrow Card */}
                  <div
                    onClick={() => handleFieldChange('paymentMethod', 'ESCROW')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.paymentMethod === 'ESCROW'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                          100% Protected
                        </span>
                        {formData.paymentMethod === 'ESCROW' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-1.5">Agri-Vault Escrow</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Funds held until produce inspection passes.</p>
                    </div>
                  </div>

                  {/* UPI Card */}
                  <div
                    onClick={() => handleFieldChange('paymentMethod', 'UPI')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.paymentMethod === 'UPI'
                        ? 'border-gray-900 bg-gray-50/80 ring-1 ring-gray-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          Instant
                        </span>
                        {formData.paymentMethod === 'UPI' && <CheckCircle2 className="w-3.5 h-3.5 text-gray-900" />}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-1.5">UPI Instant Pay</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">GPay, PhonePe, Paytm, or BHIM QR.</p>
                    </div>
                  </div>

                  {/* COD Card */}
                  <div
                    onClick={() => handleFieldChange('paymentMethod', 'COD')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.paymentMethod === 'COD'
                        ? 'border-gray-900 bg-gray-50/80 ring-1 ring-gray-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          Gate Handover
                        </span>
                        {formData.paymentMethod === 'COD' && <CheckCircle2 className="w-3.5 h-3.5 text-gray-900" />}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-1.5">Cash on Delivery</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Pay driver post physical check.</p>
                    </div>
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => handleFieldChange('paymentMethod', 'NET_BANKING')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.paymentMethod === 'NET_BANKING'
                        ? 'border-gray-900 bg-gray-50/80 ring-1 ring-gray-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          Corporate
                        </span>
                        {formData.paymentMethod === 'NET_BANKING' && <CheckCircle2 className="w-3.5 h-3.5 text-gray-900" />}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-1.5">Net Banking / NEFT</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Direct bank transfer with invoice.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Special Delivery Notes (Optional) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="checkout_notes" className="font-bold text-gray-800">
                    Delivery & Handling Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">{formData.deliveryNotes.length}/120</span>
                </div>
                <input
                  id="checkout_notes"
                  type="text"
                  maxLength={120}
                  value={formData.deliveryNotes}
                  onChange={(e) => handleFieldChange('deliveryNotes', e.target.value)}
                  placeholder="e.g. Call before arrival, leave with security at gate 2"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900"
                />
              </div>

              {/* 8. Mandatory Inspection Policy Agreement */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToInspection}
                    onChange={(e) => handleFieldChange('agreedToInspection', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <div className="text-xs text-gray-800 font-medium leading-relaxed">
                    <span className="font-bold text-gray-900">Mandatory Quality Inspection Policy: </span>
                    I strictly agree to inspect produce quality upon delivery and acknowledge Agri-Nova's 24-hour escrow dispute window for agricultural goods. <span className="text-red-500 font-bold">*</span>
                  </div>
                </label>
                {formErrors.agreedToInspection && (touched.agreedToInspection || hasAttemptedSubmit) && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1 pl-6">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.agreedToInspection}</span>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* ================= STEP 3: ORDER SUCCESS CONFIRMATION ================= */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-green-50 rounded-full border border-green-200 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-bold text-green-700 bg-green-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
                  Payment & Order Verified
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-2">Order Successfully Placed!</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Cold-chain logistics dispatch order has been generated with verified farm gate inspection terms.
                </p>
              </div>

              {/* Order Metadata Box */}
              <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Order ID</span>
                  <span className="font-mono font-bold text-gray-900">{confirmedOrder?.orderId || "ORD-VERIFIED"}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Consignee</span>
                  <span className="font-bold text-gray-900">{confirmedOrder?.recipientName || formData.recipientName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Mobile Contact</span>
                  <span className="font-bold text-gray-900">+91 {confirmedOrder?.phone || formData.phone}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Payment Mode</span>
                  <span className="font-bold text-blue-600">{formData.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 font-medium">Delivery Slot</span>
                  <span className="font-bold text-gray-900">{formData.deliverySlot}</span>
                </div>
              </div>

              <div className="w-full space-y-2.5 pt-2">
                <a
                  href="/dashboard/buyer"
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <Truck className="w-4 h-4 mr-1" />
                  <span>Track Shipment in Buyer Dashboard</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setStep('items');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Panel Footer Actions */}
        {items.length > 0 && step !== 'success' && (
          <div className="p-5 bg-gray-50 border-t border-gray-100">
            {step === 'items' && (
              <div className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Produce Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Farm Cold-Chain Delivery</span>
                    <span className="font-semibold text-gray-900">₹{delivery.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="font-bold text-gray-900 text-sm">Grand Total</span>
                    <span className="font-black text-gray-900 text-xl">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-black text-xs rounded-xl shadow-sm transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Delivery & Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 'checkout' && (
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-xs pb-1">
                  <span className="text-gray-500 font-medium">Total Payable Amount:</span>
                  <span className="text-lg font-black text-gray-900">₹{total.toFixed(2)}</span>
                </div>

                <button 
                  type="submit"
                  form="buyerCheckoutForm"
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-sm transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Place Order (₹{total.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
