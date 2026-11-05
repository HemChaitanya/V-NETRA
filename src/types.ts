export type RiskPriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM';

export type IncidentStatus = 'Unassigned' | 'Pending' | 'Crew Dispatched' | 'Queued' | 'Resolved';

export interface CitizenSubReport {
  id: string;
  timestamp: string;
  distanceMeters: number;
  reporterPhoneMasked: string;
  source: 'Citizen Camera' | 'GVMC IVRS Forward' | 'Spandana Sync' | 'WhatsApp Bot';
  note: string;
  imageUrl?: string;
}

export interface HazardIncident {
  id: string;
  title: string;
  risk: RiskPriority;
  locationName: string;
  lat: number;
  lng: number;
  clusterCount: number;
  confidence: number; // e.g. 0.94 for 94%
  status: IncidentStatus;
  timeAgo: string;
  createdAt: number; // timestamp in ms
  submergedInWater: boolean;
  feederImpacted: string;
  substationName: string;
  voltageTier: '11kV' | '33kV' | '415V LT' | 'Service Wire';
  imageUrl: string;
  hazardsDetected: string[];
  recommendedAction: string;
  summary: string;
  isSample: boolean;
  mergedReports: CitizenSubReport[];
  dispatchedCrew?: {
    squadName: string;
    vehicleNumber: string;
    leadEngineer: string;
    etaMinutes: number;
    dispatchedAt: string;
  };
}

export interface AIAnalysisResult {
  hazard: string;
  risk: RiskPriority;
  confidence: number;
  submerged_in_water: boolean;
  cluster_count: number;
  matched_incident_id?: string;
  feeder_impacted?: string;
  hazards_detected?: string[];
  recommended_action: string;
  summary: string;
  fallback?: boolean;
}

export type ActiveScreen = 'reporter' | 'map' | 'incident-details' | 'about';
export type Language = 'en' | 'te';
