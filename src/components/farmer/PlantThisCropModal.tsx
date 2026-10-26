"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  Sprout, 
  ShieldCheck, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  Droplets, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  Leaf, 
  Upload, 
  Layers, 
  ChevronRight,
  Sparkles,
  Clock
} from "lucide-react";
import { getCropKnowledge } from "@/data/cropKnowledge";
import { SafeImage } from "@/components/ui/SafeImage";

interface PlantThisCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
  cropProfileId?: string;
  cropImage?: string;
  growingPeriod?: string;
  waterRequirement?: number;
  expectedYield?: string;
  zoneName?: string;
  onConfirmAgreement: (cropProfileId: string, cropName: string, initialPhotoUrl?: string, initialNotes?: string) => Promise<void>;
}

export function PlantThisCropModal({
  isOpen,
  onClose,
  cropName,
  cropProfileId,
  cropImage,
  growingPeriod,
  waterRequirement = 3,
  expectedYield,
  zoneName,
  onConfirmAgreement
}: PlantThisCropModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct planting photo upload state inside modal
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [farmerNotes, setFarmerNotes] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const knowledge = getCropKnowledge(cropName || "Coconut");
  const stages = knowledge.cultivationStages || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5 MB. Please select a smaller photo.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleClearPhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirm = async () => {
    if (!agreed) {
      setError("Please check the agreement box before proceeding.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      let uploadedPhotoUrl = "";

      // If farmer chose a photograph right in the modal, upload it to server first
      if (selectedFile) {
        setIsUploadingPhoto(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/crops/cultivate/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Failed to upload planting photograph.");
        }
        uploadedPhotoUrl = uploadData.url;
      }

      await onConfirmAgreement(cropProfileId || cropName, cropName, uploadedPhotoUrl, farmerNotes);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to start cultivation plan. Please try again.");
    } finally {
      setSubmitting(false);
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 max-h-[92dvh] sm:max-h-[90vh] relative z-10">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-green-900 via-emerald-950 to-gray-900 text-white p-4 sm:p-5 shrink-0 relative">
          <button 
            onClick={onClose} 
            disabled={submitting}
            className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-green-300 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1">
            <Sprout className="w-4 h-4 text-green-400" />
            <span>Supervised Cultivation Program</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Start Cultivation: {cropName}</h2>
          <p className="text-[11px] sm:text-xs text-green-200/80 mt-0.5">
            Stage 1: Plant the Crop &amp; Upload Photograph · Administrator Verification Workflow
          </p>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 touch-scroll">
          
          {/* 1. Crop Profile Snapshot */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300 relative">
              {cropImage ? (
                <SafeImage src={cropImage} alt={cropName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50">
                  <Sprout className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-gray-900 truncate">{cropName}</h4>
                {zoneName && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {zoneName}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-gray-600">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Expected Yield</span>
                  <strong className="text-gray-800 text-[11px]">{expectedYield || knowledge.expectedYield}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Growing Period</span>
                  <strong className="text-gray-800 text-[11px]">{growingPeriod || knowledge.growingPeriod}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ALL CULTIVATION STAGES BREAKDOWN */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-green-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                  All Cultivation Stages for {cropName} ({stages.length} Milestones)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-gray-400">Strict Sequential Progress</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stages.map((stg, i) => (
                <div 
                  key={stg.stageOrder || i} 
                  className={`p-3 rounded-xl border flex items-start space-x-3 transition-colors ${
                    i === 0 
                      ? 'bg-green-50/90 border-green-300 ring-1 ring-green-200' 
                      : 'bg-gray-50/70 border-gray-200 opacity-80'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                    i === 0 ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i === 0 ? "1" : <Lock className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${i === 0 ? 'text-green-950 font-black' : 'text-gray-700'}`}>
                        Stage {i + 1}: {stg.stageName}
                      </h5>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        i === 0 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {i === 0 ? "🟢 ACTIVE — UPLOAD PHOTO" : `🔒 Day ${stg.startDay} - ${stg.endDay || '30'}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                      {stg.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-DAY PLANTING POLICY & STAGE LOCKING BANNER */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-black text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Mandatory 3-Day Planting Commitment & Stage Lock Rules</span>
            </div>
            <div className="space-y-1.5 text-xs text-amber-950 font-medium">
              <p className="flex items-start space-x-1.5">
                <span className="font-bold text-amber-800 shrink-0">1. Plant Within 3 Days:</span>
                <span>After agreeing to this policy, you must plant your crop and upload the image of the planted crop within <strong>3 days (72 hours)</strong>.</span>
              </p>
              <p className="flex items-start space-x-1.5">
                <span className="font-bold text-amber-800 shrink-0">2. Strict Stage Lock:</span>
                <span>Only after Stage 1 photo is submitted and approved by an agricultural officer can you advance to Stage 2. You can view all requirements for the next stage, but cannot proceed to that stage until Stage 1 is verified.</span>
              </p>
            </div>
          </div>

          {/* 3. IMMEDIATE OPTION TO UPLOAD IMAGE OF THE PLANTED CROP */}
          <div className="p-4 bg-gradient-to-br from-amber-50/70 via-white to-green-50/60 border-2 border-green-300 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-900 px-2 py-0.5 rounded-full border border-green-200 inline-block mb-1">
                  Stage 1 Photographic Evidence
                </span>
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-green-600" />
                  <span>Upload Image of the Planted Crop (Seed / Sapling in Soil)</span>
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Have you planted your seed or sapling? You can select and upload your photograph right now to submit your verification request immediately, or complete it anytime on your dashboard cultivation menu.
                </p>
              </div>
            </div>

            {/* Planting Instructions Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-gray-200 text-gray-700">
              <div>
                <span className="text-gray-400 block font-semibold uppercase">Method</span>
                <strong className="text-gray-900 truncate block">{knowledge.plantingMethod ? knowledge.plantingMethod.slice(0, 45) + '...' : "Standard pit planting"}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase">Spacing</span>
                <strong className="text-gray-900 truncate block">{knowledge.spacing || "Standard spacing"}</strong>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase">Seed/Sapling</span>
                <strong className="text-gray-900 truncate block">{knowledge.seedInformation ? knowledge.seedInformation.slice(0, 45) + '...' : "High-yield variety"}</strong>
              </div>
            </div>

            {/* Photo Input Box */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="modal-planting-photo"
              />

              {!selectedFile ? (
                <label
                  htmlFor="modal-planting-photo"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 hover:border-green-500 rounded-xl bg-white/80 hover:bg-green-50/50 transition-colors cursor-pointer group text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 mb-2 group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    Click to Choose or Take Planted Crop Photo
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    JPG, PNG, or WEBP (Max 5 MB) · Clear photo of seed/sapling in soil
                  </span>
                </label>
              ) : (
                <div className="bg-white p-3 rounded-xl border border-green-200 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {previewUrl && (
                      <img src={previewUrl} alt="Planted preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center space-x-1 text-green-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {(selectedFile.size / 1024).toFixed(0)} KB · Ready to submit for Admin approval
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Farmer notes input */}
              <input
                type="text"
                value={farmerNotes}
                onChange={(e) => setFarmerNotes(e.target.value)}
                placeholder="Optional planting notes (e.g. Planted in 1m pit with cow dung manure)"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 4. Farmer Agreement Checkbox */}
          <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (error) setError(null);
                }}
                className="w-5 h-5 rounded text-green-600 focus:ring-green-500 border-gray-300 mt-0.5 cursor-pointer shrink-0"
              />
              <span className="text-xs font-bold text-emerald-950 leading-relaxed">
                I agree to the cultivation policy for <strong className="text-gray-900">{cropName}</strong>: I commit to <strong>planting the crop within 3 days</strong> and uploading the image of the planted crop for verification. I understand that general cultivation progress tracking will remain locked until this photograph is verified, and although I can view the requirements for subsequent stages, I cannot proceed to them until Stage 1 is completed.
              </span>
            </label>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!agreed || submitting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all flex items-center justify-center space-x-2 shadow-sm ${
              !agreed || submitting 
                ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isUploadingPhoto ? "Uploading Photo..." : "Activating Cultivation..."}</span>
              </>
            ) : selectedFile ? (
              <>
                <Camera className="w-4 h-4" />
                <span>I Agree — Submit Planting Photograph</span>
              </>
            ) : (
              <>
                <Sprout className="w-4 h-4" />
                <span>I Agree — Start Cultivation</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
