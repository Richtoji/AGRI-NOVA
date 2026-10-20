"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard/farmer"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Security &amp; Data Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Privacy &amp; Data Protection Policy</h1>
          <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
            AGRI-NOVA is committed to protecting agricultural, financial, and personal information across our farm-to-fork ecosystem in compliance with the Digital Personal Data Protection (DPDP) Act.
          </p>
          <div className="mt-4 text-xs text-emerald-300 font-semibold">
            Last Updated: October 2026 &bull; Operational Scope: Pan-India &amp; Kerala Regional Hubs
          </div>
        </div>

        {/* Content Blocks */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <Lock className="w-4.5 h-4.5 text-emerald-600" />
              <span>1. Agricultural Data We Collect</span>
            </h2>
            <p>
              To deliver precision agronomy advice, satellite weather forecasting, direct marketplace procurement, and subsidized government scheme routing, AGRI-NOVA collects the following:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Farmer &amp; Landholdings:</strong> Land boundaries, cadastral survey coordinates, crop cycle records, and Krishi Bhavan certificates.</li>
              <li><strong>Telemetry &amp; Soil Profiles:</strong> Soil testing reports, NPK metrics, irrigation schedules, and weather telemetry.</li>
              <li><strong>Marketplace &amp; Payments:</strong> Direct sale transaction logs, wholesale produce pricing, and verified UPI / bank account identifiers.</li>
              <li><strong>Veterinary &amp; Machinery:</strong> Livestock health registers, e-prescriptions, and equipment rental contracts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <Eye className="w-4.5 h-4.5 text-emerald-600" />
              <span>2. How Your Information Is Utilized</span>
            </h2>
            <p>
              Your data is solely used to facilitate platform operations, improve crop yields, verify stage photographic evidence, and connect registered farmers with certified buyers, equipment owners, and veterinarians. We do not sell your personal data to third-party advertising brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <span>3. Data Storage &amp; Encryption Standards</span>
            </h2>
            <p>
              All stored telemetry, photographic verification records, and user credentials are encrypted using AES-256 standards at rest and TLS 1.3 in transit. Enterprise Admin access is governed by strict Role-Based Access Controls (RBAC) with complete audit logging.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <FileText className="w-4.5 h-4.5 text-emerald-600" />
              <span>4. Farmer Rights &amp; Data Sovereignty</span>
            </h2>
            <p>
              Farmers retain complete ownership of their farm data. You may request an export of your cultivation history or account deactivation by contacting our Data Protection Officer at <span className="font-mono font-bold text-gray-900">privacy@agri-nova.com</span>.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ISO 27001 &amp; DPDP Compliant Architecture</span>
            </div>
            <Link
              href="/terms"
              className="text-xs font-bold text-gray-900 hover:text-emerald-700 hover:underline"
            >
              Read Terms of Service &rarr;
            </Link>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
