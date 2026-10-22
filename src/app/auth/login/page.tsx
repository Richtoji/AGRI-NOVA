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
  TrendingUp,
  Sparkles,
  Award,
  Layers
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
  demoEmail: string;
  demoPass: string;
}

const ROLE_META: Record<RoleType, RoleMeta> = {
  FARMER: {
    label: "Farmer",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pillColor: "hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300",
    icon: Sprout,
    demoEmail: "farmer@agri-nova.com",
    demoPass: "Farmer@123"
  },
  BUYER: {
    label: "Buyer",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    pillColor: "hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300",
    icon: ShoppingBag,
    demoEmail: "subin@gmail.com",
    demoPass: "Buyer@123"
  },
  EQUIPMENT_OWNER: {
    label: "Equipment",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    pillColor: "hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300",
    icon: Wrench,
    demoEmail: "equipment@agrinova.com",
    demoPass: "Equipment@123"
  },
  VETERINARY_EXPERT: {
    label: "Veterinary",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    pillColor: "hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300",
    icon: HeartHandshake,
    demoEmail: "vet@agrinova.com",
    demoPass: "Vet@123"
  },
  DELIVERY_PARTNER: {
    label: "Delivery",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-200",
    pillColor: "hover:bg-orange-50 hover:text-orange-800 hover:border-orange-300",
    icon: Truck,
    demoEmail: "delivery@agri-nova.com",
    demoPass: "Delivery@123"
  },
  ADMIN: {
    label: "Admin",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    pillColor: "hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300",
    icon: ShieldCheck,
    demoEmail: "admin@agri-nova.com",
    demoPass: "Admin@12345"
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
    pillColor: "hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300",
    icon: ShieldCheck,
    demoEmail: "admin@agri-nova.com",
    demoPass: "Admin@12345"
  }
};

