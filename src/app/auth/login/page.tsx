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
  Truck,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import {
  validateEmailWithDetails,
  validatePhoneWithDetails,
  validateDob,
  validatePasswords,
  evaluatePasswordStrength
} from "@/lib/validation";

interface RoleThemeConfig {
  label: string;
  badgeLabel: string;
  desc: string;
  icon: React.ElementType;
  bgLight: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

const ROLE_THEMES: Record<RoleType, RoleThemeConfig> = {
  FARMER: {
    label: "Farmer",
    badgeLabel: "Cultivator & Producer",
    desc: "AI crop advisory, cultivation logs & farm-gate trade",
    icon: Sprout,
    bgLight: "bg-emerald-50/80 dark:bg-emerald-950/30",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800/60",
    glowColor: "rgba(16, 185, 129, 0.25)"
  },
  BUYER: {
    label: "Buyer",
    badgeLabel: "Wholesale & Supermarket",
    desc: "Direct farm procurement, order escrow & tracking",
    icon: ShoppingBag,
    bgLight: "bg-sky-50/80 dark:bg-sky-950/30",
    textColor: "text-sky-700 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800/60",
    glowColor: "rgba(14, 165, 233, 0.25)"
  },
  EQUIPMENT_OWNER: {
    label: "Equipment Owner",
    badgeLabel: "Machinery Fleet",
    desc: "Tractor, drone & harvester bookings & revenue",
    icon: Wrench,
    bgLight: "bg-amber-50/80 dark:bg-amber-950/30",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800/60",
    glowColor: "rgba(245, 158, 11, 0.25)"
  },
  VETERINARY_EXPERT: {
    label: "Veterinary Expert",
    badgeLabel: "Animal Healthcare",
    desc: "Tele-consultations, livestock prescriptions & visits",
    icon: HeartHandshake,
    bgLight: "bg-teal-50/80 dark:bg-teal-950/30",
    textColor: "text-teal-700 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-800/60",
    glowColor: "rgba(20, 184, 166, 0.25)"
  },
  DELIVERY_PARTNER: {
    label: "Delivery Partner",
    badgeLabel: "Cold-Chain Logistics",
    desc: "Farm pickup assignments & cold-chain distribution",
    icon: Truck,
    bgLight: "bg-orange-50/80 dark:bg-orange-950/30",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800/60",
    glowColor: "rgba(249, 115, 22, 0.25)"
  },
  ADMIN: {
    label: "System Admin",
    badgeLabel: "Ecosystem Control",
    desc: "Platform governance, KYC verification & analytics",
    icon: ShieldCheck,
    bgLight: "bg-purple-50/80 dark:bg-purple-950/30",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800/60",
    glowColor: "rgba(168, 85, 247, 0.25)"
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

  const currentTheme = ROLE_THEMES[selectedRole] || ROLE_THEMES.FARMER;
  const RoleIcon = currentTheme.icon;

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
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* ================= DYNAMIC BACKGROUND ORBS & AMBIENCE ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft floating emerald blob */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -35, 20, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/20 dark:bg-emerald-600/15 blur-3xl"
        />

        {/* Soft floating sky/teal blob */}
        <motion.div
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 30, -25, 0],
            scale: [1, 1.12, 0.96, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-400/20 dark:bg-teal-600/15 blur-3xl"
        />

        {/* Warm amber center glow */}
        <motion.div
          animate={{
            opacity: [0.15, 0.28, 0.15],
            scale: [0.9, 1.05, 0.9]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-amber-400/10 dark:bg-amber-600/10 blur-[100px]"
        />

        {/* Precision Agricultural Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px]" 
        />

        {/* Floating Agricultural Micro-Particles */}
        <motion.div
          animate={{ y: [0, -24, 0], rotate: [0, 15, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[15%] text-emerald-500/20 dark:text-emerald-400/15"
        >
          <Sprout className="w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 28, 0], rotate: [0, -20, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-[16%] text-teal-500/20 dark:text-teal-400/15"
        >
          <Sparkles className="w-7 h-7" />
        </motion.div>
      </div>

      {/* ================= HEADER BRANDING ================= */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center"
      >
        <Link href="/" className="inline-flex items-center space-x-3 group mb-4">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-500/20 transition-all duration-300"
          >
            <Sprout className="w-7 h-7" />
          </motion.div>
          <div className="text-left">
            <span className="block font-black text-2xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              AGRI-NOVA
            </span>
            <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
              Smart Farming &amp; Trade Ecosystem
            </span>
          </div>
        </Link>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {mode === "login" ? "Sign in to your account" : "Reset your password"}
        </h2>
        
        {mode === "login" && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Or{" "}
            <Link 
              href="/auth/register" 
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors"
            >
              create a new account
            </Link>
          </p>
        )}
      </motion.div>

      {/* ================= LOGIN FORM CARD ================= */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl py-8 px-5 sm:px-9 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 transition-all">
          
          {/* Subtle Top Accent Glow Border */}
          <div className="absolute inset-x-8 -top-px h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

          {/* Validation & Success Banners */}
          <AnimatePresence mode="wait">
            {validationError && (
              <motion.div 
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium flex items-center shadow-xs"
              >
                <AlertCircle className="w-4 h-4 mr-2.5 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {fpSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Password updated successfully! Redirecting to login...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" ? (
            <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin} noValidate>
              
              {/* Dynamic Animated Role Card Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Account Role
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-detected
                  </span>
                </div>

                {/* Animated Role Status Banner */}
                <motion.div 
                  key={selectedRole}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center justify-between px-3.5 py-2.5 mb-2 rounded-2xl border ${currentTheme.bgLight} ${currentTheme.borderColor} shadow-xs transition-colors`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-xs ${currentTheme.textColor}`}>
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`block text-xs font-bold ${currentTheme.textColor}`}>
                        {currentTheme.label}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        {currentTheme.desc}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border ${currentTheme.borderColor} ${currentTheme.textColor}`}>
                    {currentTheme.badgeLabel}
                  </span>
                </motion.div>

                {/* Role Dropdown */}
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    const newRole = e.target.value as RoleType;
                    setSelectedRole(newRole);
                  }}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium bg-slate-50/50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="FARMER">Farmer (Cultivation, Advisory &amp; Produce)</option>
                  <option value="BUYER">Buyer (Wholesale, Retail &amp; Escrow)</option>
                  <option value="EQUIPMENT_OWNER">Equipment Owner (Tractors, Drones &amp; Harvesters)</option>
                  <option value="VETERINARY_EXPERT">Veterinary Expert (Livestock Healthcare &amp; DVM)</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner (Cold-Chain Logistics &amp; Transport)</option>
                  <option value="ADMIN">System Admin (Platform Governance &amp; Security)</option>
                </select>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
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
                    className={`appearance-none block w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    placeholder="Enter your registered email"
                  />
                </div>
                {fieldErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center font-medium"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className={`appearance-none block w-full pl-10 pr-10 py-2.5 sm:py-3 border rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.password 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {fieldErrors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center font-medium"
                  >
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                <label className="flex items-center cursor-pointer select-none text-slate-600 dark:text-slate-400">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 rounded-md cursor-pointer"
                  />
                  <span className="ml-2 font-medium">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot_password");
                    setValidationError(null);
                    setFieldErrors({});
                  }}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isLoading}
                  className="relative group overflow-hidden w-full flex justify-center items-center py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {/* Subtle Light Sweep Animation on Hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center space-x-2">
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
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
                    className={`appearance-none block w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      fpFieldErrors.phone 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {fpFieldErrors.phone && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center font-medium">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fpFieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Date of Birth (For Identity Verification) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
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
                    className={`appearance-none block w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      fpFieldErrors.dob 
                        ? "border-rose-400 focus:ring-rose-200" 
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {fpFieldErrors.dob && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center font-medium">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fpFieldErrors.dob}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  {fpNewPassword && (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Strength: {fpStrength.strengthLabel}
                    </span>
                  )}
                </div>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showFpNewPassword ? "text" : "password"}
                    required
                    value={fpNewPassword}
                    onChange={(e) => {
                      setFpNewPassword(e.target.value);
                      if (fpFieldErrors.password) setFpFieldErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Enter strict new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFpNewPassword(!showFpNewPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                      {showFpNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {fpNewPassword && (
                  <div className="grid grid-cols-2 gap-1 pt-1.5 text-[11px]">
                    <span className={fpStrength.rules.minLength ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-400"}>
                      • 8+ characters
                    </span>
                    <span className={fpStrength.rules.hasUppercase && fpStrength.rules.hasLowercase ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-400"}>
                      • Upper &amp; lower
                    </span>
                    <span className={fpStrength.rules.hasNumber ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-400"}>
                      • Number (0-9)
                    </span>
                    <span className={fpStrength.rules.hasSpecial ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-slate-400"}>
                      • Symbol (!@#$)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  {fpConfirmPassword && (
                    <span className={`text-[10px] font-bold ${fpMatch ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {fpMatch ? "✓ Match" : "✕ Mismatch"}
                    </span>
                  )}
                </div>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showFpConfirmPassword ? "text" : "password"}
                    required
                    value={fpConfirmPassword}
                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Re-enter new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFpConfirmPassword(!showFpConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                      {showFpConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {fpFieldErrors.password && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center font-medium">
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
                  className="w-full flex justify-center py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                  className="w-full flex justify-center py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Ambient Trust Badges Below Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            256-Bit SSL Encrypted
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Auto-Role Navigation
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Kerala Agri-Tech Network
          </span>
        </motion.div>

      </motion.div>
    </div>
  );
}
