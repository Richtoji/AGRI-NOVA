"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, Scale, CheckCircle2, ArrowLeft, Shield, AlertTriangle } from "lucide-react";

export default function TermsOfServicePage() {
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
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-emerald-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Platform Service Agreement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Terms of Service &amp; Fair Trading Code</h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Please read these terms carefully before utilizing the AGRI-NOVA smart agriculture ecosystem, marketplace order processing, equipment hire, and veterinary consultation services.
          </p>
          <div className="mt-4 text-xs text-gray-400 font-semibold">
            Effective Date: October 2026 &bull; Jurisdiction: Kerala High Court &amp; Cyber Appellate Tribunal
          </div>
        </div>

        {/* Content Blocks */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-8 text-sm text-gray-700 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <Shield className="w-4.5 h-4.5 text-emerald-600" />
              <span>1. User Verification &amp; Account Integrity</span>
            </h2>
            <p>
              By accessing AGRI-NOVA, users certify that all agricultural credentials, landholding extents, equipment specifications, veterinary accreditations, and GSTIN details submitted during registration are accurate and truthful. Any fraudulent claims are subject to immediate account revocation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <FileText className="w-4.5 h-4.5 text-emerald-600" />
              <span>2. Marketplace Trading &amp; Payment Settlement</span>
            </h2>
            <p>
              Direct farm-to-buyer transactions executed via AGRI-NOVA require adherence to verified produce grade specifications and agreed delivery time windows. Payouts to farmers are settled securely upon digital delivery confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-4.5 h-4.5 text-emerald-600" />
              <span>3. Advisory &amp; Telehealth Disclaimers</span>
            </h2>
            <p>
              AI crop cultivation suggestions and telemetry-based advisories are intended as precision guidance tools. Certified veterinary prescriptions issued through the platform comply with statutory telemedicine directives, but in life-threatening livestock emergencies, on-field clinical veterinary assistance should be sought.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2">
              <Scale className="w-4.5 h-4.5 text-emerald-600" />
              <span>4. Equipment Rental &amp; Logistics Transport</span>
            </h2>
            <p>
              Machinery rented through Kisan Agro Hubs must be operated by certified personnel or contracted operators. Transit of perishable commodities is subject to temperature log validation at pickup and dropoff hubs.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fair Trade Certified &amp; Farmer-First Policy</span>
            </div>
            <Link
              href="/privacy"
              className="text-xs font-bold text-gray-900 hover:text-emerald-700 hover:underline"
            >
              Read Privacy Policy &rarr;
            </Link>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
