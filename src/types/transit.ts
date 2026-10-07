export type TransitMode = 'bus' | 'rail' | 'brt' | 'ferry';

export type OccupancyLevel = 'low' | 'moderate' | 'crowded' | 'full';

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  crossStreet: string;
  x: number; // Map canvas coordinate (0 - 1000)
  y: number; // Map canvas coordinate (0 - 700)
  lines: string[]; // Line IDs that serve this stop
  accessible: boolean;
  shelter: boolean;
  digitalBoard: boolean;
  zone: string;
}

export interface TransitLine {
  id: string;
  code: string; // e.g. "14X", "BLUE", "38R"
  name: string;
  mode: TransitMode;
  color: string;
  textColor: string;
  description: string;
  origin: string;
  destination: string;
  path: { x: number; y: number }[]; // Route coordinates
  stopIds: string[];
  peakFrequencyMin: number;
  offPeakFrequencyMin: number;
  operatingHours: string;
  activeAlert?: string;
}

export interface Vehicle {
  id: string;
  lineId: string;
  destination: string;
  model: string;
  speedMph: number;
  occupancy: OccupancyLevel;
  occupancyPercent: number;
  hasBikeRack: boolean;
  isElectric: boolean;
  acOn: boolean;
  driverId: string;
  lastUpdated: number;
  // Position along the line's path:
  currentStopIndex: number;
  progressBetweenStops: number; // 0.0 to 1.0
  x: number;
  y: number;
  bearing: number; // 0 to 360
  isStopped: boolean;
  dwellSecondsRemaining: number;
}

export interface ArrivalPrediction {
  id: string;
  lineId: string;
  vehicleId: string;
  destination: string;
  scheduledTime: string;
  estimatedSecondsRemaining: number;
  delayMinutes: number; // 0 = on-time, >0 = delayed, <0 = early
  occupancy: OccupancyLevel;
  subsequentArrivals: number[]; // e.g. [12, 24] in minutes
  platform?: string;
}

export interface ServiceAlert {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  affectedLines: string[];
  affectedStops: string[];
  description: string;
  recommendation: string;
  postedTime: string;
  updatedTime: string;
}

export interface TripItinerary {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  walkMinutes: number;
  fare: string;
  transfers: number;
  steps: {
    type: 'walk' | 'transit';
    lineId?: string;
    vehicleCode?: string;
    fromStop: string;
    toStop: string;
    durationMinutes: number;
    distance?: string;
    departureCountdown?: number; // seconds
    instructions: string;
  }[];
}
