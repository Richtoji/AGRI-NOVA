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
  ArrowLeft,
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
  Sparkles,
  Award
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
  pillColor: string;
  icon: React.ElementType;
}

const ROLE_META: Record<RoleType, RoleMeta> = {
  FARMER: {
    label: "Farmer",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pillColor: "hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300",
    icon: Sprout
  },
  BUYER: {
    label: "Buyer",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    pillColor: "hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300",
    icon: ShoppingBag
  },
  EQUIPMENT_OWNER: {
    label: "Equipment",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    pillColor: "hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300",
    icon: Wrench
  },
  VETERINARY_EXPERT: {
    label: "Veterinary",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    pillColor: "hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300",
    icon: HeartHandshake
  },
  DELIVERY_PARTNER: {
    label: "Delivery",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-200",
    pillColor: "hover:bg-orange-50 hover:text-orange-800 hover:border-orange-300",
    icon: Truck
  },
  ADMIN: {
    label: "Admin",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    pillColor: "hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300",
    icon: ShieldCheck
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
    pillColor: "hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300",
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

    // Strict Email Validation
    const emailCheck = validateEmailWithDetails(email.trim());
    if (!emailCheck.isValid) {
      errors.email = emailCheck.error || "Please enter a valid email address.";
    }

    // Strict Password Validation
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
    <div className="h-screen w-full bg-slate-50 flex flex-col justify-between overflow-hidden relative">
      
      {/* ================= WEBSITE INTEGRATED TOP HEADER ================= */}
      <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white group-hover:bg-emerald-700 transition-colors shrink-0 shadow-2xs">
            <Sprout className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm text-gray-900 tracking-tight leading-none">
              AGRI-NOVA
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Smart Agriculture Portal
            </span>
          </div>
        </Link>

        {/* Website Navigation Links (Aligned to Website Theme) */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-semibold">
          <Link 
            href="/" 
            className="hidden sm:flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
            <span>Back to Home</span>
          </Link>
          <Link 
            href="/marketplace" 
            className="hidden md:flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Marketplace</span>
          </Link>
          <span className="h-4 w-px bg-gray-200 hidden sm:block"></span>
          <span className="text-gray-500 text-xs hidden sm:inline font-medium">New to platform?</span>
          <Link 
            href="/auth/register" 
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors"
          >
            Register Account
          </Link>
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA (FITTED SINGLE PAGE) ================= */}
      <main className="flex-1 flex items-center justify-center p-2.5 sm:p-4 lg:p-6 overflow-hidden relative">
        
        {/* Subtle Themed Ambient Orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Single Page Card Container */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100/90 grid grid-cols-1 lg:grid-cols-12 overflow-hidden my-auto max-h-[calc(100vh-4.5rem)]">

          {/* ================= LEFT COLUMN: AGRICULTURAL SHOWCASE (Desktop) ================= */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 xl:p-8 flex-col justify-between relative overflow-hidden">
            
            {/* Background Texture & Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Top Showcase Info */}
            <div className="relative z-10 space-y-2.5">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>AI Agriculture Ecosystem</span>
              </div>
              
              <h1 className="text-xl xl:text-2xl font-black text-white leading-tight tracking-tight">
                Empower Your Farm.<br />
                Connect With Markets.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                  Harvest Pure Value.
                </span>
              </h1>

              <p className="text-[11px] text-emerald-100/80 leading-relaxed font-normal">
                Connecting Kerala&apos;s agricultural community with AI crop cycle tracking, marketplace auctions, and certified veterinary healthcare.
              </p>
            </div>

            {/* Center Image Banner */}
            <div className="relative z-10 my-3">
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 p-2 relative group">
                <div className="relative h-28 xl:h-32 rounded-xl overflow-hidden">
                  <img
                    src="/images/slide1.png"
                    alt="Kerala Supervised Farming"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/20 to-transparent" />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Kerala Farm Hubs</span>
                    </span>
                    <span className="text-emerald-300">1,200+ Acres</span>
                  </div>
                </div>

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Sprout className="w-3.5 h-3.5 mx-auto text-emerald-300 mb-0.5" />
                    <div className="text-[10px] font-bold text-white leading-tight">AI Advisor</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <ShoppingBag className="w-3.5 h-3.5 mx-auto text-amber-300 mb-0.5" />
                    <div className="text-[10px] font-bold text-white leading-tight">Direct Trade</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 mx-auto text-teal-300 mb-0.5" />
                    <div className="text-[10px] font-bold text-white leading-tight">Verified KYC</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-emerald-200/80 font-medium">
              <span className="flex items-center space-x-1">
                <Award className="w-3 h-3 text-emerald-300" />
                <span>State Agricultural Compliant</span>
              </span>
              <span>256-Bit SSL</span>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: COMPACT SINGLE-PAGE FORM ================= */}
          <div className="lg:col-span-7 xl:col-span-7 p-4 sm:p-6 xl:p-8 flex flex-col justify-center bg-white overflow-y-auto custom-scrollbar">
            
            {/* Form Header */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {mode === "login" ? "Sign In" : "Reset Password"}
                </h2>
                <span className="text-base sm:text-lg">🌿</span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium">
                {mode === "login" 
                  ? "Enter your credentials to access your agricultural dashboard."
                  : "Verify your phone and date of birth to set a secure new password."
                }
              </p>
            </div>

            {/* Validation Alerts */}
            <AnimatePresence mode="wait">
              {validationError && (
                <motion.div 
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center shadow-2xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-2 shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </motion.div>
              )}

              {fpSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 shrink-0 text-emerald-600" />
                  <span>Password updated successfully! Redirecting to sign in...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "login" ? (
              <form className="space-y-3" onSubmit={handleLogin} noValidate>
                
                {/* Account Role Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Account Role
                    </label>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.2 rounded-full ${activeRole.badgeClass}`}>
                      <ActiveRoleIcon className="w-2.5 h-2.5" />
                      <span>{activeRole.label}</span>
                    </span>
                  </div>

                  {/* 5 Role Pills in 1 compact grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                    {(["FARMER", "BUYER", "ADMIN", "EQUIPMENT_OWNER", "VETERINARY_EXPERT"] as RoleType[]).map((r) => {
                      const meta = ROLE_META[r];
                      const Icon = meta.icon;
                      const isSelected = selectedRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRole(r)}
                          className={`flex items-center justify-center space-x-1 py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-gray-900 text-white border-gray-900 shadow-2xs"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <Icon className={`w-3 h-3 shrink-0 ${isSelected ? "text-emerald-400" : "text-gray-500"}`} />
                          <span className="truncate">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                      <Mail className="h-3.5 w-3.5" />
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
                        } else if (lower === "admin@agri-nova.com" || lower.startsWith("admin")) {
                          setSelectedRole("ADMIN");
                        } else if (lower === "farmer@agri-nova.com" || lower.startsWith("farmer")) {
                          setSelectedRole("FARMER");
                        }
                      }}
                      onBlur={() => {
                        const check = validateEmailWithDetails(email.trim());
                        if (!check.isValid) setFieldErrors(prev => ({ ...prev, email: check.error || "" }));
                      }}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.email 
                          ? "border-rose-400 focus:ring-rose-200" 
                          : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                      }`}
                      placeholder="e.g. farmer@agri-nova.com"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[10px] text-rose-600 mt-0.5 flex items-center font-semibold">
                      <AlertCircle className="w-2.5 h-2.5 mr-1 shrink-0" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot_password");
                        setValidationError(null);
                        setFieldErrors({});
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative rounded-xl group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                      }}
                      className={`block w-full pl-9 pr-9 py-2 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.password 
                          ? "border-rose-400 focus:ring-rose-200" 
                          : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                      }`}
                      placeholder="Enter account password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[10px] text-rose-600 mt-0.5 flex items-center font-semibold">
                      <AlertCircle className="w-2.5 h-2.5 mr-1 shrink-0" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>


                {/* Submit Button */}
                <div className="pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl shadow-md text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 hover:from-emerald-800 hover:to-teal-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Register & Security Footer */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-gray-500 font-medium">
                  <Link 
                    href="/auth/register" 
                    className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Register new account →
                  </Link>

                  <span className="flex items-center space-x-1 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Encrypted Session</span>
                  </span>
                </div>

              </form>
            ) : (
              /* ================= FORGOT PASSWORD FORM (FITTED) ================= */
              <form className="space-y-2.5" onSubmit={handleForgotPassword} noValidate>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="h-3.5 w-3.5" />
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
                      className={`block w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                        fpFieldErrors.phone ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                      }`}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  {fpFieldErrors.phone && (
                    <p className="text-[10px] text-rose-600 mt-0.5 flex items-center font-semibold">
                      <AlertCircle className="w-2.5 h-2.5 mr-1 shrink-0" />
                      {fpFieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
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
                      className={`block w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                        fpFieldErrors.dob ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                      }`}
                    />
                  </div>
                  {fpFieldErrors.dob && (
                    <p className="text-[10px] text-rose-600 mt-0.5 flex items-center font-semibold">
                      <AlertCircle className="w-2.5 h-2.5 mr-1 shrink-0" />
                      {fpFieldErrors.dob}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    {fpNewPassword && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        Strength: {fpStrength.strengthLabel}
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showFpNewPassword ? "text" : "password"}
                      required
                      value={fpNewPassword}
                      onChange={(e) => {
                        setFpNewPassword(e.target.value);
                        if (fpFieldErrors.password) setFpFieldErrors(prev => ({ ...prev, password: "" }));
                      }}
                      className="block w-full pl-9 pr-9 py-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
                      placeholder="Enter strong new password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowFpNewPassword(!showFpNewPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                      >
                        {showFpNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    {fpConfirmPassword && (
                      <span className={`text-[10px] font-bold ${fpMatch ? "text-emerald-600" : "text-rose-600"}`}>
                        {fpMatch ? "✓ Match" : "✕ Mismatch"}
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showFpConfirmPassword ? "text" : "password"}
                      required
                      value={fpConfirmPassword}
                      onChange={(e) => setFpConfirmPassword(e.target.value)}
                      className="block w-full pl-9 pr-9 py-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
                      placeholder="Re-enter new password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowFpConfirmPassword(!showFpConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                      >
                        {showFpConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {fpFieldErrors.password && (
                  <p className="text-[10px] text-rose-600 flex items-center font-semibold">
                    <AlertCircle className="w-2.5 h-2.5 mr-1 shrink-0" />
                    {fpFieldErrors.password}
                  </p>
                )}

                <div className="flex flex-col space-y-1.5 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading || fpSuccess || !fpStrength.isValid || !fpMatch}
                    className="w-full py-2 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Reset Password"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setValidationError(null);
                      setFpFieldErrors({});
                    }}
                    className="w-full py-1.5 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
