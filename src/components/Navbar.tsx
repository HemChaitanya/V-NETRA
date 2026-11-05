import React from 'react';
import { ActiveScreen, Language, HazardIncident } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  Camera, 
  MapPin, 
  FileText, 
  Info, 
  Zap, 
  AlertTriangle, 
  Languages, 
  Activity,
  Truck,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  lang: Language;
  onToggleLang: () => void;
  incidents: HazardIncident[];
  onTriggerP1Dispatch: (incidentId?: string) => void;
  onResetSamples: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  lang,
  onToggleLang,
  incidents,
  onTriggerP1Dispatch,
  onResetSamples,
}) => {
  const t = getTranslation(lang);

  // Count unassigned P1 criticals
  const unassignedP1 = incidents.filter(i => i.risk === 'P1_CRITICAL' && (i.status === 'Unassigned' || i.status === 'Pending'));
  const firstUnassignedP1 = unassignedP1[0];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Critical Storm Operations Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border-b border-red-500/20 px-3 py-1 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-mono-tactical font-semibold text-red-400 tracking-wider uppercase text-[11px]">
              APEPDCL STORM DISASTER OPS | VIZAG CIRCLE
            </span>
            <span className="hidden sm:inline-block text-slate-500">•</span>
            <span className="hidden md:inline-block text-slate-400 text-[11px]">
              Spatial GIS Auto-Clustering Active (Sub-10s Triage)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {unassignedP1.length > 0 && (
              <button
                onClick={() => onTriggerP1Dispatch(firstUnassignedP1.id)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-[11px] font-medium transition cursor-pointer"
                title="Review and dispatch top P1 emergency"
              >
                <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                <span>{unassignedP1.length} P1 Live Hazard{unassignedP1.length > 1 ? 's' : ''} Need Action</span>
              </button>
            )}

            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
            >
              <Languages className="w-3 h-3 text-cyan-400" />
              <span>{lang === 'en' ? 'తెలుగు (TE)' : 'English (EN)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Headline */}
          <div 
            onClick={() => onNavigate('map')} 
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 via-amber-500 to-cyan-500 p-[1.5px] shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-[#0b101e] rounded-[7px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-wide text-white group-hover:text-cyan-300 transition">
                  {t.appName}
                </span>
                <span className="font-mono-tactical text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  CV-TRIAGE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
                APEPDCL Visakhapatnam Emergency Grid
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Accessible & Touch-Friendly) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('reporter')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                currentScreen === 'reporter'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">{t.nav.reporter}</span>
              <span className="md:hidden">Reporter</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer relative ${
                currentScreen === 'map'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-sm shadow-red-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="hidden md:inline">{t.nav.map}</span>
              <span className="md:hidden">Map</span>
              {unassignedP1.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-1.5 right-1.5"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('incident-details')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                currentScreen === 'incident-details'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">{t.nav.details}</span>
              <span className="md:hidden">Details</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                currentScreen === 'about'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">{t.nav.about}</span>
            </button>
          </nav>

          {/* Quick Route Crew Action (The Main Action) */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => onTriggerP1Dispatch(firstUnassignedP1?.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-red-950/50 border border-red-400/40 cursor-pointer active:scale-95 transition"
            >
              <Truck className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>{t.actions.confirmRouteCrew}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
