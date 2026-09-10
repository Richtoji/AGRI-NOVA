"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, User, Mail, Lock, CheckCircle2, Phone, AlertCircle, Loader2, Calendar, Upload } from "lucide-react";
import { validateFullName, validateEmailWithDetails, validatePhoneWithDetails, validatePasswords, validateRole, validateDob } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    role: "FARMER",
    password: "",
    confirmPassword: "",
    avatarBase64: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string, currentData: typeof formData) => {
    let error = "";
    if (name === "name") {
      const res = validateFullName(value);
      if (!res.isValid) error = res.error || "Invalid name";
    } else if (name === "email") {
      const res = validateEmailWithDetails(value);
      if (!res.isValid) error = res.error || "Please enter a valid email address.";
    } else if (name === "phone") {
      const res = validatePhoneWithDetails(value);
      if (!res.isValid) error = res.error || "Phone number must contain exactly 10 digits.";
    } else if (name === "dob") {
      const res = validateDob(value);
      if (!res.isValid) error = res.error || "Invalid date of birth.";
    } else if (name === "password") {
      const res = validatePasswords(value, currentData.confirmPassword);
      if (!res.isValid && res.error !== "Passwords do not match." && res.error !== "Confirm password is required.") {
        error = res.error || "Invalid password";
      }
    } else if (name === "confirmPassword") {
      const res = validatePasswords(currentData.password, value);
      if (!res.isValid && (res.error === "Passwords do not match." || res.error === "Confirm password is required.")) {
        error = res.error;
      }
    } else if (name === "role") {
      const res = validateRole(value);
      if (!res.isValid) error = res.error || "Invalid role";
    }
    return error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const fields = ["name", "email", "phone", "dob", "password", "confirmPassword", "role"] as const;
    
    fields.forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (!formData.avatarBase64) {
      newErrors.avatar = "Profile Image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          dob: formData.dob,
          role: formData.role,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          ...(formData.avatarBase64 && { avatarBase64: formData.avatarBase64 })
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Registration failed. Please try again.");
      } else {
        setSuccess(true);
        router.push("/auth/login");
      }
    } catch (err) {
      setApiError("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      const error = validateField(name, value, newData);
      
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }

        // Cross-field validation for passwords
        if (name === "password" && newData.confirmPassword !== undefined) {
           const confirmError = validateField("confirmPassword", newData.confirmPassword, newData);
           if (confirmError) newErrors.confirmPassword = confirmError;
           else delete newErrors.confirmPassword;
        }
        if (name === "confirmPassword" && newData.password !== undefined) {
           const passError = validateField("password", newData.password, newData);
           if (passError) newErrors.password = passError;
           else delete newErrors.password;
        }

        return newErrors;
      });

      return newData;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors(prev => ({ ...prev, avatar: "Only image files (JPEG, PNG, etc.) are allowed" }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors(prev => ({ ...prev, avatar: "Image size must be less than 2MB" }));
        return;
      }
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.avatar;
        return newErrors;
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value, formData);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center space-x-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl text-gray-900 tracking-tight">AGRI-NOVA</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {apiError && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {apiError}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 text-sm font-medium flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Profile Image (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="appearance-none block w-full pl-10 px-3 py-1.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                </div>
                {errors.avatar && <p className="mt-1 text-xs text-red-500">{errors.avatar}</p>}
                {formData.avatarBase64 && (
                  <div className="mt-2 flex justify-center">
                    <img src={formData.avatarBase64} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>

              {/* Account Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Role</label>
                <div className="mt-1">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.role ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="BUYER">Buyer</option>
                    <option value="EQUIPMENT_OWNER">Equipment Owner</option>
                    <option value="VETERINARY_EXPERT">Veterinary Expert</option>
                    <option value="DELIVERY_PARTNER">Delivery Partner</option>
                  </select>
                </div>
                {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${errors.dob ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                  />
                </div>
                {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm bg-white text-gray-900`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-[10px] text-gray-500 px-4">
            By registering, you agree to AGRI-NOVA's Terms of Service and Privacy Policy. Your data is secured and processed as per GDPR & local regulations.
          </p>

        </div>
      </div>
    </div>
  );
}
