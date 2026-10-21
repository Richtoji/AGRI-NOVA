"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthRole, RoleType } from "@/lib/context/AuthRoleContext";
import {
  Sprout,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShoppingBag,
  Wrench,
  HeartHandshake,
  Truck,
  ShieldCheck,
  Shield
} from "lucide-react";
import {
  validateEmailWithDetails,
  validatePhoneWithDetails,
  validateDob,
  validatePasswords,
  evaluatePasswordStrength
} from "@/lib/validation";

interface RoleMeta {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
}

const ROLE_META: Record<RoleType, RoleMeta> = {
  FARMER: {
    label: "Farmer",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Sprout
  },
  BUYER: {
    label: "Buyer",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    icon: ShoppingBag
  },
  EQUIPMENT_OWNER: {
    label: "Equipment Owner",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Wrench
  },
  VETERINARY_EXPERT: {
    label: "Veterinary Expert",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    icon: HeartHandshake
  },
  DELIVERY_PARTNER: {
    label: "Delivery Partner",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Truck
  },
  ADMIN: {
    label: "System Admin",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    icon: ShieldCheck
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    icon: ShieldCheck
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("FARMER");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Forgot Password State
  const [mode, setMode] = useState<"login" | "forgot_password">("login");
  const [fpPhone, setFpPhone] = useState("");
  const [fpDob, setFpDob] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpSuccess, setFpSuccess] = useState(false);
  const [fpFieldErrors, setFpFieldErrors] = useState<Record<string, string>>({});

  // Show Password States
  const [showPassword, setShowPassword] = useState(false);
  const [showFpNewPassword, setShowFpNewPassword] = useState(false);
  const [showFpConfirmPassword, setShowFpConfirmPassword] = useState(false);

  const fpStrength = evaluatePasswordStrength(fpNewPassword);
  const fpMatch = fpNewPassword.length > 0 && fpConfirmPassword.length > 0 && fpNewPassword === fpConfirmPassword;

  const activeRole = ROLE_META[selectedRole] || ROLE_META.FARMER;
  const ActiveRoleIcon = activeRole.icon;

  const getRoleDashboardPath = (r: RoleType) => {
    switch (r) {
      case "FARMER": return "/dashboard/farmer";
      case "BUYER": return "/dashboard/buyer";
      case "EQUIPMENT_OWNER": return "/dashboard/equipment";
      case "VETERINARY_EXPERT": return "/dashboard/veterinary";
      case "DELIVERY_PARTNER": return "/dashboard/delivery";
      case "ADMIN": return "/dashboard/admin";
      default: return "/dashboard/farmer";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const errors: Record<string, string> = {};

    // 1. Strict Email Validation
    const emailCheck = validateEmailWithDetails(email.trim());
    if (!emailCheck.isValid) {
      errors.email = emailCheck.error || "Please enter a valid email address.";
    }

    // 2. Strict Password Validation
    if (!password || password.trim().length === 0) {
      errors.password = "Password is required and cannot be empty.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setValidationError("Please resolve the input errors below.");
      return;
    }

    setIsLoading(true);
    const res = await login(email.trim().toLowerCase(), password, selectedRole);
    setIsLoading(false);

    if (res.success) {
      const targetRole = (res as any)?.user?.role || selectedRole;
      const targetPath = getRoleDashboardPath(targetRole);
      router.push(targetPath);
      setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth/login")) {
          window.location.href = targetPath;
        }
      }, 250);
    } else {
      setValidationError(res.error || "Invalid credentials or role selection.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const errors: Record<string, string> = {};

    // Strict Phone Validation
    const phoneCheck = validatePhoneWithDetails(fpPhone);
    if (!phoneCheck.isValid) {
      errors.phone = phoneCheck.error || "Enter a valid 10-digit Indian phone number.";
    }

    // Strict DOB Validation
    const dobCheck = validateDob(fpDob);
    if (!dobCheck.isValid) {
      errors.dob = dobCheck.error || "Please select a valid date of birth.";
    }

    // Strict Passwords Validation
    const pwdCheck = validatePasswords(fpNewPassword, fpConfirmPassword);
    if (!pwdCheck.isValid) {
      errors.password = pwdCheck.error || "New password does not meet security requirements.";
    }

    setFpFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setValidationError("Please fix all errors before resetting your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneCheck.cleanPhone || fpPhone.trim(),
          dob: fpDob,
          newPassword: fpNewPassword,
          confirmPassword: fpConfirmPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setValidationError(data.error || "Failed to reset password.");
      } else {
        setFpSuccess(true);
        setTimeout(() => {
          setMode("login");
          setFpSuccess(false);
          setFpPhone("");
          setFpDob("");
          setFpNewPassword("");
          setFpConfirmPassword("");
          setFpFieldErrors({});
        }, 3000);
      }
    } catch (err) {
      setValidationError("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Subtle Pastel Ambient Accents (Barely-there, matching light theme) */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/35 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        <Link href="/" className="inline-flex items-center space-x-2 group mb-6">
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-emerald-50 flex items-center justify-center text-gray-900 transition-colors shadow-xs"
          >
            <Sprout className="w-6 h-6 text-emerald-600 group-hover:scale-105 transition-transform" />
          </motion.div>
          <span className="font-bold text-2xl text-gray-900 tracking-tight">AGRI-NOVA</span>
        </Link>
        <h2 className="mt-1 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {mode === "login" ? "Sign in to your account" : "Reset your password"}
        </h2>
        {mode === "login" && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link 
              href="/auth/register" 
              className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors font-semibold"
            >
              create a new account
            </Link>
          </p>
        )}
      </motion.div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-sm sm:shadow-md rounded-2xl sm:px-10 border border-gray-100 relative transition-all">

          <AnimatePresence mode="wait">
            {validationError && (
              <motion.div 
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium flex items-center shadow-xs"
              >
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {fpSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-medium flex items-center shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                <span>Password updated successfully! Redirecting to login...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" ? (
            <form className="space-y-5" onSubmit={handleLogin} noValidate>
              
              {/* Account Role with Dynamic Subtle Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Account Role</label>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={selectedRole}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${activeRole.badgeClass}`}
                    >
                      <ActiveRoleIcon className="w-3 h-3" />
                      {activeRole.label}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="mt-1">
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      const newRole = e.target.value as RoleType;
                      setSelectedRole(newRole);
                    }}
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl shadow-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 sm:text-sm bg-white text-gray-900 transition-colors cursor-pointer"
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="BUYER">Buyer</option>
                    <option value="EQUIPMENT_OWNER">Equipment Owner</option>
                    <option value="VETERINARY_EXPERT">Veterinary Expert</option>
                    <option value="DELIVERY_PARTNER">Delivery Partner</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                      const lower = val.trim().toLowerCase();
                      if (lower === "subin@gmail.com" || lower.startsWith("subin") || lower.includes("buyer")) {
                        setSelectedRole("BUYER");
                      } else if (lower === "vet@agrinova.com" || lower.startsWith("vet")) {
                        setSelectedRole("VETERINARY_EXPERT");
                      } else if (lower === "equipment@agrinova.com" || lower.startsWith("equipment")) {
                        setSelectedRole("EQUIPMENT_OWNER");
                      } else if (lower === "admin@agrinova.com" || lower.startsWith("admin")) {
                        setSelectedRole("ADMIN");
                      } else if (lower === "delivery@agri-nova.com" || lower.startsWith("delivery")) {
                        setSelectedRole("DELIVERY_PARTNER");
                      } else if (lower === "farmer@agri-nova.com" || lower.startsWith("farmer")) {
                        setSelectedRole("FARMER");
                      }
                    }}
                    onBlur={() => {
                      const check = validateEmailWithDetails(email.trim());
                      if (!check.isValid) setFieldErrors(prev => ({ ...prev, email: check.error || "" }));
                    }}
                    className={`appearance-none block w-full pl-10 px-3 py-2.5 border rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-gray-300 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 mt-1 flex items-center font-medium"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className={`appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.password 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-gray-300 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {fieldErrors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 mt-1 flex items-center font-medium"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 block text-sm text-gray-900 font-medium">
                    Remember me
                  </span>
                </label>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setValidationError(null);
                      setFieldErrors({});
                    }}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Submit Button with Subtle Hover Feedback */}
              <div className="pt-1">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center space-x-1.5">
                      <span>Sign in to Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            /* ================= FORGOT PASSWORD FORM ================= */
            <form className="space-y-4" onSubmit={handleForgotPassword} noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registered Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={fpPhone}
                    onChange={(e) => {
                      setFpPhone(e.target.value);
                      if (fpFieldErrors.phone) setFpFieldErrors(prev => ({ ...prev, phone: "" }));
                    }}
                    onBlur={() => {
                      const check = validatePhoneWithDetails(fpPhone);
                      if (!check.isValid) setFpFieldErrors(prev => ({ ...prev, phone: check.error || "" }));
                    }}
                    className={`appearance-none block w-full pl-10 px-3 py-2.5 border rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      fpFieldErrors.phone ? "border-rose-400 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {fpFieldErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center font-medium">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fpFieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth (For Identity Verification) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={fpDob}
                    onChange={(e) => {
                      setFpDob(e.target.value);
                      if (fpFieldErrors.dob) setFpFieldErrors(prev => ({ ...prev, dob: "" }));
                    }}
                    onBlur={() => {
                      const check = validateDob(fpDob);
                      if (!check.isValid) setFpFieldErrors(prev => ({ ...prev, dob: check.error || "" }));
                    }}
                    className={`appearance-none block w-full pl-10 px-3 py-2.5 border rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      fpFieldErrors.dob ? "border-rose-400 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {fpFieldErrors.dob && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center font-medium">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fpFieldErrors.dob}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  {fpNewPassword && (
                    <span className="text-[10px] font-bold text-gray-600">
                      Strength: {fpStrength.strengthLabel}
                    </span>
                  )}
                </div>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showFpNewPassword ? "text" : "password"}
                    required
                    value={fpNewPassword}
                    onChange={(e) => {
                      setFpNewPassword(e.target.value);
                      if (fpFieldErrors.password) setFpFieldErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border border-gray-300 rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
                    placeholder="Enter strict new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFpNewPassword(!showFpNewPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showFpNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {fpNewPassword && (
                  <div className="grid grid-cols-2 gap-1 pt-1.5 text-[11px]">
                    <span className={fpStrength.rules.minLength ? "text-emerald-700 font-semibold" : "text-gray-400"}>
                      • 8+ characters
                    </span>
                    <span className={fpStrength.rules.hasUppercase && fpStrength.rules.hasLowercase ? "text-emerald-700 font-semibold" : "text-gray-400"}>
                      • Upper &amp; lower
                    </span>
                    <span className={fpStrength.rules.hasNumber ? "text-emerald-700 font-semibold" : "text-gray-400"}>
                      • Number (0-9)
                    </span>
                    <span className={fpStrength.rules.hasSpecial ? "text-emerald-700 font-semibold" : "text-gray-400"}>
                      • Symbol (!@#$)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  {fpConfirmPassword && (
                    <span className={`text-[10px] font-bold ${fpMatch ? "text-emerald-600" : "text-rose-600"}`}>
                      {fpMatch ? "✓ Match" : "✕ Mismatch"}
                    </span>
                  )}
                </div>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showFpConfirmPassword ? "text" : "password"}
                    required
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border border-gray-300 rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
                    placeholder="Re-enter new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFpConfirmPassword(!showFpConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showFpConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {fpFieldErrors.password && (
                <p className="text-[11px] text-rose-600 flex items-center font-medium">
                  <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                  {fpFieldErrors.password}
                </p>
              )}

              <div className="flex flex-col space-y-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading || fpSuccess || !fpStrength.isValid || !fpMatch}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Reset Password"}
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setValidationError(null);
                    setFpFieldErrors({});
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-xs text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Minimal clean live status badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 flex items-center justify-center space-x-3 text-xs text-gray-500 font-medium"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            End-to-End Encrypted Session
          </span>
          <span>•</span>
          <span>Kerala Smart Agriculture</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
