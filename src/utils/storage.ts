import { HazardIncident } from '../types';
import { initialSampleIncidents } from '../data/sampleIncidents';

const STORAGE_KEY = 'vnetra_incidents_v1';

export function loadIncidents(): HazardIncident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSampleIncidents));
      return initialSampleIncidents;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSampleIncidents));
      return initialSampleIncidents;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading incidents from localStorage:', e);
    return initialSampleIncidents;
  }
}

export function saveIncidents(incidents: HazardIncident[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
  } catch (e) {
    console.error('Error saving incidents to localStorage:', e);
  }
}

export function resetToSampleIncidents(): HazardIncident[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSampleIncidents));
  return initialSampleIncidents;
}

export function clearAllIncidents(): HazardIncident[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
