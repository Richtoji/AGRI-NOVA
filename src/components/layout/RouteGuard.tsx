"use client";

import React from "react";
import { useAuthRole, RoleType } from "@/lib/context/AuthRoleContext";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, currentRole } = useAuthRole();
  const router = useRouter();

  // Not logged in — show clean login prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center space-y-6">
          
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900">Sign In Required</h2>
            <p className="text-sm text-gray-500 font-medium">
              You must sign in to your AGRI-NOVA account to access this page.
            </p>
          </div>

          {/* Role label */}
          {allowedRoles && allowedRoles.length > 0 && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-700 capitalize">
                {allowedRoles.map(r => r.replace(/_/g, " ").toLowerCase()).join(" or ")} access required
              </span>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full flex items-center justify-center py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            Sign In to Continue
          </button>

          <p className="text-xs text-gray-400 font-medium">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-gray-700 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Logged in but wrong role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole as RoleType)) {
    const roleLabel = allowedRoles.map(r => r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(" or ");
    const currentRoleLabel = currentRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center space-y-6">

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900">Access Forbidden</h2>
            <p className="text-sm text-gray-500 font-medium">
              This workspace is restricted to <strong className="text-gray-900">{roleLabel}</strong> accounts only.
            </p>
          </div>

          {/* Role mismatch info */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Your current role</span>
              <span className="font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded-lg">{currentRoleLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Required role</span>
              <span className="font-bold text-gray-900 bg-gray-900 text-white px-2 py-0.5 rounded-lg">{roleLabel}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Login as {roleLabel}
            </button>
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
