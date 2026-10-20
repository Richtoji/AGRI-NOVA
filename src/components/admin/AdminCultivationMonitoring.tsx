"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  CheckCircle, XCircle, RefreshCw, Eye, Clock, AlertCircle,
  Camera, Leaf, ChevronDown, ChevronUp, BarChart3, Sprout,
  Search, ShieldCheck, CheckCircle2, AlertTriangle, Calendar,
  Sparkles, ExternalLink, ArrowRight, User, Phone, Mail
} from "lucide-react";

type ReviewView = "list" | "planting" | "stages" | "weekly";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "PENDING REVIEW": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "PENDING ADMIN APPROVAL": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "APPROVED": "bg-green-50 text-green-700 border-green-200",
    "REJECTED": "bg-red-50 text-red-700 border-red-200",
    "RESUBMISSION REQUIRED": "bg-orange-50 text-orange-700 border-orange-200",
    "PLANTING_PENDING": "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs",
    "ACTIVE": "bg-blue-50 text-blue-700 border-blue-200",
    "COMPLETED": "bg-gray-100 text-gray-600 border-gray-200",
  };

  const label = status === "PLANTING_PENDING" 
    ? "🌱 Planting Phase (3-Day Window)" 
    : status;

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${colors[status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {status === "PLANTING_PENDING" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />}
      {label}
    </span>
  );
}

