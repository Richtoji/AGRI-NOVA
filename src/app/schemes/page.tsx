"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, ExternalLink, CheckCircle2, Search } from "lucide-react";

export default function SchemesPage() {
  const [search, setSearch] = useState("");
  const [eligibleScheme, setEligibleScheme] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch("/api/schemes");
        if (res.ok) {
          const data = await res.json();
          setSchemes(data.schemes || []);
        }
      } catch (err) {
        console.error("Failed to fetch schemes", err);
      }
    };
    fetchSchemes();
  }, []);

  const filtered = schemes.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100 bg-white">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-gray-900" /> Government Schemes
            </h1>
            <p className="text-sm text-gray-500">
              Direct Benefit Transfer (DBT) integration for PM-KISAN income support, PMFBY crop loss insurance, and drone mechanization subsidies.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:border-gray-700 focus:ring-1 focus:ring-gray-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-gray-200 transition-colors p-5 flex flex-col justify-between rounded-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    {s.category}
                  </span>
                  <span className="text-[11px] font-bold text-gray-800 font-mono bg-gray-50 px-2 py-0.5 rounded">{s.subsidyAmount}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{s.title}</h3>
                  <div className="text-[11px] text-gray-500 font-semibold mt-1">{s.department}</div>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setEligibleScheme(s.id)}
                    className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                  >
                    Check Eligibility
                  </button>

                  <a
                    href={s.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {eligibleScheme === s.id && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-800 text-xs animate-in fade-in space-y-1">
                    <div className="font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-gray-900" />
                      <span>100% Eligible!</span>
                    </div>
                    <p className="text-[11px] text-gray-900">Aadhaar & Bank Account linked with AGRI-NOVA KYC.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
