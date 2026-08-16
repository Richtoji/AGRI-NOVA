"use client";

import React from "react";
import Link from "next/link";
import { Sprout, ShoppingBag, Tractor, Fish, Stethoscope, FileText, ArrowRight } from "lucide-react";

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: <Sprout className="w-5 h-5 text-gray-900" />,
      title: "Crop Recommendation & Diagnostics",
      description: "Analyze soil nitrogen, phosphorus, potassium, pH, and rainfall to get optimal crop recommendations and instant leaf disease treatments.",
      badge: "Soil & Crop AI",
      badgeColor: "text-gray-800 bg-gray-100",
      link: "/dashboard/farmer"
    },
    {
      icon: <ShoppingBag className="w-5 h-5 text-gray-900" />,
      title: "Direct Farm Marketplace",
      description: "Sell fresh vegetables, Kerala Matta rice, spices, coconuts, and dairy products directly to verified buyers without middlemen.",
      badge: "Agri-Commerce",
      badgeColor: "text-sky-700 bg-sky-100",
      link: "/marketplace"
    },
    {
      icon: <Tractor className="w-5 h-5 text-amber-600" />,
      title: "Machinery & Equipment Rental",
      description: "Rent tractors, harvesters, cultivators, and spraying drones by the day or hour from verified local equipment owners.",
      badge: "Rental Marketplace",
      badgeColor: "text-amber-700 bg-amber-100",
      link: "/equipment"
    },
    {
      icon: <Fish className="w-5 h-5 text-sky-600" />,
      title: "Livestock & Aquaculture",
      description: "Track cattle, goats, poultry, and fish farming stock with ear-tag registration, vaccination schedules, and health monitoring.",
      badge: "Animal Registry",
      badgeColor: "text-indigo-700 bg-indigo-100",
      link: "/dashboard/farmer"
    },
    {
      icon: <Stethoscope className="w-5 h-5 text-rose-600" />,
      title: "Veterinary Telehealth",
      description: "Connect with certified veterinary doctors for livestock health consultations, digital prescriptions, and vaccination advice.",
      badge: "Veterinary Care",
      badgeColor: "text-rose-700 bg-rose-100",
      link: "/dashboard/veterinary"
    },
    {
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      title: "Government Schemes Directory",
      description: "Access PM-KISAN, PMFBY crop insurance, and SMAM drone subsidies with automated eligibility criteria and direct application links.",
      badge: "Subsidy Access",
      badgeColor: "text-purple-700 bg-purple-100",
      link: "/schemes"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-gray-900">
            Unified Agricultural Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Everything Farmers & Agricultural Businesses Need
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            Integrated tools for farm management, crop science, equipment rental, healthcare, and produce commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-gray-200 transition-colors bg-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">{feat.icon}</div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-gray-900 tracking-tight">{feat.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed font-medium">{feat.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link href={feat.link} className="inline-flex items-center text-xs font-bold text-gray-900 hover:text-gray-800">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
