import { ArrivalPrediction, OccupancyLevel } from '../types/transit';

export interface LtaNextBus {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD'; // SEA = Seats Available, SDA = Standing Available, LSD = Limited Standing
  Feature?: string; // WAB = Wheelchair Accessible Bus
  Type?: 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy
}

export interface LtaService {
  ServiceNo: string;
  Operator: string;
  NextBus?: LtaNextBus;
  NextBus2?: LtaNextBus;
  NextBus3?: LtaNextBus;
}

export interface LtaBusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: LtaService[];
  _source?: string;
  _note?: string;
}

export interface LtaHealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  lta_configured: boolean;
  message: string;
}

/**
 * Fetch health status of the TransitPulse API
 */
export async function checkApiHealth(): Promise<LtaHealthResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return null;
  }
}

/**
 * Fetch LTA bus arrival predictions from /api/bus-arrival
 * Refreshes every 20 seconds per LTA specifications.
 */
export async function fetchLtaBusArrival(
  busStopCode: string,
  serviceNo?: string
): Promise<{
  data: LtaBusArrivalResponse | null;
  source: 'live' | 'simulated' | 'error';
  error?: string;
}> {
  try {
    let url = `/api/bus-arrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
    if (serviceNo && serviceNo.trim() !== '') {
      url += `&ServiceNo=${encodeURIComponent(serviceNo.trim())}`;
    }

    const res = await fetch(url);
    const sourceHeader = res.headers.get('x-lta-source');

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        data: null,
        source: 'error',
        error: errJson.error || `HTTP ${res.status}`
      };
    }

    const data: LtaBusArrivalResponse = await res.json();
    return {
      data,
      source: (sourceHeader as 'live' | 'simulated') || (data._source === 'simulation_pending_lta_key' ? 'simulated' : 'live')
    };
  } catch (err) {
    return {
      data: null,
      source: 'error',
      error: String(err)
    };
  }
}

/**
 * Convert LTA NextBus arrival time into seconds remaining
 */
export function getSecondsUntilArrival(isoDateString?: string): number {
  if (!isoDateString) return 9999;
  const arrivalTime = new Date(isoDateString).getTime();
  const now = Date.now();
  const diffSec = Math.round((arrivalTime - now) / 1000);
  return Math.max(0, diffSec);
}

/**
 * Convert LTA Load code (SEA, SDA, LSD) to TransitPulse occupancy
 */
export function mapLtaLoad(load?: string): OccupancyLevel {
  switch (load) {
    case 'SEA':
      return 'low'; // Seats Available
    case 'SDA':
      return 'moderate'; // Standing Available
    case 'LSD':
      return 'crowded'; // Limited Standing
    default:
      return 'low';
  }
}

/**
 * Popular Singapore LTA bus stops for instant testing
 */
export const POPULAR_LTA_BUS_STOPS = [
  { code: '04121', name: 'Old Hill St Police Station / Clarke Quay', road: 'Hill Street' },
  { code: '01012', name: 'Hotel Grand Pacific / Victoria St', road: 'Victoria Street' },
  { code: '08057', name: 'Opposite Somerset Station / Orchard', road: 'Orchard Road' },
  { code: '03019', name: 'Fullerton Square / Raffles Place', road: 'Battery Road' },
  { code: '10169', name: 'VivoCity / HarbourFront Station', road: 'Telok Blangah Road' },
  { code: '09048', name: 'Orchard Boulevard Station', road: 'Grange Road' }
];
