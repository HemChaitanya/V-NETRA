import React, { useState } from 'react';
import { HazardIncident, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  AlertTriangle, 
  Truck, 
  CheckCircle, 
  X, 
  Radio, 
  Clock, 
  ZapOff, 
  ShieldCheck, 
  Send
} from 'lucide-react';

interface DispatchCrewModalProps {
  incident: HazardIncident | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfirmDispatch: (incidentId: string, squadData: {
    squadName: string;
    vehicleNumber: string;
    leadEngineer: string;
    etaMinutes: number;
  }) => void;
}

export const DispatchCrewModal: React.FC<DispatchCrewModalProps> = ({
  incident,
  isOpen,
  onClose,
  lang,
  onConfirmDispatch,
}) => {
  const t = getTranslation(lang);

  const [selectedSquad, setSelectedSquad] = useState<'Bravo-2' | 'Alpha-1' | 'Delta-4'>('Bravo-2');
  const [breakerTripped, setBreakerTripped] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  if (!isOpen || !incident) return null;

  const squads = [
    {
      id: 'Bravo-2' as const,
      name: 'APEPDCL Cyclone Squad Bravo-2',
      base: `${incident.substationName || 'MVP Substation'} (2.4 km away)`,
      vehicle: 'AP-31-TE-4402 (Heavy Hydraulic Crane & Winch)',
      lead: 'K. Ramana Rao, ADE Operations',
      etaMinutes: 7,
      status: 'Ready on Standby',
    },
    {
      id: 'Alpha-1' as const,
      name: 'APEPDCL Rapid Response Alpha-1',
      base: 'Dutt Island Central Depot (4.1 km away)',
      vehicle: 'AP-31-TX-8819 (Emergency Lineworker Utility)',
      lead: 'M. Sreenu, Senior Lineman Lead',
      etaMinutes: 12,
      status: 'Patrolling Sector',
    },
    {
      id: 'Delta-4' as const,
      name: 'APEPDCL High-Tension Squad Delta-4',
      base: 'Town Hall Emergency Yard (5.8 km away)',
      vehicle: 'AP-31-TG-1901 (Mobile Transformer Repair Unit)',
      lead: 'V. Satyanarayana, Divisional Engineer',
      etaMinutes: 16,
      status: 'Available',
    },
  ];

  const currentSquad = squads.find(s => s.id === selectedSquad) || squads[0];

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmDispatch(incident.id, {
        squadName: currentSquad.name,
        vehicleNumber: currentSquad.vehicle.split(' ')[0],
        leadEngineer: currentSquad.lead,
        etaMinutes: currentSquad.etaMinutes,
      });
      setIsSubmitting(false);
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-4 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-mono-tactical text-xs font-semibold uppercase tracking-wider text-red-400">
                1-CLICK EMERGENCY DISPATCH
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {t.actions.confirmRouteCrew}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Target Hazard Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-tactical text-xs text-slate-400">TARGET HAZARD ID: {incident.id}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                {incident.risk.replace('_', ' ')}
              </span>
            </div>
            <div className="font-bold text-base text-slate-100">{incident.title}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>📍 {incident.locationName}</span>
              <span>•</span>
              <span className="text-cyan-400 font-medium">{incident.clusterCount} merged reports</span>
            </div>
            {incident.submergedInWater && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Water Conductive Hazard: Lineworkers must arrive with dry insulated fiberglass poles.</span>
              </div>
            )}
          </div>

          {/* Substation Breaker Protection Check */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${breakerTripped ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'}`}>
                <ZapOff className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-xs sm:text-sm">Feeder MV-04 Isolation Breaker</div>
                <div className="text-xs text-slate-400">
                  {breakerTripped ? 'Remote circuit breaker command TRIP queued' : 'Manual override live'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBreakerTripped(!breakerTripped)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                breakerTripped
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-red-500/20 text-red-300 border-red-500/50'
              }`}
            >
              {breakerTripped ? 'Breaker Tripped (Safe)' : 'Trip Breaker Now'}
            </button>
          </div>

          {/* Select APEPDCL Emergency Squad */}
          <div className="space-y-2">
            <label className="block text-xs font-mono-tactical text-slate-400 uppercase tracking-wider">
              Select APEPDCL Cyclone Emergency Squad:
            </label>
            <div className="grid gap-2.5">
              {squads.map(squad => {
                const isSelected = selectedSquad === squad.id;
                return (
                  <div
                    key={squad.id}
                    onClick={() => setSelectedSquad(squad.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{squad.name}</span>
                        <span className="text-[11px] font-mono-tactical px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {squad.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{squad.base}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Lead: <span className="text-slate-200">{squad.lead}</span></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 font-mono-tactical font-bold text-amber-400 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{squad.etaMinutes} mins</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Estimated ETA</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            {t.actions.cancel}
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting || confirmed}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xl cursor-pointer active:scale-95 transition ${
              confirmed
                ? 'bg-emerald-600 border border-emerald-400'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 border border-red-400/40'
            }`}
          >
            {confirmed ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Route Transmitted to {currentSquad.name}!</span>
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Broadcasting to Discom Dispatch...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Route Repair Crew Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
