"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthRole } from "@/lib/context/AuthRoleContext";
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Bell,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  KeyRound,
  Loader2,
  Check,
  AlertCircle,
  X,
  Camera,
  Trash2,
  UploadCloud
} from "lucide-react";
import {
  validateFullName,
  validateEmailWithDetails,
  validatePhoneWithDetails,
  validateChangePassword,
  evaluatePasswordStrength
} from "@/lib/validation";

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuthRole();

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Sync loaded session user data into form fields
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.avatarUrl && !avatarBase64) setAvatarBase64(currentUser.avatarUrl);
    }
  }, [currentUser]);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState<string | null>(null);
  const [pwdErrorMsg, setPwdErrorMsg] = useState<string | null>(null);

  // Security Toggles
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);

  const defaultAvatar = currentUser?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=f3f4f6&color=111827`
    : "https://ui-avatars.com/api/?name=User&background=f3f4f6&color=111827";

  const deviceHistory = [
    { device: "Chrome (Windows 11) • Noida, UP", time: "Active Now", current: true },
    { device: "AGRI-NOVA Mobile App (Android 14) • Ludhiana", time: "July 24, 2026, 04:30 PM", current: false },
    { device: "Firefox (Ubuntu Linux) • Delhi NCR", time: "July 21, 2026, 11:15 AM", current: false },
  ];

  // Evaluate real-time password strength
  const pwdStrength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isSameAsCurrent = currentPassword.length > 0 && newPassword.length > 0 && currentPassword === newPassword;

  // Strict validation on Profile form fields
  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    const nameVal = validateFullName(name);
    if (!nameVal.isValid) errors.name = nameVal.error || "Invalid name";

    const emailVal = validateEmailWithDetails(email);
    if (!emailVal.isValid) errors.email = emailVal.error || "Invalid email address";

    const phoneVal = validatePhoneWithDetails(phone);
    if (!phoneVal.isValid) errors.phone = phoneVal.error || "Invalid 10-digit phone number";

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Client-side image compression to ~320x320 JPEG (<30KB)
  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Strict Validation Error: Only image files (PNG, JPG, WEBP) are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Strict Validation Error: Image file must be under 10MB.");
      return;
    }

    setAvatarUploading(true);
    setProfileSuccessMsg(null);

    try {
      // 1. Compress client-side
      const compressedDataUrl = await compressAvatar(file);
      if (!compressedDataUrl) {
        setAvatarUploading(false);
        return;
      }
      setAvatarBase64(compressedDataUrl);

      // 2. Try uploading via /api/upload
      let savedUrl = compressedDataUrl;
      try {
        const blob = await (await fetch(compressedDataUrl)).blob();
        const formData = new FormData();
        formData.append("file", blob, `avatar_${Date.now()}.jpg`);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            savedUrl = uploadData.url;
          }
        }
      } catch (uploadErr) {
        console.warn("Upload route fallback to compressed base64:", uploadErr);
      }

      // 3. Immediately persist profile with new avatar
      const currentUserName = name || currentUser?.name || "User";
      const currentUserEmail = email || currentUser?.email || "";
      const currentUserPhone = phone || currentUser?.phone || "";

      const res = await updateProfile(
        currentUserName,
        currentUserEmail,
        currentUserPhone,
        savedUrl,
        savedUrl
      );

      if (res.success) {
        setProfileSuccessMsg("Profile photo updated and saved across the entire website!");
        setTimeout(() => setProfileSuccessMsg(null), 5000);
      } else {
        alert(res.error || "Could not save profile photo. Please try again.");
      }
    } catch (err: any) {
      console.error("Avatar change error:", err);
      alert("Error processing photo. Please try another image.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to reset your profile picture to default initials?")) return;
    setAvatarUploading(true);
    setAvatarBase64("");
    const currentUserName = name || currentUser?.name || "User";
    const currentUserEmail = email || currentUser?.email || "";
    const currentUserPhone = phone || currentUser?.phone || "";
    const resetAvatar = defaultAvatar;

    const res = await updateProfile(
      currentUserName,
      currentUserEmail,
      currentUserPhone,
      resetAvatar,
      resetAvatar
    );
    setAvatarUploading(false);
    if (res.success) {
      setProfileSuccessMsg("Profile photo reset to default initials!");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);

    if (!validateProfileForm()) return;

    setProfileLoading(true);
    const finalAvatar = avatarBase64 || currentUser?.avatarUrl;
    const result = await updateProfile(name, email, phone, finalAvatar, finalAvatar);
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccessMsg("Profile details updated and synchronized successfully!");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } else {
      setProfileErrors({ form: result.error || "Failed to update profile." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccessMsg(null);
    setPwdErrorMsg(null);

    // Strict client-side validation
    const validation = validateChangePassword(currentPassword, newPassword, confirmPassword);
    if (!validation.isValid) {
      setPwdErrorMsg(validation.error || "Password does not meet strict requirements.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setPwdErrorMsg(data.error || "Failed to change password. Please check your current password.");
      } else {
        setPwdSuccessMsg(data.message || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwdSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      setPwdErrorMsg("A network error occurred. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header with Avatar and Actions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Interactive Avatar Container */}
            <div className="relative group shrink-0">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-md ring-4 ring-gray-50 bg-gray-100">
                <img
                  src={avatarBase64 || currentUser?.avatarUrl || defaultAvatar}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />

                {/* Uploading Spinner Overlay */}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 animate-fadeIn">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mb-1" />
                    <span className="text-[10px] font-bold">Saving...</span>
                  </div>
                )}

                {/* Hover overlay on desktop */}
                {!avatarUploading && (
                  <label
                    htmlFor="profile-avatar-input"
                    className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Click to change profile photo"
                  >
                    <Camera className="w-5 h-5 mb-0.5 text-white" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                  </label>
                )}
              </div>

              {/* Camera badge indicator */}
              <label
                htmlFor="profile-avatar-input"
                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md border-2 border-white cursor-pointer transition-transform hover:scale-110 z-20"
                title="Upload new profile picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </label>

              <input
                id="profile-avatar-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                disabled={avatarUploading}
                onChange={handleAvatarFileChange}
              />
            </div>

            {/* User Meta Information & Fast Actions */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 leading-tight">{name || currentUser?.name || "User"}</h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                  {currentUser?.role || "FARMER"}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                  <span>KYC VERIFIED</span>
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Manage your credentials, photo, phone, and account security
              </p>

              {/* Direct Avatar Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <label
                  htmlFor="profile-avatar-input"
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200/80 text-gray-800 border border-gray-200 transition-colors cursor-pointer ${
                    avatarUploading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Photo</span>
                </label>

                {(avatarBase64 || currentUser?.avatarUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    title="Reset photo to default initials"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Persistent sync badge */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Account Sync</span>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All changes live on website</span>
            </div>
          </div>
        </div>

        {/* Global Success Notification banner if triggered */}
        {profileSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Update Successful</p>
                <p className="text-xs text-emerald-700">{profileSuccessMsg}</p>
              </div>
            </div>
            <button
              onClick={() => setProfileSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Profile Info & Change Password */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. General Profile Settings */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-emerald-600" />
                <span>General Profile Information</span>
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-sm" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 text-xs font-semibold block mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (profileErrors.name) setProfileErrors(prev => ({ ...prev, name: "" }));
                        }}
                        onBlur={() => {
                          const val = validateFullName(name);
                          if (!val.isValid) setProfileErrors(prev => ({ ...prev, name: val.error || "" }));
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white border text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                          profileErrors.name ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                        }`}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                        {profileErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-gray-600 text-xs font-semibold block mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (profileErrors.phone) setProfileErrors(prev => ({ ...prev, phone: "" }));
                        }}
                        onBlur={() => {
                          const val = validatePhoneWithDetails(phone);
                          if (!val.isValid) setProfileErrors(prev => ({ ...prev, phone: val.error || "" }));
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl bg-white border text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                          profileErrors.phone ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                        }`}
                        placeholder="+91 98765 00000"
                        required
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                        {profileErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 text-xs font-semibold block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (profileErrors.email) setProfileErrors(prev => ({ ...prev, email: "" }));
                      }}
                      onBlur={() => {
                        const val = validateEmailWithDetails(email);
                        if (!val.isValid) setProfileErrors(prev => ({ ...prev, email: val.error || "" }));
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white border text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                        profileErrors.email ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                      }`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                      {profileErrors.email}
                    </p>
                  )}
                </div>

                {profileErrors.form && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center space-x-2 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{profileErrors.form}</span>
                  </div>
                )}

                {profileSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center space-x-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </form>
            </div>

            {/* 2. CHANGE PASSWORD SECTION (STRICT VALIDATION) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Change Password</span>
                </h3>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">
                  Strict Security
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Protect your AGRI-NOVA account by creating a high-entropy password. Passwords must be at least 8 characters and include uppercase, lowercase, numbers, and special symbols.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4 text-sm" noValidate>

                {/* Current Password */}
                <div>
                  <label className="text-gray-600 text-xs font-semibold block mb-1">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (pwdErrorMsg) setPwdErrorMsg(null);
                      }}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition-colors"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-600 text-xs font-semibold">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    {newPassword && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pwdStrength.strengthLabel === "Strong"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : pwdStrength.strengthLabel === "Good"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : pwdStrength.strengthLabel === "Fair"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        Strength: {pwdStrength.strengthLabel}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (pwdErrorMsg) setPwdErrorMsg(null);
                      }}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 transition-colors"
                      placeholder="Enter strong new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Progress Bar */}
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            pwdStrength.score === 1
                              ? "w-1/4 bg-rose-500"
                              : pwdStrength.score === 2
                              ? "w-2/4 bg-amber-500"
                              : pwdStrength.score === 3
                              ? "w-3/4 bg-blue-500"
                              : pwdStrength.score === 4
                              ? "w-full bg-emerald-500"
                              : "w-0"
                          }`}
                        />
                      </div>

                      {/* Criteria Checklist */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div className={`flex items-center space-x-1.5 ${pwdStrength.rules.minLength ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                          {pwdStrength.rules.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1" />}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${pwdStrength.rules.hasUppercase && pwdStrength.rules.hasLowercase ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                          {pwdStrength.rules.hasUppercase && pwdStrength.rules.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1" />}
                          <span>Uppercase &amp; lowercase</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${pwdStrength.rules.hasNumber ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                          {pwdStrength.rules.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1" />}
                          <span>At least 1 number (0-9)</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 ${pwdStrength.rules.hasSpecial ? "text-emerald-700 font-semibold" : "text-gray-400"}`}>
                          {pwdStrength.rules.hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1" />}
                          <span>Special symbol (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isSameAsCurrent && (
                    <p className="text-[11px] text-amber-700 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                      New password cannot be identical to your current password.
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-600 text-xs font-semibold">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-bold ${passwordsMatch ? "text-emerald-600" : "text-rose-600"}`}>
                        {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (pwdErrorMsg) setPwdErrorMsg(null);
                      }}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                        confirmPassword && !passwordsMatch
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-gray-200 focus:ring-emerald-200 focus:border-emerald-600"
                      }`}
                      placeholder="Re-enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pwdErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-start space-x-2 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{pwdErrorMsg}</span>
                  </div>
                )}

                {pwdSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center space-x-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{pwdSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword || !passwordsMatch || isSameAsCurrent || !pwdStrength.isValid}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
                >
                  {pwdLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 3. Notification Preferences */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Notification Preferences</span>
              </h3>

              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="group-hover:text-gray-900 transition-colors">SMS weather advisories and heatwave warnings</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="group-hover:text-gray-900 transition-colors">Mandi market commodity price alerts</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="group-hover:text-gray-900 transition-colors">Weekly platform transaction billing summaries</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Security & Sessions */}
          <div className="lg:col-span-5 space-y-6">

            {/* Account Security Overview Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Security Status</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium">Identity Verification</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Verified ID
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium">Session Encryption</span>
                  <span className="font-bold text-gray-800">AES-256 GCM</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium">Password Policy</span>
                  <span className="font-bold text-emerald-700">Strict Entropy</span>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication Settings */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Two-Factor Authentication (2FA)</span>
              </h3>

              <div className="space-y-4 text-sm">
                <p className="text-gray-500 leading-relaxed text-xs">
                  Protect your farm operations and payouts by requiring an SMS OTP confirmation on new device logins.
                </p>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className={`w-5 h-5 ${is2FaEnabled ? "text-emerald-600" : "text-gray-400"}`} />
                    <span className="font-semibold text-gray-900">2FA Protection</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIs2FaEnabled(!is2FaEnabled)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-all ${
                      is2FaEnabled
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {is2FaEnabled ? "Active" : "Disabled"}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Session History */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Device Authorization Log</span>
              </h3>

              <div className="space-y-3 text-sm">
                {deviceHistory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">{item.device}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.time}</div>
                    </div>
                    {item.current && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
