import React, { useState, useMemo } from 'react';
import { HazardIncident, Language, RiskPriority } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  ShieldAlert, 
  Truck, 
  Layers, 
  Filter, 
  Search, 
  Zap, 
  Activity, 
  Compass, 
  Clock, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface DispatcherMapProps {
  incidents: HazardIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  lang: Language;
  onTriggerP1Dispatch: (incidentId: string) => void;
  onViewDetails: (incident: HazardIncident) => void;
}

export const DispatcherMap: React.FC<DispatcherMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  lang,
  onTriggerP1Dispatch,
  onViewDetails,
}) => {
  const t = getTranslation(lang);

  const [filterRisk, setFilterRisk] = useState<RiskPriority | 'ALL'>('ALL');
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState<boolean>(false);
  const [showFeederBoundaries, setShowFeederBoundaries] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find active incident
  const activeIncident = useMemo(() => {
    if (selectedIncidentId) {
      return incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;
    }
    return incidents[0] || null;
  }, [selectedIncidentId, incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (filterRisk !== 'ALL' && inc.risk !== filterRisk) return false;
      if (filterUnassignedOnly && inc.status !== 'Unassigned' && inc.status !== 'Pending') return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          inc.title.toLowerCase().includes(query) ||
          inc.locationName.toLowerCase().includes(query) ||
          inc.feederImpacted.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [incidents, filterRisk, filterUnassignedOnly, searchQuery]);

  // Geo bounds of Visakhapatnam to project onto SVG GIS Canvas (approx: Lat 17.65 to 17.80, Lng 83.18 to 83.38)
  const minLat = 17.66;
  const maxLat = 17.78;
  const minLng = 83.19;
  const maxLng = 83.37;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Predefined APEPDCL Feeder polygons in Visakhapatnam
  const feederZones = [
    {
      name: 'MVP Colony 11kV Feeder Zone',
      substation: 'MVP 33/11kV Substation',
      coords: [
        { lat: 17.76, lng: 83.31 },
        { lat: 17.765, lng: 83.35 },
        { lat: 17.73, lng: 83.355 },
        { lat: 17.728, lng: 83.315 },
      ],
      color: '#32ADE6',
    },
    {
      name: 'Siripuram Central Commercial Grid',
      substation: 'Dutt Island 33/11kV Substation',
      coords: [
        { lat: 17.73, lng: 83.295 },
        { lat: 17.735, lng: 83.325 },
        { lat: 17.705, lng: 83.325 },
        { lat: 17.705, lng: 83.295 },
      ],
      color: '#FF9500',
    },
    {
      name: 'Gajuwaka Industrial Feeder Zone',
      substation: 'Gajuwaka 33/11kV Substation',
      coords: [
        { lat: 17.71, lng: 83.2 },
        { lat: 17.715, lng: 83.24 },
        { lat: 17.67, lng: 83.245 },
        { lat: 17.665, lng: 83.205 },
      ],
      color: '#A855F7',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header & Sub-10s Latency Ticker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-950/80 text-red-400 border border-red-800/80">
              <MapPin className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.map.title}
            </h1>
            <span className="font-mono-tactical text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline-block">
              GIS LIVE 24×7
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.map.subtitle}
          </p>
        </div>

        {/* Tactical Telemetry Strip */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono-tactical text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>QUEUE LATENCY: <strong className="text-emerald-400">4.2s</strong> (Sub-10s OK)</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400 animate-pulse" />
            <span>P1 CRITICAL: <strong className="text-red-400">{incidents.filter(i => i.risk === 'P1_CRITICAL').length} Active</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and GIS Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterRisk('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              filterRisk === 'ALL'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {t.map.filterAll} ({incidents.length})
          </button>

          <button
            onClick={() => setFilterRisk('P1_CRITICAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              filterRisk === 'P1_CRITICAL'
                ? 'bg-red-500/20 text-red-300 border-red-500 shadow-sm shadow-red-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-red-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-ping" />
            <span>P1 Critical ({incidents.filter(i => i.risk === 'P1_CRITICAL').length})</span>
          </button>

          <button
            onClick={() => setFilterRisk('P2_HIGH')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              filterRisk === 'P2_HIGH'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff9500]" />
            <span>P2 High ({incidents.filter(i => i.risk === 'P2_HIGH').length})</span>
          </button>

          <button
            onClick={() => setFilterRisk('P3_MEDIUM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              filterRisk === 'P3_MEDIUM'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#32ade6]" />
            <span>P3 Medium ({incidents.filter(i => i.risk === 'P3_MEDIUM').length})</span>
          </button>

          <button
            onClick={() => setFilterUnassignedOnly(!filterUnassignedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              filterUnassignedOnly
                ? 'bg-rose-950/80 text-rose-300 border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            {t.map.filterUnassigned}
          </button>
        </div>

        {/* Layer Toggles & Search */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search locality / feeder..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowFeederBoundaries(!showFeederBoundaries)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              showFeederBoundaries
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Toggle 11kV Feeder Boundary Polygons"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Feeders</span>
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive GIS Spatial Map Area (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#070b14] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-tactical-grid select-none">
            {/* Real GIS SVG Map Canvas with Vizag Terrain & Coastline */}
            <svg className="w-full h-full absolute inset-0">
              <defs>
                {/* Coastal gradient representing Bay of Bengal */}
                <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#040812" />
                  <stop offset="100%" stopColor="#06182e" />
                </linearGradient>

                {/* Radar pulse SVG animation */}
                <radialGradient id="p1PulseGrad">
                  <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#ff3b30" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ff3b30" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Bay of Bengal Coastline representation (Eastern side of Visakhapatnam) */}
              <path
                d="M 520,0 Q 480,180 500,320 T 430,550 L 800,550 L 800,0 Z"
                fill="url(#oceanGrad)"
                opacity="0.85"
              />
              <path
                d="M 520,0 Q 480,180 500,320 T 430,550"
                stroke="#1e3a8a"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />

              {/* Major Roads / NH-16 Corridor Arteries across Visakhapatnam */}
              {/* NH-16 (Gajuwaka to Maddilapalem and North) */}
              <path
                d="M 120,440 Q 280,310 420,220 T 520,80"
                stroke="#1e293b"
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M 120,440 Q 280,310 420,220 T 520,80"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                fill="none"
              />

              {/* Beach Road Arteries (RK Beach to Lawsons Bay) */}
              <path
                d="M 390,380 Q 460,330 480,210 T 510,130"
                stroke="#0e7490"
                strokeWidth="2.5"
                strokeOpacity="0.4"
                fill="none"
              />

              {/* Feeder Boundary Polygons */}
              {showFeederBoundaries &&
                feederZones.map((zone, idx) => {
                  const points = zone.coords
                    .map(coord => {
                      const pos = projectToMap(coord.lat, coord.lng);
                      return `${pos.x}%,${pos.y}%`;
                    })
                    .join(' ');

                  return (
                    <g key={idx}>
                      <polygon
                        points={points}
                        fill={zone.color}
                        fillOpacity="0.08"
                        stroke={zone.color}
                        strokeWidth="1.5"
                        strokeDasharray="5 5"
                        strokeOpacity="0.6"
                      />
                    </g>
                  );
                })}
            </svg>

            {/* Geographical Land Marks & Feeder Labels */}
            <div className="absolute top-4 left-4 font-mono-tactical text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur-sm pointer-events-none">
              <span>VISAKHAPATNAM (VIZAG) URBAN CIRCLE</span>
            </div>

            <div className="absolute top-4 right-4 font-mono-tactical text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900 pointer-events-none">
              BAY OF BENGAL (COASTAL SECTOR)
            </div>

            <div className="absolute bottom-3 left-4 font-mono-tactical text-[10px] text-slate-500 pointer-events-none flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-500" />
              <span>GEOFENCE RADIUS: 150m BUFFER • GIS EPSG:4326</span>
            </div>

            {/* Render Hazard Cluster Markers */}
            {filteredIncidents.map(incident => {
              const pos = projectToMap(incident.lat, incident.lng);
              const isSelected = activeIncident?.id === incident.id;
              const isP1 = incident.risk === 'P1_CRITICAL';
              const isP2 = incident.risk === 'P2_HIGH';

              const ringColor = isP1 ? '#ff3b30' : isP2 ? '#ff9500' : '#32ade6';
              const pinBg = isP1
                ? 'bg-red-600 text-white border-white'
                : isP2
                ? 'bg-amber-500 text-black border-amber-200'
                : 'bg-cyan-600 text-white border-cyan-200';

              return (
                <div
                  key={incident.id}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => onSelectIncident(incident.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 group z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                >
                  {/* Pulsing Radar Ring for P1 Critical */}
                  {isP1 && (
                    <div
                      className="absolute -inset-4 rounded-full border-2 border-red-500/80 animate-radar-pulse pointer-events-none"
                      style={{ transformOrigin: 'center center' }}
                    />
                  )}

                  {/* Outer selection glow */}
                  {isSelected && (
                    <div className="absolute -inset-2 rounded-full border border-cyan-400 animate-ping-slow pointer-events-none" />
                  )}

                  {/* Marker Pin Bubble with Cluster Count */}
                  <div
                    className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono-tactical font-bold text-xs shadow-xl transition-all ${pinBg} ${
                      isSelected ? 'ring-4 ring-cyan-400/40' : ''
                    }`}
                  >
                    <span>{incident.clusterCount}</span>

                    {/* Water risk icon indicator */}
                    {incident.submergedInWater && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] font-bold shadow">
                        💧
                      </span>
                    )}
                  </div>

                  {/* Floating Tooltip Label */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-lg bg-black/90 border border-slate-700 text-white text-[11px] whitespace-nowrap shadow-xl pointer-events-none font-medium z-40">
                    <div className="font-bold">{incident.title}</div>
                    <div className="text-[10px] text-slate-300">
                      {incident.locationName} • {incident.clusterCount} merged ({Math.round(incident.confidence * 100)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff3b30] animate-ping" />
                <span className="text-red-400 font-medium">P1 Live Wire / Explosion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff9500]" />
                <span className="text-amber-400 font-medium">P2 Leaning Pole / Dangling Cable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#32ade6]" />
                <span className="text-cyan-400 font-medium">P3 Routine Public Hazard</span>
              </div>
            </div>
            <div className="font-mono-tactical text-[11px] text-slate-400">
              Numbers indicate merged citizen reports in cluster
            </div>
          </div>
        </div>

        {/* Selected Incident Action Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {activeIncident ? (
            <div className="p-5 rounded-2xl bg-[#0f172a] border-2 border-slate-700/80 shadow-2xl space-y-4">
              {/* Header with Risk Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono-tactical text-xs text-slate-400">
                  INCIDENT #{activeIncident.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                    activeIncident.risk === 'P1_CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/50'
                      : activeIncident.risk === 'P2_HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                  }`}
                >
                  {activeIncident.risk.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Photo Preview */}
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {activeIncident.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                  <span>📍 {activeIncident.locationName}</span>
                </p>
              </div>

              {/* Photo Snapshot with Bounding Box Overlay */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black group">
                <img
                  src={activeIncident.imageUrl}
                  alt={activeIncident.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono-tactical text-cyan-400 border border-cyan-500/30">
                  CV CONFIDENCE: {Math.round(activeIncident.confidence * 100)}%
                </div>
                {activeIncident.submergedInWater && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-red-950/90 text-[10px] font-mono-tactical text-red-300 border border-red-500/50 flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-red-400" />
                    <span>CONDUCTIVE WATER CONTACT</span>
                  </div>
                )}
              </div>

              {/* Spatial Deduplication Stats */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono-tactical text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>REPORTS MERGED:</span>
                  <span className="font-bold text-amber-400">{activeIncident.clusterCount} Citizen Reports</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>STATUS:</span>
                  <span className={`font-semibold ${activeIncident.status === 'Crew Dispatched' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeIncident.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>FEEDER:</span>
                  <span className="text-cyan-400 truncate max-w-[170px]">{activeIncident.feederImpacted}</span>
                </div>
              </div>

              {/* Tactical Summary */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                {activeIncident.summary}
              </p>

              {/* Crew Dispatched Status Banner if already routed */}
              {activeIncident.dispatchedCrew && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Crew En Route ({activeIncident.dispatchedCrew.squadName})</span>
                  </div>
                  <div className="text-[11px] text-emerald-300/80">
                    Lead: {activeIncident.dispatchedCrew.leadEngineer} • ETA: ~{activeIncident.dispatchedCrew.etaMinutes} mins
                  </div>
                </div>
              )}

              {/* THE MAIN ACTION BUTTON: Confirm & Route Repair Crew */}
              <button
                type="button"
                onClick={() => onTriggerP1Dispatch(activeIncident.id)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 border border-red-400/50 cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4 text-white animate-pulse" />
                <span>{t.actions.confirmRouteCrew}</span>
              </button>

              {/* View Deep AI Verification Details */}
              <button
                type="button"
                onClick={() => onViewDetails(activeIncident)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.actions.viewDetails}</span>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-slate-300 font-bold text-sm">No Incident Selected</div>
              <p className="text-xs text-slate-400">
                {t.map.selectIncidentPrompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
