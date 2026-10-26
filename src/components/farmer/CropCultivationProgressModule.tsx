"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sprout, 
  CheckCircle, 
  Clock, 
  Lock, 
  Camera, 
  Calendar, 
  AlertCircle, 
  Droplets, 
  Leaf, 
  ChevronRight, 
  ExternalLink, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  TrendingUp,
  X,
  Trash2
} from "lucide-react";
import { getCropKnowledge } from "@/data/cropKnowledge";
import { CultivationImageUpload } from "@/components/farmer/CultivationImageUpload";
import { SafeImage } from "@/components/ui/SafeImage";

interface CropCultivationProgressModuleProps {
  cultivations: any[];
  selectedCultivationId: string | null;
  onSelectCultivation: (id: string) => void;
  onSubmitStageEvidence: (cultivationId: string, stageId: string, imageUrl: string, notes: string) => Promise<void>;
  onSubmitWeeklyPhoto: (cultivationId: string, weekNumber: number, dueDate: Date, imageUrl: string, notes: string) => Promise<void>;
  onDeleteCultivation?: (cultivationId: string) => Promise<void>;
  onOpenGuide: (cropName: string) => void;
  onStartNewCrop: () => void;
  onStartAnyCrop?: () => void;
  loading?: boolean;
}

export function CropCultivationProgressModule({
  cultivations = [],
  selectedCultivationId,
  onSelectCultivation,
  onSubmitStageEvidence,
  onSubmitWeeklyPhoto,
  onDeleteCultivation,
  onOpenGuide,
  onStartNewCrop,
  onStartAnyCrop,
  loading = false,
}: CropCultivationProgressModuleProps) {
  const [activeTab, setActiveTab] = useState<"stages" | "weekly" | "care">("stages");
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    title: string;
    date?: string;
    notes?: string;
    status?: string;
    adminComment?: string;
  } | null>(null);
  const [isUploadingWeekly, setIsUploadingWeekly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // If no cultivations started yet
  if (!loading && cultivations.length === 0) {
    return (
      <div id="my-cultivations" className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shrink-0">
              <Sprout className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                  Supervised Cultivation
                </span>
                <span className="text-xs text-gray-400 font-medium">Stage Monitoring</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Crop Cultivation Progress</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                You haven&apos;t started any supervised crop cultivations yet. Choose a recommended crop below or click <strong>&quot;Plant This Crop&quot;</strong> to agree to the policy, plant your seed or sapling, upload photo evidence for Administrator verification, and track weekly progress here.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={onStartNewCrop}
              className="w-full sm:w-auto px-6 py-3 bg-[#15803d] hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>Plant Recommended Crop</span>
            </button>
            {onStartAnyCrop && (
              <button
                onClick={onStartAnyCrop}
                className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Choose Other Crop</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Step Onboarding Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-gray-100">
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="w-6 h-6 rounded-lg bg-green-600 text-white font-black text-xs flex items-center justify-center mb-2">1</span>
            <h4 className="text-xs font-bold text-gray-900">Plant &amp; Upload Verification</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Agree to guidelines, sow seeds or saplings, and upload planting photograph.</p>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center mb-2">2</span>
            <h4 className="text-xs font-bold text-gray-900">Admin Review &amp; Approval</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Admin verifies your planting photograph to unlock Stage 2 and weekly monitoring.</p>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center mb-2">3</span>
            <h4 className="text-xs font-bold text-gray-900">Weekly Growth Tracking</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Upload photos every 7 days to document growth height and health through harvest.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active Cultivation Calculation
  const activeCultivation = cultivations.find(c => c.id === selectedCultivationId) || cultivations[0] || {};
  const crop = activeCultivation.cropProfile || {};
  const guide = crop.cultivationGuide || crop.cultivationGuides?.[0] || {};
  const fallbackKnowledge = getCropKnowledge(crop.name || "Coconut");

  const rawStages = guide.cultivationStages || [];
  const stages = rawStages.length > 0 
    ? rawStages 
    : fallbackKnowledge.cultivationStages.map((s: any, i: number) => ({ id: `stage_${i+1}`, ...s }));

  const submissions = activeCultivation.stageSubmissions || [];
  const weeklyPhotos = activeCultivation.weeklyPhotos || [];

  // Helper to reliably find a stage submission by stage ID or stage order/index
  const getStageSubmission = (stage: any, index: number) => {
    return submissions.find((s: any) => 
      s.stageId === stage?.id || 
      s.stageId === `stage_${index + 1}` || 
      (stage?.stageOrder && (s.stageId === `stage_${stage.stageOrder}` || s.stageId === String(stage.stageOrder))) ||
      (index === 0 && (s.stageId === 'stage_1' || s.stageId === 'first' || s.stageId === 'planting'))
    );
  };

  // Determine current stage index based on approvals
  let currentStageIndex = 0;
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const sub = getStageSubmission(stage, i);
    if (!sub || sub.status !== "APPROVED") {
      currentStageIndex = i;
      break;
    }
    if (i === stages.length - 1 && sub?.status === "APPROVED") {
      currentStageIndex = stages.length;
    }
  }

  const currentStage = stages.length > 0 ? stages[Math.min(currentStageIndex, stages.length - 1)] : null;
  const currentSubmission = currentStage ? getStageSubmission(currentStage, currentStageIndex) : null;
  const isPlantingPhase = currentStageIndex === 0 || activeCultivation.status === "PLANTING_PENDING";
  const initialPlantingApproved = currentStageIndex > 0 && activeCultivation.status !== "PLANTING_PENDING";
  const progressPercent = isPlantingPhase ? 0 : Math.min(100, Math.round(activeCultivation.progress || ((currentStageIndex / Math.max(stages.length, 1)) * 100)));

  // Planting date & 3-day deadline calculations
  const startDate = new Date(activeCultivation.startDate || Date.now());
  const now = new Date();
  const daysPlanted = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksDiff = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const currentWeekNum = Math.max(1, weeksDiff + 1);
  const nextDueDate = new Date(startDate.getTime() + (currentWeekNum * 7 * 24 * 60 * 60 * 1000));
  const thisWeekSubmission = weeklyPhotos.find((p: any) => p.weekNumber === currentWeekNum);
  const needsWeeklyPhoto = initialPlantingApproved && (!thisWeekSubmission || thisWeekSubmission.status === "REJECTED" || thisWeekSubmission.status === "RESUBMISSION REQUIRED");

  // Initial Planting Submission (Stage 1)
  const plantingSubmission = stages.length > 0 ? getStageSubmission(stages[0], 0) : submissions[0];

  // 3-Day Planting Deadline Window (72 Hours)
  const plantingDeadline = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const plantingTimeRemainingMs = plantingDeadline.getTime() - now.getTime();
  const plantingDaysRemaining = Math.max(0, Math.floor(plantingTimeRemainingMs / (1000 * 60 * 60 * 24)));
  const plantingHoursRemaining = Math.max(0, Math.floor((plantingTimeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const isPlantingOverdue = plantingTimeRemainingMs <= 0 && (!plantingSubmission || plantingSubmission.status === "REJECTED" || plantingSubmission.status === "RESUBMISSION REQUIRED");

  // Active Inspecting Stage (Allows farmer to view requirements of the next stage or any stage)
  const activeInspectIndex = selectedStageIdx !== null ? selectedStageIdx : currentStageIndex;
  const inspectingStage = stages[activeInspectIndex] || currentStage;
  const inspectingSubmission = inspectingStage ? getStageSubmission(inspectingStage, activeInspectIndex) : null;
  const isInspectingLocked = activeInspectIndex > currentStageIndex || (activeInspectIndex > 0 && isPlantingPhase);

  return (
    <div id="my-cultivations" className="bg-white border-2 border-green-600/30 rounded-3xl p-6 lg:p-7 shadow-sm space-y-6">
      
      {/* 1. TOP MODULE HEADER: Title, Cultivation Switcher & Quick Meta */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-900 px-3 py-1 rounded-full border border-green-200 flex items-center">
              <Sprout className="w-3.5 h-3.5 mr-1 text-green-700" />
              CROP CULTIVATION PROGRESS MODULE
            </span>
            {isPlantingPhase ? (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-amber-700 animate-pulse" />
                Stage 1: Planting Verification Phase
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-blue-700" />
                Stage {currentStageIndex + 1}: Supervised Active Growth
              </span>
            )}
            <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
              Day {daysPlanted} of Growth
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              {crop.imageUrl ? (
                <SafeImage src={crop.imageUrl} alt={crop.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50">
                  <Sprout className="w-7 h-7" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>{crop.name || "Cultivated Crop"}</span>
                {activeCultivation.status === "ACTIVE" && (
                  <span className="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded-md">LIVE</span>
                )}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {crop.scientificName || fallbackKnowledge.scientificName || "Agricultural Plant"} · Sown on {startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Crop Switcher & External Workspace Link */}
        <div className="flex flex-wrap items-center gap-2.5">
          {cultivations.length > 1 && (
            <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto max-w-full no-scrollbar touch-scroll">
              {cultivations.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCultivation(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    c.id === activeCultivation.id 
                      ? "bg-green-600 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-200/60"
                  }`}
                >
                  {c.cropProfile?.name || "Crop"}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onOpenGuide(crop.name || "Coconut")}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-gray-500" />
            <span>Cultivation Guide</span>
          </button>

          <Link
            href={`/dashboard/farmer/cultivation/${activeCultivation.id}`}
            className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {onDeleteCultivation && activeCultivation.id && (
            <button
              onClick={() => onDeleteCultivation(activeCultivation.id)}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200"
              title="Remove this cultivation to start fresh with a new crop"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 2. PROGRESS BANNER WITH METRICS & TIMELINE BAR */}
      <div className="bg-gradient-to-br from-green-50/70 via-emerald-50/40 to-white p-5 rounded-2xl border border-green-200/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-green-800">
              Cultivation Progress Tracker
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl font-black text-gray-900">{progressPercent}%</span>
              <span className="text-xs text-gray-600 font-semibold">
                Completed · Stage {Math.min(currentStageIndex + 1, stages.length)} of {stages.length} ({currentStage?.stageName || "Planting"})
              </span>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center space-x-2">
            {isPlantingPhase ? (
              currentSubmission?.status === "PENDING REVIEW" ? (
                <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-amber-100 text-amber-900 rounded-xl border border-amber-300 text-xs font-black">
                  <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                  <span>Planting Photo Under Admin Review</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs animate-pulse">
                  <Camera className="w-4 h-4 text-white" />
                  <span>Planting Photo Required (Within 3 Days)</span>
                </div>
              )
            ) : needsWeeklyPhoto ? (
              <button
                onClick={() => {
                  setActiveTab("weekly");
                  setIsUploadingWeekly(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm animate-pulse"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Week {currentWeekNum} Photo</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-green-100 text-green-900 rounded-xl border border-green-200 text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span>Supervised Growth on Track</span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Multi-Segment Stage Bar */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
            {stages.map((stage: any, idx: number) => {
              const isApproved = idx < currentStageIndex && !isPlantingPhase;
              const isCurrent = idx === currentStageIndex;
              const isLocked = idx > currentStageIndex || (idx > 0 && isPlantingPhase);

              return (
                <div 
                  key={stage.id || idx} 
                  onClick={() => setSelectedStageIdx(idx)}
                  className="flex flex-col space-y-1 cursor-pointer group"
                >
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isApproved 
                        ? "bg-green-600 shadow-xs" 
                        : isCurrent 
                        ? "bg-green-500 animate-pulse ring-2 ring-green-300" 
                        : "bg-gray-200 group-hover:bg-gray-300"
                    }`}
                  />
                  <span className={`text-[9px] font-bold truncate ${
                    isCurrent ? "text-gray-900 font-black" : isApproved ? "text-green-800" : "text-gray-400"
                  }`}>
                    {idx + 1}. {stage.stageName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-level stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-green-200/50 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Growing Period</span>
            <strong className="text-gray-900 text-xs">{crop.growingPeriod || fallbackKnowledge.growingPeriod}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Expected Yield</span>
            <strong className="text-gray-900 text-xs">{crop.expectedYield || fallbackKnowledge.expectedYield}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Weekly Updates Logged</span>
            <strong className="text-gray-900 text-xs">{weeklyPhotos.length} Photos</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Admin Verification</span>
            <strong className="text-gray-900 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              {initialPlantingApproved ? "Verified & Supervised" : "Stage 1 Planting Review"}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. TAB CONTROLS: Stages Progression | Weekly Growth Journey | Care & Maintenance */}
      <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto no-scrollbar touch-scroll pb-0.5">
        <button
          onClick={() => setActiveTab("stages")}
          className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "stages"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Stages Progression ({stages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("weekly")}
          className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "weekly"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Weekly Growth Gallery ({weeklyPhotos.length})</span>
          {needsWeeklyPhoto && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("care")}
          className={`pb-3 px-3 text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 border-b-2 cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "care"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Water &amp; Fertilizer Schedule</span>
        </button>
      </div>

      {/* 4. TAB 1 CONTENT: STAGES PROGRESSION & EVIDENCE */}
      {activeTab === "stages" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Stages Timeline Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                Cultivation Stage Milestones
              </h4>
              <span className="text-[10px] text-gray-400 font-semibold">Strict Admin Approval</span>
            </div>

            <div className="space-y-2.5">
              {stages.map((stage: any, idx: number) => {
                const isApproved = idx < currentStageIndex && !isPlantingPhase;
                const isCurrent = idx === currentStageIndex;
                const isLocked = idx > currentStageIndex || (idx > 0 && isPlantingPhase);
                const isSelected = activeInspectIndex === idx;
                const sub = getStageSubmission(stage, idx);

                return (
                  <div
                    key={stage.id || idx}
                    onClick={() => setSelectedStageIdx(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-green-50/90 border-green-500 ring-2 ring-green-300 shadow-sm"
                        : isCurrent
                        ? "bg-white border-green-300 hover:border-green-400"
                        : isApproved
                        ? "bg-white border-gray-200 hover:border-green-200"
                        : "bg-gray-50/70 border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                        isApproved ? "bg-green-600 text-white" :
                        isCurrent ? "bg-white border-2 border-green-600 text-green-700 shadow-xs" :
                        "bg-gray-200 text-gray-500"
                      }`}>
                        {isApproved ? <CheckCircle className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h5 className={`text-xs font-bold truncate ${isSelected ? "text-green-950 font-black" : isCurrent ? "text-gray-900 font-bold" : "text-gray-700"}`}>
                            Stage {idx + 1}: {stage.stageName}
                          </h5>
                          {isSelected && (
                            <span className="text-[8px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                              VIEWING
                            </span>
                          )}
                          {!isSelected && isApproved && (
                            <span className="text-[8px] font-black bg-green-100 text-green-900 px-2 py-0.5 rounded-full border border-green-200">
                              APPROVED ✓
                            </span>
                          )}
                          {!isSelected && isCurrent && sub?.status === "PENDING REVIEW" && (
                            <span className="text-[8px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                              PENDING REVIEW
                            </span>
                          )}
                          {!isSelected && isCurrent && (!sub || sub.status === "REJECTED" || sub.status === "RESUBMISSION REQUIRED") && (
                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                              🟢 ACTIVE
                            </span>
                          )}
                          {!isSelected && isLocked && (
                            <span className="text-[8px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Lock className="w-2 h-2" /> LOCKED
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                          {stage.description}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-100/80">
                          <span>Day {stage.startDay || 1} - {stage.endDay || 30}</span>
                          <span className="text-green-700 font-semibold hover:underline">
                            {isLocked ? "Click to view requirements" : "Click to view stage"}
                          </span>
                        </div>

                        {/* Evidence thumbnail if uploaded for this stage */}
                        {sub?.imageUrl && (
                          <div className="mt-2 flex items-center space-x-2 pt-1 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPhoto({
                                  url: sub.imageUrl,
                                  title: `Stage ${idx + 1}: ${stage.stageName} Evidence`,
                                  date: sub.submittedAt,
                                  notes: sub.farmerNotes,
                                  status: sub.status,
                                  adminComment: sub.adminComment
                                });
                              }}
                              className="flex items-center space-x-1.5 text-[10px] font-bold text-green-700 hover:text-green-800 hover:underline cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Submitted Photograph</span>
                            </button>
                            <span className="text-[9px] text-gray-400">· {new Date(sub.submittedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Stage 1 Planting Evidence / Stage Action Area (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {isInspectingLocked ? (
              <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-amber-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" />
                        Stage {activeInspectIndex + 1} Requirements Preview (Locked)
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        Sequential Progress Enforced
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900">
                      {inspectingStage.stageName} — Stage Requirements
                    </h4>
                    <p className="text-xs text-amber-900/90 font-medium mt-1 leading-relaxed">
                      You can view and study all the instructions, watering schedules, and manure requirements for this stage below. However, <strong>you cannot advance to or enter this stage</strong> until Stage 1 (Planting the crop within 3 days &amp; uploading the planted crop photograph) is verified and approved by the Administrator.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStageIdx(0)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Back to Stage 1 Planting</span>
                  </button>
                </div>

                {/* Important Stage Rule Notice */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-amber-900 block font-black">
                      🔒 Stage Currently Locked — Read-Only Mode
                    </strong>
                    <p className="leading-relaxed">
                      This stage will automatically unlock once your Stage 1 planting photograph is approved by the agricultural officer. Until then, you can plan ahead using the requirements below.
                    </p>
                  </div>
                </div>

                {/* Requirements Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                      Growth Timeline
                    </span>
                    <p className="text-base font-black text-gray-900">
                      Day {inspectingStage.startDay} - Day {inspectingStage.endDay || '30'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Estimated duration for this developmental stage
                    </p>
                  </div>

                  <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 block flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      Water Management Requirement
                    </span>
                    <p className="text-sm font-black text-gray-900">
                      {inspectingStage.waterReq || "Consistent root-zone moisture"}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Recommended watering method &amp; frequency
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                      Manure &amp; Fertilizer Requirement
                    </span>
                    <p className="text-sm font-black text-gray-900">
                      {inspectingStage.manureReq || "Organic compost & bio-fertilizer"}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Nutrient doses and application method
                    </p>
                  </div>

                  <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Care &amp; Weeding Instructions
                    </span>
                    <p className="text-sm font-bold text-gray-900">
                      {inspectingStage.careInstructions || "Keep soil weed-free and monitor plant health"}
                    </p>
                    <p className="text-[11px] text-gray-600">
                      Sanitation, pest inspection, and pruning
                    </p>
                  </div>
                </div>

                {/* Stage Description */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                    Detailed Stage Description &amp; Target Milestones
                  </span>
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {inspectingStage.description}
                  </p>
                </div>

                {/* What Evidence Will Be Required */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 text-xs space-y-1.5 text-blue-950">
                  <span className="font-black text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-700" />
                    Required Evidence When Unlocked
                  </span>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Once unlocked, you will document this stage by uploading a clear photograph showing the plant height, leaf emergence, and stem development for Administrator review.
                  </p>
                </div>

                {/* Disabled Stage Action Button */}
                <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
                    <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>You cannot advance to this stage until Stage 1 photo verification is approved.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStageIdx(0);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center space-x-2 shrink-0 shadow-xs"
                    title="Click to view and complete Stage 1 planting photo verification"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Stage Locked &bull; Go to Stage 1 Verification &rarr;</span>
                  </button>
                </div>
              </div>
            ) : isPlantingPhase ? (
              <div className="bg-white border-2 border-emerald-500/50 rounded-3xl p-6 shadow-md space-y-5">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                      Step 1 Photographic Evidence
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      Mandatory Admin Review
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-emerald-600" />
                    Planting Verification Photograph
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Sow the seed or plant the sapling in the prepared soil as instructed, then upload a real photograph. The photograph is submitted to the Administrator for approval before Stage 2 unlocks.
                  </p>
                </div>

                {/* 3-DAY PLANTING WINDOW COUNTDOWN CARD */}
                <div className={`p-4 rounded-2xl border-2 space-y-2.5 ${
                  plantingSubmission?.status === 'PENDING REVIEW'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : isPlantingOverdue
                    ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                    : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-current animate-pulse shrink-0" />
                      <strong className="text-xs font-black uppercase tracking-wider">
                        {plantingSubmission?.status === 'PENDING REVIEW'
                          ? '🟡 Planting Photo Under Admin Review'
                          : isPlantingOverdue
                          ? '🔴 Mandatory 3-Day Planting Deadline Overdue'
                          : '⏱️ Mandatory 3-Day Planting Window Active'}
                      </strong>
                    </div>
                    {stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedStageIdx(1)}
                        className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Next Stage Requirements</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      {plantingSubmission?.status === 'PENDING REVIEW' ? (
                        <p className="font-semibold text-amber-900">
                          Planting photograph submitted on {new Date(plantingSubmission.submittedAt).toLocaleDateString()}. Stage 2 unlocks automatically once verified by the administrator.
                        </p>
                      ) : isPlantingOverdue ? (
                        <p className="font-bold text-rose-800">
                          The 3-day (72-hour) planting period expired on {plantingDeadline.toLocaleDateString()}. Please upload the photograph of your planted seed/sapling immediately!
                        </p>
                      ) : (
                        <p className="font-bold text-emerald-900">
                          Time remaining: <span className="underline">{plantingDaysRemaining} Day(s), {plantingHoursRemaining} Hour(s)</span> to plant your crop and upload photograph.
                        </p>
                      )}
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Agreed on: {startDate.toLocaleDateString()} · Planting Deadline: {plantingDeadline.toLocaleDateString()} ({plantingDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>

                    {!plantingSubmission && !isPlantingOverdue && (
                      <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shrink-0 shadow-xs">
                        {plantingDaysRemaining}d {plantingHoursRemaining}h LEFT
                      </div>
                    )}
                  </div>
                </div>

                {/* State A: Awaiting Initial Planting Photo */}
                {(!plantingSubmission || plantingSubmission.status === "REJECTED" || plantingSubmission.status === "RESUBMISSION REQUIRED") && (
                  <div className="space-y-3">
                    {plantingSubmission?.adminComment && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800">
                        <strong className="block text-red-900">🔴 Resubmission Requested by Administrator:</strong>
                        <p className="mt-0.5">{plantingSubmission.adminComment}</p>
                      </div>
                    )}

                    <CultivationImageUpload
                      label={plantingSubmission ? "Upload Revised Planting Photograph" : "Upload Planting Photograph (Seed / Sapling in Soil)"}
                      subLabel="Ensure the planted seed or sapling and prepared soil are clearly visible in natural daylight."
                      submitButtonText="SUBMIT PLANTING PHOTOGRAPH FOR ADMIN APPROVAL"
                      onSubmit={async (imageUrl, notes) => {
                        setActionError(null);
                        try {
                          await onSubmitStageEvidence(activeCultivation.id, stages[0]?.id || "stage_1", imageUrl, notes);
                        } catch (err: any) {
                          setActionError(err.message || "Failed to submit planting evidence.");
                        }
                      }}
                    />
                  </div>
                )}

                {/* State B: Photo Submitted — Under Admin Review */}
                {plantingSubmission?.status === "PENDING REVIEW" && (
                  <div className="p-6 bg-amber-50/80 border-2 border-amber-300 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-200 text-amber-900 mb-1.5">
                        🟡 Verification Request Under Admin Review
                      </span>
                      <h5 className="font-black text-gray-900 text-base">Planting Photograph Submitted</h5>
                      <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                        Submitted on <strong>{new Date(plantingSubmission.submittedAt).toLocaleDateString()}</strong> at {new Date(plantingSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Your request is queued for Administrator review. Stage 2 will unlock automatically once approved.
                      </p>
                    </div>

                    {plantingSubmission.imageUrl && (
                      <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-amber-300 shadow-sm mt-3">
                        <img 
                          src={plantingSubmission.imageUrl} 
                          alt="Planted crop" 
                          className="w-full h-44 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => setPreviewPhoto({
                            url: plantingSubmission.imageUrl,
                            title: "Submitted Planting Photograph",
                            date: plantingSubmission.submittedAt,
                            notes: plantingSubmission.farmerNotes,
                            status: plantingSubmission.status
                          })}
                        />
                        {plantingSubmission.farmerNotes && (
                          <p className="p-2 text-[10px] bg-white text-gray-700 italic border-t border-amber-100">
                            &quot;{plantingSubmission.farmerNotes}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Planting guidelines checklist */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2 text-emerald-950">
                  <span className="font-bold flex items-center text-[11px] text-emerald-900">
                    <Leaf className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                    Planting Instructions Summary
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-gray-500 font-semibold block text-[10px]">Method</span>
                      <strong className="text-gray-800">{guide.plantingMethod || fallbackKnowledge.plantingMethod || "Standard pit planting"}</strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-gray-500 font-semibold block text-[10px]">Spacing</span>
                      <strong className="text-gray-800">{guide.spacing || fallbackKnowledge.spacing || "Grid spacing"}</strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-gray-500 font-semibold block text-[10px]">Seed/Sapling</span>
                      <strong className="text-gray-800">{guide.seedInformation || fallbackKnowledge.seedInformation || "High-yield sapling"}</strong>
                    </div>
                  </div>
                </div>

                {/* Dedicated Upcoming Weekly Photo Tracking Card */}
                <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-purple-900">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <strong className="font-black uppercase tracking-wider text-[11px]">
                      🌱 Weekly Plant Growth Updates (Every 7 Days)
                    </strong>
                  </div>
                  <div className="flex items-start space-x-2 text-purple-800/80">
                    <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>Weekly growth upload unlocks after planting approval:</strong> Once the Administrator reviews and approves your planting photograph above, this place in your cultivation menu will activate for weekly photo updates. You will upload a photo of the planted crop every 7 days to document its height and health.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* When Initial Planting is Approved: Stage 2+ Evidence & Progression */
              <div className="space-y-5">
                
                {/* 🌟 DEDICATED PLACE IN CULTIVATION MENU TO UPLOAD WEEKLY IMAGE OF THE PLANTED CROP */}
                <div className="bg-gradient-to-br from-purple-50/80 via-white to-green-50/60 border-2 border-purple-300 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                          Weekly Plant Growth Monitoring
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          Cycle: Week {currentWeekNum}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mt-1 flex items-center gap-1.5">
                        <Camera className="w-5 h-5 text-purple-600" />
                        <span>Upload Week {currentWeekNum} Crop Growth Photograph</span>
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Upload a fresh photograph of the plant you have planted to record its height, foliage, and health. Due by <strong>{nextDueDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</strong>.
                      </p>
                    </div>

                    <div className="shrink-0">
                      {thisWeekSubmission ? (
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                          thisWeekSubmission.status === "APPROVED" ? "bg-green-100 text-green-900 border-green-300" :
                          thisWeekSubmission.status === "PENDING REVIEW" ? "bg-amber-100 text-amber-900 border-amber-300" :
                          "bg-red-100 text-red-900 border-red-300"
                        }`}>
                          {thisWeekSubmission.status === "APPROVED" ? "WEEKLY PHOTO APPROVED ✓" :
                           thisWeekSubmission.status === "PENDING REVIEW" ? "WEEKLY PHOTO UNDER REVIEW 🟡" :
                           "RESUBMISSION REQUESTED 🔴"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-400 text-gray-950 shadow-xs animate-pulse">
                          📸 PHOTO DUE THIS WEEK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* If week's photo not yet submitted or resubmission requested */}
                  {(!thisWeekSubmission || thisWeekSubmission.status === "REJECTED" || thisWeekSubmission.status === "RESUBMISSION REQUIRED") ? (
                    <div className="space-y-3">
                      {thisWeekSubmission?.adminComment && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                          <strong>Admin Feedback:</strong> {thisWeekSubmission.adminComment}
                        </div>
                      )}

                      <CultivationImageUpload
                        label={`Upload Week ${currentWeekNum} Crop Growth Photograph`}
                        subLabel="Take a photo showing plant height against a scale/hand, leaf count, and overall condition."
                        submitButtonText={`SUBMIT WEEK ${currentWeekNum} GROWTH PHOTOGRAPH`}
                        onSubmit={async (imageUrl, notes) => {
                          setActionError(null);
                          try {
                            await onSubmitWeeklyPhoto(activeCultivation.id, currentWeekNum, nextDueDate, imageUrl, notes);
                          } catch (err: any) {
                            setActionError(err.message || "Failed to submit weekly growth photograph.");
                          }
                        }}
                      />
                    </div>
                  ) : thisWeekSubmission?.status === "PENDING REVIEW" ? (
                    <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                      {thisWeekSubmission.imageUrl && (
                        <div 
                          className="w-28 h-24 rounded-xl overflow-hidden bg-gray-100 border border-amber-300 shrink-0 cursor-pointer shadow-xs hover:opacity-90"
                          onClick={() => setPreviewPhoto({
                            url: thisWeekSubmission.imageUrl,
                            title: `Week ${currentWeekNum} Growth Photograph`,
                            date: thisWeekSubmission.submittedAt,
                            notes: thisWeekSubmission.farmerNotes,
                            status: "PENDING REVIEW"
                          })}
                        >
                          <img src={thisWeekSubmission.imageUrl} alt="Weekly photo" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-amber-900 font-bold text-xs">
                          <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                          <span>Week {currentWeekNum} Growth Photo Under Admin Review</span>
                        </div>
                        <p className="text-[11px] text-gray-600">
                          Submitted on {new Date(thisWeekSubmission.submittedAt).toLocaleDateString()}. The Administrator is reviewing your weekly crop growth photograph.
                        </p>
                        {thisWeekSubmission.farmerNotes && (
                          <p className="text-[11px] text-gray-700 italic bg-white/80 p-2 rounded-lg border border-amber-100">
                            &quot;{thisWeekSubmission.farmerNotes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-green-50/90 border border-green-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                      {thisWeekSubmission.imageUrl && (
                        <div 
                          className="w-28 h-24 rounded-xl overflow-hidden bg-gray-100 border border-green-300 shrink-0 cursor-pointer shadow-xs hover:opacity-90"
                          onClick={() => setPreviewPhoto({
                            url: thisWeekSubmission.imageUrl,
                            title: `Week ${currentWeekNum} Growth Photograph`,
                            date: thisWeekSubmission.submittedAt,
                            notes: thisWeekSubmission.farmerNotes,
                            status: "APPROVED",
                            adminComment: thisWeekSubmission.adminComment
                          })}
                        >
                          <img src={thisWeekSubmission.imageUrl} alt="Weekly photo" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-green-900 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-green-700" />
                          <span>Week {currentWeekNum} Growth Photo Approved!</span>
                        </div>
                        <p className="text-[11px] text-green-800">
                          Your weekly crop growth submission is verified. Next weekly photo is due on {new Date(nextDueDate.getTime() + 7*24*60*60*1000).toLocaleDateString()}.
                        </p>
                        {thisWeekSubmission.adminComment && (
                          <div className="text-[11px] text-emerald-900 bg-white/80 p-2 rounded-lg border border-green-200">
                            <strong>Admin Remark:</strong> {thisWeekSubmission.adminComment}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs text-purple-900">
                    <span className="text-[11px] text-gray-500">
                      Total weekly updates logged: <strong>{weeklyPhotos.length}</strong>
                    </span>
                    <button
                      onClick={() => setActiveTab("weekly")}
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Growth Gallery &amp; History ({weeklyPhotos.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stage Care & Evidence Card */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-900 px-2.5 py-0.5 rounded-full border border-green-200 inline-block mb-1">
                        Active Stage {currentStageIndex + 1}
                      </span>
                      <h4 className="text-lg font-black text-gray-900">
                        {currentStage?.stageName} Care &amp; Evidence
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {currentStage?.description}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-xl">
                      Day {currentStage?.startDay || "1"} - {currentStage?.endDay || "30"}
                    </span>
                  </div>

                  {/* Stage Evidence Upload or Under Review */}
                  {currentStage && (!currentSubmission || currentSubmission.status === "REJECTED" || currentSubmission.status === "RESUBMISSION REQUIRED") ? (
                    <div className="pt-2">
                      <CultivationImageUpload
                        label={`Upload Stage ${currentStageIndex + 1} Completion Photo`}
                        subLabel="Clear photo showing plant height, leaf count, and health."
                        submitButtonText="SUBMIT STAGE EVIDENCE FOR APPROVAL"
                        onSubmit={async (imageUrl, notes) => {
                          setActionError(null);
                          try {
                            await onSubmitStageEvidence(activeCultivation.id, currentStage.id, imageUrl, notes);
                          } catch (err: any) {
                            setActionError(err.message || "Failed to submit stage evidence.");
                          }
                        }}
                      />
                    </div>
                  ) : currentSubmission?.status === "PENDING REVIEW" ? (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                      <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                      <h5 className="font-bold text-amber-900 text-sm">Stage Evidence Under Review</h5>
                      <p className="text-xs text-amber-800">
                        Your photographic evidence for Stage {currentStageIndex + 1} ({currentStage?.stageName}) is being reviewed by the administrator.
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Approved Planting Photographic Evidence Showcase Card */}
                {plantingSubmission && (
                  <div className="bg-gradient-to-br from-emerald-50/90 to-white border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">✓</span>
                        <h5 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                          Stage 1 Verified Planting Evidence
                        </h5>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        APPROVED BY ADMIN
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {plantingSubmission.imageUrl && (
                        <div 
                          className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-gray-100 border-2 border-emerald-200 shrink-0 relative group cursor-pointer shadow-xs"
                          onClick={() => setPreviewPhoto({
                            url: plantingSubmission.imageUrl,
                            title: "Stage 1: Verified Planting Photograph",
                            date: plantingSubmission.submittedAt,
                            notes: plantingSubmission.farmerNotes,
                            status: "APPROVED",
                            adminComment: plantingSubmission.adminComment
                          })}
                        >
                          <img 
                            src={plantingSubmission.imageUrl} 
                            alt="Planted sapling evidence" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                            <Eye className="w-6 h-6 drop-shadow-md" />
                          </div>
                          <span className="absolute bottom-2 left-2 text-[9px] font-black bg-gray-900/80 text-white px-2 py-0.5 rounded-full">
                            Click to Enlarge
                          </span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2 text-xs">
                        <div className="text-[11px] text-gray-500">
                          <strong>Planted &amp; Submitted:</strong> {new Date(plantingSubmission.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </div>

                        {plantingSubmission.farmerNotes && (
                          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Farmer Planting Notes:</span>
                            <p className="text-gray-800 italic leading-relaxed text-xs">&quot;{plantingSubmission.farmerNotes}&quot;</p>
                          </div>
                        )}

                        {plantingSubmission.adminComment && (
                          <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200 text-emerald-950">
                            <span className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1 mb-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Official Agricultural Officer Remark:
                            </span>
                            <p className="text-xs font-semibold">{plantingSubmission.adminComment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2 CONTENT: WEEKLY GROWTH JOURNEY GALLERY */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-900 via-gray-800 to-green-950 text-white p-5 rounded-3xl shadow-sm">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Camera className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-green-300">
                  Weekly Crop Growth Photo Journey
                </span>
              </div>
              <h3 className="text-xl font-black">Photographic Growth Timeline</h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Every 7 days, upload a progress photo showing the actual growth, height, and foliage of your planted crop.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-gray-400 font-semibold block">Current Cycle</span>
                <strong className="text-sm text-white">Week {currentWeekNum}</strong>
              </div>
              {needsWeeklyPhoto && !isUploadingWeekly && (
                <button
                  onClick={() => setIsUploadingWeekly(true)}
                  className="px-4 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Week {currentWeekNum} Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Weekly Photo Upload Drawer if active or due */}
          {(needsWeeklyPhoto || isUploadingWeekly) && (
            <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Due by: {nextDueDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </span>
                  <h4 className="text-lg font-black text-gray-900 mt-1">
                    Upload Week {currentWeekNum} Crop Growth Photograph
                  </h4>
                  <p className="text-xs text-gray-500">
                    Take a clear photo showing the whole crop, height against a scale/hand, and leaf development.
                  </p>
                </div>
                {isUploadingWeekly && !needsWeeklyPhoto && (
                  <button 
                    onClick={() => setIsUploadingWeekly(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <CultivationImageUpload
                label={`Week ${currentWeekNum} Photograph`}
                subLabel="Take or upload a high-resolution photo of your crop."
                submitButtonText={`SUBMIT WEEK ${currentWeekNum} PROGRESS PHOTO`}
                onSubmit={async (imageUrl, notes) => {
                  setActionError(null);
                  try {
                    await onSubmitWeeklyPhoto(activeCultivation.id, currentWeekNum, nextDueDate, imageUrl, notes);
                    setIsUploadingWeekly(false);
                  } catch (err: any) {
                    setActionError(err.message || "Failed to submit weekly growth photograph.");
                  }
                }}
              />
            </div>
          )}

          {/* Gallery of Uploaded Weekly Photos */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Growth History &amp; Photo Log ({weeklyPhotos.length} Uploads)
            </h4>

            {weeklyPhotos.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 text-center space-y-2">
                <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                <h5 className="font-bold text-gray-700 text-sm">No Weekly Photos Uploaded Yet</h5>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {isPlantingPhase 
                    ? "Weekly growth tracking will unlock once the initial planting photograph is verified and approved by the Administrator." 
                    : `Your first weekly photo is due on ${nextDueDate.toLocaleDateString()}. Click upload to record growth progress.`}
                </p>
                {isPlantingPhase && (
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab("stages")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Go to Step 1: Upload Planting Photo</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Baseline: Day 1 Planting Verification Photo */}
                {plantingSubmission?.imageUrl && (
                  <div className="bg-white border-2 border-emerald-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                      <img 
                        src={plantingSubmission.imageUrl} 
                        alt="Day 1 Planting" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setPreviewPhoto({
                          url: plantingSubmission.imageUrl,
                          title: "Day 1: Planting Baseline Photograph",
                          date: plantingSubmission.submittedAt,
                          notes: plantingSubmission.farmerNotes,
                          status: plantingSubmission.status,
                          adminComment: plantingSubmission.adminComment
                        })}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-xs">
                        Day 1: Sown
                      </span>
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-green-500 text-white">
                        APPROVED ✓
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block">
                          {plantingSubmission.submittedAt ? new Date(plantingSubmission.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Baseline"}
                        </span>
                        <p className="text-xs font-bold text-gray-900 mt-0.5">Initial Planting Evidence</p>
                        {plantingSubmission.farmerNotes && (
                          <p className="text-xs text-gray-600 italic line-clamp-2 mt-1">
                            &quot;{plantingSubmission.farmerNotes}&quot;
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setPreviewPhoto({
                          url: plantingSubmission.imageUrl,
                          title: "Day 1: Planting Baseline Photograph",
                          date: plantingSubmission.submittedAt,
                          notes: plantingSubmission.farmerNotes,
                          status: plantingSubmission.status,
                          adminComment: plantingSubmission.adminComment
                        })}
                        className="text-[11px] font-bold text-green-700 hover:text-green-800 flex items-center justify-between pt-2 border-t border-gray-100 cursor-pointer"
                      >
                        <span>View Photo Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {weeklyPhotos.map((photo: any) => (
                  <div 
                    key={photo.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
                      {photo.imageUrl ? (
                        <img 
                          src={photo.imageUrl} 
                          alt={`Week ${photo.weekNumber}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => setPreviewPhoto({
                            url: photo.imageUrl,
                            title: `Week ${photo.weekNumber} Growth Photograph`,
                            date: photo.submittedAt,
                            notes: photo.farmerNotes,
                            status: photo.status,
                            adminComment: photo.adminComment
                          })}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-900/80 backdrop-blur-sm text-white shadow-xs">
                        Week {photo.weekNumber}
                      </span>
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black ${
                        photo.status === "APPROVED" 
                          ? "bg-green-500 text-white" 
                          : photo.status === "PENDING REVIEW" 
                          ? "bg-amber-400 text-gray-900" 
                          : "bg-red-500 text-white"
                      }`}>
                        {photo.status === "APPROVED" ? "APPROVED ✓" : photo.status === "PENDING REVIEW" ? "UNDER REVIEW" : photo.status}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block">
                          {photo.submittedAt ? new Date(photo.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Logged"}
                        </span>
                        {photo.farmerNotes && (
                          <p className="text-xs text-gray-700 italic line-clamp-2 mt-1">
                            &quot;{photo.farmerNotes}&quot;
                          </p>
                        )}
                        {photo.adminComment && (
                          <div className="mt-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-600">
                            <strong>Admin:</strong> {photo.adminComment}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setPreviewPhoto({
                          url: photo.imageUrl,
                          title: `Week ${photo.weekNumber} Growth Photograph`,
                          date: photo.submittedAt,
                          notes: photo.farmerNotes,
                          status: photo.status,
                          adminComment: photo.adminComment
                        })}
                        className="text-[11px] font-bold text-green-700 hover:text-green-800 flex items-center justify-between pt-2 border-t border-gray-100 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 3 CONTENT: WATER & FERTILIZER CARE SCHEDULE */}
      {activeTab === "care" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Watering Schedule */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base">Irrigation &amp; Water Schedule</h4>
                <p className="text-xs text-blue-900/70">Stage-specific moisture management</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(guide.wateringSchedules && guide.wateringSchedules.length > 0 ? guide.wateringSchedules : fallbackKnowledge.wateringSchedules).map((w: any, i: number) => (
                <div key={i} className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-bold text-gray-900">{w.growthStage}</strong>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {w.frequency}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    <strong>Method:</strong> {w.irrigationMethod}
                  </p>
                  {w.specialInstructions && (
                    <p className="text-[10px] text-gray-500 italic">{w.specialInstructions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Manure & Fertilizers */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base">Manure &amp; Fertilizer Schedule</h4>
                <p className="text-xs text-emerald-900/70">Nutrition for yield maximization</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(guide.manureFertilizers && guide.manureFertilizers.length > 0 ? guide.manureFertilizers : fallbackKnowledge.manureFertilizers).map((m: any, i: number) => (
                <div key={i} className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-1">
                  <strong className="text-xs font-bold text-gray-900 block">{m.stageName}</strong>
                  <div className="text-[11px] text-gray-600 space-y-0.5">
                    <p><strong>Organic Option:</strong> {m.organicOption}</p>
                    <p><strong>Chemical Option:</strong> {m.chemicalOption}</p>
                    <p className="text-[10px] text-emerald-700"><strong>Application:</strong> {m.applicationMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. HIGH-RESOLUTION PHOTO PREVIEW LIGHTBOX */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-bold truncate">{previewPhoto.title}</h4>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black/5 border border-gray-200 max-h-[50vh] flex items-center justify-center">
                <img 
                  src={previewPhoto.url} 
                  alt={previewPhoto.title} 
                  className="w-full h-full object-contain max-h-[50vh]" 
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                  {previewPhoto.date && (
                    <span>Submitted on: {new Date(previewPhoto.date).toLocaleDateString()}</span>
                  )}
                  {previewPhoto.status && (
                    <span className="font-bold text-gray-800">Status: {previewPhoto.status}</span>
                  )}
                </div>

                {previewPhoto.notes && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Farmer Notes</span>
                    <p className="text-gray-800 italic mt-0.5">&quot;{previewPhoto.notes}&quot;</p>
                  </div>
                )}

                {previewPhoto.adminComment && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                    <span className="text-[10px] text-blue-700 font-bold block uppercase">Admin Review Comment</span>
                    <p className="mt-0.5">{previewPhoto.adminComment}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
