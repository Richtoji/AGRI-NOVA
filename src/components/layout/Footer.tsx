"use client";

import React from "react";
import Link from "next/link";
import { Sprout, Phone, Shield, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-900">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                AGRI-NOVA
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              Smart agriculture, livestock, aquaculture, and agri-commerce platform connecting farmers, buyers, equipment owners, and veterinary experts across Kerala and India.
            </p>
            <div className="flex flex-col space-y-2 pt-2 text-[11px]">
              <div className="flex items-center space-x-2 text-gray-900 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Farmer Network</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-600 font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span>Kisan Helpline 1800-180-1551</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Modules */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-gray-900">Platform Modules</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/dashboard/farmer" className="hover:text-gray-900 transition-colors">Crop Recommender</Link></li>
              <li><Link href="/dashboard/farmer" className="hover:text-gray-900 transition-colors">Leaf Disease Diagnostics</Link></li>
              <li><Link href="/marketplace" className="hover:text-gray-900 transition-colors">Direct Farm Marketplace</Link></li>
              <li><Link href="/equipment" className="hover:text-gray-900 transition-colors">Machinery Rental Hub</Link></li>
              <li><Link href="/dashboard/veterinary" className="hover:text-gray-900 transition-colors">Veterinary Telehealth</Link></li>
            </ul>
          </div>

          {/* Column 3: Government Schemes */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-gray-900">Government Schemes</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/schemes" className="hover:text-gray-900 transition-colors flex items-center justify-between"><span>PM-KISAN Samman</span> <ExternalLink className="w-3 h-3 text-gray-400" /></Link></li>
              <li><Link href="/schemes" className="hover:text-gray-900 transition-colors flex items-center justify-between"><span>PMFBY Crop Insurance</span> <ExternalLink className="w-3 h-3 text-gray-400" /></Link></li>
              <li><Link href="/schemes" className="hover:text-gray-900 transition-colors flex items-center justify-between"><span>SMAM Machinery Subsidy</span> <ExternalLink className="w-3 h-3 text-gray-400" /></Link></li>
              <li><Link href="/contact" className="hover:text-gray-900 transition-colors">Regional Krishi Bhavan Contacts</Link></li>
            </ul>
          </div>

          {/* Column 4: Regional Hubs */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-gray-900">Regional Coverage</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Serving agricultural hubs in Palakkad, Wayanad, Idukki, Kottayam, Thrissur, Alappuzha, and across Kerala.
            </p>
            <div className="pt-2">
              <Link href="/contact" className="text-xs font-semibold text-gray-900 hover:underline">
                View Contact & Support Offices &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <p>&copy; 2026 AGRI-NOVA Smart Agriculture Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0 font-medium">
            <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Support Directory</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
