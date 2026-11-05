import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  PhoneCall, 
  ShieldAlert, 
  Truck, 
  TrendingUp, 
  Users, 
  Building2, 
  RotateCcw, 
  Trash2, 
  ExternalLink,
  Cpu,
  Layers,
  MapPin
} from 'lucide-react';

interface AboutScreenProps {
  lang: Language;
  onClearData: () => void;
  onReloadSamples: () => void;
  onTriggerP1Dispatch: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  lang,
  onClearData,
  onReloadSamples,
  onTriggerP1Dispatch,
}) => {
  const t = getTranslation(lang);
  const [dataClearedNotice, setDataClearedNotice] = useState<string | null>(null);

  const handleClear = () => {
    onClearData();
    setDataClearedNotice('Local browser storage cleared.');
    setTimeout(() => setDataClearedNotice(null), 3000);
  };

  const handleReload = () => {
    onReloadSamples();
    setDataClearedNotice('10 Sample records reloaded.');
    setTimeout(() => setDataClearedNotice(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8 space-y-10">
      {/* Hero Headline and Pitch */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#090e18] to-red-950/20 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono-tactical">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>DISASTER RESILIENCE ENGINE • VISAKHAPATNAM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            {t.headline}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.pitch}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onTriggerP1Dispatch}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-red-950/60 border border-red-400/40 cursor-pointer active:scale-95 transition flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-white animate-pulse" />
              <span>{t.actions.confirmRouteCrew}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip: AI Deduplication Accuracy Rate, Dashboard Triage Latency, Active Dispatcher Weekly Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tactical text-slate-400 uppercase tracking-wider">
              {t.stats.dedupAccuracy}
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-tactical">
            {t.stats.dedupAccuracyVal}
          </div>
          <p className="text-xs text-slate-400">
            Within 150m geofence clusters during Cyclone storm surges.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tactical text-slate-400 uppercase tracking-wider">
              {t.stats.triageLatency}
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-tactical text-cyan-300">
            4.2s <span className="text-base text-slate-400 font-normal">(&lt; 10s)</span>
          </div>
          <p className="text-xs text-slate-400">
            From citizen camera shutter tap to dispatcher route queue.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tactical text-slate-400 uppercase tracking-wider">
              {t.stats.weeklySessions}
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-tactical text-amber-300">
            {t.stats.weeklySessionsVal}
          </div>
          <p className="text-xs text-slate-400">
            APEPDCL local section engineers & GVMC Disaster cell operators.
          </p>
        </div>
      </div>

      {/* WHY IT MATTERS: The 3 Stat Cards with Direct Links */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.about.whyItMattersTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-red-500/30 flex flex-col justify-between space-y-4 hover:border-red-500/60 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base leading-snug">
                1. Call centers and IVRS jam instantly during storm power outages in AP
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Thousands of simultaneous phone calls flood emergency lines during cyclonic winds, preventing life-threatening downed conductor reports from reaching engineers.
              </p>
            </div>
            <a
              href="https://selectra.in/energy/power-outages/andhra-pradesh/visakhapatnam"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono-tactical pt-3 border-t border-slate-800"
            >
              <span>Source: Selectra AP Outage Report</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-amber-500/30 flex flex-col justify-between space-y-4 hover:border-amber-500/60 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base leading-snug">
                2. GVMC complaints treat emergency live wires with the same slow queue as routine issues
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generic grievance portals like Spandana treat a sparking high-tension wire in puddle with identical SLA to a blown streetlight, wasting critical golden-hour triage minutes.
              </p>
            </div>
            <a
              href="https://www.gvmc.gov.in/static_content/Grievances.jsp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-mono-tactical pt-3 border-t border-slate-800"
            >
              <span>Source: GVMC Grievances Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-cyan-500/30 flex flex-col justify-between space-y-4 hover:border-cyan-500/60 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base leading-snug">
                3. Electrocution accounts for over 9,000 deaths annually in India, often due to downed wires
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                National Crime Records Bureau data proves snapped live conductors in standing rainwater are among the deadliest urban monsoon killers in coastal peninsular India.
              </p>
            </div>
            <a
              href="https://ncrb.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono-tactical pt-3 border-t border-slate-800"
            >
              <span>Source: NCRB Government Report</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Problem, Solution & What Makes Us Different */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-slate-200">The Problem</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.problemStatement}
          </p>
          <div className="pt-2 text-xs font-mono-tactical text-slate-400">
            <strong>Target Users:</strong> {t.about.targetUsers}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">{t.about.differentiationTitle}</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300">{t.about.differentiationBody}</strong>
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.solutionStatement}
          </p>
        </div>
      </div>

      {/* Business Model / Who Pays Later */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Commercial Model & Procurement</h3>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-300">
            <strong>Customer:</strong> APEPDCL (Eastern Power Distribution Company of AP) / GVMC Disaster Management Cell.
          </div>
          <div className="text-xs text-slate-300">
            <strong>Pricing:</strong> Annual Enterprise Software Licensing per Discom Circle at <span className="text-amber-400 font-mono-tactical font-bold">₹50,000 / month per Division (₹6 Lakhs / year per Division)</span>.
          </div>
          <div className="text-xs text-slate-400">
            <strong>Team & Place:</strong> Team VOID404.exe | Visakhapatnam, Andhra Pradesh, India.
          </div>
        </div>
      </div>

      {/* Data Management: Clear Data & Reload Samples */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Browser Data Management</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset or clear incidents stored in your local browser storage.
          </p>
          {dataClearedNotice && (
            <span className="text-xs font-mono-tactical text-emerald-400 font-bold block mt-1">
              ✓ {dataClearedNotice}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.actions.reloadSamples}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-medium transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>{t.actions.clearData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
