"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check
} from "lucide-react";
import {
  validateEmailWithDetails,
  validatePhoneWithDetails,
  validateDob,
  validatePasswords,
  evaluatePasswordStrength
} from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthRole();
  const [email, setEmail] = useState("farmer@agri-nova.com");
  const [password, setPassword] = useState("password123");
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
      router.push(getRoleDashboardPath(selectedRole));
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center space-x-2 group mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 transition-colors">
            <Sprout className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="font-bold text-2xl text-gray-900 tracking-tight">AGRI-NOVA</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          {mode === "login" ? "Sign in to your account" : "Reset your password"}
        </h2>
        {mode === "login" && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/auth/register" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">
              create a new account
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-2xl sm:px-10 border border-gray-100">

          {validationError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {fpSuccess && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-medium flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
              <span>Password updated successfully! Redirecting to login...</span>
            </div>
          )}

          {mode === "login" ? (
            <form className="space-y-5" onSubmit={handleLogin} noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
                <div className="mt-1">
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      const newRole = e.target.value as RoleType;
                      setSelectedRole(newRole);

                      // Auto-fill demo emails
                      switch (newRole) {
                        case "FARMER": setEmail("farmer@agri-nova.com"); break;
                        case "BUYER": setEmail("buyer@agri-nova.com"); break;
                        case "EQUIPMENT_OWNER": setEmail("equipment@agri-nova.com"); break;
                        case "VETERINARY_EXPERT": setEmail("vet@agri-nova.com"); break;
                        case "DELIVERY_PARTNER": setEmail("delivery@agri-nova.com"); break;
                        case "ADMIN": setEmail("admin@agri-nova.com"); break;
                      }
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 sm:text-sm bg-white text-gray-900"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                    }}
                    onBlur={() => {
                      const check = validateEmailWithDetails(email.trim());
                      if (!check.isValid) setFieldErrors(prev => ({ ...prev, email: check.error || "" }));
                    }}
                    className={`appearance-none block w-full pl-10 px-3 py-2.5 border rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.email ? "border-rose-400 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className={`appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border rounded-xl sm:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.password ? "border-rose-400 focus:ring-rose-200" : "border-gray-300 focus:ring-emerald-200 focus:border-emerald-600"
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot_password");
                      setValidationError(null);
                      setFieldErrors({});
                    }}
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in to Dashboard"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleForgotPassword} noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registered Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
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
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
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
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
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
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
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
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showFpConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {fpFieldErrors.password && (
                <p className="text-[11px] text-rose-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                  {fpFieldErrors.password}
                </p>
              )}

              <div className="flex flex-col space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || fpSuccess || !fpStrength.isValid || !fpMatch}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Reset Password"}
                </button>
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
      </div>
    </div>
  );
}
