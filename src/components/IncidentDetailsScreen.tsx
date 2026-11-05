import React, { useState } from 'react';
import { HazardIncident, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Droplet, 
  Flame, 
  Truck, 
  Zap, 
  ZapOff, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Layers, 
  Eye, 
  Radio, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface IncidentDetailsScreenProps {
  incidents: HazardIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  lang: Language;
  onTriggerP1Dispatch: (incidentId: string) => void;
}

export const IncidentDetailsScreen: React.FC<IncidentDetailsScreenProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  lang,
  onTriggerP1Dispatch,
}) => {
  const t = getTranslation(lang);

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;
  const [breakerTripped, setBreakerTripped] = useState<boolean>(true);
  const [activePhotoTab, setActivePhotoTab] = useState<number>(0);

  if (!activeIncident) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Incidents in Queue</h2>
        <p className="text-sm text-slate-400">All storm hazard reports have been resolved or cleared.</p>
      </div>
    );
  }

  // Simulated multi-angle photos for duplicate cluster view
  const clusterAngles = [
    {
      title: 'Citizen Primary Angle (Facing North)',
      source: 'Citizen Mobile Camera (MVP Sector 2)',
      url: activeIncident.imageUrl,
      note: 'Conductor dangling into street puddle adjacent to transformer pole.',
    },
    {
      title: 'Secondary Citizen Angle (Opposite Alley)',
      source: 'WhatsApp Cyclone Helpdesk (+91 94401 •••••)',
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      note: 'View of severed conductor terminal end sparking on asphalt.',
    },
    {
      title: 'GVMC Field Ward Monitor Angle',
      source: 'Spandana Emergency Sync (#GVMC-9921)',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
      note: 'Pedestrian blockade created by locals with bamboo sticks.',
    },
  ];

  const isP1 = activeIncident.risk === 'P1_CRITICAL';
  const isP2 = activeIncident.risk === 'P2_HIGH';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Header: Select incident dropdown & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/80">
              <Eye className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.details.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            APEPDCL AI Computer Vision & Spatial Geofence Verification Breakdown
          </p>
        </div>

        {/* Incident Selector Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono-tactical text-slate-400">SELECT INCIDENT:</label>
          <select
            value={activeIncident.id}
            onChange={e => onSelectIncident(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[240px] truncate"
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                [{inc.risk.split('_')[0]}] {inc.title} - {inc.locationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Computer Vision Analysis (Left) & Cluster Deduplication & Dispatch (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Computer Vision & Asset Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Visual Photo with AI Bounding Box & HUD */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black aspect-[16/10] shadow-2xl group">
            <img
              src={clusterAngles[activePhotoTab]?.url || activeIncident.imageUrl}
              alt={activeIncident.title}
              className="w-full h-full object-cover"
            />

            {/* AI Bounding Box Annotation overlay */}
            <div className="absolute inset-x-[20%] inset-y-[25%] border-2 border-red-500/80 rounded-lg pointer-events-none shadow-[0_0_15px_rgba(255,59,48,0.5)]">
              <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono-tactical text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>CV: {activeIncident.title.toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-6 right-0 bg-black/80 border border-cyan-500/50 text-cyan-300 font-mono-tactical text-[10px] px-2 py-0.5 rounded">
                CONF: {Math.round(activeIncident.confidence * 100)}%
              </div>
            </div>

            {/* Top Bar HUD */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <span className="font-mono-tactical text-[11px] px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-slate-200 border border-slate-700">
                FRAME: V-NETRA CV SENSOR #{activeIncident.id}
              </span>
              <span
                className={`font-mono-tactical text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                  isP1
                    ? 'bg-red-600/90 text-white border-red-400 shadow-lg shadow-red-900/60'
                    : isP2
                    ? 'bg-amber-600/90 text-white border-amber-400'
                    : 'bg-cyan-600/90 text-white border-cyan-400'
                }`}
              >
                {activeIncident.risk.replace('_', ' ')}
              </span>
            </div>

            {/* Bottom Bar HUD */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <span className="font-mono-tactical text-[11px] text-slate-300 bg-black/80 px-2 py-0.5 rounded border border-slate-800">
                📍 {activeIncident.lat.toFixed(4)}°N, {activeIncident.lng.toFixed(4)}°E
              </span>
              <span className="font-mono-tactical text-[11px] text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-slate-800">
                {activeIncident.clusterCount} CITIZEN REPORTS MERGED
              </span>
            </div>
          </div>

          {/* Submerged in Rainwater High-Risk Alert */}
          {activeIncident.submergedInWater && (
            <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 flex items-start gap-3 shadow-xl">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 animate-pulse">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  {t.details.submergedAlert}
                </h4>
                <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                  Water puddle conducts high lethal voltage up to 25 meters radius. Lineworkers and local GVMC ward police must cordone off MVP Sector 2 perimeter prior to grounding.
                </p>
              </div>
            </div>
          )}

          {/* AI Computer Vision Verification Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-slate-200 text-sm">
                  {t.details.detectedFeatures}
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono-tactical text-xs text-cyan-400 font-bold">
                <span>{t.details.confidence}:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {Math.round(activeIncident.confidence * 100)}% Match
                </span>
              </div>
            </div>

            {/* Detected Infrastructure Signatures List */}
            <div className="space-y-2">
              {activeIncident.hazardsDetected.map((marker, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                  <span className="font-medium">{marker}</span>
                </div>
              ))}
            </div>

            {/* Recommended Emergency Action */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
              <div className="text-xs font-mono-tactical text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{t.details.recommendedActionTitle}:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeIncident.recommendedAction}
              </p>
            </div>
          </div>

          {/* Electrical Substation & Feeder Telemetry */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>APEPDCL Grid Infrastructure Linkage</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tactical text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SUBSTATION</span>
                <span className="font-bold text-slate-200 text-xs truncate block mt-0.5">
                  {activeIncident.substationName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">FEEDER LINE</span>
                <span className="font-bold text-cyan-400 text-xs truncate block mt-0.5">
                  {activeIncident.feederImpacted}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">VOLTAGE TIER</span>
                <span className="font-bold text-red-400 text-xs block mt-0.5">
                  {activeIncident.voltageTier}
                </span>
              </div>
            </div>

            {/* Feeder Breaker Remote Trip Switch */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    breakerTripped
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-950 text-red-400 border border-red-500/40'
                  }`}
                >
                  <ZapOff className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-200">
                    Substation Remote Breaker: {breakerTripped ? t.details.breakerTripped : t.details.breakerActive}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Auto-isolation safety trigger
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBreakerTripped(!breakerTripped)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  breakerTripped
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-red-600 text-white border-red-500 animate-pulse'
                }`}
              >
                {breakerTripped ? 'Tripped (Safe)' : 'Trip Breaker Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Duplicate Photo Cluster & Big Dispatch Action (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* THE BIG ACTION BUTTON CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-red-950/40 via-[#0f172a] to-[#0f172a] border-2 border-red-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono-tactical text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-red-400 animate-pulse" />
                <span>PRIMARY DISPATCHER ACTION</span>
              </span>
              <span className="text-[11px] font-mono-tactical text-slate-400">
                {activeIncident.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Route Emergency Repair Squad to {activeIncident.locationName}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Dispatch APEPDCL heavy lineworker unit with insulated fiberglass poles and cable splicing gear.
              </p>
            </div>

            {/* Crew assigned info if present */}
            {activeIncident.dispatchedCrew ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Crew Dispatched & En Route!</span>
                </div>
                <div className="text-xs text-emerald-300">
                  Squad: <strong>{activeIncident.dispatchedCrew.squadName}</strong>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono-tactical flex items-center justify-between">
                  <span>Vehicle: {activeIncident.dispatchedCrew.vehicleNumber}</span>
                  <span>ETA: ~{activeIncident.dispatchedCrew.etaMinutes} mins</span>
                </div>
              </div>
            ) : null}

            {/* ONE BIG BUTTON: Confirm & Route Repair Crew */}
            <button
              type="button"
              onClick={() => onTriggerP1Dispatch(activeIncident.id)}
              className="w-full py-4 px-5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-red-950/70 border border-red-400 cursor-pointer active:scale-95 transition flex items-center justify-center gap-2.5"
            >
              <Truck className="w-5 h-5 text-white animate-pulse" />
              <span>{t.actions.confirmRouteCrew}</span>
            </button>
          </div>

          {/* Spatial Geofence Duplicate Cluster View */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>{t.details.mergedReportsTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t.details.mergedReportsDesc}
                </p>
              </div>
              <span className="font-mono-tactical text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                {activeIncident.clusterCount} Merged
              </span>
            </div>

            {/* Multi-angle citizen photo tabs */}
            <div>
              <label className="block text-[11px] font-mono-tactical text-slate-400 uppercase tracking-wider mb-2">
                Verified Citizen Photo Angles:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {clusterAngles.map((angle, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoTab(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-video border transition cursor-pointer ${
                      activePhotoTab === idx
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-102'
                        : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={angle.url} alt={angle.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono-tactical text-white">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-300 mt-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                "{clusterAngles[activePhotoTab]?.note}"
              </p>
            </div>

            {/* Individual Sub-Reports List in Cluster */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {activeIncident.mergedReports && activeIncident.mergedReports.length > 0 ? (
                activeIncident.mergedReports.map(sub => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 text-xs space-y-1.5 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tactical font-semibold text-cyan-400">
                        {sub.source}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono-tactical">
                        {sub.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-300">{sub.note}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono-tactical text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Reporter: {sub.reporterPhoneMasked}</span>
                      <span className="text-amber-400">Within {sub.distanceMeters}m</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  Initial single citizen report filed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
