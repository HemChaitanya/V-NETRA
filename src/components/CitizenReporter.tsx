import React, { useState, useRef, useEffect } from 'react';
import { Language, HazardIncident, AIAnalysisResult } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  Camera, 
  MapPin, 
  Moon, 
  Sun, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  RefreshCw, 
  Upload, 
  Sliders, 
  Truck, 
  ShieldAlert, 
  Crosshair,
  Flame,
  Droplet
} from 'lucide-react';

interface CitizenReporterProps {
  lang: Language;
  onHazardReported: (newIncident: HazardIncident) => void;
  existingIncidents: HazardIncident[];
  onTriggerP1Dispatch: (incidentId: string) => void;
}

export const CitizenReporter: React.FC<CitizenReporterProps> = ({
  lang,
  onHazardReported,
  existingIncidents,
  onTriggerP1Dispatch,
}) => {
  const t = getTranslation(lang);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera and sensor states
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lowLightMode, setLowLightMode] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // GPS state
  const [locationName, setLocationName] = useState<string>('MVP Colony Sector 2, Vizag');
  const [lat, setLat] = useState<number>(17.7432);
  const [lng, setLng] = useState<number>(83.3311);
  const [gpsStatus, setGpsStatus] = useState<'locked' | 'searching'>('locked');
  const [citizenNote, setCitizenNote] = useState<string>('Snapped 11kV wire sparking in water puddle on road.');

  // Triage submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [triageSecondsElapsed, setTriageSecondsElapsed] = useState<number>(0);

  // Vizag Presets for immediate instant testing
  const presets = [
    {
      label: 'Snapped 11kV Wire in Water (MVP Colony)',
      location: 'MVP Colony Sector 2, Vizag',
      lat: 17.7432,
      lng: 83.3311,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      note: 'Snapped 11kV overhead wire lying in standing rainwater near MVP Colony Sector 2.',
    },
    {
      label: 'Transformer Explosion (Siripuram)',
      location: 'Siripuram Junction, Vizag',
      lat: 17.7211,
      lng: 83.3155,
      image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
      note: 'Pole mounted transformer sparking and caught fire after storm surge.',
    },
    {
      label: 'Leaning 33kV Pole (Visakha Valley)',
      location: 'Visakha Valley School Road',
      lat: 17.7551,
      lng: 83.3422,
      image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
      note: 'Hillside high-tension pole tilted at 50 degrees over roadway.',
    },
    {
      label: 'Broken LT Overhead Cable (Gajuwaka)',
      location: 'Gajuwaka Main Road, Vizag',
      lat: 17.6888,
      lng: 83.2188,
      image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
      note: 'Cross arm snapped, hanging low across vehicular traffic.',
    },
  ];

  // Try initializing device camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setCameraError(null);
          }
        } else {
          setCameraError('Webcam not directly accessible. Tactical simulated viewfinder active.');
        }
      } catch (err: any) {
        console.warn('Camera stream notice:', err.message);
        setCameraError('Using high-fidelity storm viewfinder simulation.');
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Browser Geolocation attempt
  const handleAcquireRealGPS = () => {
    setGpsStatus('searching');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E (Vizag Sector)`);
          setGpsStatus('locked');
        },
        _err => {
          setLat(17.7432);
          setLng(83.3311);
          setLocationName('MVP Colony Sector 2, Vizag');
          setGpsStatus('locked');
        },
        { timeout: 5000 }
      );
    } else {
      setGpsStatus('locked');
    }
  };

  // Capture frame from active camera stream
  const captureFromVideo = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      }
    } else {
      // Use fallback preset
      setCapturedImage(presets[0].image);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pick preset
  const selectPreset = (preset: typeof presets[0]) => {
    setCapturedImage(preset.image);
    setLocationName(preset.location);
    setLat(preset.lat);
    setLng(preset.lng);
    setCitizenNote(preset.note);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Submit hazard for Gemini AI computer vision triage
  const handleSubmitHazard = async () => {
    setIsSubmitting(true);
    setAnalysisError(null);
    setTriageSecondsElapsed(0);

    const timer = setInterval(() => {
      setTriageSecondsElapsed(prev => prev + 0.5);
    }, 500);

    try {
      const payload = {
        imageBase64: capturedImage || presets[0].image,
        mimeType: 'image/jpeg',
        locationName,
        latitude: lat,
        longitude: lng,
        citizenNote,
        existingIncidents,
      };

      const response = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error('Analysis failed to return structured data');
      }

      const aiData: AIAnalysisResult = result.data;
      setAnalysisResult(aiData);

      // Create or update incident record
      const newIncident: HazardIncident = {
        id: aiData.matched_incident_id && aiData.matched_incident_id !== 'NEW' ? aiData.matched_incident_id : `inc-${Date.now().toString(36)}`,
        title: aiData.hazard || 'Snapped 11kV Conductor',
        risk: aiData.risk || 'P1_CRITICAL',
        locationName,
        lat,
        lng,
        clusterCount: (aiData.cluster_count || 1) + 1,
        confidence: aiData.confidence || 0.94,
        status: 'Unassigned',
        timeAgo: 'Just now (<10s)',
        createdAt: Date.now(),
        submergedInWater: aiData.submerged_in_water ?? true,
        feederImpacted: aiData.feeder_impacted || 'MVP Colony 11kV Feeder',
        substationName: 'MVP Double Pole 33/11kV Substation',
        voltageTier: '11kV',
        imageUrl: capturedImage || presets[0].image,
        hazardsDetected: aiData.hazards_detected || [
          'High Voltage Conductor Severed',
          aiData.submerged_in_water ? 'Standing Rainwater Contact' : 'Live Ground Contact',
        ],
        recommendedAction: aiData.recommended_action || 'Trip MV-04 feeder breaker immediately & route emergency squad',
        summary: aiData.summary || 'Emergency hazard verified by V-Netra CV engine.',
        isSample: false,
        mergedReports: [
          {
            id: `sub-${Date.now()}`,
            timestamp: 'Just now',
            distanceMeters: Math.floor(Math.random() * 25) + 3,
            reporterPhoneMasked: '+91 98480 •••••',
            source: 'Citizen Camera',
            note: citizenNote,
            imageUrl: capturedImage || presets[0].image,
          },
        ],
      };

      onHazardReported(newIncident);
    } catch (err: any) {
      console.error('Hazard submission error:', err);
      setAnalysisError(err.message || 'Unable to connect to V-Netra Vision Engine. Please try again.');
    } finally {
      clearInterval(timer);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              <Camera className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.reporter.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.reporter.subtitle}
          </p>
        </div>

        {/* GPS readout & Low light toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setLowLightMode(!lowLightMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tactical transition cursor-pointer border ${
              lowLightMode
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {lowLightMode ? <Moon className="w-3.5 h-3.5 text-emerald-400" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{lowLightMode ? 'Night Vision ON' : 'Low-Light Boost'}</span>
          </button>

          <button
            type="button"
            onClick={handleAcquireRealGPS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-xs font-mono-tactical cursor-pointer hover:bg-cyan-900/60 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{gpsStatus === 'searching' ? 'Acquiring GPS...' : 'GPS Locked'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Viewfinder on Left, Location & Presets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewfinder (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-[4/3] flex items-center justify-center shadow-2xl group">
            {/* Background Feed: Video element or captured image or simulated view */}
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured grid hazard"
                className={`w-full h-full object-cover transition-all ${
                  lowLightMode ? 'brightness-125 contrast-125 saturate-150 hue-rotate-15' : ''
                }`}
              />
            ) : cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  lowLightMode ? 'brightness-125 contrast-125' : ''
                }`}
              />
            ) : (
              // High-tech Tactical Simulation Viewfinder
              <div
                className={`w-full h-full relative flex flex-col items-center justify-center bg-slate-950 bg-tactical-grid ${
                  lowLightMode ? 'bg-emerald-950/30' : ''
                }`}
              >
                <img
                  src={presets[0].image}
                  alt="Default hazard reference"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[0.5px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
              </div>
            )}

            {/* Tactical Camera HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              {/* Top HUD */}
              <div className="flex items-center justify-between font-mono-tactical text-[11px] text-cyan-400 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>V-NETRA OPTICAL HUD</span>
                </div>
                <span>LAT: {lat.toFixed(4)}°N | LNG: {lng.toFixed(4)}°E</span>
              </div>

              {/* Center Targeting Reticle */}
              <div className="relative flex items-center justify-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-cyan-400/40 rounded-2xl relative flex items-center justify-center">
                  <Crosshair className="w-10 h-10 text-cyan-400/60 animate-pulse" />
                  {/* Target corner ticks */}
                  <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                  {/* AI Scan line */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Bottom HUD */}
              <div className="flex items-center justify-between font-mono-tactical text-[11px] text-amber-300 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>CYCLONE HAZARD SENSOR READY</span>
                </div>
                <span>FPS: 30 • AUTO-CV VERIFY</span>
              </div>
            </div>

            {/* Hidden canvas for snapshotting */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Viewfinder Controls: Capture, Upload, Retake */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={capturedImage ? () => setCapturedImage(null) : captureFromVideo}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition cursor-pointer active:scale-95 ${
                capturedImage
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30'
              }`}
            >
              {capturedImage ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.actions.retakePhoto}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>{t.actions.capturePhoto}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>{t.reporter.orUpload}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Safety warning callout */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{t.reporter.guidance}</p>
          </div>
        </div>

        {/* Right Column: Location, Notes & AI Submission (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick-test Presets Card */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tactical text-cyan-400 uppercase tracking-wider font-semibold">
                {t.actions.selectPreset}
              </span>
              <span className="text-[11px] text-slate-400">1-Tap Demo</span>
            </div>
            <div className="space-y-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer text-xs flex items-center justify-between gap-2 ${
                    locationName === preset.location
                      ? 'bg-cyan-950/40 border-cyan-500/70 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="truncate font-medium">{preset.label}</div>
                  <span className="text-[10px] font-mono-tactical px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                    {idx === 0 ? 'P1 Live' : idx === 1 ? 'P1 Fire' : idx === 2 ? 'P1 Lean' : 'P2 Cable'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Incident Location & Note Input */}
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3.5">
            <div>
              <label className="block text-xs font-mono-tactical text-slate-400 uppercase tracking-wider mb-1">
                Local Section / Street Name (Vizag):
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. MVP Colony Sector 2, Siripuram..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-mono-tactical text-slate-400 text-[11px] mb-1">Latitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value) || 17.7432)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono-tactical text-slate-200"
                />
              </div>
              <div>
                <label className="block font-mono-tactical text-slate-400 text-[11px] mb-1">Longitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={e => setLng(parseFloat(e.target.value) || 83.3311)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono-tactical text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono-tactical text-slate-400 uppercase tracking-wider mb-1">
                Citizen Hazard Note:
              </label>
              <textarea
                rows={2}
                value={citizenNote}
                onChange={e => setCitizenNote(e.target.value)}
                placeholder="Describe snapped wires, sparks, or water nearby..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>

          {/* THE SUBMISSION BUTTON */}
          <button
            type="button"
            onClick={handleSubmitHazard}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 border border-red-400/40 cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.actions.submitting} ({triageSecondsElapsed.toFixed(1)}s)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-white" />
                <span>Submit & Run AI Hazard Triage</span>
              </>
            )}
          </button>

          {/* Error Alert with Try Again */}
          {analysisError && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Triage Communication Alert</span>
              </div>
              <p>{analysisError}</p>
              <button
                type="button"
                onClick={handleSubmitHazard}
                className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
              >
                {t.actions.tryAgain}
              </button>
            </div>
          )}

          {/* Instant AI Verification Breakdown Card */}
          {analysisResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1222] border-2 border-red-500/60 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="font-mono-tactical text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI VERIFIED (Sub-10s)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/50">
                  {analysisResult.risk.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {analysisResult.hazard}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{analysisResult.summary}</p>
              </div>

              {/* Confidence & Deduplication badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tactical">
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                  <span className="text-slate-400 block text-[10px]">AI CONFIDENCE</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {Math.round((analysisResult.confidence || 0.94) * 100)}%
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                  <span className="text-slate-400 block text-[10px]">REPORTS MERGED</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {analysisResult.cluster_count || 14} Reports
                  </span>
                </div>
              </div>

              {/* Submerged in water badge */}
              {analysisResult.submerged_in_water && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-semibold">Submerged in Water: Extreme Electrocution Hazard!</span>
                </div>
              )}

              {/* ONE BIG ACTION BUTTON: Confirm & Route Repair Crew */}
              <button
                type="button"
                onClick={() => onTriggerP1Dispatch(analysisResult.matched_incident_id || 'sample-p1-1')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-950/70 border border-red-400 cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4 text-white animate-pulse" />
                <span>{t.actions.confirmRouteCrew}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