function ReviewModal({ item, type, onClose, onAction }: {
  item: any; type: "planting" | "stage" | "weekly" | "cultivation"; onClose: () => void; onAction: () => void;
}) {
  const [action, setAction] = useState<"APPROVED" | "REJECTED" | "RESUBMISSION REQUIRED" | "APPROVE_PLANTING">(
    type === 'cultivation' ? 'APPROVE_PLANTING' : 'APPROVED'
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const farmer = item.farmer || item.cultivation?.farmer;
  const crop = item.cropProfile || item.cultivation?.cropProfile;
  const isDirectCultivation = type === "cultivation";
  const isPlanting = isDirectCultivation || type === "planting" || item.stage?.stageOrder === 1;

  const handleSubmit = async () => {
    if ((action === "REJECTED" || action === "RESUBMISSION REQUIRED") && !comment.trim()) {
      alert("Please provide a reason for rejection or resubmission.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/cultivation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: isDirectCultivation ? 'cultivation' : type === 'weekly' ? 'weekly' : 'stage', 
          id: item.id, 
          action: isDirectCultivation ? 'APPROVE_PLANTING' : action, 
          adminComment: comment || (isDirectCultivation ? 'Direct planting verification by Administrator' : undefined)
        })
      });
      if (res.ok) {
        // Trigger storage event so other tabs and farmer interface update immediately
        try {
          localStorage.setItem('agri_nova_cultivation_updated', Date.now().toString());
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
        onAction();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) { 
      console.error(err);
      alert("An error occurred during submission.");
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100">
        <div className="bg-gray-900 text-white p-5 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg flex items-center gap-2">
              {isPlanting ? (
                <>
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  <span>Review Planting Verification</span>
                </>
              ) : type === 'stage' ? (
                <>
                  <Leaf className="w-5 h-5 text-green-400" />
                  <span>Review Stage Evidence</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 text-purple-400" />
                  <span>Review Weekly Growth Photo</span>
                </>
              )}
            </h3>
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-300">
              ID: {(item.cultivationId || item.id)?.slice(0, 8)}...
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{farmer?.name} · {crop?.name}</p>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Submission Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-gray-400 font-semibold mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Farmer Details
              </p>
              <p className="font-bold text-gray-900">{farmer?.name || "Unknown Farmer"}</p>
              <p className="text-gray-500 truncate">{farmer?.email}</p>
              {farmer?.phone && <p className="text-gray-400 text-[11px] mt-0.5">📞 {farmer.phone}</p>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-gray-400 font-semibold mb-1 flex items-center gap-1">
                <Sprout className="w-3 h-3 text-emerald-600" /> Crop &amp; Stage
              </p>
              <p className="font-bold text-gray-900">{crop?.name || "Crop"}</p>
              <p className="text-emerald-700 font-medium">
                {type === 'weekly' 
                  ? `Week ${item.weekNumber} Growth` 
                  : isPlanting 
                    ? 'Stage 1: Seed / Sapling Planting' 
                    : item.stage?.stageName || "Cultivation Milestone"}
              </p>
            </div>
          </div>

          {/* Evidence Image */}
          {item.imageUrl ? (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center justify-between">
                <span>Submitted Photographic Evidence</span>
                <a href={item.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[10px] font-semibold flex items-center gap-1">
                  <span>Full View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <div className="w-full h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative group">
                <img src={item.imageUrl} alt="Submitted evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
          ) : isDirectCultivation ? (
            <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Direct Field / Offline Verification
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-700">
                The farmer started cultivation on <strong>{new Date(item.startDate || item.createdAt).toLocaleDateString()}</strong>.
                You can directly verify and approve planting to immediately unlock Stage 2 and weekly growth tracking for this crop.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-200">
              No photograph submitted yet. Farmer is currently within their 3-day planting period.
            </div>
          )}

          {/* Farmer Notes */}
          {item.farmerNotes && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-bold text-blue-600 mb-1">Farmer&apos;s Notes</p>
              <p className="text-sm text-blue-900 italic">&ldquo;{item.farmerNotes}&rdquo;</p>
            </div>
          )}

          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>
              {item.submittedAt 
                ? `Submitted: ${new Date(item.submittedAt).toLocaleString()}`
                : `Started: ${new Date(item.startDate || item.createdAt).toLocaleString()}`}
            </span>
          </div>

          {/* Action Selection */}
          {!isDirectCultivation ? (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Admin Decision</p>
              <div className="flex gap-2 flex-wrap">
                {(["APPROVED", "REJECTED", "RESUBMISSION REQUIRED"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAction(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      action === a 
                        ? a === 'APPROVED' ? 'bg-green-600 text-white border-green-600 shadow-xs'
                        : a === 'REJECTED' ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-orange-500 text-white border-orange-500 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {a === 'APPROVED' ? '✓ Approve' : a === 'REJECTED' ? '✕ Reject' : '↺ Request Resubmission'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
              <span className="font-bold text-gray-700">Action: </span>
              <span className="font-semibold text-emerald-700">Approve Stage 1 &amp; Unlock Next Stage</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Admin Comment {(action === 'REJECTED' || action === 'RESUBMISSION REQUIRED') && <span className="text-red-500">* (Mandatory for rejection/resubmission)</span>}
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={action === 'APPROVED' || isDirectCultivation ? 'Optional: remarks for farmer (e.g. Good planting execution, Stage 2 unlocked)...' : 'Required: explain clearly why resubmission is required (e.g. Please upload a clearer photograph showing the planted sapling in soil)...'}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none bg-white"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer">
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 ${
                action === 'APPROVED' || isDirectCultivation ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isDirectCultivation ? 'Approve & Unlock Stage 2' : 'Confirm Decision'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCultivationMonitoring() {
  const [view, setView] = useState<ReviewView>("list");
  const [stats, setStats] = useState<any>(null);
  const [cultivations, setCultivations] = useState<any[]>([]);
  const [pendingStages, setPendingStages] = useState<any[]>([]);
  const [plantingCultivations, setPlantingCultivations] = useState<any[]>([]);
  const [pendingWeekly, setPendingWeekly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ item: any; type: "planting" | "stage" | "weekly" | "cultivation" } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listStatusFilter, setListStatusFilter] = useState<"ALL" | "PLANTING_PENDING" | "ACTIVE" | "COMPLETED">("ALL");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    try {
      const [statsRes, listRes, stagesRes, weeklyRes] = await Promise.all([
        fetch('/api/admin/cultivation?view=stats').then(r => r.json()),
        fetch('/api/admin/cultivation?view=list').then(r => r.json()),
        fetch('/api/admin/cultivation?view=pending-stages').then(r => r.json()),
        fetch('/api/admin/cultivation?view=pending-weekly').then(r => r.json()),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (listRes.success) setCultivations(listRes.cultivations || []);
      if (stagesRes.success) {
        setPendingStages(stagesRes.submissions || []);
        if (stagesRes.plantingCultivations) {
          setPlantingCultivations(stagesRes.plantingCultivations);
        }
      }
      if (weeklyRes.success) setPendingWeekly(weeklyRes.records || []);
      setLastUpdated(new Date());
    } catch (err) { 
      console.error("Failed to load cultivation admin data:", err); 
    } finally { 
      if (!isSilent) setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchAll(); 

    // Auto-polling every 4 seconds for live telemetry synchronization
    const interval = setInterval(() => {
      fetchAll(true);
    }, 4000);

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agri_nova_last_cultivation_start' || e.key === 'agri_nova_cultivation_updated') {
        fetchAll(true);
      }
    };
    const handleCustom = () => fetchAll(true);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('agri_nova_cultivation_started', handleCustom);
    window.addEventListener('agri_nova_cultivation_updated', handleCustom);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('agri_nova_cultivation_started', handleCustom);
      window.removeEventListener('agri_nova_cultivation_updated', handleCustom);
    };
  }, [fetchAll]);

  // Submissions for Stage 1 that have photographic evidence awaiting admin review
  const pendingPlantingSubmissions = pendingStages.filter(
    (s: any) => s.stage?.stageOrder === 1 || s.cultivation?.status === 'PLANTING_PENDING'
  );

  // All cultivations in Stage 1 planting phase (both with submitted photo and awaiting photo)
  const allPlantingCultivations = useMemo(() => {
    const list = [...plantingCultivations];
    // If not in plantingCultivations, check cultivations list
    for (const c of cultivations) {
      if (c.status === 'PLANTING_PENDING' && !list.some(item => item.id === c.id)) {
        list.push(c);
      }
    }
    return list;
  }, [plantingCultivations, cultivations]);

  const pendingGeneralStagesList = pendingStages.filter(
    (s: any) => s.stage?.stageOrder > 1 && s.cultivation?.status !== 'PLANTING_PENDING'
  );

  // Total planting count (submissions + newly started pending planting)
  const totalPlantingBadge = Math.max(allPlantingCultivations.length, pendingPlantingSubmissions.length);

  const viewTabs: { key: ReviewView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "list", label: "All Cultivations", icon: <BarChart3 className="w-4 h-4" />, badge: cultivations.length },
    { key: "planting", label: "Planting Approvals", icon: <Sprout className="w-4 h-4 text-emerald-600" />, badge: totalPlantingBadge },
    { key: "stages", label: "Stage Approvals", icon: <Leaf className="w-4 h-4 text-amber-600" />, badge: pendingGeneralStagesList.length },
    { key: "weekly", label: "Weekly Reviews", icon: <Camera className="w-4 h-4 text-purple-600" />, badge: pendingWeekly.length },
  ];

  // Filtered cultivations list for Tab 1
  const filteredCultivations = useMemo(() => {
    return cultivations.filter(c => {
      const matchesSearch = 
        !searchQuery ||
        (c.farmer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.farmer?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cropProfile?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.region || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        listStatusFilter === "ALL" || 
        c.status === listStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cultivations, searchQuery, listStatusFilter]);

  // Newly started plant cultivations (started in the last 24 hours or in PLANTING_PENDING status)
  const newlyStartedCultivations = cultivations.filter(c => c.status === 'PLANTING_PENDING');

  return (
    <div className="mt-6 space-y-6">
      
      {/* Real-time Telemetry Status Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-gray-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-900/30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Sprout className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-black text-white text-base">Crop Cultivation Command Center</h2>
              <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>LIVE TELEMETRY ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Real-time monitoring of farmer crop plans, 3-day planting verification deadlines, and stage progressions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 text-xs">
          <span className="text-gray-400 text-[11px] hidden md:inline">
            Synced: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchAll(false)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-all cursor-pointer text-xs"
            title="Force refresh database queries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { 
            label: "Ongoing Cultivations", 
            value: stats?.activeCultivations ?? cultivations.filter(c => c.status !== 'COMPLETED').length, 
            color: "text-blue-700", 
            bg: "bg-blue-50/70 border-blue-200",
            sub: `${cultivations.filter(c => c.status === 'ACTIVE').length} growth · ${newlyStartedCultivations.length} planting`
          },
          { 
            label: "Planting Phase (3-Day)", 
            value: stats?.plantingPendingCount ?? newlyStartedCultivations.length, 
            color: "text-emerald-700", 
            bg: "bg-emerald-50/70 border-emerald-200",
            sub: `${pendingPlantingSubmissions.length} photos awaiting review`
          },
          { 
            label: "Pending Weekly Photos", 
            value: stats?.pendingWeekly ?? pendingWeekly.length, 
            color: "text-purple-700", 
            bg: "bg-purple-50/70 border-purple-200",
            sub: "7-day growth submissions"
          },
          { 
            label: "Subsequent Stages", 
            value: stats?.pendingStages ?? pendingGeneralStagesList.length, 
            color: "text-amber-700", 
            bg: "bg-amber-50/70 border-amber-200",
            sub: "Stage 2+ milestone reviews"
          },
          { 
            label: "Resubmissions Due", 
            value: stats?.resubmissions ?? '0', 
            color: "text-rose-700", 
            bg: "bg-rose-50/70 border-rose-200",
            sub: "Flagged for corrections"
          },
          { 
            label: "Completed Harvests", 
            value: stats?.completedCultivations ?? cultivations.filter(c => c.status === 'COMPLETED').length, 
            color: "text-gray-700", 
            bg: "bg-gray-50 border-gray-200",
            sub: "Full lifecycle complete"
          },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 transition-all hover:shadow-sm`}>
            <p className="text-[11px] text-gray-600 font-bold mb-1 truncate">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-gray-500 mt-1 truncate">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Real-time Alert Banner when Farmers Start Plant Cultivations */}
      {newlyStartedCultivations.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span>{newlyStartedCultivations.length} Newly Started Plant Cultivation(s) in Progress</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.2 rounded-full">
                  Action Available
                </span>
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Farmers have initiated supervised cultivation and agreed to plant their crops within 3 days. Track deadline progress or review submitted planting photos below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setView("planting")}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>View Planting Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tab Navigation & Content Container */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 pt-4 pb-0 overflow-x-auto">
          <div className="flex gap-1">
            {viewTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  view === tab.key 
                    ? 'border-emerald-600 text-emerald-900 bg-emerald-50/60 font-black' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    view === tab.key ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 pb-1">
            <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
              Auto-refreshes every 4s
            </span>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Sprout className="w-8 h-8 animate-pulse mr-3 text-emerald-600" /> 
              <span className="font-medium text-sm">Syncing live cultivation telemetry...</span>
            </div>
          ) : (
            <>
              {/* ---------------- 1. ALL CULTIVATIONS LIST ---------------- */}
              {view === "list" && (
                <div className="space-y-4">
                  {/* Controls: Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search farmer, crop, or region..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                      {(["ALL", "PLANTING_PENDING", "ACTIVE", "COMPLETED"] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => setListStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            listStatusFilter === st
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          {st === 'ALL' ? 'All' : st === 'PLANTING_PENDING' ? '🌱 Planting Phase' : st === 'ACTIVE' ? '🌿 Active' : 'Completed'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredCultivations.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <Leaf className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm font-bold text-gray-600">No cultivations found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchQuery ? "Try refining your search filter." : "When farmers start cultivating a crop, it will appear here in real-time."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-gray-400 uppercase font-semibold border-b border-gray-100">
                          <tr>
                            <th className="pb-3 pr-4">Farmer</th>
                            <th className="pb-3 pr-4">Crop Profile</th>
                            <th className="pb-3 pr-4">Region</th>
                            <th className="pb-3 pr-4">Started On</th>
                            <th className="pb-3 pr-4">Progress</th>
                            <th className="pb-3 pr-4">Status</th>
                            <th className="pb-3 pr-4">Stage / Evidence</th>
                            <th className="pb-3 text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredCultivations.map(c => {
                            const isPlantingPhase = c.status === 'PLANTING_PENDING';
                            const latestSubmission = c.stageSubmissions?.[0];
                            const plantingDeadline = new Date(new Date(c.startDate).getTime() + 3 * 24 * 60 * 60 * 1000);
                            const now = new Date();
                            const msLeft = plantingDeadline.getTime() - now.getTime();
                            const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
                            const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                            const isOverdue = msLeft <= 0;

                            return (
                              <React.Fragment key={c.id}>
                                <tr
                                  className={`hover:bg-gray-50/80 transition-colors ${isPlantingPhase ? 'bg-emerald-50/20' : ''}`}
                                >
                                  <td className="py-3.5 pr-4">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                        {(c.farmer?.name || "F")[0]}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900 leading-tight">{c.farmer?.name || "Farmer"}</p>
                                        <p className="text-[10px] text-gray-400">{c.farmer?.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <div className="flex items-center space-x-2">
                                      {c.cropProfile?.imageUrl && (
                                        <img src={c.cropProfile.imageUrl} alt={c.cropProfile.name} className="w-6 h-6 rounded-md object-cover border border-gray-200" />
                                      )}
                                      <div>
                                        <span className="font-bold text-gray-800 block text-xs">{c.cropProfile?.name}</span>
                                        <span className="text-[9px] text-gray-400">{c.cropProfile?.category || "Crop"}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 pr-4 text-gray-500 text-xs">{c.region || '—'}</td>
                                  <td className="py-3.5 pr-4 text-gray-600 text-xs">
                                    <p className="font-semibold text-gray-800">{new Date(c.startDate).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(c.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
                                      </div>
                                      <span className="text-xs font-bold text-gray-700">{c.progress}%</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <StatusBadge status={c.status} />
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    {isPlantingPhase ? (
                                      latestSubmission ? (
                                        <div className="flex items-center space-x-1.5">
                                          <StatusBadge status={latestSubmission.status} />
                                          <span className="text-[10px] text-emerald-700 font-bold">Photo Attached</span>
                                        </div>
                                      ) : (
                                        <div className="text-[11px]">
                                          <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-amber-700'}`}>
                                            {isOverdue ? '⚠️ 3-Day Deadline Expired' : `⏳ ${daysLeft}d ${hoursLeft}h left to plant`}
                                          </span>
                                        </div>
                                      )
                                    ) : latestSubmission ? (
                                      <StatusBadge status={latestSubmission.status} />
                                    ) : (
                                      <span className="text-gray-400 text-xs">Stage in progress</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 text-right">
                                    {isPlantingPhase ? (
                                      latestSubmission ? (
                                        <button
                                          onClick={() => setSelectedItem({ item: latestSubmission, type: 'planting' })}
                                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>Review Photo</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedItem({ item: c, type: 'cultivation' })}
                                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>Verify Planting</span>
                                        </button>
                                      )
                                    ) : latestSubmission && latestSubmission.status === 'PENDING REVIEW' ? (
                                      <button
                                        onClick={() => setSelectedItem({ item: latestSubmission, type: 'stage' })}
                                        className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>Review Stage</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                                        className="px-2.5 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                      >
                                        {expandedId === c.id ? 'Hide Details' : 'Details'}
                                      </button>
                                    )}
                                  </td>
                                </tr>

                                {expandedId === c.id && (
                                  <tr>
                                    <td colSpan={8} className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
                                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                        <span><strong>Cultivation ID:</strong> {c.id}</span>
                                        <span><strong>Weekly Photo Status:</strong> {c.weeklyPhotoStatus}</span>
                                        {c.weeklyPhotos?.[0] && <span><strong>Last Submitted:</strong> Week {c.weeklyPhotos[0].weekNumber}</span>}
                                        {latestSubmission?.adminComment && (
                                          <span className="text-orange-600"><strong>Latest Comment:</strong> {latestSubmission.adminComment}</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- 2. PENDING PLANTING APPROVALS & 3-DAY DEADLINE ---------------- */}
              {view === "planting" && (
                <div className="space-y-6">
                  
                  {/* Section A: Photo Evidence Submissions Pending Approval */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Action Required: Photographic Planting Verifications ({pendingPlantingSubmissions.length})</span>
                      </h4>
                      <span className="text-[11px] text-gray-400">Farmers who have submitted photo evidence of planted seeds/saplings</span>
                    </div>

                    {pendingPlantingSubmissions.length === 0 ? (
                      <div className="p-6 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-70" />
                        <span className="font-bold text-gray-700">No planting photographs awaiting review.</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">All submitted planting photographs have been reviewed.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingPlantingSubmissions.map((sub: any) => (
                          <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 shadow-xs">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200 relative group">
                              {sub.imageUrl ? (
                                <img src={sub.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Planting evidence" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold text-xs">No Photo</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                                  Planting Stage
                                </span>
                                <p className="font-bold text-gray-900">{sub.cultivation?.farmer?.name || "Farmer"}</p>
                                <span className="text-gray-300">·</span>
                                <p className="text-emerald-900 font-semibold">{sub.cultivation?.cropProfile?.name}</p>
                              </div>
                              <p className="text-xs text-gray-700">
                                Initial Seed Sowing &amp; Sapling Planting Evidence Submitted
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                              </p>
                              {sub.farmerNotes && <p className="text-xs text-emerald-800 mt-1 italic font-medium">&ldquo;{sub.farmerNotes}&rdquo;</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <StatusBadge status={sub.status} />
                              <button
                                onClick={() => setSelectedItem({ item: sub, type: 'planting' })}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Review Evidence</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section B: All Active Cultivations in 3-Day Planting Window */}
                  <div>
                    <div className="flex items-center justify-between mb-3 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Active 3-Day Planting Deadline Window ({allPlantingCultivations.length})</span>
                      </h4>
                      <span className="text-[11px] text-gray-400">Farmers who agreed to policy and are planting their crops</span>
                    </div>

                    {allPlantingCultivations.length === 0 ? (
                      <div className="p-6 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                        <Sprout className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                        <span className="font-bold text-gray-700">No cultivations currently in planting phase.</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">When a farmer starts planting, it immediately appears here.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allPlantingCultivations.map((c: any) => {
                          const deadline = new Date(new Date(c.startDate).getTime() + 3 * 24 * 60 * 60 * 1000);
                          const now = new Date();
                          const msLeft = deadline.getTime() - now.getTime();
                          const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
                          const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                          const isOverdue = msLeft <= 0;
                          const hasPhoto = c.stageSubmissions?.[0]?.imageUrl;

                          return (
                            <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-bold text-gray-900 text-sm">{c.farmer?.name || "Farmer"}</h5>
                                    <p className="text-[11px] text-gray-400">{c.farmer?.email}</p>
                                  </div>
                                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                                    {c.cropProfile?.name || "Crop"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 my-2">
                                  <div>
                                    <span className="text-gray-400 text-[10px] block">Started Cultivation:</span>
                                    <span className="font-semibold text-gray-800">{new Date(c.startDate).toLocaleDateString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-[10px] block">3-Day Deadline:</span>
                                    <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-emerald-700'}`}>
                                      {isOverdue ? 'Expired' : `${daysLeft}d ${hoursLeft}h left`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {hasPhoto ? "📸 Photo Uploaded" : "⏳ Awaiting photo"}
                                </span>
                                <button
                                  onClick={() => setSelectedItem({ 
                                    item: c.stageSubmissions?.[0] || c, 
                                    type: c.stageSubmissions?.[0] ? 'planting' : 'cultivation' 
                                  })}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                                >
                                  {c.stageSubmissions?.[0] ? "Review Photo" : "Verify Planting"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ---------------- 3. PENDING GENERAL STAGE SUBMISSIONS ---------------- */}
              {view === "stages" && (
                <div className="space-y-4">
                  {pendingGeneralStagesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <CheckCircle className="w-10 h-10 mb-3 text-emerald-300" />
                      <p className="font-bold text-gray-700 text-sm">No pending stage reviews</p>
                      <p className="text-xs text-gray-400 mt-1">All subsequent stage submissions are up to date.</p>
                    </div>
                  ) : pendingGeneralStagesList.map(sub => (
                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-yellow-200 bg-yellow-50/30">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
                        {sub.imageUrl && <img src={sub.imageUrl} className="w-full h-full object-cover" alt="Stage evidence" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded uppercase">
                            Stage {sub.stage?.stageOrder || 'Progress'}
                          </span>
                          <p className="font-bold text-gray-900">{sub.cultivation?.farmer?.name}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-gray-600 font-semibold">{sub.cultivation?.cropProfile?.name}</p>
                        </div>
                        <p className="text-xs text-gray-600">Stage: <strong>{sub.stage?.stageName}</strong></p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                        {sub.farmerNotes && <p className="text-xs text-blue-600 mt-1 italic">&ldquo;{sub.farmerNotes}&rdquo;</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={sub.status} />
                        <button
                          onClick={() => setSelectedItem({ item: sub, type: 'stage' })}
                          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review Stage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------- 4. PENDING WEEKLY GROWTH PHOTOS ---------------- */}
              {view === "weekly" && (
                <div className="space-y-4">
                  {pendingWeekly.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <CheckCircle className="w-10 h-10 mb-3 text-purple-300" />
                      <p className="font-bold text-gray-700 text-sm">No pending weekly photo reviews</p>
                      <p className="text-xs text-gray-400 mt-1">All weekly growth submissions have been reviewed.</p>
                    </div>
                  ) : pendingWeekly.map(rec => (
                    <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-purple-200 bg-purple-50/30">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
                        {rec.imageUrl && <img src={rec.imageUrl} className="w-full h-full object-cover" alt="Weekly crop" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded uppercase">
                            Weekly Growth
                          </span>
                          <p className="font-bold text-gray-900">{rec.cultivation?.farmer?.name}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-gray-600 font-semibold">{rec.cultivation?.cropProfile?.name}</p>
                        </div>
                        <p className="text-xs text-gray-600">Week <strong>{rec.weekNumber}</strong> growth photograph</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Submitted: {rec.submittedAt ? new Date(rec.submittedAt).toLocaleString() : '—'}</p>
                        {rec.farmerNotes && <p className="text-xs text-purple-700 mt-1 italic font-medium">&ldquo;{rec.farmerNotes}&rdquo;</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={rec.status} />
                        <button
                          onClick={() => setSelectedItem({ item: rec, type: 'weekly' })}
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review Photo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <ReviewModal
          item={selectedItem.item}
          type={selectedItem.type}
          onClose={() => setSelectedItem(null)}
          onAction={() => fetchAll(false)}
        />
      )}
    </div>
  );
}
