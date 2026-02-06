
export type Severity = 1 | 2 | 3 | 4 | 5;
export type IncidentCategory = 'Flood' | 'Fire' | 'Structural' | 'Medical' | 'General';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface SOSAlert {
  id: string;
  location: GeoLocation;
  severity: Severity;
  category?: IncidentCategory;
  timestamp: number;
  message: string;
  status: 'pending' | 'dispatched' | 'resolved';
  assignedResponderId?: string;
  citizenName?: string;
  isMesh?: boolean; // Indicates if delivered via Bluetooth Mesh
}

export interface MeshHop {
  nodeId: string;
  timestamp: number;
  rssi: number;
}

export interface Responder {
  id: string;
  name: string;
  location: GeoLocation;
  status: 'idle' | 'en-route' | 'on-site';
  type: 'rescue' | 'medical' | 'supply';
  currentTaskId?: string;
}

export interface Shelter {
  id: string;
  name: string;
  location: GeoLocation;
  capacity: number;
  occupancy: number;
}

export enum AppMode {
  ADMIN = 'ADMIN',
  RESPONDER = 'RESPONDER',
  CIVILIAN = 'CIVILIAN',
  TRAINING = 'TRAINING',
  STRATEGY = 'STRATEGY'
}

export interface UserStats {
  readinessPoints: number;
  goBagComplete: boolean;
  drillsCompleted: number;
}

export interface SystemState {
  alerts: SOSAlert[];
  responders: Responder[];
  shelters: Shelter[];
  isLowBandwidth: boolean;
  isOffline: boolean;
  userLocation: GeoLocation | null;
  theme: 'dark' | 'light';
  userStats: UserStats;
  reliefSearchRadius: number;
}
