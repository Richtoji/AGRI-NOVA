"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Lock, 
  Camera, 
  FileText, 
  AlertCircle, 
  Sprout, 
  Droplets,
  ShieldCheck,
  Bug,
  Leaf,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { CultivationImageUpload } from "@/components/farmer/CultivationImageUpload";

export default function CultivationWorkspace() {
  const routeParams = useParams();
  const id = (routeParams?.id as string) || "";
  const router = useRouter();
  const [cultivation, setCultivation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'STAGES' | 'WATERING' | 'PESTICIDES' | 'FERTILIZERS'>('STAGES');
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crops/cultivate/${id}`);
      const data = await res.json();
      if (data.success) {
        setCultivation(data.cultivation);
      } else {
        router.push("/dashboard/farmer");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit stage or initial planting photo
  const submitStage = async (stageId: string, imageUrl: string, notes: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/crops/cultivate/${id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, imageUrl, farmerNotes: notes })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit stage evidence.");
      }
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to submit stage evidence.");
      throw err;
    }
  };

  // Submit weekly photo
  const submitWeeklyPhoto = async (imageUrl: string, notes: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/crops/cultivate/${id}/weekly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          weekNumber: currentWeekNum, 
          dueDate: nextDueDate, 
          imageUrl, 
          farmerNotes: notes 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit weekly growth photograph.");
      }
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to submit weekly update.");
      throw err;
    }
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={["FARMER"]}>
        <AppLayout>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <Sprout className="w-12 h-12 text-green-500 animate-pulse mb-3" />
            <p className="text-xs font-bold text-gray-500">Loading your cultivation workspace...</p>
          </div>
        </AppLayout>
      </RouteGuard>
    );
  }

  if (!cultivation) return null;

  const crop = cultivation.cropProfile || {};
  const guide = crop.cultivationGuide || crop.cultivationGuides?.[0] || {};
  const stages = guide?.cultivationStages || [];
  const wateringSchedules = guide?.wateringSchedules || [];
  const pestDiseases = guide?.pestDiseases || [];
  const manureFertilizers = guide?.manureFertilizers || [];

  // Helper to reliably find stage submission by ID, order or index
  const getStageSubmission = (stage: any, index: number) => {
    return cultivation.stageSubmissions?.find((s: any) => 
      s.stageId === stage?.id || 
      s.stageId === `stage_${index + 1}` || 
      (stage?.stageOrder && (s.stageId === `stage_${stage.stageOrder}` || s.stageId === String(stage.stageOrder))) ||
      (index === 0 && (s.stageId === 'stage_1' || s.stageId === 'first' || s.stageId === 'planting'))
    );
  };

  // Calculate current stage index based on progress and approvals
  let currentStageIndex = 0;
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const submission = getStageSubmission(stage, i);
    if (!submission || submission.status !== 'APPROVED') {
      currentStageIndex = i;
      break;
    }
    if (i === stages.length - 1 && submission?.status === 'APPROVED') {
      currentStageIndex = stages.length; // all completed
    }
  }

  const currentStage = stages.length > 0 ? stages[Math.min(currentStageIndex, stages.length - 1)] : null;
  const currentSubmission = currentStage ? getStageSubmission(currentStage, currentStageIndex) : null;
  
  // Is this the planting phase? (Stage index 0 or status PLANTING_PENDING)
  const isPlantingPhase = currentStageIndex === 0 || cultivation.status === 'PLANTING_PENDING';
  const initialPlantingApproved = currentStageIndex > 0 && cultivation.status !== 'PLANTING_PENDING';

  // Calculate Weeks & Dates
  const rawStartDate = cultivation.startDate ? new Date(cultivation.startDate) : new Date();
  const startDate = isNaN(rawStartDate.getTime()) ? new Date() : rawStartDate;
  const now = new Date();
  const weeksDiff = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const currentWeekNum = Math.max(1, weeksDiff + 1);
  const nextDueDate = new Date(startDate.getTime() + (currentWeekNum * 7 * 24 * 60 * 60 * 1000));

  const thisWeekSubmission = cultivation.weeklyPhotos?.find((p: any) => p.weekNumber === currentWeekNum);
  const needsWeeklyPhoto = !thisWeekSubmission || thisWeekSubmission.status === 'REJECTED' || thisWeekSubmission.status === 'RESUBMISSION REQUIRED';

  // 3-Day Planting Deadline Window (72 Hours)
  const plantingDeadline = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const plantingTimeRemainingMs = plantingDeadline.getTime() - now.getTime();
  const plantingDaysRemaining = Math.max(0, Math.floor(plantingTimeRemainingMs / (1000 * 60 * 60 * 24)));
  const plantingHoursRemaining = Math.max(0, Math.floor((plantingTimeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const isPlantingOverdue = plantingTimeRemainingMs <= 0 && (!currentSubmission || currentSubmission.status === 'REJECTED' || currentSubmission.status === 'RESUBMISSION REQUIRED');

  // Active Inspecting Stage (Allows viewing requirements of the next stage or any stage)
  const activeInspectIndex = selectedStageIdx !== null ? selectedStageIdx : currentStageIndex;
  const inspectingStage = stages[activeInspectIndex] || currentStage;
  const inspectingSubmission = inspectingStage ? getStageSubmission(inspectingStage, activeInspectIndex) : null;
  const isInspectingLocked = activeInspectIndex > currentStageIndex || (activeInspectIndex > 0 && isPlantingPhase);

  return (
    <RouteGuard allowedRoles={["FARMER"]}>
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          
          {/* HEADER */}
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/dashboard/farmer" className="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full border border-green-200">
                  Supervised Cultivation Workspace
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  Region: {cultivation.region || 'Local Farm'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mt-1">
                {crop.name || 'Crop'} — Supervised Growth & Verification
              </h1>
            </div>
          </div>

          {actionError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-xs text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <p className="font-semibold">{actionError}</p>
            </div>
          )}

          {/* TOP SUMMARY CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
              {crop.imageUrl ? (
                <img src={crop.imageUrl} alt={crop.name || 'Crop'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-600 bg-green-50"><Sprout className="w-10 h-10"/></div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{crop.name || 'Crop'}</h2>
                  <p className="text-xs text-gray-500 font-medium italic">{crop.scientificName || "Agricultural Plant"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    isPlantingPhase 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-green-50 text-green-800 border-green-200'
                  }`}>
                    Status: {cultivation.status === 'PLANTING_PENDING' ? 'PLANTING PENDING' : cultivation.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Started Date</span>
                  <span className="text-gray-900 font-bold">{startDate.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Current Phase</span>
                  <span className="text-green-700 font-bold">
                    {isPlantingPhase ? 'Planting Phase' : (currentStage?.stageName || 'Completed')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Water Frequency</span>
                  <span className="text-sky-700 font-bold">{wateringSchedules[0]?.frequency?.split(' ')[0] || 'Every 2-3 days'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Weekly Photo</span>
                  <span className="text-amber-700 font-bold">
                    {!initialPlantingApproved 
                      ? 'Locked until planting approval' 
                      : `Week ${currentWeekNum} (${needsWeeklyPhoto ? 'Photo Required' : 'Submitted'})`}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-700">Cultivation Progress ({stages.length} Milestones)</span>
                  <span className="text-green-700">
                    {isPlantingPhase ? '0%' : `${Math.round((currentStageIndex / Math.max(stages.length, 1)) * 100)}%`}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${isPlantingPhase ? 5 : (currentStageIndex / Math.max(stages.length, 1)) * 100}%` }}
                  ></div>
                </div>

                {isPlantingPhase && (
                  <div className="mt-2.5 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                      <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
                      <span>Stage 1: Plant crop &amp; upload photograph within 3 days</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                      {plantingDaysRemaining}d {plantingHoursRemaining}h remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WORKSPACE NAVIGATION TABS */}
          <div className="flex space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
            {[
              { id: 'STAGES', label: isPlantingPhase ? 'Planting & Stage Approvals' : 'Stages & Admin Approval', icon: <Sprout className="w-4 h-4" /> },
              { id: 'WATERING', label: 'Water Management Schedule', icon: <Droplets className="w-4 h-4" /> },
              { id: 'PESTICIDES', label: 'Pesticide & Disease Care', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'FERTILIZERS', label: 'Manure & Nutrition', icon: <FlaskConical className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeWorkspaceTab === tab.id 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Active Tab View */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* TAB 1: STAGES & ADMIN APPROVAL WORKFLOW */}
              {activeWorkspaceTab === 'STAGES' && (
                <>
                  {isInspectingLocked ? (
                    <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-6 space-y-5 animate-in fade-in duration-200">
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
                          <h3 className="text-xl font-black text-gray-900">
                            {inspectingStage.stageName} — Stage Requirements
                          </h3>
                          <p className="text-xs text-amber-900/90 font-medium mt-1 leading-relaxed">
                            You can view all the guidelines, watering requirements, and nutrition needs for this stage below. However, <strong>you cannot advance to or enter this stage</strong> until Stage 1 (Planting the crop within 3 days &amp; uploading the planted crop photograph) is verified and approved by the Administrator.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedStageIdx(0)}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Back to Planting Stage</span>
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
                            This stage will automatically unlock once your Stage 1 planting photograph is approved by the agricultural officer. Until then, you can prepare ahead using the requirements below.
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

                      {/* Disabled Stage Action Button */}
                      <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
                          <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                          <span>You cannot advance to this stage until Stage 1 photo verification is approved.</span>
                        </div>
                        <button
                          disabled
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-300 text-gray-600 text-xs font-bold cursor-not-allowed flex items-center justify-center space-x-2 shrink-0"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Stage Locked — Complete Stage 1 First</span>
                        </button>
                      </div>
                    </div>
                  ) : isPlantingPhase ? (
                    <div className="bg-white rounded-2xl border-2 border-green-600/30 shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-gray-900 text-white p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white mb-2">
                              Phase 1: Seed Sowing & Sapling Planting
                            </span>
                            <h3 className="text-2xl font-black">🌱 PLANT YOUR CROP</h3>
                            <p className="text-xs text-emerald-200 mt-1">Crop: <strong className="text-white">{crop.name}</strong></p>
                          </div>
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                            Verification Required
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {/* 3-DAY PLANTING WINDOW COUNTDOWN CARD */}
                        <div className={`p-4 rounded-2xl border-2 space-y-2.5 ${
                          currentSubmission?.status === 'PENDING REVIEW'
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                            : isPlantingOverdue
                            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-current animate-pulse shrink-0" />
                              <strong className="text-xs font-black uppercase tracking-wider">
                                {currentSubmission?.status === 'PENDING REVIEW'
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
                                <Info className="w-3.5 h-3.5 text-blue-600" />
                                <span>View Next Stage Requirements</span>
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              {currentSubmission?.status === 'PENDING REVIEW' ? (
                                <p className="font-semibold text-amber-900">
                                  Planting photograph submitted on {new Date(currentSubmission.submittedAt).toLocaleDateString()}. Stage 2 unlocks automatically once verified by the administrator.
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

                            {!currentSubmission && !isPlantingOverdue && (
                              <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shrink-0 shadow-xs">
                                {plantingDaysRemaining}d {plantingHoursRemaining}h LEFT
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notice for farmer */}
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                          <p className="text-sm font-bold flex items-center mb-1 text-emerald-900">
                            <Info className="w-4 h-4 mr-1.5 text-emerald-700" />
                            Before continuing, plant the seed/sapling according to the planting instructions provided below:
                          </p>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            {guide.plantingMethod || currentStage?.description || "Dig suitable pits or planting rows, incorporate well-rotted organic compost, position the seed/sapling upright, backfill firmly, and provide immediate light watering."}
                          </p>
                        </div>

                        {/* Admin-Managed Planting Specifications */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Planting Method
                            </span>
                            <p className="font-bold text-gray-800">
                              {guide.plantingMethod ? guide.plantingMethod.slice(0, 100) + '...' : "Direct Soil Planting"}
                            </p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Planting Spacing
                            </span>
                            <p className="font-bold text-gray-800">
                              {guide.spacing || "Standard Agricultural Spacing"}
                            </p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Planting Material
                            </span>
                            <p className="font-bold text-gray-800">
                              {guide.seedInformation || "Certified Seeds / Certified Saplings"}
                            </p>
                          </div>
                        </div>

                        {/* Planting Verification Status & Upload Area */}
                        <div className="border-t border-gray-100 pt-5">
                          <div className="mb-4">
                            <h4 className="font-black text-base text-gray-900 flex items-center">
                              <Camera className="w-5 h-5 mr-2 text-green-600" />
                              📷 PLANTING VERIFICATION
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              After planting the crop, upload a clear photograph showing the planted seed/sapling in the soil. The photograph will be submitted to the AGRI-NOVA administrator for approval.
                            </p>
                          </div>

                          {/* State 1: Awaiting Submission or Resubmission */}
                          {(!currentSubmission || currentSubmission.status === 'REJECTED' || currentSubmission.status === 'RESUBMISSION REQUIRED') && (
                            <div className="space-y-4">
                              {currentSubmission?.status && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-xs">
                                  <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-rose-600" />
                                    <span className="font-bold text-rose-900">Planting Verification: 🔴 Resubmission Required</span>
                                  </div>
                                  <p className="mt-1 font-medium text-rose-800">
                                    <strong>Admin Reason:</strong> {currentSubmission.adminComment || "Please upload a clearer photograph showing the planted sapling."}
                                  </p>
                                </div>
                              )}

                              <CultivationImageUpload
                                label={currentSubmission ? "Upload Revised Planting Photograph" : "Upload Planting Verification Photograph"}
                                subLabel="Take or select a clear photograph showing the planted seed or sapling in the soil."
                                submitButtonText="SUBMIT FOR ADMIN APPROVAL"
                                onSubmit={(imageUrl, notes) => submitStage(currentStage.id, imageUrl, notes)}
                              />
                            </div>
                          )}

                          {/* State 2: Under Admin Review (Section 11) */}
                          {currentSubmission?.status === 'PENDING REVIEW' && (
                            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-center space-y-4">
                              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                                <Clock className="w-7 h-7 animate-pulse" />
                              </div>
                              <div>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-200 text-amber-900 mb-2">
                                  🟡 Pending Admin Approval
                                </span>
                                <h5 className="font-black text-gray-900 text-lg">Planting Verification Under Review</h5>
                                <p className="text-xs text-gray-600 max-w-md mx-auto mt-2 leading-relaxed">
                                  Your planting photograph has been submitted for review on <strong>{new Date(currentSubmission.submittedAt).toLocaleDateString()}</strong>. You cannot proceed to the next cultivation phase until the administrator approves it.
                                </p>
                              </div>

                              {currentSubmission.imageUrl && (
                                <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-amber-200 shadow-sm">
                                  <img src={currentSubmission.imageUrl} alt="Submitted planting" className="w-full h-44 object-cover" />
                                  {currentSubmission.farmerNotes && (
                                    <p className="p-2 text-[11px] bg-white text-gray-700 italic border-t border-amber-100">
                                      "{currentSubmission.farmerNotes}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* State 3: Approved */}
                          {currentSubmission?.status === 'APPROVED' && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
                              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                              <h5 className="font-black text-gray-900 text-base">Planting Verification Approved!</h5>
                              <p className="text-xs text-green-800">
                                Your planting submission has been approved. The next cultivation stage is now unlocked.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ============================================================== */
                    /* 2. SUBSEQUENT STAGE CARE & EVIDENCE (Sections 24, 25, 26)      */
                    /* ============================================================== */
                    currentStage && (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-green-950 text-white p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white mb-1">
                                Active Stage {currentStage.stageOrder || 1}
                              </span>
                              <h3 className="text-xl font-black">{currentStage.stageName}</h3>
                            </div>
                            <span className="text-[11px] font-bold text-green-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                              Day {currentStage.startDay} - {currentStage.endDay || '30'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-5">
                          <div className="bg-green-50/60 border border-green-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-green-900 mb-1 flex items-center">
                              <Leaf className="w-4 h-4 mr-1 text-green-600" /> Instructions for this Stage:
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {currentStage.description}
                            </p>
                          </div>

                          {/* Stage Specific Care Specs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl">
                              <span className="font-bold text-sky-900 flex items-center mb-1">
                                <Droplets className="w-3.5 h-3.5 mr-1 text-sky-600" /> Water Requirement:
                              </span>
                              <p className="text-sky-800 font-medium">{currentStage.waterReq || "Maintain damp root zone (every 2-3 days)"}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                              <span className="font-bold text-amber-900 flex items-center mb-1">
                                <FlaskConical className="w-3.5 h-3.5 mr-1 text-amber-600" /> Nutrition & Fertilizer:
                              </span>
                              <p className="text-amber-800 font-medium">{currentStage.manureReq || "Organic manure incorporation"}</p>
                            </div>
                          </div>
                          
                          {/* Stage Evidence Upload Area */}
                          <div className="border-t border-gray-100 pt-5">
                            <h4 className="font-bold text-sm text-gray-900 mb-1 flex items-center">
                              <Camera className="w-4 h-4 mr-2 text-gray-700" /> 
                              Stage Completion Evidence & Admin Approval
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">
                              Upload a clear photograph showing crop condition during Stage {currentStage.stageOrder}. Admin must approve before Stage {currentStageIndex + 2} unlocks.
                            </p>
                            
                            {!currentSubmission || currentSubmission.status === 'REJECTED' || currentSubmission.status === 'RESUBMISSION REQUIRED' ? (
                              <div className="space-y-4">
                                {currentSubmission && (
                                  <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs border border-red-200 flex items-start">
                                    <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-red-600" />
                                    <div>
                                      <p className="font-bold">Admin Feedback — Resubmission Required</p>
                                      <p className="mt-0.5 font-medium">{currentSubmission.adminComment || 'Please provide an updated clear photograph.'}</p>
                                    </div>
                                  </div>
                                )}

                                <CultivationImageUpload
                                  label={`Stage ${currentStage.stageOrder}: Evidence Photograph`}
                                  subLabel="Upload a clear photograph showing the crop progress for this stage."
                                  submitButtonText="SUBMIT STAGE EVIDENCE FOR ADMIN APPROVAL"
                                  onSubmit={(imageUrl, notes) => submitStage(currentStage.id, imageUrl, notes)}
                                />
                              </div>
                            ) : currentSubmission.status === 'PENDING REVIEW' ? (
                              <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 rounded-2xl border border-gray-200">
                                <Clock className="w-12 h-12 text-amber-500 mb-3 animate-bounce" />
                                <h5 className="font-bold text-gray-900 text-base">Stage Evidence Submitted — Pending Admin Approval</h5>
                                <p className="text-xs text-gray-500 mt-1.5 max-w-md">
                                  Your stage evidence photograph and notes have been submitted to the Administrator. Once approved, Stage {currentStageIndex + 2} will automatically unlock.
                                </p>
                                <span className="mt-3 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-full">
                                  🟡 Under Admin Review
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-6 text-center bg-green-50 rounded-2xl border border-green-200">
                                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                                <h5 className="font-bold text-gray-900 text-base">Stage Approved by Admin</h5>
                                <p className="text-xs text-green-700 mt-1">You have successfully completed this stage.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* ============================================================== */}
                  {/* STAGE LOCKING TIMELINE (Sections 15 & 30)                      */}
                  {/* ============================================================== */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-sm text-gray-900">Cultivation Stage Timeline (Strict Backend Locking)</h3>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {stages.length} Stages Configured
                      </span>
                    </div>

                    <div className="space-y-3">
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
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-green-50/90 border-green-500 ring-2 ring-green-300 shadow-sm'
                                : isCurrent 
                                ? 'bg-white border-green-300 hover:border-green-400' 
                                : isApproved 
                                ? 'bg-white border-gray-200 hover:border-green-200' 
                                : 'bg-gray-50/60 border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xs ${
                              isApproved ? 'bg-green-500 border-green-500 text-white' : 
                              isCurrent ? 'bg-white border-green-600 text-green-600' : 
                              'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                              {isApproved ? <CheckCircle className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5 text-gray-400" /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className={`text-xs font-bold ${isSelected ? 'text-green-950 font-black' : isCurrent ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                  {stage.stageName}
                                </h4>
                                {isSelected && (
                                  <span className="text-[9px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                                    VIEWING
                                  </span>
                                )}
                                {!isSelected && isApproved && (
                                  <span className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                    ✓ APPROVED
                                  </span>
                                )}
                                {!isSelected && isCurrent && sub?.status === 'PENDING REVIEW' && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    🟡 PENDING APPROVAL
                                  </span>
                                )}
                                {!isSelected && isCurrent && (!sub || sub.status === 'REJECTED' || sub.status === 'RESUBMISSION REQUIRED') && (
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                    🔵 CURRENT
                                  </span>
                                )}
                                {!isSelected && isLocked && (
                                  <span className="text-[9px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> LOCKED
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{stage.description}</p>
                              <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                                <span>Day {stage.startDay || 1} - {stage.endDay || 30}</span>
                                <span className="text-green-700 font-semibold hover:underline">
                                  {isLocked ? "View requirements" : "View stage"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: WATER MANAGEMENT & IRRIGATION FREQUENCY */}
              {activeWorkspaceTab === 'WATERING' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-sky-600" />
                      Water Management & Irrigation Schedule
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Admin-managed watering frequencies and irrigation recommendations for {crop.name}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {wateringSchedules.length > 0 ? (
                      wateringSchedules.map((w: any, idx: number) => (
                        <div key={idx} className="bg-sky-50/60 border border-sky-200 rounded-xl p-5 relative overflow-hidden">
                          <Droplets className="absolute -right-4 -bottom-4 w-28 h-28 text-sky-500/10 pointer-events-none" />
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-sky-600 text-white text-[11px] font-bold rounded-lg">
                              {w.growthStage || `Growth Phase ${idx+1}`}
                            </span>
                            <span className="text-xs font-bold text-sky-900 bg-white px-3 py-1 rounded-full border border-sky-200">
                              Method: {w.irrigationMethod || 'Standard'}
                            </span>
                          </div>
                          
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-sky-100 space-y-2">
                            <div>
                              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Recommended Frequency:</span>
                              <p className="text-base font-black text-gray-900">{w.frequency}</p>
                            </div>
                            {w.specialInstructions && (
                              <div className="pt-2 border-t border-sky-100">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Special Instructions:</span>
                                <p className="text-xs text-gray-700 mt-0.5">{w.specialInstructions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-sky-50 p-6 rounded-xl text-center text-sky-800">
                        <p className="text-sm font-bold">Water Requirement: {crop.waterRequirement}/5</p>
                        <p className="text-xs mt-1">Maintain consistent root-zone moisture during active vegetative phases.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PESTICIDES & DISEASE CARE */}
              {activeWorkspaceTab === 'PESTICIDES' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2 text-rose-600" />
                      Pesticide, Pest & Disease Protection Guide
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Admin-managed pesticide dosages, preventive care, and pest management for {crop.name}.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Standard Protective Guidance:</h4>
                      <p className="text-xs text-amber-800 mt-0.5 font-medium">{crop.pesticide || "Organic Neem Oil formulation (5ml/L water) or approved biopesticide."}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pestDiseases.length > 0 ? (
                      pestDiseases.map((p: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center">
                              <Bug className="w-4 h-4 mr-1.5 text-rose-600" /> {p.problemName}
                            </h4>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              p.problemType?.toLowerCase() === 'disease' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {p.problemType || 'PEST'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <span className="font-bold text-gray-700 block mb-0.5">Symptoms:</span>
                              <p className="text-gray-600">{p.symptoms || "Visual leaf damage or discoloration"}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <span className="font-bold text-gray-700 block mb-0.5">Prevention:</span>
                              <p className="text-gray-600">{p.prevention || "Field sanitation and regular monitoring"}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <span className="font-bold text-green-900 block mb-0.5">Recommended Treatment:</span>
                              <p className="text-green-800 font-semibold">{p.treatment}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 text-xs">
                        No specific pests reported. Use {crop.pesticide || 'approved preventive spray'} when necessary.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MANURE & NUTRITION */}
              {activeWorkspaceTab === 'FERTILIZERS' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 flex items-center">
                      <FlaskConical className="w-5 h-5 mr-2 text-amber-600" />
                      Manure & Fertilizer Management
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Nutrient doses and application schedules to maximize crop yield and soil vitality.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {manureFertilizers.length > 0 ? (
                      manureFertilizers.map((m: any, idx: number) => (
                        <div key={idx} className={`p-5 rounded-xl border ${m.isOrganic ? 'bg-amber-50/70 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block ${m.isOrganic ? 'bg-amber-200 text-amber-900' : 'bg-gray-200 text-gray-800'}`}>
                                {m.isOrganic ? 'ORGANIC MANURE' : 'CHEMICAL FERTILIZER'}
                              </span>
                              <h4 className="font-bold text-gray-900 text-sm">{m.inputName}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-black text-gray-900">{m.quantity} {m.unit}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                              <span className="text-gray-500 block font-bold text-[10px]">Application Stage:</span>
                              <span className="font-semibold text-gray-800">{m.applicationStage || 'Active Growth'}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                              <span className="text-gray-500 block font-bold text-[10px]">Frequency:</span>
                              <span className="font-semibold text-gray-800">{m.frequency || 'Scheduled'}</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-100">
                              <span className="text-gray-500 block font-bold text-[10px]">Method:</span>
                              <span className="font-semibold text-gray-800">{m.applicationMethod || 'Basal ring application'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 text-xs">
                        General Fertilizer Guidance: {crop.fertilizer || "Apply well-decomposed farmyard manure at planting."}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Weekly Growth Photo Submissions & History */}
            <div className="space-y-6">
              
              {/* WEEKLY UPDATE CARD (Sections 16, 17, 18, 19) */}
              <div className="bg-gradient-to-b from-green-900 via-green-950 to-gray-900 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Camera className="w-24 h-24" />
                </div>
                
                <h3 className="font-black text-sm text-green-100 flex items-center mb-4 relative z-10">
                  <Camera className="w-4 h-4 mr-2 text-green-400" /> 🌱 WEEKLY CROP GROWTH UPDATE
                </h3>

                {!initialPlantingApproved ? (
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 relative z-10 text-center py-6">
                    <Lock className="w-8 h-8 text-amber-300 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-bold text-white">Weekly Tracking Locked</p>
                    <p className="text-[11px] text-green-200/80 mt-1 max-w-xs mx-auto">
                      Weekly 7-day crop growth photo submissions will begin automatically after the initial <strong>Planting Verification</strong> is approved by the Administrator.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 relative z-10">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-3xl font-black">Week {currentWeekNum}</span>
                        {needsWeeklyPhoto ? (
                          <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 px-2.5 py-1 rounded-md border border-amber-400/40">
                            ⚠ PHOTO REQUIRED
                          </span>
                        ) : thisWeekSubmission?.status === 'PENDING REVIEW' ? (
                          <span className="text-[10px] font-bold bg-yellow-500/30 text-yellow-200 px-2.5 py-1 rounded-md border border-yellow-400/40">
                            🟡 PENDING REVIEW
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-green-500/30 text-green-200 px-2.5 py-1 rounded-md border border-green-400/40">
                            ✓ APPROVED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-green-200/70">Due Date: {nextDueDate.toLocaleDateString()}</p>
                    </div>

                    {needsWeeklyPhoto ? (
                      <div className="space-y-3 relative z-10">
                        {thisWeekSubmission?.status === 'REJECTED' && (
                          <div className="bg-red-500/30 text-red-200 p-2.5 rounded-xl text-[10px] border border-red-500/40">
                            <strong>Admin Resubmission Request:</strong> {thisWeekSubmission.adminComment}
                          </div>
                        )}

                        <div className="bg-white rounded-2xl text-gray-900 p-1">
                          <CultivationImageUpload
                            label={`Upload Week ${currentWeekNum} Photograph`}
                            subLabel="Take a clear photograph showing crop height, leaf count, and overall condition."
                            submitButtonText="SUBMIT WEEKLY UPDATE"
                            onSubmit={(imageUrl, notes) => submitWeeklyPhoto(imageUrl, notes)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 relative z-10 flex flex-col items-center justify-center text-center py-6">
                        {thisWeekSubmission?.status === 'PENDING REVIEW' ? (
                          <>
                            <Clock className="w-10 h-10 text-amber-400 mb-2 animate-pulse" />
                            <p className="text-xs font-bold text-white">Pending Admin Review</p>
                            <p className="text-[10px] text-green-200/70 mt-1">Week {currentWeekNum} photo submitted. The administrator is reviewing your evidence.</p>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-10 h-10 text-green-400 mb-2" />
                            <p className="text-xs font-bold text-white">Week {currentWeekNum} Approved</p>
                            <p className="text-[10px] text-green-200/70 mt-1">Next weekly photo submission will be due in 7 days.</p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* VISUAL GROWTH COMPARISON & HISTORY (Sections 20 & 21) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-gray-400" />
                    Crop Growth History & Visual Timeline
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {cultivation.weeklyPhotos?.length || 0} Submissions
                  </span>
                </div>
                
                {/* Horizontal Visual Growth Progression (WEEK 1 → WEEK 2 → WEEK 3 ...) */}
                {cultivation.weeklyPhotos && cultivation.weeklyPhotos.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Visual Growth Timeline</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {cultivation.weeklyPhotos.map((photo: any, i: number) => (
                        <React.Fragment key={photo.id}>
                          <div className="flex-shrink-0 w-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 text-center">
                            <div className="h-16 w-full bg-gray-200 overflow-hidden">
                              {photo.imageUrl ? (
                                <img src={photo.imageUrl} alt={`Week ${photo.weekNumber}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Image</div>
                              )}
                            </div>
                            <div className="p-1.5 bg-white">
                              <span className="block text-[10px] font-black text-gray-800">Week {photo.weekNumber}</span>
                              <span className={`inline-block text-[8px] font-bold px-1 rounded uppercase ${
                                photo.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                photo.status === 'PENDING REVIEW' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {photo.status === 'PENDING REVIEW' ? 'Pending' : photo.status}
                              </span>
                            </div>
                          </div>
                          {i < cultivation.weeklyPhotos.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* List of submissions with details */}
                {cultivation.weeklyPhotos?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No weekly photos submitted yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {cultivation.weeklyPhotos?.map((photo: any) => (
                      <div key={photo.id} className="flex gap-3 items-start border border-gray-100 p-2.5 rounded-xl bg-gray-50/60">
                        <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-200">
                          {photo.imageUrl && <img src={photo.imageUrl} alt={`Week ${photo.weekNumber}`} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-gray-900">Week {photo.weekNumber}</p>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              photo.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              photo.status === 'PENDING REVIEW' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>{photo.status}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">Submitted: {new Date(photo.submittedAt || photo.createdAt).toLocaleDateString()}</p>
                          {photo.farmerNotes && <p className="text-[10px] text-gray-600 italic mt-1 line-clamp-1">"{photo.farmerNotes}"</p>}
                          {photo.adminComment && (
                            <p className="text-[10px] text-emerald-700 font-medium mt-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Admin: "{photo.adminComment}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </AppLayout>
    </RouteGuard>
  );
}