const DEMO_ROLES: RoleType[] = ["FARMER", "BUYER", "ADMIN", "EQUIPMENT_OWNER", "VETERINARY_EXPERT"];

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

  const handleQuickFill = (role: RoleType) => {
    const meta = ROLE_META[role];
    if (!meta) return;
    setSelectedRole(role);
    setEmail(meta.demoEmail);
    setPassword(meta.demoPass);
    setFieldErrors({});
    setValidationError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* Decorative Atmosphere Glows (Themed to Kerala Emerald & Forest tones) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-200/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-gray-100/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ================= LEFT COLUMN: STUNNING AGRICULTURAL SHOWCASE (Desktop) ================= */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Light Orb inside Left Panel */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
          
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Top Brand Banner */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all shadow-sm">
                <Sprout className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-white tracking-tight leading-none">
                  AGRI-NOVA
                </span>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">
                  Smart Agriculture Platform
                </span>
              </div>
            </Link>

            {/* Platform Feature Highlight Title */}
            <div className="mt-8 xl:mt-10 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>AI Agriculture &amp; Agri-Commerce</span>
              </div>
              
              <h1 className="text-2xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                Empower Your Harvest.<br />
                Connect With Markets.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  Grow With Certainty.
                </span>
              </h1>

              <p className="text-xs xl:text-sm text-emerald-100/80 leading-relaxed font-normal max-w-md">
                A unified ecosystem connecting Kerala&apos;s agricultural community with AI-backed crop advisories, direct marketplace auctions, and certified veterinary healthcare.
              </p>
            </div>
          </div>

          {/* Center Card: Agricultural Visual Showcase */}
          <div className="relative z-10 my-6">
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md p-3 relative group">
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src="/images/slide1.png"
                  alt="Supervised Farm Cultivation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
                
                {/* Live Floating Info Pill */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Cultivations in Kerala</span>
                  </span>
                  <span className="text-emerald-300">1,200+ Acres</span>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-1 text-center">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <Sprout className="w-4 h-4 mx-auto text-emerald-300 mb-1" />
                  <div className="text-[11px] font-bold text-white">AI Diagnostics</div>
                  <div className="text-[9px] text-emerald-200/70">Soil &amp; Weather</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <ShoppingBag className="w-4 h-4 mx-auto text-amber-300 mb-1" />
                  <div className="text-[11px] font-bold text-white">Direct Trade</div>
                  <div className="text-[9px] text-amber-200/70">Fair Prices</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <ShieldCheck className="w-4 h-4 mx-auto text-teal-300 mb-1" />
                  <div className="text-[11px] font-bold text-white">Verified KYC</div>
                  <div className="text-[9px] text-teal-200/70">Tier-2 Security</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-[11px] text-emerald-200/80 font-medium">
            <span className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              <span>State Agricultural Compliant</span>
            </span>
            <span>256-Bit SSL Encrypted</span>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: SLEEK AUTHENTICATION FORM ================= */}
        <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
          
          {/* Mobile Header Branding (< lg) */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="font-black text-xl text-gray-900 tracking-tight">AGRI-NOVA</span>
            </Link>
          </div>

          {/* Header Title */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {mode === "login" ? "Sign In" : "Reset Password"}
              </h2>
              <span className="text-xl">🌿</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              {mode === "login" 
                ? "Enter your credentials to access your agricultural dashboard."
                : "Verify your phone and date of birth to set a secure new password."
              }
            </p>
          </div>

          {/* Alerts: Validation Error / Success */}
          <AnimatePresence mode="wait">
            {validationError && (
              <motion.div 
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center shadow-xs"
              >
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {fpSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                <span>Password updated successfully! Redirecting to sign in...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin} noValidate>
              
              {/* Account Role Selector with Interactive Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Select Your Role
                  </label>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full ${activeRole.badgeClass}`}>
                    <ActiveRoleIcon className="w-3 h-3" />
                    <span>{activeRole.label}</span>
                  </span>
                </div>

                {/* Role Pill Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(["FARMER", "BUYER", "ADMIN", "EQUIPMENT_OWNER", "VETERINARY_EXPERT", "DELIVERY_PARTNER"] as RoleType[]).map((r) => {
                    const meta = ROLE_META[r];
                    const Icon = meta.icon;
                    const isSelected = selectedRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`flex items-center space-x-1.5 p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-400" : "text-gray-500"}`} />
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
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
                      } else if (lower === "admin@agri-nova.com" || lower.startsWith("admin")) {
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
                    className={`block w-full pl-10 pr-3.5 py-2.5 border rounded-2xl text-xs sm:text-sm bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="e.g. farmer@agri-nova.com"
                  />
                </div>
                {fieldErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 mt-1 flex items-center font-semibold"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setValidationError(null);
                      setFieldErrors({});
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative rounded-2xl group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
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
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-2xl text-xs sm:text-sm bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.password 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="Enter account password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {fieldErrors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 mt-1 flex items-center font-semibold"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Quick Demo Credentials Autofill Helper */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 mb-1.5 uppercase tracking-wider">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Quick Demo Pre-fills:</span>
                  </span>
                  <span className="text-emerald-700/80">Tap to auto-fill</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {DEMO_ROLES.map((r) => {
                    const meta = ROLE_META[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleQuickFill(r)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          selectedRole === r
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 hover:from-emerald-800 hover:to-teal-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Register Callout */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 font-medium">
                  Don&apos;t have an account yet?{" "}
                  <Link 
                    href="/auth/register" 
                    className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Register new account
                  </Link>
                </p>
              </div>

            </form>
          ) : (
            /* ================= FORGOT PASSWORD FORM ================= */
            <form className="space-y-4" onSubmit={handleForgotPassword} noValidate>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Registered Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                    className={`block w-full pl-10 pr-3.5 py-2.5 border rounded-2xl text-xs sm:text-sm bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                      fpFieldErrors.phone ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="10-digit mobile number"
                  />
                </div>
                {fpFieldErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center font-semibold">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fpFieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Date of Birth (For Identity Match) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                    className={`block w-full pl-10 pr-3.5 py-2.5 border rounded-2xl text-xs sm:text-sm bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                      fpFieldErrors.dob ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {fpFieldErrors.dob && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center font-semibold">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fpFieldErrors.dob}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  {fpNewPassword && (
                    <span className="text-[10px] font-bold text-emerald-700">
                      Strength: {fpStrength.strengthLabel}
                    </span>
                  )}
                </div>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
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
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-2xl text-xs sm:text-sm bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
                    placeholder="Create strong new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFpNewPassword(!showFpNewPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                    >
                      {showFpNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {fpNewPassword && (
                  <div className="grid grid-cols-2 gap-1 pt-1.5 text-[10px]">
                    <span className={fpStrength.rules.minLength ? "text-emerald-700 font-bold" : "text-gray-400"}>
                      • 8+ characters
                    </span>
                    <span className={fpStrength.rules.hasUppercase && fpStrength.rules.hasLowercase ? "text-emerald-700 font-bold" : "text-gray-400"}>
                      • Upper &amp; lower
                    </span>
                    <span className={fpStrength.rules.hasNumber ? "text-emerald-700 font-bold" : "text-gray-400"}>
                      • Number (0-9)
                    </span>
                    <span className={fpStrength.rules.hasSpecial ? "text-emerald-700 font-bold" : "text-gray-400"}>
                      • Symbol (!@#$)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  {fpConfirmPassword && (
                    <span className={`text-[10px] font-bold ${fpMatch ? "text-emerald-600" : "text-rose-600"}`}>
                      {fpMatch ? "✓ Match" : "✕ Mismatch"}
                    </span>
                  )}
                </div>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showFpConfirmPassword ? "text" : "password"}
                    required
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-2xl text-xs sm:text-sm bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
                    placeholder="Confirm new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFpConfirmPassword(!showFpConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                    >
                      {showFpConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {fpFieldErrors.password && (
                <p className="text-[11px] text-rose-600 flex items-center font-semibold">
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
                  className="w-full py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                  className="w-full py-2.5 px-4 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Footer badge */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-[11px] text-gray-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Encrypted Session</span>
            <span>•</span>
            <span>Kerala Agricultural Network</span>
          </div>

        </div>

      </div>

    </div>
  );
}
