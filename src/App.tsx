import React, { useState, useEffect } from 'react';
import { ActiveScreen, Language, HazardIncident } from './types';
import { 
  loadIncidents, 
  saveIncidents, 
  resetToSampleIncidents, 
  clearAllIncidents 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { CitizenReporter } from './components/CitizenReporter';
import { DispatcherMap } from './components/DispatcherMap';
import { IncidentDetailsScreen } from './components/IncidentDetailsScreen';
import { AboutScreen } from './components/AboutScreen';
import { DispatchCrewModal } from './components/DispatchCrewModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('map');
  const [lang, setLang] = useState<Language>('en');
  const [incidents, setIncidents] = useState<HazardIncident[]>(() => loadIncidents());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(() => {
    const list = loadIncidents();
    return list[0]?.id || null;
  });

  // Modal state for the 1-click Dispatch Crew action
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [incidentToDispatchId, setIncidentToDispatchId] = useState<string | null>(null);

  // Sync incidents to localStorage
  useEffect(() => {
    saveIncidents(incidents);
  }, [incidents]);

  // Language toggle
  const handleToggleLang = () => {
    setLang(prev => (prev === 'en' ? 'te' : 'en'));
  };

  // Trigger dispatch crew modal for any P1/P2/P3 incident
  const handleTriggerDispatch = (incidentId?: string) => {
    const targetId = incidentId || selectedIncidentId || incidents.find(i => i.risk === 'P1_CRITICAL')?.id || incidents[0]?.id;
    if (targetId) {
      setIncidentToDispatchId(targetId);
      setIsDispatchModalOpen(true);
    }
  };

  // Confirm crew dispatch
  const handleConfirmDispatch = (
    incidentId: string,
    squadData: {
      squadName: string;
      vehicleNumber: string;
      leadEngineer: string;
      etaMinutes: number;
    }
  ) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'Crew Dispatched',
            dispatchedCrew: {
              ...squadData,
              dispatchedAt: 'Just now (<10s)',
            },
          };
        }
        return inc;
      })
    );
  };

  // Add new citizen hazard report or merge into cluster
  const handleHazardReported = (newIncident: HazardIncident) => {
    setIncidents(prev => {
      const existingIdx = prev.findIndex(i => i.id === newIncident.id);
      if (existingIdx >= 0) {
        // Merge into existing cluster
        const updated = [...prev];
        const existing = updated[existingIdx];
        updated[existingIdx] = {
          ...existing,
          clusterCount: existing.clusterCount + 1,
          timeAgo: 'Just now',
          mergedReports: [
            ...(newIncident.mergedReports || []),
            ...(existing.mergedReports || []),
          ],
        };
        return updated;
      }
      // Prepend new incident
      return [newIncident, ...prev];
    });

    setSelectedIncidentId(newIncident.id);
  };

  // Navigate to Incident Details view for specific incident
  const handleViewIncidentDetails = (incident: HazardIncident) => {
    setSelectedIncidentId(incident.id);
    setCurrentScreen('incident-details');
  };

  // Clear data
  const handleClearData = () => {
    const empty = clearAllIncidents();
    setIncidents(empty);
    setSelectedIncidentId(null);
  };

  // Reload sample records
  const handleReloadSamples = () => {
    const samples = resetToSampleIncidents();
    setIncidents(samples);
    setSelectedIncidentId(samples[0]?.id || null);
  };

  const targetIncident = incidents.find(i => i.id === (incidentToDispatchId || selectedIncidentId)) || incidents[0] || null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-red-500/30">
      {/* Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        lang={lang}
        onToggleLang={handleToggleLang}
        incidents={incidents}
        onTriggerP1Dispatch={handleTriggerDispatch}
        onResetSamples={handleReloadSamples}
      />

      {/* Main Screen Content */}
      <main className="flex-1 pb-16">
        {currentScreen === 'reporter' && (
          <CitizenReporter
            lang={lang}
            onHazardReported={handleHazardReported}
            existingIncidents={incidents}
            onTriggerP1Dispatch={handleTriggerDispatch}
          />
        )}

        {currentScreen === 'map' && (
          <DispatcherMap
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            lang={lang}
            onTriggerP1Dispatch={handleTriggerDispatch}
            onViewDetails={handleViewIncidentDetails}
          />
        )}

        {currentScreen === 'incident-details' && (
          <IncidentDetailsScreen
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            lang={lang}
            onTriggerP1Dispatch={handleTriggerDispatch}
          />
        )}

        {currentScreen === 'about' && (
          <AboutScreen
            lang={lang}
            onClearData={handleClearData}
            onReloadSamples={handleReloadSamples}
            onTriggerP1Dispatch={handleTriggerDispatch}
          />
        )}
      </main>

      {/* 1-Click Crew Dispatch Confirmation Modal */}
      <DispatchCrewModal
        incident={targetIncident}
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        lang={lang}
        onConfirmDispatch={handleConfirmDispatch}
      />
    </div>
  );
}
