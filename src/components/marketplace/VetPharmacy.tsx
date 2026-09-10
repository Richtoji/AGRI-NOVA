"use client";

import React, { useState } from "react";
import { Search, Sparkles, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { useAuthRole } from "@/lib/context/AuthRoleContext";

interface MedicineItem {
  id: string;
  name: string;
  type: string;
  requiresPrescription: boolean;
  price: number;
  rating: number;
  image: string;
  description: string;
}

interface VetPharmacyProps {
  products?: any[];
}

export const VetPharmacy: React.FC<VetPharmacyProps> = ({ products = [] }) => {
  const { addToCart } = useAuthRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [rxAlert, setRxAlert] = useState(false);
  const [diagnosedDisease, setDiagnosedDisease] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const vetCategories = ["Vaccine", "Antibiotic", "Dewormer", "Supplement", "Veterinary Medicine"];
  
  const medicines: MedicineItem[] = products
    .filter((p) => vetCategories.includes(p.category))
    .map((p) => ({
      id: p.id,
      name: p.title,
      type: p.category,
      requiresPrescription: p.category === "Vaccine" || p.category === "Antibiotic",
      price: p.price,
      rating: p.rating || 4.5,
      image: p.imageUrl,
      description: p.description || ""
    }));



  const handleUploadPrescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
      setRxAlert(false);
    }
  };

  const handlePurchase = async (item: MedicineItem) => {
    if (item.requiresPrescription && !uploadedFile) {
      setRxAlert(true);
      return;
    }
    const result = await addToCart(item.id, 1);
    if (result.success) {
      setAddedItem(item.id);
      setTimeout(() => setAddedItem(null), 2500);
    } else {
      alert(result.error);
    }
  };

  const handleAiRecommendation = () => {
    const query = diagnosedDisease.trim();
    if (!query) return;
    if (query.length > 200) {
      setAiRecommendation("Warning: Symptoms description is too long (max 200 characters).");
      return;
    }
    if (query.toLowerCase().includes("fever") || query.toLowerCase().includes("mastitis")) {
      setAiRecommendation(
        "AI Diagnostics recommends: Broad Spectrum Antibiotic Paste. Warning: This formulation requires uploading a valid Vet Prescription before checkout."
      );
    } else {
      setAiRecommendation(
        "AI Diagnostics recommends: Liquid Calcium & D3 Feed Supplement to support nutritional recovery. No prescription required."
      );
    }
  };

  const filteredMeds = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
      
      {/* Clinic/AI Diagnosis Pane */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Prescription Upload Card */}
        <Card className="space-y-4 border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Upload className="w-4 h-4 text-gray-600" />
            <span>Upload Veterinary Prescription</span>
          </h3>

          <div className="space-y-3">
            <p className="text-gray-400">
              Select vaccines or antibiotics require an active doctor prescription before platform delivery.
            </p>

            <label className="border border-dashed border-gray-700 hover:border-gray-700/50 rounded-2xl p-6 text-center block cursor-pointer transition-all">
              <input type="file" onChange={handleUploadPrescription} className="hidden" />
              <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <span className="text-gray-300 font-bold block">
                {uploadedFile ? uploadedFile : "Drag & Drop or Click to Upload"}
              </span>
              <span className="text-[10px] text-gray-500 block mt-1">Supports PDF, PNG, JPG</span>
            </label>

            {uploadedFile && (
              <div className="p-2.5 rounded-xl bg-gray-700/10 border border-gray-700/30 text-gray-600 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Prescription loaded successfully!</span>
              </div>
            )}
          </div>
        </Card>

        {/* AI Medicine Recommender */}
        <Card className="space-y-4 border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <span>AI Pharmacy Assistant</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-gray-400 block mb-1">Describe symptoms (e.g. fever, udder swelling)</label>
              <input
                type="text"
                value={diagnosedDisease}
                onChange={(e) => setDiagnosedDisease(e.target.value)}
                placeholder="e.g. Decreased cow milk, high heat..."
                className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-gray-700"
              />
            </div>

            <Button onClick={handleAiRecommendation} className="w-full">
              <span>Ask AI Pharmacist</span>
            </Button>

            {aiRecommendation && (
              <div className="p-3.5 rounded-xl bg-gray-700/10 border border-gray-700/30 text-gray-600 leading-relaxed">
                {aiRecommendation}
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* Catalog Grid */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Search */}
        <div className="relative text-xs w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine store..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-gray-700"
          />
        </div>

        {rxAlert && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Prescription Required: Please upload a valid Veterinary Medical License/Slip on the left panel.</span>
          </div>
        )}

        {addedItem && (
          <div className="p-3 rounded-xl bg-gray-700/10 border border-gray-700/30 text-gray-600 text-center font-bold">
            Medicine added to cart successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredMeds.map((med) => (
            <Card key={med.id} className="space-y-4 border-gray-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900">
                  <img src={med.image} alt={med.name} className="w-full h-full object-cover opacity-90" />
                  {med.requiresPrescription && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px] uppercase tracking-wider">
                      Rx Prescription Required
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                      {med.type}
                    </span>
                    <span className="font-mono text-white font-bold">₹{med.price}</span>
                  </div>
                  <h4 className="text-sm font-black text-white">{med.name}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{med.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80">
                <Button onClick={() => handlePurchase(med)} className="w-full">
                  <span>Purchase Product</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </div>

    </div>
  );
};
