import { TransitStop, TransitLine, Vehicle, ServiceAlert, TripItinerary } from '../types/transit';

export const INITIAL_STOPS: TransitStop[] = [
  {
    id: 'stop_hub',
    name: 'Grand Central Transit Hub',
    code: '1010',
    crossStreet: 'Terminal Ave & 1st St',
    x: 520,
    y: 280,
    lines: ['14X', '38R', 'M15', 'BLUE', 'T2'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 1 (Core)'
  },
  {
    id: 'stop_market_4th',
    name: 'Market & 4th St',
    code: '1024',
    crossStreet: '4th St at Market Concourse',
    x: 430,
    y: 330,
    lines: ['14X', '38R', 'M15', 'BLUE'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 1 (Core)'
  },
  {
    id: 'stop_civic_ctr',
    name: 'Civic Center Plaza',
    code: '1035',
    crossStreet: 'Grove St & Polk St',
    x: 320,
    y: 390,
    lines: ['14X', '38R', 'BLUE'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 1 (Core)'
  },
  {
    id: 'stop_mission_16',
    name: 'Mission & 16th St',
    code: '1048',
    crossStreet: '16th St & Mission Corridor',
    x: 250,
    y: 500,
    lines: ['14X', 'BLUE', 'T2'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 2 (Metro)'
  },
  {
    id: 'stop_ferry_bldg',
    name: 'Ferry Building Terminal',
    code: '1002',
    crossStreet: 'The Embarcadero & Market',
    x: 720,
    y: 220,
    lines: ['14X', '38R', 'FX-1'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 1 (Waterfront)'
  },
  {
    id: 'stop_chinatown',
    name: 'Chinatown Gateway Station',
    code: '1055',
    crossStreet: 'Grant Ave & Bush St',
    x: 480,
    y: 190,
    lines: ['M15', 'BLUE'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 1 (North)'
  },
  {
    id: 'stop_presidio',
    name: 'Presidio Parkway Hub',
    code: '1072',
    crossStreet: 'Lincoln Blvd & Park Way',
    x: 210,
    y: 160,
    lines: ['38R', 'BLUE'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 2 (Northwest)'
  },
  {
    id: 'stop_tech_marina',
    name: 'Tech Corridor Marina',
    code: '1088',
    crossStreet: 'Mission Bay Blvd & 3rd St',
    x: 640,
    y: 510,
    lines: ['M15', 'T2', 'FX-1'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 2 (South Bay)'
  },
  {
    id: 'stop_harbor_island',
    name: 'Harbor Point Pier',
    code: '1095',
    crossStreet: 'Point Island Promenade',
    x: 880,
    y: 210,
    lines: ['FX-1'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 3 (Harbor)'
  },
  {
    id: 'stop_airport_link',
    name: 'Airport Link Gateway',
    code: '1110',
    crossStreet: 'Aviation Way & Terminal 1',
    x: 160,
    y: 650,
    lines: ['14X', 'BLUE'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 3 (Airport)'
  },
  {
    id: 'stop_sunset_blvd',
    name: 'Sunset District Station',
    code: '1064',
    crossStreet: 'Taraval St & 19th Ave',
    x: 130,
    y: 350,
    lines: ['38R'],
    accessible: true,
    shelter: true,
    digitalBoard: true,
    zone: 'Zone 2 (West)'
  }
];

export const INITIAL_LINES: TransitLine[] = [
  {
    id: '14X',
    code: '14X',
    name: 'Mission Rapid Express',
    mode: 'bus',
    color: '#2563EB', // Transport Blue
    textColor: '#FFFFFF',
    description: 'High-frequency limited-stop trunk service connecting Ferry Terminal, Grand Central, and Airport Gateway.',
    origin: 'Ferry Terminal',
    destination: 'Airport Link Gateway',
    stopIds: ['stop_ferry_bldg', 'stop_hub', 'stop_market_4th', 'stop_civic_ctr', 'stop_mission_16', 'stop_airport_link'],
    path: [
      { x: 720, y: 220 },
      { x: 520, y: 280 },
      { x: 430, y: 330 },
      { x: 320, y: 390 },
      { x: 250, y: 500 },
      { x: 160, y: 650 }
    ],
    peakFrequencyMin: 5,
    offPeakFrequencyMin: 8,
    operatingHours: '04:30 – 01:15 Daily',
    activeAlert: 'Minor signal delay near 4th St (+2 min)'
  },
  {
    id: '38R',
    code: '38R',
    name: 'Geary Rapid BRT',
    mode: 'brt',
    color: '#DC2626', // High-Contrast Red
    textColor: '#FFFFFF',
    description: 'Dedicated center-lane bus rapid transit running from Presidio Parkway through Downtown to Ferry Terminal.',
    origin: 'Presidio Parkway Hub',
    destination: 'Ferry Terminal',
    stopIds: ['stop_presidio', 'stop_sunset_blvd', 'stop_civic_ctr', 'stop_market_4th', 'stop_hub', 'stop_ferry_bldg'],
    path: [
      { x: 210, y: 160 },
      { x: 130, y: 350 },
      { x: 320, y: 390 },
      { x: 430, y: 330 },
      { x: 520, y: 280 },
      { x: 720, y: 220 }
    ],
    peakFrequencyMin: 4,
    offPeakFrequencyMin: 7,
    operatingHours: '24 Hours (All-Nighter Service)'
  },
  {
    id: 'M15',
    code: 'M15',
    name: 'Select Downtown Crosstown',
    mode: 'bus',
    color: '#0D9488', // Electric Transit Teal
    textColor: '#FFFFFF',
    description: 'Rapid arterial connection serving Chinatown, Grand Central Core, and Tech Marina Innovation District.',
    origin: 'Chinatown Gateway',
    destination: 'Tech Corridor Marina',
    stopIds: ['stop_chinatown', 'stop_hub', 'stop_market_4th', 'stop_tech_marina'],
    path: [
      { x: 480, y: 190 },
      { x: 520, y: 280 },
      { x: 430, y: 330 },
      { x: 640, y: 510 }
    ],
    peakFrequencyMin: 7,
    offPeakFrequencyMin: 12,
    operatingHours: '05:00 – 00:30 Daily'
  },
  {
    id: 'BLUE',
    code: 'BLUE',
    name: 'Metropolitan Metro Line',
    mode: 'rail',
    color: '#004AC6', // Deep Transport Blue
    textColor: '#FFFFFF',
    description: 'Grade-separated subway rail link connecting Airport Link to Presidio Parkway through the central spine.',
    origin: 'Airport Link Gateway',
    destination: 'Presidio Parkway Hub',
    stopIds: ['stop_airport_link', 'stop_mission_16', 'stop_civic_ctr', 'stop_market_4th', 'stop_hub', 'stop_chinatown', 'stop_presidio'],
    path: [
      { x: 160, y: 650 },
      { x: 250, y: 500 },
      { x: 320, y: 390 },
      { x: 430, y: 330 },
      { x: 520, y: 280 },
      { x: 480, y: 190 },
      { x: 210, y: 160 }
    ],
    peakFrequencyMin: 6,
    offPeakFrequencyMin: 10,
    operatingHours: '05:00 – 01:00 Daily'
  },
  {
    id: 'FX-1',
    code: 'FX-1',
    name: 'Harbor Ferry Express',
    mode: 'ferry',
    color: '#0284C7', // Maritime Cyan
    textColor: '#FFFFFF',
    description: 'High-speed catamaran passenger ferry connecting Downtown Ferry Building, Tech Marina, and Harbor Point.',
    origin: 'Ferry Terminal',
    destination: 'Harbor Point Pier',
    stopIds: ['stop_ferry_bldg', 'stop_tech_marina', 'stop_harbor_island'],
    path: [
      { x: 720, y: 220 },
      { x: 640, y: 510 },
      { x: 880, y: 210 }
    ],
    peakFrequencyMin: 15,
    offPeakFrequencyMin: 30,
    operatingHours: '06:00 – 22:30 Daily'
  },
  {
    id: 'T2',
    code: 'T2',
    name: 'Tech Corridor Shuttle',
    mode: 'bus',
    color: '#7C3AED', // Violet
    textColor: '#FFFFFF',
    description: 'Autonomous zero-emission connector linking Grand Central with South Bay biotech & tech hubs.',
    origin: 'Grand Central Transit Hub',
    destination: 'Mission & 16th St',
    stopIds: ['stop_hub', 'stop_tech_marina', 'stop_mission_16'],
    path: [
      { x: 520, y: 280 },
      { x: 640, y: 510 },
      { x: 250, y: 500 }
    ],
    peakFrequencyMin: 8,
    offPeakFrequencyMin: 15,
    operatingHours: '06:30 – 21:00 Weekdays'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'BUS-4092',
    lineId: '14X',
    destination: 'Airport Link Gateway',
    model: 'New Flyer Xcelsior XE40 Electric',
    speedMph: 24,
    occupancy: 'moderate',
    occupancyPercent: 54,
    hasBikeRack: true,
    isElectric: true,
    acOn: true,
    driverId: 'DRV-8821 (Capt. Vance)',
    lastUpdated: Date.now(),
    currentStopIndex: 1, // Moving between stop_hub (index 1) and stop_market_4th (index 2)
    progressBetweenStops: 0.72,
    x: 455,
    y: 316,
    bearing: 210,
    isStopped: false,
    dwellSecondsRemaining: 0
  },
  {
    id: 'BUS-4108',
    lineId: '14X',
    destination: 'Airport Link Gateway',
    model: 'New Flyer Xcelsior XE40 Electric',
    speedMph: 28,
    occupancy: 'low',
    occupancyPercent: 28,
    hasBikeRack: true,
    isElectric: true,
    acOn: true,
    driverId: 'DRV-9014 (M. Tanaka)',
    lastUpdated: Date.now(),
    currentStopIndex: 3, // Between Civic Center and Mission 16th
    progressBetweenStops: 0.35,
    x: 295,
    y: 428,
    bearing: 235,
    isStopped: false,
    dwellSecondsRemaining: 0
  },
  {
    id: 'BRT-8814',
    lineId: '38R',
    destination: 'Ferry Terminal',
    model: 'Gillig BRT Plus Articulated 60ft',
    speedMph: 19,
    occupancy: 'crowded',
    occupancyPercent: 82,
    hasBikeRack: true,
    isElectric: false,
    acOn: true,
    driverId: 'DRV-7440 (R. Ortiz)',
    lastUpdated: Date.now(),
    currentStopIndex: 2, // Near Civic Center
    progressBetweenStops: 0.95,
    x: 326,
    y: 387,
    bearing: 150,
    isStopped: true,
    dwellSecondsRemaining: 14
  },
  {
    id: 'RAIL-204',
    lineId: 'BLUE',
    destination: 'Presidio Parkway Hub',
    model: 'Siemens S200 Light Rail 3-Car Consist',
    speedMph: 42,
    occupancy: 'moderate',
    occupancyPercent: 61,
    hasBikeRack: true,
    isElectric: true,
    acOn: true,
    driverId: 'ATO-AutoControl Unit 4',
    lastUpdated: Date.now(),
    currentStopIndex: 2, // Between Civic Center and Market 4th
    progressBetweenStops: 0.60,
    x: 386,
    y: 354,
    bearing: 60,
    isStopped: false,
    dwellSecondsRemaining: 0
  },
  {
    id: 'BUS-1022',
    lineId: 'M15',
    destination: 'Tech Corridor Marina',
    model: 'Proterra Catalyst E2 Max',
    speedMph: 22,
    occupancy: 'low',
    occupancyPercent: 32,
    hasBikeRack: true,
    isElectric: true,
    acOn: true,
    driverId: 'DRV-3105 (K. Lin)',
    lastUpdated: Date.now(),
    currentStopIndex: 1, // Near Grand Central
    progressBetweenStops: 0.25,
    x: 505,
    y: 295,
    bearing: 165,
    isStopped: false,
    dwellSecondsRemaining: 0
  },
  {
    id: 'FERRY-01',
    lineId: 'FX-1',
    destination: 'Harbor Point Pier',
    model: 'Damen Fast Ferry 4212 Catamaran',
    speedMph: 26,
    occupancy: 'moderate',
    occupancyPercent: 48,
    hasBikeRack: true,
    isElectric: false,
    acOn: true,
    driverId: 'CAPT-22 (Helm J. Campbell)',
    lastUpdated: Date.now(),
    currentStopIndex: 0, // Ferry Terminal to Tech Marina
    progressBetweenStops: 0.45,
    x: 684,
    y: 350,
    bearing: 145,
    isStopped: false,
    dwellSecondsRemaining: 0
  },
  {
    id: 'BUS-5509',
    lineId: 'T2',
    destination: 'Mission & 16th St',
    model: 'Navya Roboshuttle Autonomous EV',
    speedMph: 18,
    occupancy: 'low',
    occupancyPercent: 19,
    hasBikeRack: false,
    isElectric: true,
    acOn: true,
    driverId: 'Autonomous Fleet Mgr #09',
    lastUpdated: Date.now(),
    currentStopIndex: 1, // Tech Marina to Mission 16th
    progressBetweenStops: 0.40,
    x: 484,
    y: 506,
    bearing: 260,
    isStopped: false,
    dwellSecondsRemaining: 0
  }
];

export const INITIAL_ALERTS: ServiceAlert[] = [
  {
    id: 'ALT-302',
    title: 'Civic Center Station: Platform 2 Elevator Scheduled Maintenance',
    severity: 'info',
    affectedLines: ['14X', '38R', 'BLUE'],
    affectedStops: ['stop_civic_ctr'],
    description: 'Elevator connecting the street concourse to Platform 2 is undergoing quarterly hydraulic inspections until 16:00.',
    recommendation: 'Step-free passengers boarding outbound lines can utilize ramp access at East Concourse Gate B.',
    postedTime: 'Today at 07:15',
    updatedTime: 'Active'
  },
  {
    id: 'ALT-108',
    title: 'Line 14X: High Passenger Inflow along Market Corridor',
    severity: 'warning',
    affectedLines: ['14X'],
    affectedStops: ['stop_market_4th', 'stop_hub'],
    description: 'Heavy commuter boardings during morning peak are causing temporary dwell extensions (+2 to +3 minutes). Dispatch has injected 2 standby express units.',
    recommendation: 'Board rear multi-door validators with contactless fare cards to speed boarding.',
    postedTime: '15 min ago',
    updatedTime: 'Live Advisory'
  },
  {
    id: 'ALT-401',
    title: 'Harbor Ferry FX-1: Normal Waterway Clearances',
    severity: 'info',
    affectedLines: ['FX-1'],
    affectedStops: ['stop_ferry_bldg', 'stop_harbor_island'],
    description: 'Marine conditions calm; vessels operating at planned 15-minute headway with full bicycle capacity available.',
    recommendation: 'Bicycles allowed on upper and lower decks on all sailings.',
    postedTime: 'Today at 06:00',
    updatedTime: 'Nominal'
  }
];

export const INITIAL_TRIP_ITINERARIES: TripItinerary[] = [
  {
    id: 'TRIP-1',
    title: 'Fastest Transit Route',
    summary: 'BLUE Rail direct to Civic Center, 2 min walk',
    durationMinutes: 14,
    walkMinutes: 3,
    fare: '$2.50',
    transfers: 0,
    steps: [
      {
        type: 'walk',
        fromStop: 'Origin (Ferry Building)',
        toStop: 'Grand Central Hub Concourse',
        durationMinutes: 3,
        distance: '0.15 mi',
        instructions: 'Walk through Ferry Plaza south portal to Platform 1'
      },
      {
        type: 'transit',
        lineId: 'BLUE',
        vehicleCode: 'BLUE Light Rail',
        fromStop: 'Grand Central Transit Hub',
        toStop: 'Civic Center Plaza',
        durationMinutes: 9,
        departureCountdown: 180, // 3 min
        instructions: 'Board Westbound Subway toward Airport Gateway (3 stops)'
      },
      {
        type: 'walk',
        fromStop: 'Civic Center Plaza',
        toStop: 'Destination',
        durationMinutes: 2,
        distance: '450 ft',
        instructions: 'Take Escalator 3 to Grove Street Exit'
      }
    ]
  },
  {
    id: 'TRIP-2',
    title: 'Street-Level Rapid Bus',
    summary: 'Line 14X Express surface trunk via Market St',
    durationMinutes: 18,
    walkMinutes: 1,
    fare: '$2.50',
    transfers: 0,
    steps: [
      {
        type: 'transit',
        lineId: '14X',
        vehicleCode: '14X Mission Rapid',
        fromStop: 'Ferry Building Terminal',
        toStop: 'Civic Center Plaza',
        durationMinutes: 17,
        departureCountdown: 65, // ~1 min
        instructions: 'Board curbside at Shelter B. All-door boarding available.'
      },
      {
        type: 'walk',
        fromStop: 'Civic Center Plaza',
        toStop: 'Destination',
        durationMinutes: 1,
        distance: '200 ft',
        instructions: 'Walk 50 yards west toward City Hall'
      }
    ]
  },
  {
    id: 'TRIP-3',
    title: 'Express BRT Corridor',
    summary: 'Line 38R dedicated median busway',
    durationMinutes: 20,
    walkMinutes: 2,
    fare: '$2.50',
    transfers: 0,
    steps: [
      {
        type: 'transit',
        lineId: '38R',
        vehicleCode: '38R Geary Rapid',
        fromStop: 'Ferry Building Terminal',
        toStop: 'Civic Center Plaza',
        durationMinutes: 18,
        departureCountdown: 290,
        instructions: 'Board center median island platform'
      }
    ]
  }
];
